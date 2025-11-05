namespace TimeScope.Infrastructure.Services;

public interface IMonitoringService
{
    SystemMetrics GetSystemMetrics();
    SystemInfo GetSystemInfo();
    HealthStatus GetHealthStatus();
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
    public string Status { get; set; } = "Healthy";
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
