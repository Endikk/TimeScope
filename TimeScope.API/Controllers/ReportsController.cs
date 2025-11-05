using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Manager")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
    {
        _reportService = reportService;
        _logger = logger;
    }

    [HttpGet("audit-logs")]
    public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogs(
        [FromQuery] int? limit = 100,
        [FromQuery] string? entityType = null,
        [FromQuery] Guid? userId = null)
    {
        try
        {
            var logs = await _reportService.GetAuditLogsAsync(limit, entityType, userId);
            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs");
            return StatusCode(500, new { message = "An error occurred while retrieving audit logs" });
        }
    }

    [HttpPost("audit-logs")]
    public async Task<ActionResult<AuditLog>> CreateAuditLog([FromBody] CreateAuditLogDto dto)
    {
        try
        {
            var command = new CreateAuditLogCommand
            {
                Action = dto.Action,
                EntityType = dto.EntityType,
                EntityId = dto.EntityId,
                UserId = dto.UserId,
                UserName = dto.UserName,
                Details = dto.Details ?? string.Empty,
                IpAddress = dto.IpAddress ?? string.Empty
            };

            var log = await _reportService.CreateAuditLogAsync(command);

            _logger.LogInformation("Audit log {LogId} created successfully", log.Id);

            return CreatedAtAction(nameof(GetAuditLogs), new { id = log.Id }, log);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating audit log");
            return StatusCode(500, new { message = "An error occurred while creating audit log" });
        }
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<ReportStatistics>> GetStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var stats = await _reportService.GetStatisticsAsync(startDate, endDate);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statistics");
            return StatusCode(500, new { message = "An error occurred while retrieving statistics" });
        }
    }

    [HttpGet("activity")]
    public async Task<ActionResult<IEnumerable<ActivitySummary>>> GetActivitySummary(
        [FromQuery] int days = 7)
    {
        try
        {
            var activities = await _reportService.GetActivitySummaryAsync(days);
            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving activity summary");
            return StatusCode(500, new { message = "An error occurred while retrieving activity summary" });
        }
    }

    [HttpGet("top-users")]
    public async Task<ActionResult<IEnumerable<UserActivity>>> GetTopUsers(
        [FromQuery] int limit = 10,
        [FromQuery] int days = 30)
    {
        try
        {
            var topUsers = await _reportService.GetTopUsersAsync(limit, days);
            return Ok(topUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top users");
            return StatusCode(500, new { message = "An error occurred while retrieving top users" });
        }
    }
}

public class CreateAuditLogDto
{
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
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
