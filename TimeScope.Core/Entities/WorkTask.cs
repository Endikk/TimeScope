namespace TimeScope.Core.Entities;

public class WorkTask : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid ThemeId { get; set; }
    public Theme Theme { get; set; } = null!;
    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public TaskStatus Status { get; set; }
    public TaskPrecision Precision { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public TimeSpan EstimatedTime { get; set; }
    public TimeSpan ActualTime { get; set; }

    // Relations
    public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
}

public enum TaskStatus
{
    EnAttente,
    EnCours,
    Termine
}

public enum TaskPrecision
{
    Low,
    Medium,
    High
}

public enum TaskPriority
{
    Low,
    Medium,
    High
}
