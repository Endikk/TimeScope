using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Infrastructure.Services;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class MonitoringController : ControllerBase
{
    private readonly IMonitoringService _monitoringService;
    private readonly ILogger<MonitoringController> _logger;

    public MonitoringController(IMonitoringService monitoringService, ILogger<MonitoringController> logger)
    {
        _monitoringService = monitoringService;
        _logger = logger;
    }

    [HttpGet("metrics")]
    public ActionResult<SystemMetrics> GetSystemMetrics()
    {
        try
        {
            var metrics = _monitoringService.GetSystemMetrics();
            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system metrics");
            return StatusCode(500, new { message = "An error occurred while retrieving system metrics" });
        }
    }

    [HttpGet("health")]
    public ActionResult<HealthStatus> GetHealthStatus()
    {
        try
        {
            var health = _monitoringService.GetHealthStatus();
            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving health status");
            return StatusCode(500, new { message = "An error occurred while retrieving health status" });
        }
    }

    [HttpGet("uptime")]
    public ActionResult<UptimeInfo> GetUptime()
    {
        try
        {
            var uptime = _monitoringService.GetUptime();
            return Ok(uptime);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving uptime");
            return StatusCode(500, new { message = "An error occurred while retrieving uptime" });
        }
    }

    [HttpGet("environment")]
    public ActionResult<EnvironmentInfo> GetEnvironmentInfo()
    {
        try
        {
            var envInfo = _monitoringService.GetEnvironmentInfo();
            return Ok(envInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving environment info");
            return StatusCode(500, new { message = "An error occurred while retrieving environment info" });
        }
    }

    [HttpGet("diagnostics")]
    public ActionResult<DiagnosticsInfo> GetDiagnostics()
    {
        try
        {
            var diagnostics = _monitoringService.GetDiagnostics();
            return Ok(diagnostics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving diagnostics");
            return StatusCode(500, new { message = "An error occurred while retrieving diagnostics" });
        }
    }

    [HttpGet("info")]
    public ActionResult<SystemInfo> GetSystemInfo()
    {
        try
        {
            var info = _monitoringService.GetSystemInfo();
            return Ok(info);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system info");
            return StatusCode(500, new { message = "An error occurred while retrieving system info" });
        }
    }

    [HttpGet("logs")]
    public ActionResult<LogsResponse> GetLogs([FromQuery] int limit = 100)
    {
        try
        {
            var logs = _monitoringService.GetLogs(limit);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving logs");
            return StatusCode(500, new { message = "An error occurred while retrieving logs" });
        }
    }
    [HttpGet("stream")]
    [Produces("text/event-stream")]
    public async Task StreamMonitoring(CancellationToken cancellationToken)
    {
        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                var systemMetrics = _monitoringService.GetSystemMetrics();
                var dockerMetrics = await _monitoringService.GetDockerMetricsAsync();
                
                var data = new
                {
                    system = systemMetrics,
                    docker = dockerMetrics
                };

                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase
                };

                var json = System.Text.Json.JsonSerializer.Serialize(data, options);
                await Response.WriteAsync($"data: {json}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);

                await Task.Delay(1000, cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Client disconnected
        }
    }
}

public class SystemMetrics
{
    public double CpuUsage { get; set; }
    public long MemoryUsed { get; set; }
    public long MemoryTotal { get; set; }
    public double DiskUsage { get; set; }
    public TimeSpan Uptime { get; set; }
    public string UptimeFormatted { get; set; } = string.Empty;
    public int ThreadCount { get; set; }
    public int HandleCount { get; set; }
    public DateTime Timestamp { get; set; }
}

public class HealthStatus
{
    public string Status { get; set; } = "healthy";
    public bool IsHealthy { get; set; }
    public string[] Errors { get; set; } = Array.Empty<string>();
    public DateTime CheckedAt { get; set; }
}

public class UptimeInfo
{
    public TimeSpan Uptime { get; set; }
    public string UptimeFormatted { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime CurrentTime { get; set; }
}

public class EnvironmentInfo
{
    public string MachineName { get; set; } = string.Empty;
    public string OSVersion { get; set; } = string.Empty;
    public string OSArchitecture { get; set; } = string.Empty;
    public string ProcessArchitecture { get; set; } = string.Empty;
    public int ProcessorCount { get; set; }
    public string DotNetVersion { get; set; } = string.Empty;
    public string EnvironmentName { get; set; } = string.Empty;
}

public class DiagnosticsInfo
{
    public int ThreadCount { get; set; }
    public int HandleCount { get; set; }
    public long WorkingSet { get; set; }
    public long PrivateMemory { get; set; }
    public long VirtualMemory { get; set; }
    public TimeSpan TotalProcessorTime { get; set; }
}
