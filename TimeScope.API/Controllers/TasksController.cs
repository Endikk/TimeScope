using Microsoft.AspNetCore.Mvc;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<TasksController> _logger;

    public TasksController(IUnitOfWork unitOfWork, ILogger<TasksController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkTask>>> GetTasks()
    {
        try
        {
            var tasks = await _unitOfWork.Tasks.GetAllAsync();
            return Ok(tasks);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tasks");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkTask>> GetTask(Guid id)
    {
        try
        {
            var task = await _unitOfWork.Tasks.GetByIdAsync(id);

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
            var createdTask = await _unitOfWork.Tasks.AddAsync(task);
            await _unitOfWork.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = createdTask.Id }, createdTask);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task");
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

            var existingTask = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (existingTask == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            await _unitOfWork.Tasks.UpdateAsync(task);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        try
        {
            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null)
            {
                return NotFound($"Task with ID {id} not found");
            }

            await _unitOfWork.Tasks.DeleteAsync(id);
            await _unitOfWork.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting task {TaskId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
