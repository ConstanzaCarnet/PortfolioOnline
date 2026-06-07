using System.Text.Json.Serialization;

namespace PortfolioApi.Models;

// ── Internal deserialization models (never returned to the client) ────────────

internal record DolarApiEntry(
    [property: JsonPropertyName("nombre")] string Nombre,
    [property: JsonPropertyName("compra")] decimal? Compra,
    [property: JsonPropertyName("venta")] decimal? Venta,
    [property: JsonPropertyName("casa")] string Casa,
    [property: JsonPropertyName("fechaActualizacion")] string? FechaActualizacion
);

internal record CoinGeckoMarketEntry(
    [property: JsonPropertyName("id")] string Id,
    [property: JsonPropertyName("symbol")] string Symbol,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("current_price")] decimal? CurrentPrice,
    [property: JsonPropertyName("high_24h")] decimal? High24h,
    [property: JsonPropertyName("low_24h")] decimal? Low24h,
    [property: JsonPropertyName("price_change_percentage_24h")] decimal? PriceChange24h
);

// Yahoo Finance v8 chart endpoint. Used instead of the v7 quote API, which now
// returns 401 without a session crumb. The chart `meta` block carries everything
// we render and is reachable with a plain User-Agent.
internal record YahooChartMeta(
    [property: JsonPropertyName("symbol")] string Symbol,
    [property: JsonPropertyName("shortName")] string? ShortName,
    [property: JsonPropertyName("longName")] string? LongName,
    [property: JsonPropertyName("regularMarketPrice")] decimal? RegularMarketPrice,
    [property: JsonPropertyName("regularMarketDayHigh")] decimal? RegularMarketDayHigh,
    [property: JsonPropertyName("regularMarketDayLow")] decimal? RegularMarketDayLow,
    [property: JsonPropertyName("chartPreviousClose")] decimal? ChartPreviousClose
);

internal record YahooChartResult(
    [property: JsonPropertyName("meta")] YahooChartMeta? Meta
);

internal record YahooChart(
    [property: JsonPropertyName("result")] YahooChartResult[]? Result
);

internal record YahooChartResponse(
    [property: JsonPropertyName("chart")] YahooChart? Chart
);

// ArgentinaDatos — punto genérico { fecha, valor } usado por riesgo-país, inflación y UVA.
internal record ArgDataPoint(
    [property: JsonPropertyName("fecha")] string? Fecha,
    [property: JsonPropertyName("valor")] decimal? Valor
);

// ArgentinaDatos — entrada de /tasas/plazoFijo (tnaClientes es fracción: 0.19 = 19%).
internal record ArgPlazoFijoEntry(
    [property: JsonPropertyName("entidad")] string? Entidad,
    [property: JsonPropertyName("tnaClientes")] decimal? TnaClientes
);

// ── Output DTOs (only the fields the frontend actually renders) ───────────────

public record DolarRateDto(
    [property: JsonPropertyName("nombre")] string Nombre,
    [property: JsonPropertyName("compra")] decimal Compra,
    [property: JsonPropertyName("venta")] decimal Venta,
    [property: JsonPropertyName("casa")] string Casa,
    [property: JsonPropertyName("fecha")] string? Fecha
);

// Flat, pre-computed asset row. Volatility and alertLevel are derived on the
// backend so the client renders exactly what it receives — nothing more.
public record MarketAssetDto(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("provider")] string Provider,
    [property: JsonPropertyName("symbol")] string Symbol,
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("currentPrice")] decimal CurrentPrice,
    [property: JsonPropertyName("dailyChange")] decimal DailyChange,
    [property: JsonPropertyName("volatility")] decimal Volatility,
    [property: JsonPropertyName("alertLevel")] string AlertLevel
);

public record IndicatorValueDto(
    [property: JsonPropertyName("value")] decimal Value,
    [property: JsonPropertyName("fecha")] string? Fecha,
    [property: JsonPropertyName("entidad")] string? Entidad = null
);

// Each field is nullable: an indicator whose upstream call fails (and has no
// cached value) is sent as null, and the client skips it.
public record EconomicIndicatorsDto(
    [property: JsonPropertyName("riesgoPais")] IndicatorValueDto? RiesgoPais,
    [property: JsonPropertyName("inflacion")] IndicatorValueDto? Inflacion,
    [property: JsonPropertyName("interanual")] IndicatorValueDto? Interanual,
    [property: JsonPropertyName("uva")] IndicatorValueDto? Uva,
    [property: JsonPropertyName("plazoFijo")] IndicatorValueDto? PlazoFijo,
    [property: JsonPropertyName("mejorPlazo")] IndicatorValueDto? MejorPlazo
)
{
    [JsonIgnore]
    public bool HasAny =>
        RiesgoPais is not null || Inflacion is not null || Interanual is not null ||
        Uva is not null || PlazoFijo is not null || MejorPlazo is not null;
}
