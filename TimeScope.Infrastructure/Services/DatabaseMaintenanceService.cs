using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using System.Diagnostics;
using TimeScope.Infrastructure.Data;

namespace TimeScope.Infrastructure.Services;

public class DatabaseMaintenanceService : IDatabaseMaintenanceService
{
    private readonly ApplicationDbContext _context;

    public DatabaseMaintenanceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DatabaseStats> GetDatabaseStatsAsync()
    {
        var stats = new DatabaseStats
        {
            AdminDatabase = new DatabaseInfo
            {
                Name = "Admin (Unified)",
                UsersCount = await _context.Users.CountAsync(),
                ActiveUsersCount = await _context.Users.Where(u => u.IsActive).CountAsync(),
                TotalRecords = await _context.Users.CountAsync(),
                LastUpdated = await _context.Users
                    .OrderByDescending(u => u.UpdatedAt)
                    .Select(u => u.UpdatedAt)
                    .FirstOrDefaultAsync() ?? DateTime.UtcNow
            },
            ProjectsDatabase = new DatabaseInfo
            {
                Name = "Projects (Unified)",
                ProjectsCount = await _context.Projects.CountAsync(),
                GroupsCount = await _context.Groups.CountAsync(),
                TasksCount = await _context.Tasks.CountAsync(),
                TotalRecords = await _context.Projects.CountAsync() +
                               await _context.Groups.CountAsync() +
                               await _context.Tasks.CountAsync(),
                LastUpdated = await GetLastUpdatedDateProjects(_context)
            },
            TimeDatabase = new DatabaseInfo
            {
                Name = "Time (Unified)",
                TimeEntriesCount = await _context.TimeEntries.CountAsync(),
                TotalRecords = await _context.TimeEntries.CountAsync(),
                LastUpdated = await GetLastUpdatedDateTime(_context)
            },
            ReportsDatabase = new DatabaseInfo
            {
                Name = "Reports (Unified)",
                TotalRecords = await _context.AuditLogs.CountAsync(),
                LastUpdated = DateTime.UtcNow
            }
        };

        return stats;
    }

    public async Task<DatabaseHealth> GetDatabaseHealthAsync()
    {
        var health = new DatabaseHealth
        {
            AdminDatabase = await CheckDatabaseConnection(_context.Database, "Unified DB"),
            ProjectsDatabase = await CheckDatabaseConnection(_context.Database, "Unified DB"),
            TimeDatabase = await CheckDatabaseConnection(_context.Database, "Unified DB"),
            ReportsDatabase = await CheckDatabaseConnection(_context.Database, "Unified DB")
        };

        var allHealthy = health.AdminDatabase.IsHealthy;

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
            await _context.Database.ExecuteSqlRawAsync("ANALYZE");

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
                              await _context.Tasks.CountAsync(),
                Collections = new Dictionary<string, int>
                {
                    { "Projects", await _context.Projects.CountAsync() },
                    { "Groups", await _context.Groups.CountAsync() },
                    { "Tasks", await _context.Tasks.CountAsync() }
                }
            },
            TimeDatabase = new DatabaseSummary
            {
                Name = "Time",
                TablesCount = 1,
                TotalRecords = await _context.TimeEntries.CountAsync(),
                Collections = new Dictionary<string, int>
                {
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

        result.Tests.Add(await TestConnection("Unified DB", _context.Database));

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

        // Note : Cette implémentation compte les enregistrements marqués comme supprimés
        // En production, il serait préférable de les supprimer définitivement (hard delete)
        
        var adminCleanup = new DatabaseCleanupResult
        {
            DatabaseName = "Admin",
            RecordsCleaned = await _context.Users.Where(u => u.IsDeleted).CountAsync()
        };
        result.DatabaseResults.Add(adminCleanup);

        var projectsCleanup = new DatabaseCleanupResult
        {
            DatabaseName = "Projects",
            RecordsCleaned = await _context.Projects.Where(p => p.IsDeleted).CountAsync() +
                            await _context.Groups.Where(g => g.IsDeleted).CountAsync() +
                            await _context.Tasks.Where(t => t.IsDeleted).CountAsync()
        };
        result.DatabaseResults.Add(projectsCleanup);

        var timeCleanup = new DatabaseCleanupResult
        {
            DatabaseName = "Time",
            RecordsCleaned = await _context.TimeEntries.Where(te => te.IsDeleted).CountAsync()
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

    private static async Task<DateTime> GetLastUpdatedDateProjects(ApplicationDbContext context)
    {
        var projectDate = await context.Projects
            .OrderByDescending(p => p.UpdatedAt)
            .Select(p => p.UpdatedAt)
            .FirstOrDefaultAsync();

        var groupDate = await context.Groups
            .OrderByDescending(g => g.UpdatedAt)
            .Select(g => g.UpdatedAt)
            .FirstOrDefaultAsync();

        var taskDate = await context.Tasks
            .OrderByDescending(t => t.UpdatedAt)
            .Select(t => t.UpdatedAt)
            .FirstOrDefaultAsync();

        return new[] { projectDate ?? DateTime.UtcNow, groupDate ?? DateTime.UtcNow, taskDate ?? DateTime.UtcNow, DateTime.UtcNow }.Max();
    }

    private static async Task<DateTime> GetLastUpdatedDateTime(ApplicationDbContext context)
    {
        var entryDate = await context.TimeEntries
            .OrderByDescending(te => te.UpdatedAt)
            .Select(te => te.UpdatedAt)
            .FirstOrDefaultAsync();

        return entryDate ?? DateTime.UtcNow;
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

        // Optimisation de la base unifiée
        var result = await OptimizeDatabase(_context, "Unified DB");
        results.Add(result);

        return results;
    }

    public async Task<IEnumerable<OptimizationResult>> VacuumAllDatabasesAsync()
    {
        var results = new List<OptimizationResult>();

        // Vacuum de la base unifiée
        var result = await VacuumDatabase(_context, "Unified DB");
        results.Add(result);

        return results;
    }

    public async Task<IEnumerable<OptimizationResult>> ReindexAllDatabasesAsync()
    {
        var results = new List<OptimizationResult>();

        // Réindexation de la base unifiée
        var result = await ReindexDatabase(_context, "Unified DB");
        results.Add(result);

        return results;
    }

    public async Task<IEnumerable<BackupInfo>> GetBackupInfoAsync()
    {
        // Placeholder - En production, ceci devrait récupérer les vraies informations de sauvegarde
        var backups = new List<BackupInfo>
        {
            new BackupInfo
            {
                Database = "Unified DB",
                LastBackup = DateTime.UtcNow.AddDays(-1),
                BackupSize = 1024 * 1024 * 425, // 425 MB
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
