using Microsoft.AspNetCore.Mvc;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

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
    public async Task<ActionResult<WorkTask>> CreateTask([FromBody] WorkTask task)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            task.Id = Guid.NewGuid();
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
    public async Task<IActionResult> UpdateTask(Guid id, [FromBody] WorkTask task)
    {
        try
        {
            if (id != task.Id)
            {
                return BadRequest("ID mismatch");
            }

            var existingTask = await _timeUow.Tasks.GetByIdAsync(id);
            if (existingTask == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            await _timeUow.Tasks.UpdateAsync(task);
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
}
