using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface ITimeEntryService
{
    /// <summary>
    /// Crée une nouvelle entrée de temps
    /// </summary>
    Task<TimeEntry> CreateTimeEntryAsync(CreateTimeEntryCommand command);

    /// <summary>
    /// Met à jour une entrée de temps existante
    /// </summary>
    Task<TimeEntry> UpdateTimeEntryAsync(Guid id, UpdateTimeEntryCommand command);

    /// <summary>
    /// Supprime une entrée de temps
    /// </summary>
    Task<bool> DeleteTimeEntryAsync(Guid id);

    /// <summary>
    /// Récupère une entrée de temps par son ID
    /// </summary>
    Task<TimeEntry?> GetTimeEntryByIdAsync(Guid id);

    /// <summary>
    /// Liste les entrées de temps selon des critères
    /// </summary>
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
