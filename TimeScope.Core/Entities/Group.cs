namespace TimeScope.Core.Entities;

public class Group : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Relations
    public ICollection<Theme> Themes { get; set; } = new List<Theme>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}
