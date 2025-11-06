using System.Diagnostics;
using System.Runtime.InteropServices;

namespace TimeScope.Infrastructure.Services;

public class MonitoringService : IMonitoringService
{
    private static readonly DateTime _startTime = DateTime.UtcNow;
    private static DateTime _lastCpuCheck = DateTime.UtcNow;
    private static TimeSpan _lastCpuTime = TimeSpan.Zero;

    public SystemMetrics GetSystemMetrics()
    {
        var process = Process.GetCurrentProcess();
        var uptime = DateTime.UtcNow - _startTime;

        var metrics = new SystemMetrics
        {
            CpuUsage = GetCpuUsage(process),
            MemoryUsed = process.WorkingSet64 / (1024 * 1024), // MB
            MemoryTotal = GetTotalMemory(),
            DiskUsage = GetDiskUsage(),
            Uptime = uptime,
            UptimeFormatted = FormatUptime(uptime),
            ThreadCount = process.Threads.Count,
            HandleCount = process.HandleCount,
            Timestamp = DateTime.UtcNow
        };

        return metrics;
    }

    public SystemInfo GetSystemInfo()
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

        return info;
    }

    public HealthStatus GetHealthStatus()
    {
        var process = Process.GetCurrentProcess();
        var memoryMB = process.WorkingSet64 / (1024 * 1024);
        var cpuUsage = GetCpuUsage(process);

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

        return status;
    }

    public UptimeInfo GetUptime()
    {
        var uptime = DateTime.UtcNow - _startTime;

        return new UptimeInfo
        {
            Uptime = uptime,
            UptimeFormatted = FormatUptime(uptime),
            StartTime = _startTime,
            CurrentTime = DateTime.UtcNow
        };
    }

    public EnvironmentInfo GetEnvironmentInfo()
    {
        return new EnvironmentInfo
        {
            MachineName = Environment.MachineName,
            OSVersion = RuntimeInformation.OSDescription,
            OSArchitecture = RuntimeInformation.OSArchitecture.ToString(),
            ProcessArchitecture = RuntimeInformation.ProcessArchitecture.ToString(),
            ProcessorCount = Environment.ProcessorCount,
            DotNetVersion = RuntimeInformation.FrameworkDescription,
            EnvironmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production"
        };
    }

    public DiagnosticsInfo GetDiagnostics()
    {
        var process = Process.GetCurrentProcess();

        return new DiagnosticsInfo
        {
            ThreadCount = process.Threads.Count,
            HandleCount = process.HandleCount,
            WorkingSet = process.WorkingSet64,
            PrivateMemory = process.PrivateMemorySize64,
            VirtualMemory = process.VirtualMemorySize64,
            TotalProcessorTime = process.TotalProcessorTime
        };
    }

    #region Private Helper Methods

    private static double GetCpuUsage(Process process)
    {
        var currentTime = DateTime.UtcNow;
        var currentCpuTime = process.TotalProcessorTime;

        var timeDiff = (currentTime - _lastCpuCheck).TotalMilliseconds;
        var cpuDiff = (currentCpuTime - _lastCpuTime).TotalMilliseconds;

        if (timeDiff > 0)
        {
            var cpuUsage = (cpuDiff / (timeDiff * Environment.ProcessorCount)) * 100;
            _lastCpuCheck = currentTime;
            _lastCpuTime = currentCpuTime;
            return Math.Min(100, Math.Max(0, cpuUsage));
        }

        return 0;
    }

    private static long GetTotalMemory()
    {
        try
        {
            var gcMemory = GC.GetTotalMemory(false) / (1024 * 1024); // MB
            return gcMemory;
        }
        catch
        {
            return 0;
        }
    }

    private static double GetDiskUsage()
    {
        try
        {
            var drive = DriveInfo.GetDrives().FirstOrDefault(d => d.IsReady && d.Name == Path.GetPathRoot(Environment.CurrentDirectory));
            if (drive != null)
            {
                var usedSpace = drive.TotalSize - drive.AvailableFreeSpace;
                return (double)usedSpace / drive.TotalSize * 100;
            }
        }
        catch
        {
            // Ignore errors
        }
        return 0;
    }

    private static string FormatUptime(TimeSpan uptime)
    {
        if (uptime.TotalDays >= 1)
            return $"{(int)uptime.TotalDays}d {uptime.Hours}h {uptime.Minutes}m";
        if (uptime.TotalHours >= 1)
            return $"{(int)uptime.TotalHours}h {uptime.Minutes}m";
        return $"{uptime.Minutes}m {uptime.Seconds}s";
    }

    #endregion
}
