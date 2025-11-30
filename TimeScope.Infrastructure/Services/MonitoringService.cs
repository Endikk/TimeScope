using System.Diagnostics;
using System.Runtime.InteropServices;
using Docker.DotNet;
using Docker.DotNet.Models;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace TimeScope.Infrastructure.Services;

public class MonitoringService : IMonitoringService
{
    private static readonly DateTime _startTime = DateTime.UtcNow;
    private static DateTime _lastCpuCheck = DateTime.UtcNow;
    private static TimeSpan _lastCpuTime = TimeSpan.Zero;
    private readonly DockerClient _dockerClient;
    private readonly ILogger<MonitoringService> _logger;

    public MonitoringService(ILogger<MonitoringService> logger)
    {
        _logger = logger;
        // Auto-detect Docker socket based on OS
        var dockerUri = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
            ? new Uri("npipe://./pipe/docker_engine")
            : new Uri("unix:///var/run/docker.sock");

        _dockerClient = new DockerClientConfiguration(dockerUri).CreateClient();
    }

    public async Task<DockerMetrics> GetDockerMetricsAsync()
    {
        try
        {
            var containers = await _dockerClient.Containers.ListContainersAsync(new ContainersListParameters { All = true });
            
            var metrics = new DockerMetrics
            {
                TotalContainers = containers.Count,
                RunningContainers = containers.Count(c => c.State == "running"),
                StoppedContainers = containers.Count(c => c.State == "exited"),
                PausedContainers = containers.Count(c => c.State == "paused"),
                Timestamp = DateTime.UtcNow
            };

            var tasks = containers.Select(async container =>
            {
                var containerMetric = new ContainerMetrics
                {
                    Id = container.ID.Substring(0, 12),
                    Name = container.Names.FirstOrDefault()?.TrimStart('/') ?? "Unknown",
                    Image = container.Image,
                    State = container.State,
                    Status = container.Status
                };

                if (container.State == "running")
                {
                    var sw = Stopwatch.StartNew();
                    try
                    {
                        // Get stats (stream=false for snapshot)
                        // Add timeout to prevent hanging
                        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5)); // Increased timeout slightly
                        var statsStream = await _dockerClient.Containers.GetContainerStatsAsync(container.ID, new ContainerStatsParameters { Stream = false }, cts.Token);

                        using (var reader = new StreamReader(statsStream))
                        {
                            var json = await reader.ReadToEndAsync();
                            // Use Newtonsoft.Json for correct deserialization of Docker models
                            var stats = JsonConvert.DeserializeObject<ContainerStatsResponse>(json);

                            if (stats != null)
                            {
                                // Calculate CPU Usage
                                var cpuDelta = stats.CPUStats.CPUUsage.TotalUsage - stats.PreCPUStats.CPUUsage.TotalUsage;
                                var systemCpuDelta = stats.CPUStats.SystemUsage - stats.PreCPUStats.SystemUsage;
                                var cpuCount = stats.CPUStats.OnlineCPUs > 0 ? (int)stats.CPUStats.OnlineCPUs : Environment.ProcessorCount;

                                if (systemCpuDelta > 0 && cpuDelta > 0)
                                {
                                    containerMetric.CpuUsage = (double)cpuDelta / systemCpuDelta * cpuCount * 100.0;
                                }

                                // Calculate Memory Usage
                                containerMetric.MemoryUsage = (long)stats.MemoryStats.Usage;
                                containerMetric.MemoryLimit = (long)stats.MemoryStats.Limit;
                                if (containerMetric.MemoryLimit > 0)
                                {
                                    containerMetric.MemoryUsagePercent = (double)containerMetric.MemoryUsage / containerMetric.MemoryLimit * 100.0;
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to get stats for container {ContainerId} ({ContainerName})", container.ID.Substring(0, 12), containerMetric.Name);
                    }
                    finally
                    {
                        sw.Stop();
                        if (sw.ElapsedMilliseconds > 500)
                        {
                            _logger.LogWarning("Slow stats fetch for container {ContainerName}: {Elapsed}ms", containerMetric.Name, sw.ElapsedMilliseconds);
                        }
                    }
                }
                return containerMetric;
            });

            var results = await Task.WhenAll(tasks);
            metrics.Containers.AddRange(results);

            return metrics;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching Docker metrics");
            // Return empty metrics if Docker is not available
            return new DockerMetrics { Timestamp = DateTime.UtcNow };
        }
    }

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

    public LogsResponse GetLogs(int limit)
    {
        // Dummy implementation since we don't have a log store yet
        var logs = new List<LogEntry>
        {
            new LogEntry { Timestamp = DateTime.UtcNow, Level = "Information", Message = "System monitoring started", Source = "TimeScope.Monitoring" },
            new LogEntry { Timestamp = DateTime.UtcNow.AddSeconds(-5), Level = "Information", Message = "Docker client initialized", Source = "TimeScope.Infrastructure" },
            new LogEntry { Timestamp = DateTime.UtcNow.AddSeconds(-10), Level = "Information", Message = "Application started", Source = "TimeScope.API" }
        };

        return new LogsResponse
        {
            Logs = logs,
            Total = logs.Count
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
