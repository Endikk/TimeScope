using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface IProjectService
{
    /// <summary>
    /// Crée un nouveau projet
    /// </summary>
    Task<Project> CreateProjectAsync(CreateProjectCommand command);

    /// <summary>
    /// Crée un nouveau groupe de projets
    /// </summary>
    Task<Group> CreateGroupAsync(CreateGroupCommand command);

    /// <summary>
    /// Crée un nouveau thème
    /// </summary>
    Task<Theme> CreateThemeAsync(CreateThemeCommand command);

    /// <summary>
    /// Liste tous les projets
    /// </summary>
    Task<IEnumerable<Project>> GetAllProjectsAsync();

    /// <summary>
    /// Liste tous les groupes
    /// </summary>
    Task<IEnumerable<Group>> GetAllGroupsAsync();

    /// <summary>
    /// Liste tous les thèmes
    /// </summary>
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
