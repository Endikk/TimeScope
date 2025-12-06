using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

public class CreateTaskDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ProjectId { get; set; }
    public string? AssigneeId { get; set; }
    public string Status { get; set; } = "EnAttente";
    public string Precision { get; set; } = "Medium";
    public string Priority { get; set; } = "Medium";
    public string? DueDate { get; set; }
    public string EstimatedTime { get; set; } = "00:00:00";
}

[ApiController]
[Route("api/[controller]")]
[Authorize] // Tous les utilisateurs authentifiés peuvent accéder aux tâches
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(ITaskService taskService, ILogger<TasksController> logger)
    {
        _taskService = taskService;
        _logger = logger;
    }

    /// <summary>
    /// Liste toutes les tâches
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasks()
    {
        try
        {
            var tasks = await _taskService.GetAllTasksAsync();
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks from Time database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère les détails d'une tâche
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkTask>> GetTask(Guid id)
    {
        try
        {
            var task = await _taskService.GetTaskByIdAsync(id);

            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            return Ok(task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Crée une nouvelle tâche
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<WorkTask>> CreateTask([FromBody] CreateTaskDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Conversion du DTO vers Command
            var command = new CreateTaskCommand
            {
                Name = dto.Name,
                Description = dto.Description,
                ProjectId = dto.ProjectId,
                AssigneeId = dto.AssigneeId,
                Status = dto.Status,
                Precision = dto.Precision,
                Priority = dto.Priority,
                DueDate = dto.DueDate,
                EstimatedTime = dto.EstimatedTime
            };

            var createdTask = await _taskService.CreateTaskAsync(command);

            return CreatedAtAction(nameof(GetTask), new { id = createdTask.Id }, createdTask);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating task");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task in Time database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour une tâche existante
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] CreateTaskDto dto)
    {
        try
        {
            // Conversion du DTO vers Command
            var command = new UpdateTaskCommand
            {
                Name = dto.Name,
                Description = dto.Description,
                ProjectId = dto.ProjectId,
                AssigneeId = dto.AssigneeId,
                Status = dto.Status,
                Precision = dto.Precision,
                Priority = dto.Priority,
                DueDate = dto.DueDate,
                EstimatedTime = dto.EstimatedTime
            };

            await _taskService.UpdateTaskAsync(id, command);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Task {TaskId} not found", id);
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while updating task {TaskId}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {TaskId} in Time database", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime une tâche
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        try
        {
            var deleted = await _taskService.DeleteTaskAsync(id);
            
            if (!deleted)
            {
                return NotFound($"Task with ID {id} not found");
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {TaskId} from Time database", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère les tâches d'un projet
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasksByProject(Guid projectId)
    {
        try
        {
            var tasks = await _taskService.GetAllTasksAsync();
            var projectTasks = tasks.Where(t => t.ProjectId == projectId).ToList();
            return Ok(projectTasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for project {ProjectId}", projectId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère les tâches assignées à un utilisateur
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasksByUser(Guid userId)
    {
        try
        {
            var tasks = await _taskService.GetAllTasksAsync();
            var userTasks = tasks.Where(t => t.AssigneeId == userId).ToList();
            return Ok(userTasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Filtre les tâches par statut
    /// </summary>
    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasksByStatus(string status)
    {
        try
        {
            if (!Enum.TryParse<Core.Entities.TaskStatus>(status, true, out var taskStatus))
            {
                return BadRequest($"Invalid status: {status}");
            }

            var tasks = await _taskService.GetAllTasksAsync();
            var statusTasks = tasks.Where(t => t.Status == taskStatus).ToList();
            return Ok(statusTasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks with status {Status}", status);
            return StatusCode(500, "Internal server error");
        }
    }
}
