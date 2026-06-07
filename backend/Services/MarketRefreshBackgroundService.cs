namespace PortfolioApi.Services;

/// <summary>
/// Warms the market cache on startup and refreshes it on a fixed interval
/// (Market:RefreshMinutes, default 20). Any cycle that fails is logged and the
/// loop keeps running — a flaky upstream never takes down the host.
/// </summary>
public class MarketRefreshBackgroundService : BackgroundService
{
    private readonly MarketDataService _market;
    private readonly ILogger<MarketRefreshBackgroundService> _logger;
    private readonly TimeSpan _interval;

    public MarketRefreshBackgroundService(
        MarketDataService market,
        IConfiguration config,
        ILogger<MarketRefreshBackgroundService> logger)
    {
        _market   = market;
        _logger   = logger;
        _interval = TimeSpan.FromMinutes(config.GetValue("Market:RefreshMinutes", 20));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await _market.RefreshAllAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Market prefetch cycle failed");
            }

            try
            {
                await Task.Delay(_interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
