namespace TimeScope.Infrastructure.Services;

/// <summary>
/// DTOs partagés pour les services d'administration et de maintenance
/// </summary>

public class DatabasesSummary
{
    public DatabaseSummary AdminDatabase { get; set; } = new();
    public DatabaseSummary ProjectsDatabase { get; set; } = new();
    public DatabaseSummary TimeDatabase { get; set; } = new();
    public DatabaseSummary ReportsDatabase { get; set; } = new();
}

public class DatabaseSummary
{
    public string Name { get; set; } = string.Empty;
    public int TablesCount { get; set; }
    public int TotalRecords { get; set; }
    public Dictionary<string, int> Collections { get; set; } = new();
}

public class ConnectionTestResult
{
    public List<ConnectionTest> Tests { get; set; } = new();
    public bool AllSuccessful { get; set; }
    public DateTime Timestamp { get; set; }
}

public class ConnectionTest
{
    public string DatabaseName { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public long ResponseTimeMs { get; set; }
    public TimeSpan ResponseTime { get; set; }
}

public class CleanupResult
{
    public List<DatabaseCleanupResult> DatabaseResults { get; set; } = new();
    public int TotalRecordsRemoved { get; set; }
    public int TotalRecordsCleaned { get; set; }
    public DateTime Timestamp { get; set; }
}

public class DatabaseCleanupResult
{
    public string DatabaseName { get; set; } = string.Empty;
    public int RecordsRemoved { get; set; }
    public int RecordsCleaned { get; set; }
    public string Details { get; set; } = string.Empty;
}

public class UsageStatistics
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalProjects { get; set; }
    public int TotalTasks { get; set; }
    public int TotalTimeEntries { get; set; }
    public int RecentAuditLogs { get; set; }
    public string Period { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
}

public class ExportResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public object? DataSummary { get; set; }
    public DateTime Timestamp { get; set; }
}

public class DatabaseConnectionHealth
{
    public string DatabaseName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsConnected { get; set; }
    public bool IsHealthy { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public long ResponseTimeMs { get; set; }
    public TimeSpan ResponseTime { get; set; }
}

public class OptimizationResult
{
    public string Database { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}

public class DatabaseStatistics
{
    public string Database { get; set; } = string.Empty;
    public long TotalSize { get; set; }
    public int TableCount { get; set; }
    public long TotalRows { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class BackupInfo
{
    public string Database { get; set; } = string.Empty;
    public DateTime? LastBackup { get; set; }
    public long? BackupSize { get; set; }
    public string Status { get; set; } = string.Empty;
}
