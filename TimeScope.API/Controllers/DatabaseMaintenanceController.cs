using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeScope.Core.Interfaces;
using TimeScope.Infrastructure.Data;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatabaseMaintenanceController : ControllerBase
{
    private readonly AdminDbContext _adminContext;
    private readonly ProjectsDbContext _projectsContext;
    private readonly TimeDbContext _timeContext;
    private readonly ReportsDbContext _reportsContext;
    private readonly ILogger<DatabaseMaintenanceController> _logger;

    public DatabaseMaintenanceController(
        AdminDbContext adminContext,
        ProjectsDbContext projectsContext,
        TimeDbContext timeContext,
        ReportsDbContext reportsContext,
        ILogger<DatabaseMaintenanceController> logger)
    {
        _adminContext = adminContext;
        _projectsContext = projectsContext;
        _timeContext = timeContext;
        _reportsContext = reportsContext;
        _logger = logger;
    }

    /// <summary>
    /// Récupère les statistiques globales de toutes les bases de données
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<DatabaseStats>> GetDatabaseStats()
    {
        try
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
                    TotalRecords = 0, // À implémenter quand les entités seront créées
                    LastUpdated = DateTime.UtcNow
                }
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving database stats");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Vérifie la santé de toutes les bases de données
    /// </summary>
    [HttpGet("health")]
    public async Task<ActionResult<DatabaseHealth>> GetDatabaseHealth()
    {
        try
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

            return Ok(health);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking database health");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Optimise les bases de données (VACUUM, ANALYZE pour PostgreSQL)
    /// </summary>
    [HttpPost("optimize")]
    public async Task<ActionResult<OptimizationResult>> OptimizeDatabases()
    {
        try
        {
            var result = new OptimizationResult
            {
                StartTime = DateTime.UtcNow
            };

            // Note: VACUUM ne peut pas être exécuté dans une transaction
            // Pour PostgreSQL, on peut utiliser ANALYZE qui fournit des stats au query planner
            await _adminContext.Database.ExecuteSqlRawAsync("ANALYZE");
            await _projectsContext.Database.ExecuteSqlRawAsync("ANALYZE");
            await _timeContext.Database.ExecuteSqlRawAsync("ANALYZE");
            await _reportsContext.Database.ExecuteSqlRawAsync("ANALYZE");

            result.EndTime = DateTime.UtcNow;
            result.Success = true;
            result.Message = "Optimization completed successfully";

            _logger.LogInformation("Database optimization completed");

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error optimizing databases");
            return StatusCode(500, new OptimizationResult
            {
                Success = false,
                Message = $"Optimization failed: {ex.Message}",
                EndTime = DateTime.UtcNow
            });
        }
    }

    private async Task<DateTime> GetLastUpdatedDate(DbContext context)
    {
        try
        {
            // Essaie de récupérer la date de mise à jour la plus récente
            var entityType = context.Model.GetEntityTypes().FirstOrDefault();
            if (entityType == null) return DateTime.UtcNow;

            return DateTime.UtcNow; // Placeholder - à améliorer selon les entités
        }
        catch
        {
            return DateTime.UtcNow;
        }
    }

    private async Task<DatabaseHealthInfo> CheckDatabaseConnection(
        Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade database,
        string databaseName)
    {
        try
        {
            var canConnect = await database.CanConnectAsync();
            return new DatabaseHealthInfo
            {
                DatabaseName = databaseName,
                IsHealthy = canConnect,
                Message = canConnect ? "Connected" : "Cannot connect",
                CheckedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            return new DatabaseHealthInfo
            {
                DatabaseName = databaseName,
                IsHealthy = false,
                Message = $"Error: {ex.Message}",
                CheckedAt = DateTime.UtcNow
            };
        }
    }
}

// DTOs
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
    public int TotalRecords { get; set; }
    public int UsersCount { get; set; }
    public int ActiveUsersCount { get; set; }
    public int ProjectsCount { get; set; }
    public int GroupsCount { get; set; }
    public int ThemesCount { get; set; }
    public int TasksCount { get; set; }
    public int TimeEntriesCount { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class DatabaseHealth
{
    public string OverallStatus { get; set; } = string.Empty;
    public DatabaseHealthInfo AdminDatabase { get; set; } = new();
    public DatabaseHealthInfo ProjectsDatabase { get; set; } = new();
    public DatabaseHealthInfo TimeDatabase { get; set; } = new();
    public DatabaseHealthInfo ReportsDatabase { get; set; } = new();
}

public class DatabaseHealthInfo
{
    public string DatabaseName { get; set; } = string.Empty;
    public bool IsHealthy { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CheckedAt { get; set; }
}

public class OptimizationResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}
