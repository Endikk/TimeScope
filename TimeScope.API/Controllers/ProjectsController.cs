using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Tous les utilisateurs authentifiés peuvent accéder aux projets
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly IProjectsUnitOfWork _projectsUow;
    private readonly ILogger<ProjectsController> _logger;

    public ProjectsController(
        IProjectService projectService,
        IProjectsUnitOfWork projectsUow,
        ILogger<ProjectsController> logger)
    {
        _projectService = projectService;
        _projectsUow = projectsUow;
        _logger = logger;
    }

    /// <summary>
    /// Liste tous les projets disponibles
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
    {
        try
        {
            var projects = await _projectService.GetAllProjectsAsync();
            return Ok(projects);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving projects from Projects database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Liste tous les groupes de projets
    /// </summary>
    [HttpGet("groups")]
    public async Task<ActionResult<IEnumerable<Group>>> GetGroups()
    {
        try
        {
            var groups = await _projectService.GetAllGroupsAsync();
            return Ok(groups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving groups from Projects database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Liste tous les thèmes
    /// </summary>
    [HttpGet("themes")]
    public async Task<ActionResult<IEnumerable<Theme>>> GetThemes()
    {
        try
        {
            var themes = await _projectService.GetAllThemesAsync();
            return Ok(themes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving themes from Projects database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Crée un nouveau projet (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost]
    public async Task<ActionResult<Project>> CreateProject([FromBody] CreateProjectDto dto)
    {
        try
        {
            var command = new CreateProjectCommand
            {
                Name = dto.Name,
                Description = dto.Description,
                GroupId = dto.GroupId
            };

            var project = await _projectService.CreateProjectAsync(command);

            _logger.LogInformation("Project {ProjectId} created successfully in Projects database", project.Id);

            return CreatedAtAction(nameof(GetProjects), new { id = project.Id }, project);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating project");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating project in Projects database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Crée un nouveau groupe (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("groups")]
    public async Task<ActionResult<Group>> CreateGroup([FromBody] CreateGroupDto dto)
    {
        try
        {
            var command = new CreateGroupCommand
            {
                Name = dto.Name,
                Description = dto.Description
            };

            var group = await _projectService.CreateGroupAsync(command);

            _logger.LogInformation("Group {GroupId} created successfully in Projects database", group.Id);

            return CreatedAtAction(nameof(GetGroups), new { id = group.Id }, group);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating group");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating group in Projects database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Crée un nouveau thème (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpPost("themes")]
    public async Task<ActionResult<Theme>> CreateTheme([FromBody] CreateThemeDto dto)
    {
        try
        {
            var command = new CreateThemeCommand
            {
                Name = dto.Name,
                Color = dto.Color,
                Description = dto.Description,
                GroupId = dto.GroupId,
                ProjectId = dto.ProjectId
            };

            var theme = await _projectService.CreateThemeAsync(command);

            _logger.LogInformation("Theme {ThemeId} created successfully in Projects database", theme.Id);

            return CreatedAtAction(nameof(GetThemes), new { id = theme.Id }, theme);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating theme");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating theme in Projects database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour un projet (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectDto dto)
    {
        try
        {
            var project = await _projectsUow.Projects.GetByIdAsync(id);
            if (project == null)
                return NotFound($"Project with ID {id} not found");

            project.Name = dto.Name ?? project.Name;
            project.Description = dto.Description ?? project.Description;
            project.GroupId = dto.GroupId ?? project.GroupId;

            await _projectsUow.Projects.UpdateAsync(project);
            await _projectsUow.SaveChangesAsync();

            _logger.LogInformation("Project {ProjectId} updated successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating project {ProjectId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime un projet (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProject(Guid id)
    {
        try
        {
            await _projectsUow.Projects.DeleteAsync(id);
            await _projectsUow.SaveChangesAsync();

            _logger.LogInformation("Project {ProjectId} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting project {ProjectId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour un groupe (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("groups/{id}")]
    public async Task<ActionResult> UpdateGroup(Guid id, [FromBody] UpdateGroupDto dto)
    {
        try
        {
            var group = await _projectsUow.Groups.GetByIdAsync(id);
            if (group == null)
                return NotFound($"Group with ID {id} not found");

            group.Name = dto.Name ?? group.Name;
            group.Description = dto.Description ?? group.Description;

            await _projectsUow.Groups.UpdateAsync(group);
            await _projectsUow.SaveChangesAsync();

            _logger.LogInformation("Group {GroupId} updated successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating group {GroupId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime un groupe (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("groups/{id}")]
    public async Task<ActionResult> DeleteGroup(Guid id)
    {
        try
        {
            await _projectsUow.Groups.DeleteAsync(id);
            await _projectsUow.SaveChangesAsync();

            _logger.LogInformation("Group {GroupId} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting group {GroupId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour un thème (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpPut("themes/{id}")]
    public async Task<ActionResult> UpdateTheme(Guid id, [FromBody] UpdateThemeDto dto)
    {
        try
        {
            var theme = await _projectsUow.Themes.GetByIdAsync(id);
            if (theme == null)
                return NotFound($"Theme with ID {id} not found");

            theme.Name = dto.Name ?? theme.Name;
            theme.Color = dto.Color ?? theme.Color;
            theme.Description = dto.Description ?? theme.Description;
            theme.GroupId = dto.GroupId ?? theme.GroupId;
            theme.ProjectId = dto.ProjectId ?? theme.ProjectId;

            await _projectsUow.Themes.UpdateAsync(theme);
            await _projectsUow.SaveChangesAsync();

            _logger.LogInformation("Theme {ThemeId} updated successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating theme {ThemeId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime un thème (Admin/Manager uniquement)
    /// </summary>
    [Authorize(Roles = "Admin,Manager")]
    [HttpDelete("themes/{id}")]
    public async Task<ActionResult> DeleteTheme(Guid id)
    {
        try
        {
            await _projectsUow.Themes.DeleteAsync(id);
            await _projectsUow.SaveChangesAsync();

            _logger.LogInformation("Theme {ThemeId} deleted successfully", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting theme {ThemeId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}

// DTOs
public class CreateProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? GroupId { get; set; }
}

public class UpdateProjectDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public Guid? GroupId { get; set; }
}

public class CreateGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}

public class UpdateGroupDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
}

public class CreateThemeDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? GroupId { get; set; }
    public Guid? ProjectId { get; set; }
}

public class UpdateThemeDto
{
    public string? Name { get; set; }
    public string? Color { get; set; }
    public string? Description { get; set; }
    public Guid? GroupId { get; set; }
    public Guid? ProjectId { get; set; }
}
