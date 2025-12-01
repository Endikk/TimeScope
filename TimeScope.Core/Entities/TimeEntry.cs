namespace TimeScope.Core.Entities;

/// <summary>
/// Entrée de temps (log) sur une tâche
/// </summary>
public class TimeEntry : BaseEntity
{
    public Guid TaskId { get; set; }
    public WorkTask Task { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime Date { get; set; }
    public TimeSpan Duration { get; set; }
    public string? Notes { get; set; }
}
