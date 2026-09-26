using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Caching.Memory;
using PortfolioApi.Models;

namespace PortfolioApi.Services;

/// <summary>
/// Single source of truth for all third-party market data. Owns the cache,
/// dedupes concurrent fetches per dataset and computes every derived field the
/// frontend renders. Upstream failures are logged here and never surface to the
/// client — callers receive the last known cached value, or an empty result the
/// endpoint translates into a generic 500.
/// </summary>
public class MarketDataService
{
    private readonly IHttpClientFactory _factory;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MarketDataService> _logger;
    private readonly JsonSerializerOptions _deser = new() { PropertyNameCaseInsensitive = true };

    private readonly string[] _cryptos;
    private readonly string[] _stocks;

    // Throttle for the user-forced refresh ("Actualizar"): if the defaults were
    // refreshed more recently than this, a forced refresh serves the cache instead
    // of hitting CoinGecko/Yahoo again. Guards against button-spam exceeding the
    // providers' per-minute limits. Read/written only under _defaultsLock.
    private readonly TimeSpan _forcedRefreshCooldown;
    private DateTimeOffset _defaultsRefreshedAt = DateTimeOffset.MinValue;
    private static readonly HashSet<string> TiposInteres =
        new() { "oficial", "bolsa", "mep", "tarjeta", "cripto" };

    private const string KeyDefaults   = "market:defaults";
    private const string KeyDolar      = "currency:dolar";
    private const string KeyIndicators = "indicators:economic";

    // One gate per dataset so concurrent requests share a single upstream fetch.
    private readonly SemaphoreSlim _defaultsLock   = new(1, 1);
    private readonly SemaphoreSlim _dolarLock       = new(1, 1);
    private readonly SemaphoreSlim _indicatorsLock  = new(1, 1);

    private const string ArgBase = "https://api.argentinadatos.com/v1/finanzas";

    // Waits between attempts when an upstream answers 429 or a transient 5xx.
    // Render's free instances share outbound IPs, so CoinGecko/Yahoo often throttle
    // the first burst after a cold start; retrying instantly just hits the limit again.
    private static readonly TimeSpan[] RetryBackoff = [TimeSpan.FromSeconds(2), TimeSpan.FromSeconds(5)];

    public MarketDataService(
        IHttpClientFactory factory,
        IMemoryCache cache,
        IConfiguration config,
        ILogger<MarketDataService> logger)
    {
        _factory = factory;
        _cache   = cache;
        _logger  = logger;
        _cryptos = config.GetSection("Market:DefaultCryptos").Get<string[]>()
                   ?? ["bitcoin", "ethereum", "solana"];
        _stocks  = config.GetSection("Market:DefaultStocks").Get<string[]>()
                   ?? ["AAPL", "MSFT", "GOOGL"];
        _forcedRefreshCooldown = TimeSpan.FromSeconds(
            config.GetValue("Market:ForcedRefreshCooldownSeconds", 30));
    }

    // ── Public API ───────────────────────────────────────────────────────────

    public async Task<IReadOnlyList<MarketAssetDto>> GetDefaultsAsync(bool forceRefresh, CancellationToken ct)
    {
        if (!forceRefresh && _cache.TryGetValue(KeyDefaults, out IReadOnlyList<MarketAssetDto>? cached) && cached is not null)
            return cached;

        await _defaultsLock.WaitAsync(ct);
        try
        {
            var haveCache = _cache.TryGetValue(KeyDefaults, out cached) && cached is not null;

            // Non-forced: serve the warm cache populated by the background prefetch.
            if (!forceRefresh && haveCache)
                return cached!;

            // Forced ("Actualizar"): if we refreshed very recently, serve the cache
            // instead of hitting the upstream APIs again. The 20-min background loop
            // is never throttled — its interval is far longer than this cooldown.
            if (forceRefresh && haveCache &&
                DateTimeOffset.UtcNow - _defaultsRefreshedAt < _forcedRefreshCooldown)
                return cached!;

            var merged = await FetchDefaultsAsync(ct);
            if (merged.Count > 0)
            {
                _cache.Set(KeyDefaults, merged);
                _defaultsRefreshedAt = DateTimeOffset.UtcNow;
            }
            return merged;
        }
        finally { _defaultsLock.Release(); }
    }

    public async Task<IReadOnlyList<DolarRateDto>> GetDolarAsync(bool forceRefresh, CancellationToken ct)
    {
        if (!forceRefresh && _cache.TryGetValue(KeyDolar, out IReadOnlyList<DolarRateDto>? cached) && cached is not null)
            return cached;

        await _dolarLock.WaitAsync(ct);
        try
        {
            if (!forceRefresh && _cache.TryGetValue(KeyDolar, out cached) && cached is not null)
                return cached;

            var fetched = await SafeAsync(() => FetchDolarAsync(ct), "DolarAPI", ct);
            if (fetched is { Count: > 0 })
            {
                _cache.Set(KeyDolar, fetched);
                return fetched;
            }
            // Upstream failed: keep serving the last known real values if we have them.
            return _cache.TryGetValue(KeyDolar, out cached) && cached is not null
                ? cached
                : [];
        }
        finally { _dolarLock.Release(); }
    }

    public async Task<EconomicIndicatorsDto?> GetIndicatorsAsync(bool forceRefresh, CancellationToken ct)
    {
        if (!forceRefresh && _cache.TryGetValue(KeyIndicators, out EconomicIndicatorsDto? cached) && cached is not null)
            return cached;

        await _indicatorsLock.WaitAsync(ct);
        try
        {
            if (!forceRefresh && _cache.TryGetValue(KeyIndicators, out cached) && cached is not null)
                return cached;

            var merged = await FetchIndicatorsAsync(ct);
            if (merged.HasAny)
            {
                _cache.Set(KeyIndicators, merged);
                return merged;
            }
            return null;
        }
        finally { _indicatorsLock.Release(); }
    }

    /// <summary>
    /// Refreshes every dataset; used by the background prefetch loop. Returns
    /// whether every dataset is fully populated, so the loop can retry sooner
    /// when a cold start left gaps (e.g. an upstream 429 right after spin-up).
    /// </summary>
    public async Task<bool> RefreshAllAsync(CancellationToken ct)
    {
        var defaults   = GetDefaultsAsync(true, ct);
        var dolar      = GetDolarAsync(true, ct);
        var indicators = GetIndicatorsAsync(true, ct);
        await Task.WhenAll(defaults, dolar, indicators);

        return defaults.Result.Count == _cryptos.Length + _stocks.Length
            && dolar.Result.Count > 0
            && indicators.Result is { IsComplete: true };
    }

    // ── Market defaults (the "two GETs": one batched call per provider) ────────

    private async Task<IReadOnlyList<MarketAssetDto>> FetchDefaultsAsync(CancellationToken ct)
    {
        var existing = _cache.TryGetValue(KeyDefaults, out IReadOnlyList<MarketAssetDto>? old) ? old : null;

        var cryptoTask = SafeAsync(() => FetchCryptoAsync(ct), "CoinGecko defaults", ct);
        var stockTask  = SafeAsync(() => FetchStocksAsync(ct), "Yahoo defaults", ct);
        await Task.WhenAll(cryptoTask, stockTask);

        // Crypto is one batched call: all-or-nothing, so fall back to the cached subset.
        var crypto = cryptoTask.Result ?? existing?.Where(a => a.Type == "crypto").ToList() ?? [];

        // Stocks fan out one call per symbol, so a single flaky symbol must not drop
        // the whole row. Merge per symbol: prefer the fresh value, else keep the last
        // cached one — preserving the configured order.
        var freshStocks  = stockTask.Result ?? [];
        var cachedStocks = existing?.Where(a => a.Type == "stock").ToList() ?? [];
        var stocks = _stocks
            .Select(s => s.ToUpperInvariant())
            .Select(sym => freshStocks.FirstOrDefault(a => a.Symbol == sym)
                        ?? cachedStocks.FirstOrDefault(a => a.Symbol == sym))
            .Where(a => a is not null)
            .Select(a => a!)
            .ToList();

        return [.. crypto, .. stocks];
    }

    private async Task<List<MarketAssetDto>> FetchCryptoAsync(CancellationToken ct)
    {
        var client = _factory.CreateClient("proxy");
        var ids    = string.Join(",", _cryptos.Select(c => c.ToLowerInvariant()));
        var url    = $"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids={Uri.EscapeDataString(ids)}";

        var raw = await GetJsonWithRetryAsync<CoinGeckoMarketEntry[]>(client, url, ct);
        if (raw is null || raw.Length == 0)
            throw new InvalidOperationException("Empty CoinGecko response");

        return raw.Select(MapCrypto).ToList();
    }

    private async Task<List<MarketAssetDto>> FetchStocksAsync(CancellationToken ct)
    {
        // v8 chart is per-symbol, so fan out in parallel. A symbol that fails
        // is logged and skipped; the rest still come through.
        var results = await Task.WhenAll(_stocks.Select(s => FetchStockAsync(s, ct)));
        var assets  = results.Where(a => a is not null).Select(a => a!).ToList();
        if (assets.Count == 0)
            throw new InvalidOperationException("No Yahoo Finance data");
        return assets;
    }

    private async Task<MarketAssetDto?> FetchStockAsync(string symbol, CancellationToken ct)
    {
        var sym = symbol.ToUpperInvariant();
        var url = $"https://query1.finance.yahoo.com/v8/finance/chart/{Uri.EscapeDataString(sym)}?interval=1d&range=1d";

        // Yahoo occasionally rejects a symbol under parallel load (429); the backoff
        // in GetJsonSafeAsync keeps a transient miss from leaving a gap in the watchlist.
        var resp = await GetJsonSafeAsync<YahooChartResponse>(url, $"Yahoo {sym}", ct, "yahoo");
        var meta = resp?.Chart?.Result?.FirstOrDefault()?.Meta;
        return meta is not null ? MapStock(meta) : null;
    }

    private static MarketAssetDto MapCrypto(CoinGeckoMarketEntry c)
    {
        var price  = c.CurrentPrice ?? 0;
        var high   = c.High24h ?? price;
        var low    = c.Low24h ?? price;
        var change = c.PriceChange24h ?? 0;
        var vol    = low > 0 ? (high - low) / low * 100 : 0;
        return new MarketAssetDto(
            "crypto", "coingecko", c.Symbol.ToUpperInvariant(), c.Name,
            price, decimal.Round(change, 2), decimal.Round(vol, 2),
            Alert(vol, highAt: 8, moderateAt: 4),
            c.LastUpdated); // CoinGecko already returns an ISO-8601 string.
    }

    private static MarketAssetDto MapStock(YahooChartMeta m)
    {
        var price     = m.RegularMarketPrice ?? 0;
        var high      = m.RegularMarketDayHigh ?? price;
        var low       = m.RegularMarketDayLow ?? price;
        var prevClose = m.ChartPreviousClose ?? price;
        var change    = prevClose > 0 ? (price - prevClose) / prevClose * 100 : 0;
        var vol       = low > 0 ? (high - low) / low * 100 : 0;
        // Yahoo's regularMarketTime is Unix seconds; normalize to an ISO-8601 string.
        var updated = m.RegularMarketTime is { } secs
            ? DateTimeOffset.FromUnixTimeSeconds(secs).ToString("o")
            : null;
        return new MarketAssetDto(
            "stock", "yahoo", m.Symbol, m.ShortName ?? m.LongName ?? m.Symbol,
            price, decimal.Round(change, 2), decimal.Round(vol, 2),
            Alert(vol, highAt: 5, moderateAt: 2),
            updated);
    }

    private static string Alert(decimal volatility, decimal highAt, decimal moderateAt) =>
        volatility > highAt ? "high" : volatility > moderateAt ? "moderate" : "normal";

    // ── Dólar ──────────────────────────────────────────────────────────────────

    private async Task<List<DolarRateDto>> FetchDolarAsync(CancellationToken ct)
    {
        var client = _factory.CreateClient("proxy");
        var raw    = await GetJsonWithRetryAsync<DolarApiEntry[]>(
                         client, "https://dolarapi.com/v1/dolares", ct);
        if (raw is null)
            throw new InvalidOperationException("Empty DolarAPI response");

        return raw
            .Where(d => TiposInteres.Contains(d.Casa))
            .Select(d => new DolarRateDto(
                d.Casa == "bolsa" ? "MEP" : d.Nombre,
                d.Compra ?? 0,
                d.Venta ?? 0,
                d.Casa == "bolsa" ? "mep" : d.Casa,
                d.FechaActualizacion))
            .ToList();
    }

    // ── Indicadores económicos (ArgentinaDatos) ────────────────────────────────

    private async Task<EconomicIndicatorsDto> FetchIndicatorsAsync(CancellationToken ct)
    {
        var prev = _cache.TryGetValue(KeyIndicators, out EconomicIndicatorsDto? cached) ? cached : null;

        const string arg = "argentinadatos";
        var riesgoTask     = GetJsonSafeAsync<ArgDataPoint>($"{ArgBase}/indices/riesgo-pais/ultimo", "riesgo-pais", ct, arg);
        var inflacionTask  = GetJsonSafeAsync<ArgDataPoint[]>($"{ArgBase}/indices/inflacion", "inflacion", ct, arg);
        var interanualTask = GetJsonSafeAsync<ArgDataPoint[]>($"{ArgBase}/indices/inflacionInteranual", "interanual", ct, arg);
        var uvaTask        = GetJsonSafeAsync<ArgDataPoint[]>($"{ArgBase}/indices/uva", "uva", ct, arg);
        var plazoTask      = GetJsonSafeAsync<ArgPlazoFijoEntry[]>($"{ArgBase}/tasas/plazoFijo", "plazoFijo", ct, arg);

        await Task.WhenAll(riesgoTask, inflacionTask, interanualTask, uvaTask, plazoTask);

        var riesgo = riesgoTask.Result is { Valor: { } rv }
            ? new IndicatorValueDto(rv, riesgoTask.Result.Fecha)
            : prev?.RiesgoPais;

        var inflacion  = FromLast(inflacionTask.Result)  ?? prev?.Inflacion;
        var interanual = FromLast(interanualTask.Result) ?? prev?.Interanual;
        var uva        = FromLast(uvaTask.Result)        ?? prev?.Uva;

        IndicatorValueDto? plazoFijo  = prev?.PlazoFijo;
        IndicatorValueDto? mejorPlazo = prev?.MejorPlazo;

        var tasas = (plazoTask.Result ?? [])
            .Where(b => b.TnaClientes is > 0)
            .Select(b => (Tna: b.TnaClientes!.Value, b.Entidad))
            .ToList();

        if (tasas.Count > 0)
        {
            var promedio = tasas.Average(b => b.Tna);
            var mejor    = tasas.MaxBy(b => b.Tna);
            plazoFijo  = new IndicatorValueDto(decimal.Round(promedio * 100, 2), null);
            mejorPlazo = new IndicatorValueDto(decimal.Round(mejor.Tna * 100, 2), null, mejor.Entidad);
        }

        return new EconomicIndicatorsDto(riesgo, inflacion, interanual, uva, plazoFijo, mejorPlazo);
    }

    private static IndicatorValueDto? FromLast(ArgDataPoint[]? series)
    {
        var last = series is { Length: > 0 } ? series[^1] : null;
        return last is { Valor: { } v } ? new IndicatorValueDto(v, last.Fecha) : null;
    }

    // Like SafeAsync but for nullable JSON shapes that don't satisfy the `class`
    // constraint (ArgentinaDatos, Yahoo chart). Failures are logged, not surfaced.
    private async Task<T?> GetJsonSafeAsync<T>(string url, string label, CancellationToken ct, string clientName = "proxy")
    {
        try
        {
            var client = _factory.CreateClient(clientName);
            return await GetJsonWithRetryAsync<T>(client, url, ct);
        }
        // Host is shutting down: let it propagate so the prefetch loop exits cleanly,
        // instead of being logged as an upstream failure. A plain HTTP timeout (the
        // client's own token) leaves ct unsignalled and falls through to the catch below.
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Upstream fetch failed: {Label}", label);
            return default;
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    // GET + deserialize, retrying with RetryBackoff on 429 / 5xx. Any other failure,
    // or the last retryable one, is thrown for the caller's Safe* wrapper to log.
    // Task.Delay honours ct, so a shutdown still cancels promptly mid-backoff.
    private async Task<T?> GetJsonWithRetryAsync<T>(HttpClient client, string url, CancellationToken ct)
    {
        for (var attempt = 0; ; attempt++)
        {
            try
            {
                return await client.GetFromJsonAsync<T>(url, _deser, ct);
            }
            catch (HttpRequestException ex) when (IsRetryable(ex.StatusCode) && attempt < RetryBackoff.Length)
            {
                await Task.Delay(RetryBackoff[attempt], ct);
            }
        }
    }

    private static bool IsRetryable(HttpStatusCode? status) =>
        status is HttpStatusCode.TooManyRequests || (int?)status >= 500;

    // Runs an upstream fetch; on any failure logs it server-side and returns null
    // so the caller can fall back to cached data. Errors never reach the client.
    private async Task<T?> SafeAsync<T>(Func<Task<T>> func, string label, CancellationToken ct) where T : class
    {
        try
        {
            return await func();
        }
        // Shutdown cancellation propagates (clean loop exit); a real timeout is logged below.
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Upstream fetch failed: {Label}", label);
            return null;
        }
    }
}
