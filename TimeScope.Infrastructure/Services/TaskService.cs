using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;
using TaskStatus = TimeScope.Core.Entities.TaskStatus;

namespace TimeScope.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly ITimeUnitOfWork _timeUow;

    public TaskService(ITimeUnitOfWork timeUow)
    {
        _timeUow = timeUow;
    }

    public async Task<WorkTask> CreateTaskAsync(CreateTaskCommand command)
    {
        // Validation et parsing des données entrantes
        var projectId = ParseNullableGuid(command.ProjectId);
        var assigneeId = ParseNullableGuid(command.AssigneeId);
        var status = ParseEnum<TaskStatus>(command.Status, "Status");
        var precision = ParseEnum<TaskPrecision>(command.Precision, "Precision");
        var priority = ParseEnum<TaskPriority>(command.Priority, "Priority");
        var dueDate = ParseNullableDateTime(command.DueDate);
        var estimatedTime = ParseTimeSpan(command.EstimatedTime);

        // Validation des règles métier (nom obligatoire)
        if (string.IsNullOrWhiteSpace(command.Name))
        {
            throw new ArgumentException("Task name is required");
        }

        // Création de la nouvelle tâche
        var task = new WorkTask
        {
            Id = Guid.NewGuid(),
            Name = command.Name.Trim(),
            Description = command.Description?.Trim(),
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

        return createdTask;
    }

    public async Task<WorkTask> UpdateTaskAsync(Guid id, UpdateTaskCommand command)
    {
        var existingTask = await _timeUow.Tasks.GetByIdAsync(id);
        
        if (existingTask == null)
        {
            throw new KeyNotFoundException($"Task with ID {id} not found");
        }

        // Parsing des nouvelles valeurs
        var projectId = ParseNullableGuid(command.ProjectId);
        var assigneeId = ParseNullableGuid(command.AssigneeId);
        var status = ParseEnum<TaskStatus>(command.Status, "Status");
        var precision = ParseEnum<TaskPrecision>(command.Precision, "Precision");
        var priority = ParseEnum<TaskPriority>(command.Priority, "Priority");
        var dueDate = ParseNullableDateTime(command.DueDate);
        var estimatedTime = ParseTimeSpan(command.EstimatedTime);

        // Validation métier
        if (string.IsNullOrWhiteSpace(command.Name))
        {
            throw new ArgumentException("Task name is required");
        }

        // Mise à jour des propriétés
        existingTask.Name = command.Name.Trim();
        existingTask.Description = command.Description?.Trim();
        existingTask.ProjectId = projectId;
        existingTask.AssigneeId = assigneeId;
        existingTask.Status = status;
        existingTask.Precision = precision;
        existingTask.Priority = priority;
        existingTask.DueDate = dueDate;
        existingTask.EstimatedTime = estimatedTime;

        await _timeUow.Tasks.UpdateAsync(existingTask);
        await _timeUow.SaveChangesAsync();

        return existingTask;
    }

    public async Task<bool> DeleteTaskAsync(Guid id)
    {
        var task = await _timeUow.Tasks.GetByIdAsync(id);
        
        if (task == null)
        {
            return false;
        }

        await _timeUow.Tasks.DeleteAsync(id);
        await _timeUow.SaveChangesAsync();

        return true;
    }

    public async Task<WorkTask?> GetTaskByIdAsync(Guid id)
    {
        return await _timeUow.Tasks.GetByIdAsync(id);
    }

    public async Task<IEnumerable<WorkTask>> GetAllTasksAsync()
    {
        return await _timeUow.Tasks.GetAllAsync();
    }

    #region Méthodes utilitaires de parsing

    private static Guid ParseGuid(string value, string fieldName)
    {
        if (!Guid.TryParse(value, out var result))
        {
            throw new ArgumentException($"Invalid {fieldName} format");
        }
        return result;
    }

    private static Guid? ParseNullableGuid(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        if (Guid.TryParse(value, out var result))
        {
            return result;
        }

        return null;
    }

    private static TEnum ParseEnum<TEnum>(string value, string fieldName) where TEnum : struct
    {
        if (!Enum.TryParse<TEnum>(value, true, out var result))
        {
            throw new ArgumentException($"Invalid {fieldName}");
        }
        return result;
    }

    private static DateTime? ParseNullableDateTime(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return null;
        }

        if (DateTime.TryParse(value, out var result))
        {
            return result;
        }

        return null;
    }

    private static TimeSpan ParseTimeSpan(string value)
    {
        if (!TimeSpan.TryParse(value, out var result))
        {
            return TimeSpan.Zero;
        }
        return result;
    }

    #endregion
}
