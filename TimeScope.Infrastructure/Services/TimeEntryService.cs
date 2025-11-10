using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

public class TimeEntryService : ITimeEntryService
{
    private readonly ITimeUnitOfWork _timeUow;
    private readonly ICurrentUserService _currentUserService;

    public TimeEntryService(ITimeUnitOfWork timeUow, ICurrentUserService currentUserService)
    {
        _timeUow = timeUow;
        _currentUserService = currentUserService;
    }

    public async Task<TimeEntry> CreateTimeEntryAsync(CreateTimeEntryCommand command)
    {
        // Sécurité: Utiliser l'utilisateur authentifié au lieu de celui fourni dans la requête
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User must be authenticated");
        }

        // Parsing et validation
        var taskId = ParseGuid(command.TaskId, "TaskId");
        var duration = ParseTimeSpan(command.Duration, "Duration");
        var date = ParseDateTime(command.Date);

        // Règles métier : validation
        if (duration <= TimeSpan.Zero)
        {
            throw new ArgumentException("Duration must be greater than zero");
        }

        // Normalisation de la date en UTC
        date = NormalizeToUtc(date);

        var timeEntry = new TimeEntry
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            UserId = _currentUserService.UserId.Value, // Force l'utilisateur connecté
            Date = date,
            Duration = duration,
            Notes = command.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        await _timeUow.TimeEntries.AddAsync(timeEntry);
        await _timeUow.SaveChangesAsync();

        return timeEntry;
    }

    public async Task<TimeEntry> UpdateTimeEntryAsync(Guid id, UpdateTimeEntryCommand command)
    {
        // Sécurité: Vérifier l'authentification
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User must be authenticated");
        }

        var timeEntry = await _timeUow.TimeEntries.GetByIdAsync(id);

        if (timeEntry == null || timeEntry.IsDeleted)
        {
            throw new KeyNotFoundException($"Time entry with ID {id} not found");
        }

        // Sécurité: Vérifier que l'utilisateur est propriétaire (sauf Admin)
        if (timeEntry.UserId != _currentUserService.UserId.Value && !_currentUserService.IsAdmin)
        {
            throw new UnauthorizedAccessException("You can only update your own time entries");
        }

        // Mise à jour conditionnelle
        if (!string.IsNullOrWhiteSpace(command.Duration))
        {
            var duration = ParseTimeSpan(command.Duration, "Duration");
            if (duration <= TimeSpan.Zero)
            {
                throw new ArgumentException("Duration must be greater than zero");
            }
            timeEntry.Duration = duration;
        }

        if (!string.IsNullOrWhiteSpace(command.Date))
        {
            var date = ParseDateTime(command.Date);
            timeEntry.Date = NormalizeToUtc(date);
        }

        if (command.Notes != null)
        {
            timeEntry.Notes = command.Notes.Trim();
        }

        timeEntry.UpdatedAt = DateTime.UtcNow;

        await _timeUow.TimeEntries.UpdateAsync(timeEntry);
        await _timeUow.SaveChangesAsync();

        return timeEntry;
    }

    public async Task<bool> DeleteTimeEntryAsync(Guid id)
    {
        // Sécurité: Vérifier l'authentification
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User must be authenticated");
        }

        var timeEntry = await _timeUow.TimeEntries.GetByIdAsync(id);

        if (timeEntry == null || timeEntry.IsDeleted)
        {
            return false;
        }

        // Sécurité: Vérifier que l'utilisateur est propriétaire (sauf Admin)
        if (timeEntry.UserId != _currentUserService.UserId.Value && !_currentUserService.IsAdmin)
        {
            throw new UnauthorizedAccessException("You can only delete your own time entries");
        }

        // Soft delete
        timeEntry.IsDeleted = true;
        timeEntry.UpdatedAt = DateTime.UtcNow;

        await _timeUow.TimeEntries.UpdateAsync(timeEntry);
        await _timeUow.SaveChangesAsync();

        return true;
    }

    public async Task<TimeEntry?> GetTimeEntryByIdAsync(Guid id)
    {
        // Sécurité: Vérifier l'authentification
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User must be authenticated");
        }

        var timeEntry = await _timeUow.TimeEntries.GetByIdAsync(id);

        if (timeEntry != null && timeEntry.IsDeleted)
        {
            return null;
        }

        // Sécurité: Vérifier que l'utilisateur est propriétaire (sauf Admin)
        if (timeEntry != null && timeEntry.UserId != _currentUserService.UserId.Value && !_currentUserService.IsAdmin)
        {
            throw new UnauthorizedAccessException("You can only view your own time entries");
        }

        return timeEntry;
    }

    public async Task<IEnumerable<TimeEntry>> GetTimeEntriesAsync(TimeEntryFilter filter)
    {
        // Sécurité: Vérifier l'authentification
        if (!_currentUserService.UserId.HasValue)
        {
            throw new UnauthorizedAccessException("User must be authenticated");
        }

        // Logique métier : filtrage
        var allEntries = await _timeUow.TimeEntries.GetAllAsync();

        var query = allEntries.Where(te => !te.IsDeleted);

        // Sécurité: FORCER le filtrage par utilisateur courant (sauf Admin qui peut tout voir)
        if (!_currentUserService.IsAdmin)
        {
            query = query.Where(te => te.UserId == _currentUserService.UserId.Value);
        }
        else if (filter.UserId.HasValue)
        {
            // Admin peut filtrer par utilisateur spécifique
            query = query.Where(te => te.UserId == filter.UserId.Value);
        }

        if (filter.TaskId.HasValue)
        {
            query = query.Where(te => te.TaskId == filter.TaskId.Value);
        }

        if (filter.StartDate.HasValue)
        {
            query = query.Where(te => te.Date >= filter.StartDate.Value);
        }

        if (filter.EndDate.HasValue)
        {
            query = query.Where(te => te.Date <= filter.EndDate.Value);
        }

        return query
            .OrderByDescending(te => te.Date)
            .ThenByDescending(te => te.CreatedAt)
            .ToList();
    }

    #region Helper Methods

    private static Guid ParseGuid(string value, string fieldName)
    {
        if (!Guid.TryParse(value, out var result))
        {
            throw new ArgumentException($"Invalid {fieldName} format");
        }
        return result;
    }

    private static TimeSpan ParseTimeSpan(string value, string fieldName)
    {
        if (!TimeSpan.TryParse(value, out var result))
        {
            throw new ArgumentException($"Invalid {fieldName} format. Expected HH:mm:ss");
        }
        return result;
    }

    private static DateTime ParseDateTime(string value)
    {
        if (!DateTime.TryParse(value, out var result))
        {
            throw new ArgumentException("Invalid date format");
        }
        return result;
    }

    private static DateTime NormalizeToUtc(DateTime date)
    {
        if (date.Kind == DateTimeKind.Unspecified)
        {
            return DateTime.SpecifyKind(date, DateTimeKind.Utc);
        }
        else if (date.Kind == DateTimeKind.Local)
        {
            return date.ToUniversalTime();
        }
        return date;
    }

    #endregion
}
