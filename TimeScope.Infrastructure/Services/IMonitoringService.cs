namespace TimeScope.Infrastructure.Services;

public interface IMonitoringService
{
    SystemMetrics GetSystemMetrics();
    SystemInfo GetSystemInfo();
    HealthStatus GetHealthStatus();
    UptimeInfo GetUptime();
    EnvironmentInfo GetEnvironmentInfo();
    DiagnosticsInfo GetDiagnostics();
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
