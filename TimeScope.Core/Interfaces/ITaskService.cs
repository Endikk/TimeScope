using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface ITaskService
{
    /// <summary>
    /// Crée une nouvelle tâche
    /// </summary>
    Task<WorkTask> CreateTaskAsync(CreateTaskCommand command);

    /// <summary>
    /// Met à jour une tâche existante
    /// </summary>
    Task<WorkTask> UpdateTaskAsync(Guid id, UpdateTaskCommand command);

    /// <summary>
    /// Supprime une tâche
    /// </summary>
    Task<bool> DeleteTaskAsync(Guid id);

    /// <summary>
    /// Récupère une tâche par son ID
    /// </summary>
    Task<WorkTask?> GetTaskByIdAsync(Guid id);

    /// <summary>
    /// Liste toutes les tâches
    /// </summary>
    Task<IEnumerable<WorkTask>> GetAllTasksAsync();
}

public class CreateTaskCommand
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

public class UpdateTaskCommand
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
