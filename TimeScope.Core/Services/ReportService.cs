using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Core.Services;

public class ReportService : IReportService
{
    private readonly IReportsUnitOfWork _reportsUow;
    private readonly IAdminUnitOfWork _adminUow;
    private readonly IProjectsUnitOfWork _projectsUow;
    private readonly ITimeUnitOfWork _timeUow;

    public ReportService(
        IReportsUnitOfWork reportsUow,
        IAdminUnitOfWork adminUow,
        IProjectsUnitOfWork projectsUow,
        ITimeUnitOfWork timeUow)
    {
        _reportsUow = reportsUow;
        _adminUow = adminUow;
        _projectsUow = projectsUow;
        _timeUow = timeUow;
    }

    public async Task<AuditLog> CreateAuditLogAsync(CreateAuditLogCommand command)
    {
        // Règles métier : validation
        if (string.IsNullOrWhiteSpace(command.Action))
        {
            throw new ArgumentException("Action is required");
        }

        if (string.IsNullOrWhiteSpace(command.EntityType))
        {
            throw new ArgumentException("Entity type is required");
        }

        var log = new AuditLog
        {
            Action = command.Action.Trim(),
            EntityType = command.EntityType.Trim(),
            EntityId = command.EntityId,
            UserId = command.UserId,
            UserName = command.UserName.Trim(),
            Details = command.Details?.Trim() ?? string.Empty,
            IpAddress = command.IpAddress?.Trim() ?? string.Empty,
            Timestamp = DateTime.UtcNow
        };

        await _reportsUow.AuditLogs.AddAsync(log);
        await _reportsUow.SaveChangesAsync();

        return log;
    }

    public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(AuditLogFilter filter)
    {
        var allLogs = await _reportsUow.AuditLogs.GetAllAsync();
        var query = allLogs.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(filter.EntityType))
        {
            query = query.Where(log => log.EntityType == filter.EntityType);
        }

        if (filter.UserId.HasValue)
        {
            query = query.Where(log => log.UserId == filter.UserId.Value);
        }

        return query
            .OrderByDescending(log => log.Timestamp)
            .Take(filter.Limit)
            .ToList();
    }

    public async Task<ReportStatistics> GetStatisticsAsync(DateTime? startDate, DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddDays(-30);
        var end = endDate ?? DateTime.UtcNow;

        // Récupération des données depuis toutes les bases
        var users = await _adminUow.Users.GetAllAsync();
        var projects = await _projectsUow.Projects.GetAllAsync();
        var groups = await _projectsUow.Groups.GetAllAsync();
        var themes = await _projectsUow.Themes.GetAllAsync();
        var tasks = await _timeUow.Tasks.GetAllAsync();
        var timeEntries = await _timeUow.TimeEntries.GetAllAsync();
        var auditLogs = await _reportsUow.AuditLogs.GetAllAsync();

        // Logique métier : calculs de statistiques
        var stats = new ReportStatistics
        {
            TotalUsers = users.Count(u => u.IsActive),
            TotalProjects = projects.Count(p => !p.IsDeleted),
            TotalGroups = groups.Count(g => !g.IsDeleted),
            TotalThemes = themes.Count(t => !t.IsDeleted),
            TotalTasks = tasks.Count(t => !t.IsDeleted),
            TotalTimeEntries = timeEntries.Count(te => !te.IsDeleted),
            TotalAuditLogs = auditLogs.Count(log => log.Timestamp >= start && log.Timestamp <= end),
            PeriodStart = start,
            PeriodEnd = end
        };

        return stats;
    }

    public async Task<IEnumerable<ActivitySummary>> GetActivitySummaryAsync(int days)
    {
        var since = DateTime.UtcNow.AddDays(-days);
        var allLogs = await _reportsUow.AuditLogs.GetAllAsync();

        // Logique métier : agrégation des activités
        var activities = allLogs
            .Where(log => log.Timestamp >= since)
            .GroupBy(log => new { log.EntityType, log.Action })
            .Select(g => new ActivitySummary
            {
                EntityType = g.Key.EntityType,
                Action = g.Key.Action,
                Count = g.Count(),
                LastOccurrence = g.Max(log => log.Timestamp)
            })
            .OrderByDescending(a => a.Count)
            .ToList();

        return activities;
    }

    public async Task<IEnumerable<UserActivity>> GetTopUsersAsync(int limit, int days)
    {
        var since = DateTime.UtcNow.AddDays(-days);
        var allLogs = await _reportsUow.AuditLogs.GetAllAsync();

        // Logique métier : calcul des utilisateurs les plus actifs
        var topUsers = allLogs
            .Where(log => log.Timestamp >= since)
            .GroupBy(log => new { log.UserId, log.UserName })
            .Select(g => new UserActivity
            {
                UserId = g.Key.UserId,
                UserName = g.Key.UserName,
                ActionCount = g.Count(),
                LastActivity = g.Max(log => log.Timestamp)
            })
            .OrderByDescending(u => u.ActionCount)
            .Take(limit)
            .ToList();

        return topUsers;
    }
}
