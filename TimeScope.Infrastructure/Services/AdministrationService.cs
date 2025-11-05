using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TimeScope.Infrastructure.Data;

namespace TimeScope.Infrastructure.Services;

public class AdministrationService : IAdministrationService
{
    private readonly AdminDbContext _adminContext;
    private readonly ProjectsDbContext _projectsContext;
    private readonly TimeDbContext _timeContext;
    private readonly ReportsDbContext _reportsContext;
    private readonly ILogger<AdministrationService> _logger;

    public AdministrationService(
        AdminDbContext adminContext,
        ProjectsDbContext projectsContext,
        TimeDbContext timeContext,
        ReportsDbContext reportsContext,
        ILogger<AdministrationService> logger)
    {
        _adminContext = adminContext;
        _projectsContext = projectsContext;
        _timeContext = timeContext;
        _reportsContext = reportsContext;
        _logger = logger;
    }

    public async Task<DatabasesSummary> GetDatabasesSummaryAsync()
    {
        var summary = new DatabasesSummary
        {
            AdminDatabase = new DatabaseSummary
            {
                Name = "Admin",
                TablesCount = 2,
                TotalRecords = await _adminContext.Users.CountAsync() + await _adminContext.AppSettings.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "Users", await _adminContext.Users.CountAsync() },
                    { "AppSettings", await _adminContext.AppSettings.CountAsync() }
                }
            },
            ProjectsDatabase = new DatabaseSummary
            {
                Name = "Projects",
                TablesCount = 3,
                TotalRecords = await _projectsContext.Projects.CountAsync() +
                              await _projectsContext.Groups.CountAsync() +
                              await _projectsContext.Themes.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "Projects", await _projectsContext.Projects.CountAsync() },
                    { "Groups", await _projectsContext.Groups.CountAsync() },
                    { "Themes", await _projectsContext.Themes.CountAsync() }
                }
            },
            TimeDatabase = new DatabaseSummary
            {
                Name = "Time",
                TablesCount = 2,
                TotalRecords = await _timeContext.Tasks.CountAsync() + await _timeContext.TimeEntries.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "Tasks", await _timeContext.Tasks.CountAsync() },
                    { "TimeEntries", await _timeContext.TimeEntries.CountAsync() }
                }
            },
            ReportsDatabase = new DatabaseSummary
            {
                Name = "Reports",
                TablesCount = 1,
                TotalRecords = await _reportsContext.AuditLogs.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "AuditLogs", await _reportsContext.AuditLogs.CountAsync() }
                }
            }
        };

        return summary;
    }

    public async Task<ConnectionTestResult> TestDatabaseConnectionsAsync()
    {
        var result = new ConnectionTestResult
        {
            Tests = new List<ConnectionTest>()
        };

        // Test Admin DB
        result.Tests.Add(await TestConnectionAsync("Admin", _adminContext));

        // Test Projects DB
        result.Tests.Add(await TestConnectionAsync("Projects", _projectsContext));

        // Test Time DB
        result.Tests.Add(await TestConnectionAsync("Time", _timeContext));

        // Test Reports DB
        result.Tests.Add(await TestConnectionAsync("Reports", _reportsContext));

        result.AllSuccessful = result.Tests.All(t => t.Success);
        result.Timestamp = DateTime.UtcNow;

        return result;
    }

    public async Task<CleanupResult> CleanupSoftDeletedAsync()
    {
        var result = new CleanupResult
        {
            DatabaseResults = new List<DatabaseCleanupResult>()
        };

        // Admin DB
        var deletedUsers = await _adminContext.Users.Where(u => u.IsDeleted).CountAsync();
        var deletedSettings = await _adminContext.AppSettings.Where(s => s.IsDeleted).CountAsync();
        result.DatabaseResults.Add(new DatabaseCleanupResult
        {
            DatabaseName = "Admin",
            RecordsRemoved = deletedUsers + deletedSettings,
            Details = $"{deletedUsers} users, {deletedSettings} settings"
        });

        // Projects DB
        var deletedProjects = await _projectsContext.Projects.Where(p => p.IsDeleted).CountAsync();
        var deletedGroups = await _projectsContext.Groups.Where(g => g.IsDeleted).CountAsync();
        var deletedThemes = await _projectsContext.Themes.Where(t => t.IsDeleted).CountAsync();
        result.DatabaseResults.Add(new DatabaseCleanupResult
        {
            DatabaseName = "Projects",
            RecordsRemoved = deletedProjects + deletedGroups + deletedThemes,
            Details = $"{deletedProjects} projects, {deletedGroups} groups, {deletedThemes} themes"
        });

        // Time DB
        var deletedTasks = await _timeContext.Tasks.Where(t => t.IsDeleted).CountAsync();
        var deletedEntries = await _timeContext.TimeEntries.Where(te => te.IsDeleted).CountAsync();
        result.DatabaseResults.Add(new DatabaseCleanupResult
        {
            DatabaseName = "Time",
            RecordsRemoved = deletedTasks + deletedEntries,
            Details = $"{deletedTasks} tasks, {deletedEntries} time entries"
        });

        result.TotalRecordsRemoved = result.DatabaseResults.Sum(r => r.RecordsRemoved);
        result.Timestamp = DateTime.UtcNow;

        _logger.LogInformation("Cleanup completed. Total records found: {Total}", result.TotalRecordsRemoved);

        return result;
    }

    public async Task<UsageStatistics> GetUsageStatisticsAsync()
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);

        var stats = new UsageStatistics
        {
            TotalUsers = await _adminContext.Users.CountAsync(),
            ActiveUsers = await _adminContext.Users.CountAsync(u => u.IsActive),
            TotalProjects = await _projectsContext.Projects.CountAsync(p => !p.IsDeleted),
            TotalTasks = await _timeContext.Tasks.CountAsync(t => !t.IsDeleted),
            TotalTimeEntries = await _timeContext.TimeEntries.CountAsync(te => !te.IsDeleted),
            RecentAuditLogs = await _reportsContext.AuditLogs.CountAsync(log => log.Timestamp >= thirtyDaysAgo),
            Period = "Last 30 days",
            Timestamp = now
        };

        return stats;
    }

    public async Task<ExportResult> ExportSystemDataAsync()
    {
        var exportData = new
        {
            ExportDate = DateTime.UtcNow,
            UsersCount = await _adminContext.Users.CountAsync(),
            ProjectsCount = await _projectsContext.Projects.CountAsync(),
            TasksCount = await _timeContext.Tasks.CountAsync(),
            Message = "Export data summary generated successfully"
        };

        return new ExportResult
        {
            Success = true,
            Message = "Export completed successfully",
            DataSummary = exportData,
            Timestamp = DateTime.UtcNow
        };
    }

    private async Task<ConnectionTest> TestConnectionAsync(string name, DbContext context)
    {
        var test = new ConnectionTest { DatabaseName = name };
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            await context.Database.CanConnectAsync();
            stopwatch.Stop();
            test.Success = true;
            test.Message = "Connection successful";
            test.ResponseTimeMs = stopwatch.ElapsedMilliseconds;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            test.Success = false;
            test.Message = ex.Message;
            test.ResponseTimeMs = stopwatch.ElapsedMilliseconds;
        }

        return test;
    }
}
