namespace TimeScope.Core.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? GroupId { get; set; }
    public Group? Group { get; set; }

    // Relations
    public ICollection<Theme> Themes { get; set; } = new List<Theme>();
    public ICollection<WorkTask> Tasks { get; set; } = new List<WorkTask>();
}
