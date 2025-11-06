namespace TimeScope.Core.Entities;

public class Theme : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? GroupId { get; set; }
    public Group? Group { get; set; }
    public Guid? ProjectId { get; set; }
    public Project? Project { get; set; }

    // Relations
    public ICollection<WorkTask> Tasks { get; set; } = new List<WorkTask>();
}
