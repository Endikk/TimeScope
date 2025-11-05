using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Infrastructure.Services;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdministrationController : ControllerBase
{
    private readonly IAdministrationService _administrationService;
    private readonly ILogger<AdministrationController> _logger;

    public AdministrationController(
        IAdministrationService administrationService,
        ILogger<AdministrationController> logger)
    {
        _administrationService = administrationService;
        _logger = logger;
    }

    [HttpGet("databases/summary")]
    public async Task<ActionResult<DatabasesSummary>> GetDatabasesSummary()
    {
        try
        {
            var summary = await _administrationService.GetDatabasesSummaryAsync();
            return Ok(summary);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving databases summary");
            return StatusCode(500, new { message = "An error occurred while retrieving databases summary" });
        }
    }

    [HttpGet("databases/test-connections")]
    public async Task<ActionResult<ConnectionTestResult>> TestDatabaseConnections()
    {
        try
        {
            var result = await _administrationService.TestDatabaseConnectionsAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error testing database connections");
            return StatusCode(500, new { message = "An error occurred while testing database connections" });
        }
    }

    [HttpPost("cleanup/soft-deleted")]
    public async Task<ActionResult<CleanupResult>> CleanupSoftDeleted()
    {
        try
        {
            var result = await _administrationService.CleanupSoftDeletedAsync();
            
            _logger.LogInformation("Cleanup completed. Total records found: {Total}", result.TotalRecordsRemoved);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during cleanup");
            return StatusCode(500, new { message = "An error occurred during cleanup" });
        }
    }

    [HttpGet("usage/statistics")]
    public async Task<ActionResult<UsageStatistics>> GetUsageStatistics()
    {
        try
        {
            var stats = await _administrationService.GetUsageStatisticsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving usage statistics");
            return StatusCode(500, new { message = "An error occurred while retrieving usage statistics" });
        }
    }

    [HttpGet("export/system-data")]
    public async Task<ActionResult<ExportResult>> ExportSystemData()
    {
        try
        {
            var result = await _administrationService.ExportSystemDataAsync();
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error exporting system data");
            return StatusCode(500, new { message = "An error occurred while exporting system data" });
        }
    }
}
