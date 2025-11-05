using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface IReportService
{
    Task<AuditLog> CreateAuditLogAsync(CreateAuditLogCommand command);
    Task<IEnumerable<AuditLog>> GetAuditLogsAsync(AuditLogFilter filter);
    Task<ReportStatistics> GetStatisticsAsync(DateTime? startDate, DateTime? endDate);
    Task<IEnumerable<ActivitySummary>> GetActivitySummaryAsync(int days);
    Task<IEnumerable<UserActivity>> GetTopUsersAsync(int limit, int days);
}

public class CreateAuditLogCommand
{
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
}

public class AuditLogFilter
{
    public int Limit { get; set; } = 100;
    public string? EntityType { get; set; }
    public Guid? UserId { get; set; }
}

public class ReportStatistics
{
    public int TotalUsers { get; set; }
    public int TotalProjects { get; set; }
    public int TotalGroups { get; set; }
    public int TotalThemes { get; set; }
    public int TotalTasks { get; set; }
    public int TotalTimeEntries { get; set; }
    public int TotalAuditLogs { get; set; }
    public DateTime PeriodStart { get; set; }
    public DateTime PeriodEnd { get; set; }
}

public class ActivitySummary
{
    public string EntityType { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int Count { get; set; }
    public DateTime LastOccurrence { get; set; }
}

public class UserActivity
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int ActionCount { get; set; }
    public DateTime LastActivity { get; set; }
}
