using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeScope.Core.Entities;
using TimeScope.Infrastructure.Data;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportsDbContext _reportsContext;
    private readonly AdminDbContext _adminContext;
    private readonly ProjectsDbContext _projectsContext;
    private readonly TimeDbContext _timeContext;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(
        ReportsDbContext reportsContext,
        AdminDbContext adminContext,
        ProjectsDbContext projectsContext,
        TimeDbContext timeContext,
        ILogger<ReportsController> logger)
    {
        _reportsContext = reportsContext;
        _adminContext = adminContext;
        _projectsContext = projectsContext;
        _timeContext = timeContext;
        _logger = logger;
    }

    /// <summary>
    /// Récupère tous les logs d'audit
    /// </summary>
    [HttpGet("audit-logs")]
    public async Task<ActionResult<IEnumerable<AuditLog>>> GetAuditLogs(
        [FromQuery] int? limit = 100,
        [FromQuery] string? entityType = null,
        [FromQuery] Guid? userId = null)
    {
        try
        {
            var query = _reportsContext.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(entityType))
                query = query.Where(log => log.EntityType == entityType);

            if (userId.HasValue)
                query = query.Where(log => log.UserId == userId.Value);

            var logs = await query
                .OrderByDescending(log => log.Timestamp)
                .Take(limit ?? 100)
                .ToListAsync();

            return Ok(logs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit logs");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Crée un nouveau log d'audit
    /// </summary>
    [HttpPost("audit-logs")]
    public async Task<ActionResult<AuditLog>> CreateAuditLog([FromBody] CreateAuditLogDto dto)
    {
        try
        {
            var log = new AuditLog
            {
                Action = dto.Action,
                EntityType = dto.EntityType,
                EntityId = dto.EntityId,
                UserId = dto.UserId,
                UserName = dto.UserName,
                Details = dto.Details ?? string.Empty,
                IpAddress = dto.IpAddress ?? string.Empty,
                Timestamp = DateTime.UtcNow
            };

            await _reportsContext.AuditLogs.AddAsync(log);
            await _reportsContext.SaveChangesAsync();

            _logger.LogInformation("Audit log {LogId} created successfully", log.Id);

            return CreatedAtAction(nameof(GetAuditLogs), new { id = log.Id }, log);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating audit log");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère les statistiques globales pour les rapports
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<ReportStatistics>> GetStatistics(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var stats = new ReportStatistics
            {
                TotalUsers = await _adminContext.Users.CountAsync(u => u.IsActive),
                TotalProjects = await _projectsContext.Projects.CountAsync(p => !p.IsDeleted),
                TotalGroups = await _projectsContext.Groups.CountAsync(g => !g.IsDeleted),
                TotalThemes = await _projectsContext.Themes.CountAsync(t => !t.IsDeleted),
                TotalTasks = await _timeContext.Tasks.CountAsync(t => !t.IsDeleted),
                TotalTimeEntries = await _timeContext.TimeEntries.CountAsync(te => !te.IsDeleted),
                TotalAuditLogs = await _reportsContext.AuditLogs.CountAsync(
                    log => log.Timestamp >= start && log.Timestamp <= end),
                PeriodStart = start,
                PeriodEnd = end
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statistics");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère l'activité récente par type d'entité
    /// </summary>
    [HttpGet("activity")]
    public async Task<ActionResult<IEnumerable<ActivitySummary>>> GetActivitySummary(
        [FromQuery] int days = 7)
    {
        try
        {
            var since = DateTime.UtcNow.AddDays(-days);

            var activities = await _reportsContext.AuditLogs
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
                .ToListAsync();

            return Ok(activities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving activity summary");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère les utilisateurs les plus actifs
    /// </summary>
    [HttpGet("top-users")]
    public async Task<ActionResult<IEnumerable<UserActivity>>> GetTopUsers(
        [FromQuery] int limit = 10,
        [FromQuery] int days = 30)
    {
        try
        {
            var since = DateTime.UtcNow.AddDays(-days);

            var topUsers = await _reportsContext.AuditLogs
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
                .ToListAsync();

            return Ok(topUsers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving top users");
            return StatusCode(500, "Internal server error");
        }
    }
}

// DTOs
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
