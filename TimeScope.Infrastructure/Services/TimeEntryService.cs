using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

public class TimeEntryService : ITimeEntryService
{
    private readonly ITimeUnitOfWork _timeUow;

    public TimeEntryService(ITimeUnitOfWork timeUow)
    {
        _timeUow = timeUow;
    }

    public async Task<TimeEntry> CreateTimeEntryAsync(CreateTimeEntryCommand command)
    {
        // Parsing et validation
        var taskId = ParseGuid(command.TaskId, "TaskId");
        var userId = ParseGuid(command.UserId, "UserId");
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
            UserId = userId,
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
        var timeEntry = await _timeUow.TimeEntries.GetByIdAsync(id);

        if (timeEntry == null || timeEntry.IsDeleted)
        {
            throw new KeyNotFoundException($"Time entry with ID {id} not found");
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
        var timeEntry = await _timeUow.TimeEntries.GetByIdAsync(id);

        if (timeEntry == null || timeEntry.IsDeleted)
        {
            return false;
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
        var timeEntry = await _timeUow.TimeEntries.GetByIdAsync(id);
        
        if (timeEntry != null && timeEntry.IsDeleted)
        {
            return null;
        }

        return timeEntry;
    }

    public async Task<IEnumerable<TimeEntry>> GetTimeEntriesAsync(TimeEntryFilter filter)
    {
        // Logique métier : filtrage
        var allEntries = await _timeUow.TimeEntries.GetAllAsync();

        var query = allEntries.Where(te => !te.IsDeleted);

        if (filter.UserId.HasValue)
        {
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
