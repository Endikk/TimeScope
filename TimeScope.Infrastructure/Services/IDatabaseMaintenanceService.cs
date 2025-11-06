using Microsoft.EntityFrameworkCore;

namespace TimeScope.Infrastructure.Services;

public interface IDatabaseMaintenanceService
{
    Task<DatabaseStats> GetDatabaseStatsAsync();
    Task<DatabaseHealth> GetDatabaseHealthAsync();
    Task<OptimizationResult> OptimizeDatabasesAsync();
    Task<DatabasesSummary> GetDatabasesSummaryAsync();
    Task<ConnectionTestResult> TestDatabaseConnectionsAsync();
    Task<CleanupResult> CleanupSoftDeletedAsync();
    Task<IEnumerable<ConnectionTest>> TestAllConnectionsAsync();
    Task<IEnumerable<DatabaseStatistics>> GetDatabaseStatisticsAsync();
    Task<IEnumerable<OptimizationResult>> OptimizeAllDatabasesAsync();
    Task<IEnumerable<OptimizationResult>> VacuumAllDatabasesAsync();
    Task<IEnumerable<OptimizationResult>> ReindexAllDatabasesAsync();
    Task<IEnumerable<BackupInfo>> GetBackupInfoAsync();
}

public class DatabaseStats
{
    public DatabaseInfo AdminDatabase { get; set; } = new();
    public DatabaseInfo ProjectsDatabase { get; set; } = new();
    public DatabaseInfo TimeDatabase { get; set; } = new();
    public DatabaseInfo ReportsDatabase { get; set; } = new();
}

public class DatabaseInfo
{
    public string Name { get; set; } = string.Empty;
    public int UsersCount { get; set; }
    public int ActiveUsersCount { get; set; }
    public int ProjectsCount { get; set; }
    public int GroupsCount { get; set; }
    public int ThemesCount { get; set; }
    public int TasksCount { get; set; }
    public int TimeEntriesCount { get; set; }
    public int TotalRecords { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class DatabaseHealth
{
    public string OverallStatus { get; set; } = string.Empty;
    public DatabaseConnectionHealth AdminDatabase { get; set; } = new();
    public DatabaseConnectionHealth ProjectsDatabase { get; set; } = new();
    public DatabaseConnectionHealth TimeDatabase { get; set; } = new();
    public DatabaseConnectionHealth ReportsDatabase { get; set; } = new();
}
