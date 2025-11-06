using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectsUnitOfWork _projectsUow;

    public ProjectService(IProjectsUnitOfWork projectsUow)
    {
        _projectsUow = projectsUow;
    }

    public async Task<Project> CreateProjectAsync(CreateProjectCommand command)
    {
        // Règles métier : validation
        if (string.IsNullOrWhiteSpace(command.Name))
        {
            throw new ArgumentException("Project name is required");
        }

        var project = new Project
        {
            Name = command.Name.Trim(),
            Description = command.Description?.Trim(),
            GroupId = command.GroupId
        };

        await _projectsUow.Projects.AddAsync(project);
        await _projectsUow.SaveChangesAsync();

        return project;
    }

    public async Task<Group> CreateGroupAsync(CreateGroupCommand command)
    {
        // Règles métier : validation
        if (string.IsNullOrWhiteSpace(command.Name))
        {
            throw new ArgumentException("Group name is required");
        }

        var group = new Group
        {
            Name = command.Name.Trim(),
            Description = command.Description?.Trim()
        };

        await _projectsUow.Groups.AddAsync(group);
        await _projectsUow.SaveChangesAsync();

        return group;
    }

    public async Task<Theme> CreateThemeAsync(CreateThemeCommand command)
    {
        // Règles métier : validation
        if (string.IsNullOrWhiteSpace(command.Name))
        {
            throw new ArgumentException("Theme name is required");
        }

        if (string.IsNullOrWhiteSpace(command.Color))
        {
            throw new ArgumentException("Theme color is required");
        }

        // Validation du format de couleur hexadécimale
        if (!IsValidHexColor(command.Color))
        {
            throw new ArgumentException("Color must be in valid hex format (e.g., #RRGGBB)");
        }

        var theme = new Theme
        {
            Name = command.Name.Trim(),
            Color = command.Color.Trim(),
            Description = command.Description?.Trim(),
            GroupId = command.GroupId,
            ProjectId = command.ProjectId
        };

        await _projectsUow.Themes.AddAsync(theme);
        await _projectsUow.SaveChangesAsync();

        return theme;
    }

    public async Task<IEnumerable<Project>> GetAllProjectsAsync()
    {
        return await _projectsUow.Projects.GetAllAsync();
    }

    public async Task<IEnumerable<Group>> GetAllGroupsAsync()
    {
        return await _projectsUow.Groups.GetAllAsync();
    }

    public async Task<IEnumerable<Theme>> GetAllThemesAsync()
    {
        return await _projectsUow.Themes.GetAllAsync();
    }

    #region Private Helper Methods

    private static bool IsValidHexColor(string color)
    {
        if (string.IsNullOrWhiteSpace(color))
        {
            return false;
        }

        var trimmed = color.Trim();
        
        // Check if it starts with #
        if (!trimmed.StartsWith("#"))
        {
            return false;
        }

        // Check length (should be #RGB or #RRGGBB)
        if (trimmed.Length != 4 && trimmed.Length != 7)
        {
            return false;
        }

        // Check if all characters after # are hexadecimal
        for (int i = 1; i < trimmed.Length; i++)
        {
            var c = trimmed[i];
            if (!((c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f')))
            {
                return false;
            }
        }

        return true;
    }

    #endregion
}
