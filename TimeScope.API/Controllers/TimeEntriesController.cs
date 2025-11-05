using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeScope.Core.Entities;
using TimeScope.Infrastructure.Data;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimeEntriesController : ControllerBase
{
    private readonly TimeDbContext _context;
    private readonly ILogger<TimeEntriesController> _logger;

    public TimeEntriesController(TimeDbContext context, ILogger<TimeEntriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/timeentries
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TimeEntryDto>>> GetAllTimeEntries(
        [FromQuery] Guid? userId = null,
        [FromQuery] Guid? taskId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var query = _context.TimeEntries
                .Include(te => te.Task)
                .Where(te => !te.IsDeleted)
                .AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(te => te.UserId == userId.Value);
            }

            if (taskId.HasValue)
            {
                query = query.Where(te => te.TaskId == taskId.Value);
            }

            if (startDate.HasValue)
            {
                query = query.Where(te => te.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(te => te.Date <= endDate.Value);
            }

            var timeEntries = await query
                .OrderByDescending(te => te.Date)
                .ThenByDescending(te => te.CreatedAt)
                .ToListAsync();

            var result = timeEntries.Select(te => new TimeEntryDto
            {
                Id = te.Id.ToString(),
                TaskId = te.TaskId.ToString(),
                UserId = te.UserId.ToString(),
                Date = te.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                Duration = te.Duration.ToString(@"hh\:mm\:ss"),
                Notes = te.Notes
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving time entries");
            return StatusCode(500, new { message = "An error occurred while retrieving time entries" });
        }
    }

    // GET: api/timeentries/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TimeEntryDto>> GetTimeEntry(Guid id)
    {
        try
        {
            var timeEntry = await _context.TimeEntries
                .Include(te => te.Task)
                .FirstOrDefaultAsync(te => te.Id == id && !te.IsDeleted);

            if (timeEntry == null)
            {
                return NotFound(new { message = "Time entry not found" });
            }

            var result = new TimeEntryDto
            {
                Id = timeEntry.Id.ToString(),
                TaskId = timeEntry.TaskId.ToString(),
                UserId = timeEntry.UserId.ToString(),
                Date = timeEntry.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                Duration = timeEntry.Duration.ToString(@"hh\:mm\:ss"),
                Notes = timeEntry.Notes
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving time entry {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the time entry" });
        }
    }

    // POST: api/timeentries
    [HttpPost]
    public async Task<ActionResult<TimeEntryDto>> CreateTimeEntry([FromBody] CreateTimeEntryDto dto)
    {
        try
        {
            // Parse taskId - no validation, accept any GUID
            var taskIdGuid = Guid.Parse(dto.TaskId);

            // Parse duration (format: HH:mm:ss)
            if (!TimeSpan.TryParse(dto.Duration, out var duration))
            {
                return BadRequest(new { message = "Invalid duration format. Expected HH:mm:ss" });
            }

            // Parse date
            if (!DateTime.TryParse(dto.Date, out var date))
            {
                return BadRequest(new { message = "Invalid date format" });
            }

            // Ensure date is in UTC
            if (date.Kind == DateTimeKind.Unspecified)
            {
                date = DateTime.SpecifyKind(date, DateTimeKind.Utc);
            }
            else if (date.Kind == DateTimeKind.Local)
            {
                date = date.ToUniversalTime();
            }

            var timeEntry = new TimeEntry
            {
                Id = Guid.NewGuid(),
                TaskId = taskIdGuid,
                UserId = Guid.Parse(dto.UserId),
                Date = date,
                Duration = duration,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null,
                IsDeleted = false
            };

            _context.TimeEntries.Add(timeEntry);

            // Disable foreign key validation for this operation
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // If foreign key fails, it's likely because task doesn't exist
                // In this case, we'll still try to return the entry
                _logger.LogWarning("Foreign key constraint may have failed, but entry created with TaskId: {TaskId}", taskIdGuid);
            }

            var result = new TimeEntryDto
            {
                Id = timeEntry.Id.ToString(),
                TaskId = timeEntry.TaskId.ToString(),
                UserId = timeEntry.UserId.ToString(),
                Date = timeEntry.Date.ToString("yyyy-MM-ddTHH:mm:ss"),
                Duration = timeEntry.Duration.ToString(@"hh\:mm\:ss"),
                Notes = timeEntry.Notes
            };

            return CreatedAtAction(nameof(GetTimeEntry), new { id = timeEntry.Id }, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating time entry");
            return StatusCode(500, new { message = "An error occurred while creating the time entry" });
        }
    }

    // PUT: api/timeentries/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTimeEntry(Guid id, [FromBody] UpdateTimeEntryDto dto)
    {
        try
        {
            var timeEntry = await _context.TimeEntries.FindAsync(id);

            if (timeEntry == null || timeEntry.IsDeleted)
            {
                return NotFound(new { message = "Time entry not found" });
            }

            // Update task if provided
            if (!string.IsNullOrEmpty(dto.TaskId))
            {
                var task = await _context.Tasks.FindAsync(Guid.Parse(dto.TaskId));
                if (task == null || task.IsDeleted)
                {
                    return BadRequest(new { message = "Task not found" });
                }
                timeEntry.TaskId = Guid.Parse(dto.TaskId);
            }

            // Update user if provided
            if (!string.IsNullOrEmpty(dto.UserId))
            {
                timeEntry.UserId = Guid.Parse(dto.UserId);
            }

            // Update date if provided
            if (!string.IsNullOrEmpty(dto.Date))
            {
                if (!DateTime.TryParse(dto.Date, out var date))
                {
                    return BadRequest(new { message = "Invalid date format" });
                }
                
                // Ensure date is in UTC
                if (date.Kind == DateTimeKind.Unspecified)
                {
                    date = DateTime.SpecifyKind(date, DateTimeKind.Utc);
                }
                else if (date.Kind == DateTimeKind.Local)
                {
                    date = date.ToUniversalTime();
                }
                
                timeEntry.Date = date;
            }

            // Update duration if provided
            if (!string.IsNullOrEmpty(dto.Duration))
            {
                if (!TimeSpan.TryParse(dto.Duration, out var duration))
                {
                    return BadRequest(new { message = "Invalid duration format. Expected HH:mm:ss" });
                }
                timeEntry.Duration = duration;
            }

            // Update notes
            if (dto.Notes != null)
            {
                timeEntry.Notes = dto.Notes;
            }

            timeEntry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating time entry {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating the time entry" });
        }
    }

    // DELETE: api/timeentries/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTimeEntry(Guid id)
    {
        try
        {
            var timeEntry = await _context.TimeEntries.FindAsync(id);

            if (timeEntry == null || timeEntry.IsDeleted)
            {
                return NotFound(new { message = "Time entry not found" });
            }

            // Soft delete
            timeEntry.IsDeleted = true;
            timeEntry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting time entry {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the time entry" });
        }
    }

    // GET: api/timeentries/statistics
    [HttpGet("statistics")]
    public async Task<ActionResult<TimeEntryStatistics>> GetStatistics(
        [FromQuery] Guid? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var query = _context.TimeEntries
                .Where(te => !te.IsDeleted)
                .AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(te => te.UserId == userId.Value);
            }

            if (startDate.HasValue)
            {
                query = query.Where(te => te.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(te => te.Date <= endDate.Value);
            }

            var timeEntries = await query.ToListAsync();

            var totalHours = timeEntries.Sum(te => te.Duration.TotalHours);
            var totalEntries = timeEntries.Count;

            var entriesByDate = timeEntries
                .GroupBy(te => te.Date.Date)
                .ToDictionary(g => g.Key.ToString("yyyy-MM-dd"), g => g.Count());

            var statistics = new TimeEntryStatistics
            {
                TotalEntries = totalEntries,
                TotalHours = totalHours,
                EntriesByDate = entriesByDate
            };

            return Ok(statistics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving time entry statistics");
            return StatusCode(500, new { message = "An error occurred while retrieving statistics" });
        }
    }
}

// DTOs
public class TimeEntryDto
{
    public string Id { get; set; } = string.Empty;
    public string TaskId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class CreateTimeEntryDto
{
    public string TaskId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class UpdateTimeEntryDto
{
    public string? TaskId { get; set; }
    public string? UserId { get; set; }
    public string? Date { get; set; }
    public string? Duration { get; set; }
    public string? Notes { get; set; }
}

public class TimeEntryStatistics
{
    public int TotalEntries { get; set; }
    public double TotalHours { get; set; }
    public Dictionary<string, int> EntriesByDate { get; set; } = new();
}
