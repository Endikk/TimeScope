using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

/// <summary>
/// Service de validation des références cross-database
/// Vérifie l'existence des entités référencées dans d'autres bases de données
/// </summary>
public interface ICrossDbValidationService
{
    /// <summary>
    /// Vérifie si un utilisateur existe dans la base Admin
    /// </summary>
    Task<bool> UserExistsAsync(Guid userId);

    /// <summary>
    /// Vérifie si un projet existe dans la base Projects
    /// </summary>
    Task<bool> ProjectExistsAsync(Guid projectId);

    /// <summary>
    /// Vérifie si un thème existe dans la base Projects
    /// </summary>
    Task<bool> ThemeExistsAsync(Guid themeId);

    /// <summary>
    /// Valide une tâche avant création/modification
    /// Vérifie que ProjectId et AssigneeId (si fourni) existent
    /// </summary>
    Task ValidateTaskReferencesAsync(Guid? projectId, Guid? assigneeId);

    /// <summary>
    /// Valide une entrée de temps avant création/modification
    /// Vérifie que UserId existe
    /// </summary>
    Task ValidateTimeEntryReferencesAsync(Guid userId);

    /// <summary>
    /// Trouve les références orphelines dans la base Time
    /// Retourne les IDs de tâches avec des références invalides
    /// </summary>
    Task<OrphanReport> FindOrphanReferencesAsync();
}

/// <summary>
/// Rapport des références orphelines
/// </summary>
public class OrphanReport
{
    public List<Guid> TasksWithInvalidProject { get; set; } = new();
    public List<Guid> TasksWithInvalidAssignee { get; set; } = new();
    public List<Guid> TimeEntriesWithInvalidUser { get; set; } = new();
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    public bool HasOrphans =>
        TasksWithInvalidProject.Any() ||
        TasksWithInvalidAssignee.Any() ||
        TimeEntriesWithInvalidUser.Any();

    public int TotalOrphans =>
        TasksWithInvalidProject.Count +
        TasksWithInvalidAssignee.Count +
        TimeEntriesWithInvalidUser.Count;
}
