using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using PortfolioApi.Data;
using PortfolioApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Render (and most PaaS) inject the port to listen on via the PORT env var.
// Sanitize it: only bind when it parses to a valid TCP port (1-65535), so a
// malformed/hostile value can never be interpolated into the bind URL. When it's
// absent or invalid (local dev) Kestrel keeps its launchSettings/appsettings defaults.
var portEnv = Environment.GetEnvironmentVariable("PORT");
if (int.TryParse(portEnv, out var port) && port is > 0 and <= 65535)
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase);

builder.Services.AddHttpClient("proxy", client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
    client.DefaultRequestHeaders.Add("User-Agent", "PortfolioAPI/1.0");
});

// ArgentinaDatos serves full historical series (UVA alone is ~200 KB) with slow,
// highly variable response times that routinely brush the 10s mark. It gets its
// own client with a generous timeout — safe because this data is cached and warmed
// by the background prefetch, never on a user's critical path.
builder.Services.AddHttpClient("argentinadatos", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
    client.DefaultRequestHeaders.Add("User-Agent", "PortfolioAPI/1.0");
});

builder.Services.AddMemoryCache();

// Market data: cache, dedup and prefetch all live behind this singleton.
builder.Services.AddSingleton<MarketDataService>();
builder.Services.AddHostedService<MarketRefreshBackgroundService>();

var allowedOrigins = builder.Configuration
    .GetSection("AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()));

var permitLimit   = builder.Configuration.GetValue<int>("RateLimit:PermitLimit", 60);
var windowMinutes = builder.Configuration.GetValue<int>("RateLimit:WindowMinutes", 1);

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("default", opt =>
    {
        opt.PermitLimit = permitLimit;
        opt.Window      = TimeSpan.FromMinutes(windowMinutes);
        opt.QueueLimit  = 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var app = builder.Build();

// Defense in depth: any unhandled exception is logged by the framework and the
// client only ever sees a generic 500 — never a stack trace or internal message.
app.UseExceptionHandler(errApp =>
    errApp.Run(async context =>
    {
        context.Response.StatusCode  = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new { error = "service_unavailable" });
    }));

app.UseCors("frontend");
app.UseRateLimiter();

var portfolioTtl = TimeSpan.FromHours(app.Configuration.GetValue<int>("Cache:PortfolioTtlHours", 1));

// Generic failure response — no upstream detail ever crosses to the client.
static IResult Unavailable() =>
    Results.Json(new { error = "service_unavailable" }, statusCode: StatusCodes.Status500InternalServerError);

// ══════════════════════════════════════════════════════════════════════════════
// ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

app.MapGet("/health", () => Results.Ok(new
{
    status    = "healthy",
    timestamp = DateTime.UtcNow,
    version   = "1.0.0"
}));

// ── Portfolio data ─────────────────────────────────────────────────────────────
app.MapGet("/api/portfolio/data", (IMemoryCache cache) =>
{
    const string key = "portfolio-data";
    if (!cache.TryGetValue(key, out var data))
    {
        data = PortfolioDataStore.GetAll();
        cache.Set(key, data, portfolioTtl);
    }
    return Results.Ok(data);
}).RequireRateLimiting("default");

// ── Mercado: activos por defecto (servidos desde el cache del back) ─────────────
app.MapGet("/api/market/defaults", async (MarketDataService market, CancellationToken ct) =>
{
    var data = await market.GetDefaultsAsync(forceRefresh: false, ct);
    return data.Count > 0 ? Results.Ok(data) : Unavailable();
}).RequireRateLimiting("default");

// ── Mercado: refresh forzado (botón "Actualizar") ──────────────────────────────
app.MapGet("/api/market/refresh", async (MarketDataService market, CancellationToken ct) =>
{
    var data = await market.GetDefaultsAsync(forceRefresh: true, ct);
    return data.Count > 0 ? Results.Ok(data) : Unavailable();
}).RequireRateLimiting("default");

// ── Cotizaciones dólar ─────────────────────────────────────────────────────────
app.MapGet("/api/currency/dolar", async (MarketDataService market, CancellationToken ct) =>
{
    var data = await market.GetDolarAsync(forceRefresh: false, ct);
    return data.Count > 0 ? Results.Ok(data) : Unavailable();
}).RequireRateLimiting("default");

// ── Indicadores económicos (ArgentinaDatos, parseados en el back) ───────────────
app.MapGet("/api/indicators/economic", async (MarketDataService market, CancellationToken ct) =>
{
    var data = await market.GetIndicatorsAsync(forceRefresh: false, ct);
    return data is not null && data.HasAny ? Results.Ok(data) : Unavailable();
}).RequireRateLimiting("default");

app.Run();
