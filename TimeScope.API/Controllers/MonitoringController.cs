using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MonitoringController : ControllerBase
{
    private readonly ILogger<MonitoringController> _logger;
    private static readonly DateTime _startTime = DateTime.UtcNow;

    public MonitoringController(ILogger<MonitoringController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Récupère les métriques système
    /// </summary>
    [HttpGet("metrics")]
    public ActionResult<SystemMetrics> GetSystemMetrics()
    {
        try
        {
            var process = Process.GetCurrentProcess();
            var uptime = DateTime.UtcNow - _startTime;

            var metrics = new SystemMetrics
            {
                CpuUsage = GetCpuUsage(),
                MemoryUsed = process.WorkingSet64 / (1024 * 1024), // MB
                MemoryTotal = GetTotalMemory(),
                DiskUsage = GetDiskUsage(),
                Uptime = uptime,
                UptimeFormatted = FormatUptime(uptime),
                ThreadCount = process.Threads.Count,
                HandleCount = process.HandleCount,
                Timestamp = DateTime.UtcNow
            };

            return Ok(metrics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system metrics");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère les informations système
    /// </summary>
    [HttpGet("info")]
    public ActionResult<SystemInfo> GetSystemInfo()
    {
        try
        {
            var info = new SystemInfo
            {
                HostName = Environment.MachineName,
                OperatingSystem = RuntimeInformation.OSDescription,
                Architecture = RuntimeInformation.ProcessArchitecture.ToString(),
                Framework = RuntimeInformation.FrameworkDescription,
                ProcessorCount = Environment.ProcessorCount,
                WorkingDirectory = Environment.CurrentDirectory,
                Is64BitOperatingSystem = Environment.Is64BitOperatingSystem,
                Is64BitProcess = Environment.Is64BitProcess,
                ApplicationVersion = "1.0.0",
                StartTime = _startTime,
                CurrentTime = DateTime.UtcNow
            };

            return Ok(info);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system info");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère l'état de santé du système
    /// </summary>
    [HttpGet("health")]
    public ActionResult<HealthStatus> GetHealth()
    {
        try
        {
            var process = Process.GetCurrentProcess();
            var memoryMB = process.WorkingSet64 / (1024 * 1024);
            var cpuUsage = GetCpuUsage();

            var status = new HealthStatus
            {
                Status = "Healthy",
                Checks = new List<HealthCheck>
                {
                    new HealthCheck
                    {
                        Name = "Memory",
                        Status = memoryMB < 1000 ? "Healthy" : "Warning",
                        Value = $"{memoryMB} MB",
                        Message = memoryMB < 1000 ? "Memory usage is normal" : "Memory usage is high"
                    },
                    new HealthCheck
                    {
                        Name = "CPU",
                        Status = cpuUsage < 80 ? "Healthy" : "Warning",
                        Value = $"{cpuUsage:F1}%",
                        Message = cpuUsage < 80 ? "CPU usage is normal" : "CPU usage is high"
                    },
                    new HealthCheck
                    {
                        Name = "Threads",
                        Status = process.Threads.Count < 100 ? "Healthy" : "Warning",
                        Value = process.Threads.Count.ToString(),
                        Message = "Thread count is acceptable"
                    },
                    new HealthCheck
                    {
                        Name = "Uptime",
                        Status = "Healthy",
                        Value = FormatUptime(DateTime.UtcNow - _startTime),
                        Message = "Application is running"
                    }
                },
                Timestamp = DateTime.UtcNow
            };

            // Déterminer le statut global
            if (status.Checks.Any(c => c.Status == "Warning"))
                status.Status = "Warning";
            if (status.Checks.Any(c => c.Status == "Unhealthy"))
                status.Status = "Unhealthy";

            return Ok(status);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving health status");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère les logs récents
    /// </summary>
    [HttpGet("logs")]
    public ActionResult<LogsResponse> GetLogs([FromQuery] int limit = 100)
    {
        try
        {
            // Pour l'instant, retourne des logs simulés
            // En production, vous pourriez lire depuis un fichier de logs ou une base de données
            var logs = new List<LogEntry>
            {
                new LogEntry
                {
                    Timestamp = DateTime.UtcNow.AddMinutes(-5),
                    Level = "Information",
                    Message = "Application started successfully",
                    Source = "TimeScope.API"
                },
                new LogEntry
                {
                    Timestamp = DateTime.UtcNow.AddMinutes(-2),
                    Level = "Information",
                    Message = "Database connection established",
                    Source = "EntityFramework"
                }
            };

            var response = new LogsResponse
            {
                Logs = logs.Take(limit).ToList(),
                Total = logs.Count
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving logs");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Force le garbage collection
    /// </summary>
    [HttpPost("gc")]
    public ActionResult ForceGarbageCollection()
    {
        try
        {
            var beforeMemory = GC.GetTotalMemory(false) / (1024 * 1024);
            GC.Collect();
            GC.WaitForPendingFinalizers();
            GC.Collect();
            var afterMemory = GC.GetTotalMemory(false) / (1024 * 1024);

            _logger.LogInformation("Garbage collection completed. Memory before: {Before} MB, after: {After} MB", beforeMemory, afterMemory);

            return Ok(new
            {
                message = "Garbage collection completed",
                memoryBeforeMB = beforeMemory,
                memoryAfterMB = afterMemory,
                freedMB = beforeMemory - afterMemory
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error forcing garbage collection");
            return StatusCode(500, "Internal server error");
        }
    }

    private double GetCpuUsage()
    {
        try
        {
            var process = Process.GetCurrentProcess();
            var startTime = DateTime.UtcNow;
            var startCpuUsage = process.TotalProcessorTime;

            Thread.Sleep(100); // Wait a bit to measure

            var endTime = DateTime.UtcNow;
            var endCpuUsage = process.TotalProcessorTime;

            var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
            var totalMsPassed = (endTime - startTime).TotalMilliseconds;
            var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);

            return cpuUsageTotal * 100;
        }
        catch
        {
            return 0;
        }
    }

    private long GetTotalMemory()
    {
        try
        {
            // Cette méthode retourne une estimation
            // En production, vous pourriez utiliser des APIs système spécifiques
            return 8192; // 8 GB par défaut
        }
        catch
        {
            return 0;
        }
    }

    private double GetDiskUsage()
    {
        try
        {
            var drive = new DriveInfo(Path.GetPathRoot(Environment.CurrentDirectory) ?? "C:\\");
            var totalSpace = drive.TotalSize / (1024.0 * 1024 * 1024); // GB
            var usedSpace = (drive.TotalSize - drive.AvailableFreeSpace) / (1024.0 * 1024 * 1024); // GB
            return (usedSpace / totalSpace) * 100;
        }
        catch
        {
            return 0;
        }
    }

    private string FormatUptime(TimeSpan uptime)
    {
        if (uptime.TotalDays >= 1)
            return $"{(int)uptime.TotalDays}d {uptime.Hours}h {uptime.Minutes}m";
        if (uptime.TotalHours >= 1)
            return $"{(int)uptime.TotalHours}h {uptime.Minutes}m";
        return $"{(int)uptime.TotalMinutes}m {uptime.Seconds}s";
    }
}

// DTOs
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

public class SystemInfo
{
    public string HostName { get; set; } = string.Empty;
    public string OperatingSystem { get; set; } = string.Empty;
    public string Architecture { get; set; } = string.Empty;
    public string Framework { get; set; } = string.Empty;
    public int ProcessorCount { get; set; }
    public string WorkingDirectory { get; set; } = string.Empty;
    public bool Is64BitOperatingSystem { get; set; }
    public bool Is64BitProcess { get; set; }
    public string ApplicationVersion { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime CurrentTime { get; set; }
}

public class HealthStatus
{
    public string Status { get; set; } = string.Empty;
    public List<HealthCheck> Checks { get; set; } = new();
    public DateTime Timestamp { get; set; }
}

public class HealthCheck
{
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

public class LogEntry
{
    public DateTime Timestamp { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
}

public class LogsResponse
{
    public List<LogEntry> Logs { get; set; } = new();
    public int Total { get; set; }
}
