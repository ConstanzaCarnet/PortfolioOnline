namespace PortfolioApi.Services;

/// <summary>
/// Warms the market cache on startup and refreshes it on a fixed interval
/// (Market:RefreshMinutes, default 20). If a cycle leaves any dataset incomplete
/// — typically an upstream 429 right after a cold start — the next attempt comes
/// after Market:RetryMinutes (default 2) instead, so the dashboard isn't left
/// empty for a full interval. Any cycle that fails is logged and the loop keeps
/// running — a flaky upstream never takes down the host.
/// </summary>
public class MarketRefreshBackgroundService : BackgroundService
{
    private readonly MarketDataService _market;
    private readonly ILogger<MarketRefreshBackgroundService> _logger;
    private readonly TimeSpan _interval;
    private readonly TimeSpan _retryInterval;

    public MarketRefreshBackgroundService(
        MarketDataService market,
        IConfiguration config,
        ILogger<MarketRefreshBackgroundService> logger)
    {
        _market        = market;
        _logger        = logger;
        _interval      = TimeSpan.FromMinutes(config.GetValue("Market:RefreshMinutes", 20));
        _retryInterval = TimeSpan.FromMinutes(config.GetValue("Market:RetryMinutes", 2));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var complete = false;
            try
            {
                complete = await _market.RefreshAllAsync(stoppingToken);
                if (!complete)
                    _logger.LogWarning("Market prefetch incomplete; retrying in {Minutes} min",
                        _retryInterval.TotalMinutes);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                // Never let a failure (including a logging-provider failure) escape and
                // stop the host: a BackgroundService exception tears down the whole app.
                try { _logger.LogError(ex, "Market prefetch cycle failed"); }
                catch { /* swallow: the loop must keep running */ }
            }

            try
            {
                await Task.Delay(complete ? _interval : _retryInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
