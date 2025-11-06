namespace TimeScope.Infrastructure.Services;

public interface IAdministrationService
{
    Task<DatabasesSummary> GetDatabasesSummaryAsync();
    Task<ConnectionTestResult> TestDatabaseConnectionsAsync();
    Task<CleanupResult> CleanupSoftDeletedAsync();
    Task<UsageStatistics> GetUsageStatisticsAsync();
    Task<ExportResult> ExportSystemDataAsync();
}
