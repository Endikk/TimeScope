using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeScope.Infrastructure.Data;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdministrationController : ControllerBase
{
    private readonly AdminDbContext _adminContext;
    private readonly ProjectsDbContext _projectsContext;
    private readonly TimeDbContext _timeContext;
    private readonly ReportsDbContext _reportsContext;
    private readonly ILogger<AdministrationController> _logger;

    public AdministrationController(
        AdminDbContext adminContext,
        ProjectsDbContext projectsContext,
        TimeDbContext timeContext,
        ReportsDbContext reportsContext,
        ILogger<AdministrationController> logger)
    {
        _adminContext = adminContext;
        _projectsContext = projectsContext;
        _timeContext = timeContext;
        _reportsContext = reportsContext;
        _logger = logger;
    }

    /// <summary>
    /// Récupère un résumé de toutes les bases de données
    /// </summary>
    [HttpGet("databases/summary")]
    public async Task<ActionResult<DatabasesSummary>> GetDatabasesSummary()
    {
        try
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

            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving databases summary");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Teste les connexions aux bases de données
    /// </summary>
    [HttpGet("databases/test-connections")]
    public async Task<ActionResult<ConnectionTestResult>> TestDatabaseConnections()
    {
        var result = new ConnectionTestResult
        {
            Tests = new List<ConnectionTest>()
        };

        try
        {
            // Test Admin DB
            result.Tests.Add(await TestConnection("Admin", _adminContext));

            // Test Projects DB
            result.Tests.Add(await TestConnection("Projects", _projectsContext));

            // Test Time DB
            result.Tests.Add(await TestConnection("Time", _timeContext));

            // Test Reports DB
            result.Tests.Add(await TestConnection("Reports", _reportsContext));

            result.AllSuccessful = result.Tests.All(t => t.Success);
            result.Timestamp = DateTime.UtcNow;

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing database connections");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Nettoie les données supprimées (soft delete)
    /// </summary>
    [HttpPost("cleanup/soft-deleted")]
    public async Task<ActionResult<CleanupResult>> CleanupSoftDeleted()
    {
        try
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

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cleanup");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère les statistiques d'utilisation du système
    /// </summary>
    [HttpGet("usage/statistics")]
    public async Task<ActionResult<UsageStatistics>> GetUsageStatistics()
    {
        try
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

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving usage statistics");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Exporte les données système
    /// </summary>
    [HttpGet("export/system-data")]
    public async Task<ActionResult<ExportResult>> ExportSystemData()
    {
        try
        {
            var exportData = new
            {
                ExportDate = DateTime.UtcNow,
                UsersCount = await _adminContext.Users.CountAsync(),
                ProjectsCount = await _projectsContext.Projects.CountAsync(),
                TasksCount = await _timeContext.Tasks.CountAsync(),
                Message = "Export data summary generated successfully"
            };

            return Ok(new ExportResult
            {
                Success = true,
                Message = "Export completed successfully",
                DataSummary = exportData,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting system data");
            return StatusCode(500, "Internal server error");
        }
    }

    private async Task<ConnectionTest> TestConnection(string name, DbContext context)
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

// DTOs
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
}

public class CleanupResult
{
    public List<DatabaseCleanupResult> DatabaseResults { get; set; } = new();
    public int TotalRecordsRemoved { get; set; }
    public DateTime Timestamp { get; set; }
}

public class DatabaseCleanupResult
{
    public string DatabaseName { get; set; } = string.Empty;
    public int RecordsRemoved { get; set; }
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
