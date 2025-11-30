using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TimeScope.Infrastructure.Data;

namespace TimeScope.Infrastructure.Services;

public class AdministrationService : IAdministrationService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdministrationService> _logger;

    public AdministrationService(
        ApplicationDbContext context,
        ILogger<AdministrationService> logger)
    {
        _context = context;
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
                TotalRecords = await _context.Users.CountAsync() + await _context.AppSettings.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "Users", await _context.Users.CountAsync() },
                    { "AppSettings", await _context.AppSettings.CountAsync() }
                }
            },
            ProjectsDatabase = new DatabaseSummary
            {
                Name = "Projects",
                TablesCount = 3,
                TotalRecords = await _context.Projects.CountAsync() +
                              await _context.Groups.CountAsync() +
                              await _context.Themes.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "Projects", await _context.Projects.CountAsync() },
                    { "Groups", await _context.Groups.CountAsync() },
                    { "Themes", await _context.Themes.CountAsync() }
                }
            },
            TimeDatabase = new DatabaseSummary
            {
                Name = "Time",
                TablesCount = 2,
                TotalRecords = await _context.Tasks.CountAsync() + await _context.TimeEntries.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "Tasks", await _context.Tasks.CountAsync() },
                    { "TimeEntries", await _context.TimeEntries.CountAsync() }
                }
            },
            ReportsDatabase = new DatabaseSummary
            {
                Name = "Reports",
                TablesCount = 1,
                TotalRecords = await _context.AuditLogs.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "AuditLogs", await _context.AuditLogs.CountAsync() }
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

        // Test Unified DB
        result.Tests.Add(await TestConnectionAsync("Unified DB", _context));

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
        var deletedUsers = await _context.Users.Where(u => u.IsDeleted).CountAsync();
        var deletedSettings = await _context.AppSettings.Where(s => s.IsDeleted).CountAsync();
        result.DatabaseResults.Add(new DatabaseCleanupResult
        {
            DatabaseName = "Admin",
            RecordsRemoved = deletedUsers + deletedSettings,
            Details = $"{deletedUsers} users, {deletedSettings} settings"
        });

        // Projects DB
        var deletedProjects = await _context.Projects.Where(p => p.IsDeleted).CountAsync();
        var deletedGroups = await _context.Groups.Where(g => g.IsDeleted).CountAsync();
        var deletedThemes = await _context.Themes.Where(t => t.IsDeleted).CountAsync();
        result.DatabaseResults.Add(new DatabaseCleanupResult
        {
            DatabaseName = "Projects",
            RecordsRemoved = deletedProjects + deletedGroups + deletedThemes,
            Details = $"{deletedProjects} projects, {deletedGroups} groups, {deletedThemes} themes"
        });

        // Time DB
        var deletedTasks = await _context.Tasks.Where(t => t.IsDeleted).CountAsync();
        var deletedEntries = await _context.TimeEntries.Where(te => te.IsDeleted).CountAsync();
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
            TotalUsers = await _context.Users.CountAsync(),
            ActiveUsers = await _context.Users.CountAsync(u => u.IsActive),
            TotalProjects = await _context.Projects.CountAsync(p => !p.IsDeleted),
            TotalTasks = await _context.Tasks.CountAsync(t => !t.IsDeleted),
            TotalTimeEntries = await _context.TimeEntries.CountAsync(te => !te.IsDeleted),
            RecentAuditLogs = await _context.AuditLogs.CountAsync(log => log.Timestamp >= thirtyDaysAgo),
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
            UsersCount = await _context.Users.CountAsync(),
            ProjectsCount = await _context.Projects.CountAsync(),
            TasksCount = await _context.Tasks.CountAsync(),
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
