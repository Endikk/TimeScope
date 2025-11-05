using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TimeEntriesController : ControllerBase
{
    private readonly ITimeEntryService _timeEntryService;
    private readonly ILogger<TimeEntriesController> _logger;

    public TimeEntriesController(ITimeEntryService timeEntryService, ILogger<TimeEntriesController> logger)
    {
        _timeEntryService = timeEntryService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TimeEntryDto>>> GetAllTimeEntries(
        [FromQuery] Guid? userId = null,
        [FromQuery] Guid? taskId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var filter = new TimeEntryFilter
            {
                UserId = userId,
                TaskId = taskId,
                StartDate = startDate,
                EndDate = endDate
            };

            var timeEntries = await _timeEntryService.GetTimeEntriesAsync(filter);

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

    [HttpGet("{id}")]
    public async Task<ActionResult<TimeEntryDto>> GetTimeEntry(Guid id)
    {
        try
        {
            var timeEntry = await _timeEntryService.GetTimeEntryByIdAsync(id);

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

    [HttpPost]
    public async Task<ActionResult<TimeEntryDto>> CreateTimeEntry([FromBody] CreateTimeEntryDto dto)
    {
        try
        {
            var command = new CreateTimeEntryCommand
            {
                TaskId = dto.TaskId,
                UserId = dto.UserId,
                Date = dto.Date,
                Duration = dto.Duration,
                Notes = dto.Notes
            };

            var timeEntry = await _timeEntryService.CreateTimeEntryAsync(command);

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
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating time entry");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating time entry");
            return StatusCode(500, new { message = "An error occurred while creating the time entry" });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTimeEntry(Guid id, [FromBody] UpdateTimeEntryDto dto)
    {
        try
        {
            var command = new UpdateTimeEntryCommand
            {
                Duration = dto.Duration,
                Notes = dto.Notes,
                Date = dto.Date
            };

            await _timeEntryService.UpdateTimeEntryAsync(id, command);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Time entry {Id} not found", id);
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while updating time entry {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating time entry {Id}", id);
            return StatusCode(500, new { message = "An error occurred while updating the time entry" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTimeEntry(Guid id)
    {
        try
        {
            var deleted = await _timeEntryService.DeleteTimeEntryAsync(id);

            if (!deleted)
            {
                return NotFound(new { message = "Time entry not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting time entry {Id}", id);
            return StatusCode(500, new { message = "An error occurred while deleting the time entry" });
        }
    }
}

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
    public string? Date { get; set; }
    public string? Duration { get; set; }
    public string? Notes { get; set; }
}
