using Microsoft.AspNetCore.Mvc;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

public class CreateTaskDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ProjectId { get; set; } = string.Empty;
    public string? AssigneeId { get; set; }
    public string Status { get; set; } = "EnAttente";
    public string Precision { get; set; } = "Medium";
    public string Priority { get; set; } = "Medium";
    public string? DueDate { get; set; }
    public string EstimatedTime { get; set; } = "00:00:00";
}

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITimeUnitOfWork _timeUow;
    private readonly ILogger<TasksController> _logger;

    public TasksController(ITimeUnitOfWork timeUow, ILogger<TasksController> logger)
    {
        _timeUow = timeUow;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasks()
    {
        try
        {
            var tasks = await _timeUow.Tasks.GetAllAsync();
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks from Time database");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkTask>> GetTask(Guid id)
    {
        try
        {
            var task = await _timeUow.Tasks.GetByIdAsync(id);

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

    [HttpPost]
    public async Task<ActionResult<WorkTask>> CreateTask([FromBody] CreateTaskDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Parse ProjectId
            if (!Guid.TryParse(dto.ProjectId, out var projectId))
            {
                return BadRequest("Invalid ProjectId format");
            }

            // Parse AssigneeId if provided
            Guid? assigneeId = null;
            if (!string.IsNullOrEmpty(dto.AssigneeId))
            {
                if (Guid.TryParse(dto.AssigneeId, out var parsedAssigneeId))
                {
                    assigneeId = parsedAssigneeId;
                }
            }

            // Parse Status
            if (!Enum.TryParse<Core.Entities.TaskStatus>(dto.Status, true, out var status))
            {
                return BadRequest("Invalid Status");
            }

            // Parse Precision
            if (!Enum.TryParse<TaskPrecision>(dto.Precision, true, out var precision))
            {
                return BadRequest("Invalid Precision");
            }

            // Parse Priority
            if (!Enum.TryParse<TaskPriority>(dto.Priority, true, out var priority))
            {
                return BadRequest("Invalid Priority");
            }

            // Parse DueDate if provided
            DateTime? dueDate = null;
            if (!string.IsNullOrEmpty(dto.DueDate))
            {
                if (DateTime.TryParse(dto.DueDate, out var parsedDueDate))
                {
                    dueDate = parsedDueDate;
                }
            }

            // Parse EstimatedTime
            if (!TimeSpan.TryParse(dto.EstimatedTime, out var estimatedTime))
            {
                estimatedTime = TimeSpan.Zero;
            }

            var task = new WorkTask
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                ProjectId = projectId,
                AssigneeId = assigneeId,
                Status = status,
                Precision = precision,
                Priority = priority,
                DueDate = dueDate,
                EstimatedTime = estimatedTime,
                ActualTime = TimeSpan.Zero
            };

            var createdTask = await _timeUow.Tasks.AddAsync(task);
            await _timeUow.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = createdTask.Id }, createdTask);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task in Time database");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] CreateTaskDto dto)
    {
        try
        {
            var existingTask = await _timeUow.Tasks.GetByIdAsync(id);
            if (existingTask == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            // Parse ProjectId
            if (!Guid.TryParse(dto.ProjectId, out var projectId))
            {
                return BadRequest("Invalid ProjectId format");
            }

            // Parse AssigneeId if provided
            Guid? assigneeId = null;
            if (!string.IsNullOrEmpty(dto.AssigneeId))
            {
                if (Guid.TryParse(dto.AssigneeId, out var parsedAssigneeId))
                {
                    assigneeId = parsedAssigneeId;
                }
            }

            // Parse Status
            if (!Enum.TryParse<Core.Entities.TaskStatus>(dto.Status, true, out var status))
            {
                return BadRequest("Invalid Status");
            }

            // Parse Precision
            if (!Enum.TryParse<TaskPrecision>(dto.Precision, true, out var precision))
            {
                return BadRequest("Invalid Precision");
            }

            // Parse Priority
            if (!Enum.TryParse<TaskPriority>(dto.Priority, true, out var priority))
            {
                return BadRequest("Invalid Priority");
            }

            // Parse DueDate if provided
            DateTime? dueDate = null;
            if (!string.IsNullOrEmpty(dto.DueDate))
            {
                if (DateTime.TryParse(dto.DueDate, out var parsedDueDate))
                {
                    dueDate = parsedDueDate;
                }
            }

            // Parse EstimatedTime
            if (!TimeSpan.TryParse(dto.EstimatedTime, out var estimatedTime))
            {
                estimatedTime = TimeSpan.Zero;
            }

            // Update task properties
            existingTask.Name = dto.Name;
            existingTask.Description = dto.Description;
            existingTask.ProjectId = projectId;
            existingTask.AssigneeId = assigneeId;
            existingTask.Status = status;
            existingTask.Precision = precision;
            existingTask.Priority = priority;
            existingTask.DueDate = dueDate;
            existingTask.EstimatedTime = estimatedTime;

            await _timeUow.Tasks.UpdateAsync(existingTask);
            await _timeUow.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {TaskId} in Time database", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        try
        {
            var task = await _timeUow.Tasks.GetByIdAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            await _timeUow.Tasks.DeleteAsync(id);
            await _timeUow.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {TaskId} from Time database", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasksByProject(Guid projectId)
    {
        try
        {
            var tasks = await _timeUow.Tasks.GetAllAsync();
            var projectTasks = tasks.Where(t => t.ProjectId == projectId).ToList();
            return Ok(projectTasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for project {ProjectId}", projectId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasksByUser(Guid userId)
    {
        try
        {
            var tasks = await _timeUow.Tasks.GetAllAsync();
            var userTasks = tasks.Where(t => t.AssigneeId == userId).ToList();
            return Ok(userTasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks for user {UserId}", userId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasksByStatus(string status)
    {
        try
        {
            if (!Enum.TryParse<Core.Entities.TaskStatus>(status, true, out var taskStatus))
            {
                return BadRequest($"Invalid status: {status}");
            }

            var tasks = await _timeUow.Tasks.GetAllAsync();
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
