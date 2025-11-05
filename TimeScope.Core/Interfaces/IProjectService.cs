using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface IProjectService
{
    Task<Project> CreateProjectAsync(CreateProjectCommand command);
    Task<Group> CreateGroupAsync(CreateGroupCommand command);
    Task<Theme> CreateThemeAsync(CreateThemeCommand command);
    Task<IEnumerable<Project>> GetAllProjectsAsync();
    Task<IEnumerable<Group>> GetAllGroupsAsync();
    Task<IEnumerable<Theme>> GetAllThemesAsync();
}

public class CreateProjectCommand
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? GroupId { get; set; }
}

public class CreateGroupCommand
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class CreateThemeCommand
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? GroupId { get; set; }
    public Guid? ProjectId { get; set; }
}
