using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Diagnostics;
using TimeScope.Infrastructure.Data;

namespace TimeScope.Infrastructure.Services;

public class DatabaseMaintenanceService : IDatabaseMaintenanceService
{
    private readonly AdminDbContext _adminContext;
    private readonly ProjectsDbContext _projectsContext;
    private readonly TimeDbContext _timeContext;
    private readonly ReportsDbContext _reportsContext;

    public DatabaseMaintenanceService(
        AdminDbContext adminContext,
        ProjectsDbContext projectsContext,
        TimeDbContext timeContext,
        ReportsDbContext reportsContext)
    {
        _adminContext = adminContext;
        _projectsContext = projectsContext;
        _timeContext = timeContext;
        _reportsContext = reportsContext;
    }

    public async Task<DatabaseStats> GetDatabaseStatsAsync()
    {
        var stats = new DatabaseStats
        {
            AdminDatabase = new DatabaseInfo
            {
                Name = "Admin",
                UsersCount = await _adminContext.Users.CountAsync(),
                ActiveUsersCount = await _adminContext.Users.Where(u => u.IsActive).CountAsync(),
                TotalRecords = await _adminContext.Users.CountAsync(),
                LastUpdated = await _adminContext.Users
                    .OrderByDescending(u => u.UpdatedAt)
                    .Select(u => u.UpdatedAt)
                    .FirstOrDefaultAsync() ?? DateTime.UtcNow
            },
            ProjectsDatabase = new DatabaseInfo
            {
                Name = "Projects",
                ProjectsCount = await _projectsContext.Projects.CountAsync(),
                GroupsCount = await _projectsContext.Groups.CountAsync(),
                ThemesCount = await _projectsContext.Themes.CountAsync(),
                TotalRecords = await _projectsContext.Projects.CountAsync() +
                               await _projectsContext.Groups.CountAsync() +
                               await _projectsContext.Themes.CountAsync(),
                LastUpdated = await GetLastUpdatedDate(_projectsContext)
            },
            TimeDatabase = new DatabaseInfo
            {
                Name = "Time",
                TasksCount = await _timeContext.Tasks.CountAsync(),
                TimeEntriesCount = await _timeContext.TimeEntries.CountAsync(),
                TotalRecords = await _timeContext.Tasks.CountAsync() +
                               await _timeContext.TimeEntries.CountAsync(),
                LastUpdated = await GetLastUpdatedDate(_timeContext)
            },
            ReportsDatabase = new DatabaseInfo
            {
                Name = "Reports",
                TotalRecords = await _reportsContext.AuditLogs.CountAsync(),
                LastUpdated = DateTime.UtcNow
            }
        };

        return stats;
    }

    public async Task<DatabaseHealth> GetDatabaseHealthAsync()
    {
        var health = new DatabaseHealth
        {
            AdminDatabase = await CheckDatabaseConnection(_adminContext.Database, "Admin"),
            ProjectsDatabase = await CheckDatabaseConnection(_projectsContext.Database, "Projects"),
            TimeDatabase = await CheckDatabaseConnection(_timeContext.Database, "Time"),
            ReportsDatabase = await CheckDatabaseConnection(_reportsContext.Database, "Reports")
        };

        var allHealthy = health.AdminDatabase.IsHealthy &&
                        health.ProjectsDatabase.IsHealthy &&
                        health.TimeDatabase.IsHealthy &&
                        health.ReportsDatabase.IsHealthy;

        health.OverallStatus = allHealthy ? "Healthy" : "Unhealthy";

        return health;
    }

    public async Task<OptimizationResult> OptimizeDatabasesAsync()
    {
        var result = new OptimizationResult
        {
            StartTime = DateTime.UtcNow
        };

        try
        {
            // ANALYZE pour PostgreSQL (met à jour les statistiques du query planner)
            await _adminContext.Database.ExecuteSqlRawAsync("ANALYZE");
            await _projectsContext.Database.ExecuteSqlRawAsync("ANALYZE");
            await _timeContext.Database.ExecuteSqlRawAsync("ANALYZE");
            await _reportsContext.Database.ExecuteSqlRawAsync("ANALYZE");

            result.Success = true;
            result.Message = "Optimization completed successfully";
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Optimization failed: {ex.Message}";
        }

        result.EndTime = DateTime.UtcNow;

        return result;
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

        result.Tests.Add(await TestConnection("Admin", _adminContext.Database));
        result.Tests.Add(await TestConnection("Projects", _projectsContext.Database));
        result.Tests.Add(await TestConnection("Time", _timeContext.Database));
        result.Tests.Add(await TestConnection("Reports", _reportsContext.Database));

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

        // Note: Cette implémentation compte les enregistrements marqués comme supprimés
        // En production, vous pourriez vouloir les supprimer définitivement
        
        var adminCleanup = new DatabaseCleanupResult
        {
            DatabaseName = "Admin",
            RecordsCleaned = await _adminContext.Users.Where(u => u.IsDeleted).CountAsync()
        };
        result.DatabaseResults.Add(adminCleanup);

        var projectsCleanup = new DatabaseCleanupResult
        {
            DatabaseName = "Projects",
            RecordsCleaned = await _projectsContext.Projects.Where(p => p.IsDeleted).CountAsync() +
                            await _projectsContext.Groups.Where(g => g.IsDeleted).CountAsync() +
                            await _projectsContext.Themes.Where(t => t.IsDeleted).CountAsync()
        };
        result.DatabaseResults.Add(projectsCleanup);

        var timeCleanup = new DatabaseCleanupResult
        {
            DatabaseName = "Time",
            RecordsCleaned = await _timeContext.Tasks.Where(t => t.IsDeleted).CountAsync() +
                            await _timeContext.TimeEntries.Where(te => te.IsDeleted).CountAsync()
        };
        result.DatabaseResults.Add(timeCleanup);

        result.TotalRecordsCleaned = result.DatabaseResults.Sum(r => r.RecordsCleaned);

        return result;
    }

    #region Private Helper Methods

    private static async Task<DatabaseConnectionHealth> CheckDatabaseConnection(DatabaseFacade database, string name)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await database.ExecuteSqlRawAsync("SELECT 1");
            stopwatch.Stop();

            return new DatabaseConnectionHealth
            {
                Name = name,
                IsHealthy = true,
                Message = "Connection successful",
                ResponseTime = stopwatch.Elapsed
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            return new DatabaseConnectionHealth
            {
                Name = name,
                IsHealthy = false,
                Message = $"Connection failed: {ex.Message}",
                ResponseTime = stopwatch.Elapsed
            };
        }
    }

    private static async Task<ConnectionTest> TestConnection(string name, DatabaseFacade database)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await database.ExecuteSqlRawAsync("SELECT 1");
            stopwatch.Stop();

            return new ConnectionTest
            {
                DatabaseName = name,
                Success = true,
                Message = "Connection successful",
                ResponseTime = stopwatch.Elapsed
            };
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            return new ConnectionTest
            {
                DatabaseName = name,
                Success = false,
                Message = $"Connection failed: {ex.Message}",
                ResponseTime = stopwatch.Elapsed
            };
        }
    }

    private static async Task<DateTime> GetLastUpdatedDate(ProjectsDbContext context)
    {
        var projectDate = await context.Projects
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => p.UpdatedAt)
            .FirstOrDefaultAsync();

        var groupDate = await context.Groups
            .OrderByDescending(g => g.UpdatedAt)
            .Select(g => g.UpdatedAt)
            .FirstOrDefaultAsync();

        var themeDate = await context.Themes
            .OrderByDescending(t => t.UpdatedAt)
            .Select(t => t.UpdatedAt)
            .FirstOrDefaultAsync();

        return new[] { projectDate ?? DateTime.UtcNow, groupDate ?? DateTime.UtcNow, themeDate ?? DateTime.UtcNow, DateTime.UtcNow }.Max();
    }

    private static async Task<DateTime> GetLastUpdatedDate(TimeDbContext context)
    {
        var taskDate = await context.Tasks
            .OrderByDescending(t => t.UpdatedAt)
            .Select(t => t.UpdatedAt)
            .FirstOrDefaultAsync();

        var entryDate = await context.TimeEntries
            .OrderByDescending(te => te.UpdatedAt)
            .Select(te => te.UpdatedAt)
            .FirstOrDefaultAsync();

        return new[] { taskDate ?? DateTime.UtcNow, entryDate ?? DateTime.UtcNow, DateTime.UtcNow }.Max();
    }

    #endregion

    #region New Interface Methods

    public async Task<IEnumerable<ConnectionTest>> TestAllConnectionsAsync()
    {
        var result = await TestDatabaseConnectionsAsync();
        return result.Tests;
    }

    public async Task<IEnumerable<DatabaseStatistics>> GetDatabaseStatisticsAsync()
    {
        var stats = await GetDatabaseStatsAsync();
        
        var statisticsList = new List<DatabaseStatistics>
        {
            new DatabaseStatistics
            {
                Database = "Admin",
                TotalRows = stats.AdminDatabase.TotalRecords,
                TableCount = 2,
                LastUpdated = stats.AdminDatabase.LastUpdated
            },
            new DatabaseStatistics
            {
                Database = "Projects",
                TotalRows = stats.ProjectsDatabase.TotalRecords,
                TableCount = 3,
                LastUpdated = stats.ProjectsDatabase.LastUpdated
            },
            new DatabaseStatistics
            {
                Database = "Time",
                TotalRows = stats.TimeDatabase.TotalRecords,
                TableCount = 2,
                LastUpdated = stats.TimeDatabase.LastUpdated
            },
            new DatabaseStatistics
            {
                Database = "Reports",
                TotalRows = stats.ReportsDatabase.TotalRecords,
                TableCount = 1,
                LastUpdated = stats.ReportsDatabase.LastUpdated
            }
        };

        return statisticsList;
    }

    public async Task<IEnumerable<OptimizationResult>> OptimizeAllDatabasesAsync()
    {
        var results = new List<OptimizationResult>();

        // Optimize Admin DB
        var adminResult = await OptimizeDatabase(_adminContext, "Admin");
        results.Add(adminResult);

        // Optimize Projects DB
        var projectsResult = await OptimizeDatabase(_projectsContext, "Projects");
        results.Add(projectsResult);

        // Optimize Time DB
        var timeResult = await OptimizeDatabase(_timeContext, "Time");
        results.Add(timeResult);

        // Optimize Reports DB
        var reportsResult = await OptimizeDatabase(_reportsContext, "Reports");
        results.Add(reportsResult);

        return results;
    }

    public async Task<IEnumerable<OptimizationResult>> VacuumAllDatabasesAsync()
    {
        var results = new List<OptimizationResult>();

        // Vacuum Admin DB
        var adminResult = await VacuumDatabase(_adminContext, "Admin");
        results.Add(adminResult);

        // Vacuum Projects DB
        var projectsResult = await VacuumDatabase(_projectsContext, "Projects");
        results.Add(projectsResult);

        // Vacuum Time DB
        var timeResult = await VacuumDatabase(_timeContext, "Time");
        results.Add(timeResult);

        // Vacuum Reports DB
        var reportsResult = await VacuumDatabase(_reportsContext, "Reports");
        results.Add(reportsResult);

        return results;
    }

    public async Task<IEnumerable<OptimizationResult>> ReindexAllDatabasesAsync()
    {
        var results = new List<OptimizationResult>();

        // Reindex Admin DB
        var adminResult = await ReindexDatabase(_adminContext, "Admin");
        results.Add(adminResult);

        // Reindex Projects DB
        var projectsResult = await ReindexDatabase(_projectsContext, "Projects");
        results.Add(projectsResult);

        // Reindex Time DB
        var timeResult = await ReindexDatabase(_timeContext, "Time");
        results.Add(timeResult);

        // Reindex Reports DB
        var reportsResult = await ReindexDatabase(_reportsContext, "Reports");
        results.Add(reportsResult);

        return results;
    }

    public async Task<IEnumerable<BackupInfo>> GetBackupInfoAsync()
    {
        // Placeholder - en production, ceci devrait récupérer les vraies informations de backup
        var backups = new List<BackupInfo>
        {
            new BackupInfo
            {
                Database = "Admin",
                LastBackup = DateTime.UtcNow.AddDays(-1),
                BackupSize = 1024 * 1024 * 50, // 50 MB
                Status = "Success"
            },
            new BackupInfo
            {
                Database = "Projects",
                LastBackup = DateTime.UtcNow.AddDays(-1),
                BackupSize = 1024 * 1024 * 100, // 100 MB
                Status = "Success"
            },
            new BackupInfo
            {
                Database = "Time",
                LastBackup = DateTime.UtcNow.AddDays(-1),
                BackupSize = 1024 * 1024 * 200, // 200 MB
                Status = "Success"
            },
            new BackupInfo
            {
                Database = "Reports",
                LastBackup = DateTime.UtcNow.AddDays(-1),
                BackupSize = 1024 * 1024 * 75, // 75 MB
                Status = "Success"
            }
        };

        return await Task.FromResult(backups);
    }

    private async Task<OptimizationResult> OptimizeDatabase(DbContext context, string databaseName)
    {
        var result = new OptimizationResult
        {
            Database = databaseName,
            StartTime = DateTime.UtcNow
        };

        try
        {
            await context.Database.ExecuteSqlRawAsync("ANALYZE");
            result.Success = true;
            result.Message = $"Optimization completed successfully for {databaseName}";
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Optimization failed for {databaseName}: {ex.Message}";
        }

        result.EndTime = DateTime.UtcNow;
        result.Duration = result.EndTime - result.StartTime;

        return result;
    }

    private async Task<OptimizationResult> VacuumDatabase(DbContext context, string databaseName)
    {
        var result = new OptimizationResult
        {
            Database = databaseName,
            StartTime = DateTime.UtcNow
        };

        try
        {
            await context.Database.ExecuteSqlRawAsync("VACUUM ANALYZE");
            result.Success = true;
            result.Message = $"Vacuum completed successfully for {databaseName}";
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Vacuum failed for {databaseName}: {ex.Message}";
        }

        result.EndTime = DateTime.UtcNow;
        result.Duration = result.EndTime - result.StartTime;

        return result;
    }

    private async Task<OptimizationResult> ReindexDatabase(DbContext context, string databaseName)
    {
        var result = new OptimizationResult
        {
            Database = databaseName,
            StartTime = DateTime.UtcNow
        };

        try
        {
            await context.Database.ExecuteSqlRawAsync("REINDEX DATABASE CURRENT");
            result.Success = true;
            result.Message = $"Reindex completed successfully for {databaseName}";
        }
        catch (Exception ex)
        {
            result.Success = false;
            result.Message = $"Reindex failed for {databaseName}: {ex.Message}";
        }

        result.EndTime = DateTime.UtcNow;
        result.Duration = result.EndTime - result.StartTime;

        return result;
    }

    #endregion
}
