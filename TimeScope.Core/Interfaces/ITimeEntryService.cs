using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface ITimeEntryService
{
    Task<TimeEntry> CreateTimeEntryAsync(CreateTimeEntryCommand command);
    Task<TimeEntry> UpdateTimeEntryAsync(Guid id, UpdateTimeEntryCommand command);
    Task<bool> DeleteTimeEntryAsync(Guid id);
    Task<TimeEntry?> GetTimeEntryByIdAsync(Guid id);
    Task<IEnumerable<TimeEntry>> GetTimeEntriesAsync(TimeEntryFilter filter);
}

public class CreateTimeEntryCommand
{
    public string TaskId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class UpdateTimeEntryCommand
{
    public string? Duration { get; set; }
    public string? Notes { get; set; }
    public string? Date { get; set; }
}

public class TimeEntryFilter
{
    public Guid? UserId { get; set; }
    public Guid? TaskId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
