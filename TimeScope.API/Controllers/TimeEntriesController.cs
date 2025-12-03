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
    private readonly ISettingsService _settingsService;
    private readonly ILogger<TimeEntriesController> _logger;

    public TimeEntriesController(
        ITimeEntryService timeEntryService,
        ISettingsService settingsService,
        ILogger<TimeEntriesController> logger)
    {
        _timeEntryService = timeEntryService;
        _settingsService = settingsService;
        _logger = logger;
    }

    /// <summary>
    /// Liste les entrées de temps (filtrage possible)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TimeEntryDto>>> GetAllTimeEntries(
        [FromQuery] Guid? userId = null,
        [FromQuery] Guid? taskId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        // Sécurité : Si on filtre par userId, on vérifie que c'est bien l'utilisateur courant ou un admin
        if (userId.HasValue)
        {
            var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId != null && userId.ToString() != currentUserId && !User.IsInRole("Admin") && !User.IsInRole("Manager"))
            {
                return Forbid();
            }
        }
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
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access while retrieving time entries");
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving time entries");
            return StatusCode(500, new { message = "An error occurred while retrieving time entries" });
        }
    }

    /// <summary>
    /// Récupère une entrée de temps spécifique
    /// </summary>
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
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access to time entry {Id}", id);
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving time entry {Id}", id);
            return StatusCode(500, new { message = "An error occurred while retrieving the time entry" });
        }
    }

    /// <summary>
    /// Crée une nouvelle entrée de temps
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<TimeEntryDto>> CreateTimeEntry([FromBody] CreateTimeEntryDto dto)
    {
        try
        {
            // Vérification des paramètres globaux (sauf pour Admin)
            if (!User.IsInRole("Admin"))
            {
                // 1. Vérifier si la saisie dans le futur est autorisée
                if (DateTime.TryParse(dto.Date, out DateTime entryDate) && entryDate.Date > DateTime.Today)
                {
                    var allowFuture = await _settingsService.GetSettingByKeyAsync("time.allowFutureEntries");
                    if (allowFuture != null && allowFuture.Value == "false")
                    {
                        return Forbid();
                    }
                }
            }

            var command = new CreateTimeEntryCommand
            {
                TaskId = dto.TaskId,
                UserId = "", // Sera ignoré, le service utilise l'utilisateur authentifié
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
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access while creating time entry");
            return Unauthorized(new { message = ex.Message });
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

    /// <summary>
    /// Met à jour une entrée de temps
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTimeEntry(Guid id, [FromBody] UpdateTimeEntryDto dto)
    {
        try
        {
            // Vérification des paramètres globaux (sauf pour Admin)
            if (!User.IsInRole("Admin"))
            {
                // 1. Vérifier si la saisie dans le futur est autorisée (si la date est modifiée)
                if (dto.Date != null && DateTime.TryParse(dto.Date, out DateTime newDate) && newDate.Date > DateTime.Today)
                {
                    var allowFuture = await _settingsService.GetSettingByKeyAsync("time.allowFutureEntries");
                    if (allowFuture != null && allowFuture.Value == "false")
                    {
                        return Forbid();
                    }
                }

                // Récupérer l'entrée existante pour vérifier sa date
                var existingEntry = await _timeEntryService.GetTimeEntryByIdAsync(id);
                if (existingEntry != null)
                {
                    // 2. Vérifier si la modification des entrées passées est autorisée
                    if (existingEntry.Date.Date < DateTime.Today)
                    {
                        var allowPast = await _settingsService.GetSettingByKeyAsync("time.allowModifyingPastEntries");
                        if (allowPast != null && allowPast.Value == "false")
                        {
                            return Forbid();
                        }
                    }
                }
            }

            var command = new UpdateTimeEntryCommand
            {
                Duration = dto.Duration,
                Notes = dto.Notes,
                Date = dto.Date
            };

            await _timeEntryService.UpdateTimeEntryAsync(id, command);

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access while updating time entry {Id}", id);
            return Unauthorized(new { message = ex.Message });
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

    /// <summary>
    /// Supprime une entrée de temps
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTimeEntry(Guid id)
    {
        try
        {
            // Vérification des paramètres globaux (sauf pour Admin)
            if (!User.IsInRole("Admin"))
            {
                // 1. Vérifier si la suppression est autorisée
                var allowDelete = await _settingsService.GetSettingByKeyAsync("time.allowDeleteTimeEntries");
                if (allowDelete != null && allowDelete.Value == "false")
                {
                    return Forbid();
                }
            }

            var deleted = await _timeEntryService.DeleteTimeEntryAsync(id);

            if (!deleted)
            {
                return NotFound(new { message = "Time entry not found" });
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access while deleting time entry {Id}", id);
            return Unauthorized(new { message = ex.Message });
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
    // UserId removed - automatically assigned from authenticated user
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
