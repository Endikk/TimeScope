using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Infrastructure.Services;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DatabaseMaintenanceController : ControllerBase
{
    private readonly IDatabaseMaintenanceService _dbMaintenanceService;
    private readonly ILogger<DatabaseMaintenanceController> _logger;

    public DatabaseMaintenanceController(
        IDatabaseMaintenanceService dbMaintenanceService,
        ILogger<DatabaseMaintenanceController> logger)
    {
        _dbMaintenanceService = dbMaintenanceService;
        _logger = logger;
    }

    [HttpGet("test-connections")]
    public async Task<ActionResult> TestDatabaseConnections()
    {
        try
        {
            var results = await _dbMaintenanceService.TestAllConnectionsAsync();
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing database connections");
            return StatusCode(500, new { message = "An error occurred while testing database connections" });
        }
    }

    [HttpGet("statistics")]
    public async Task<ActionResult> GetDatabaseStatistics()
    {
        try
        {
            var stats = await _dbMaintenanceService.GetDatabaseStatisticsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving database statistics");
            return StatusCode(500, new { message = "An error occurred while retrieving database statistics" });
        }
    }

    [HttpPost("optimize")]
    public async Task<ActionResult> OptimizeDatabases()
    {
        try
        {
            var results = await _dbMaintenanceService.OptimizeAllDatabasesAsync();
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error optimizing databases");
            return StatusCode(500, new { message = "An error occurred while optimizing databases" });
        }
    }

    [HttpPost("vacuum")]
    public async Task<ActionResult> VacuumDatabases()
    {
        try
        {
            var results = await _dbMaintenanceService.VacuumAllDatabasesAsync();
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error vacuuming databases");
            return StatusCode(500, new { message = "An error occurred while vacuuming databases" });
        }
    }

    [HttpPost("reindex")]
    public async Task<ActionResult> ReindexDatabases()
    {
        try
        {
            var results = await _dbMaintenanceService.ReindexAllDatabasesAsync();
            return Ok(results);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reindexing databases");
            return StatusCode(500, new { message = "An error occurred while reindexing databases" });
        }
    }

    [HttpGet("backup-info")]
    public async Task<ActionResult> GetBackupInfo()
    {
        try
        {
            var info = await _dbMaintenanceService.GetBackupInfoAsync();
            return Ok(info);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving backup info");
            return StatusCode(500, new { message = "An error occurred while retrieving backup info" });
        }
    }
}

public class DatabaseConnectionTest
{
    public string Database { get; set; } = string.Empty;
    public bool IsConnected { get; set; }
    public string? Error { get; set; }
    public TimeSpan ResponseTime { get; set; }
}

public class DatabaseStatistics
{
    public string Database { get; set; } = string.Empty;
    public long TotalSize { get; set; }
    public int TableCount { get; set; }
    public long TotalRows { get; set; }
    public DateTime LastUpdated { get; set; }
}

public class OptimizationResult
{
    public string Database { get; set; } = string.Empty;
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public TimeSpan Duration { get; set; }
}

public class BackupInfo
{
    public string Database { get; set; } = string.Empty;
    public DateTime? LastBackup { get; set; }
    public long? BackupSize { get; set; }
    public string Status { get; set; } = string.Empty;
}
