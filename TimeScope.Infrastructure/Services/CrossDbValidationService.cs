using TimeScope.Core.Interfaces;
using TimeScope.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace TimeScope.Infrastructure.Services;

/// <summary>
/// Implémentation du service de validation cross-database (maintenant unifié)
/// </summary>
public class CrossDbValidationService : ICrossDbValidationService
{
    private readonly ApplicationDbContext _context;

    public CrossDbValidationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> UserExistsAsync(Guid userId)
    {
        return await _context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Id == userId && !u.IsDeleted);
    }

    public async Task<bool> ProjectExistsAsync(Guid projectId)
    {
        return await _context.Projects
            .IgnoreQueryFilters()
            .AnyAsync(p => p.Id == projectId && !p.IsDeleted);
    }

    public async Task<bool> ThemeExistsAsync(Guid themeId)
    {
        return await _context.Themes
            .IgnoreQueryFilters()
            .AnyAsync(t => t.Id == themeId && !t.IsDeleted);
    }

    public async Task ValidateTaskReferencesAsync(Guid? projectId, Guid? assigneeId)
    {
        // Vérifier que le projet existe (si fourni)
        if (projectId.HasValue)
        {
            var projectExists = await ProjectExistsAsync(projectId.Value);
            if (!projectExists)
            {
                throw new ValidationException($"Project with ID {projectId} not found");
            }
        }

        // Vérifier que l'assigné existe (si fourni)
        if (assigneeId.HasValue)
        {
            var userExists = await UserExistsAsync(assigneeId.Value);
            if (!userExists)
            {
                throw new ValidationException($"User with ID {assigneeId.Value} not found");
            }
        }
    }

    public async Task ValidateTimeEntryReferencesAsync(Guid userId)
    {
        var userExists = await UserExistsAsync(userId);
        if (!userExists)
        {
            throw new ValidationException($"User with ID {userId} not found");
        }
    }

    public async Task<OrphanReport> FindOrphanReferencesAsync()
    {
        var report = new OrphanReport();

        // Récupérer tous les IDs valides
        var validUserIdsList = await _context.Users
            .IgnoreQueryFilters()
            .Where(u => !u.IsDeleted)
            .Select(u => u.Id)
            .ToListAsync();
        var validUserIds = new HashSet<Guid>(validUserIdsList);

        var validProjectIdsList = await _context.Projects
            .IgnoreQueryFilters()
            .Where(p => !p.IsDeleted)
            .Select(p => p.Id)
            .ToListAsync();
        var validProjectIds = new HashSet<Guid>(validProjectIdsList);

        // Vérifier les tâches
        var tasks = await _context.Tasks
            .IgnoreQueryFilters()
            .Where(t => !t.IsDeleted)
            .Select(t => new { t.Id, t.ProjectId, t.AssigneeId })
            .ToListAsync();

        foreach (var task in tasks)
        {
            if (task.ProjectId.HasValue && !validProjectIds.Contains(task.ProjectId.Value))
            {
                report.TasksWithInvalidProject.Add(task.Id);
            }

            if (task.AssigneeId.HasValue && !validUserIds.Contains(task.AssigneeId.Value))
            {
                report.TasksWithInvalidAssignee.Add(task.Id);
            }
        }

        // Vérifier les entrées de temps
        var timeEntries = await _context.TimeEntries
            .IgnoreQueryFilters()
            .Where(te => !te.IsDeleted)
            .Select(te => new { te.Id, te.UserId })
            .ToListAsync();

        foreach (var entry in timeEntries)
        {
            if (!validUserIds.Contains(entry.UserId))
            {
                report.TimeEntriesWithInvalidUser.Add(entry.Id);
            }
        }

        return report;
    }
}

/// <summary>
/// Exception de validation pour les références cross-database
/// </summary>
public class ValidationException : Exception
{
    public ValidationException(string message) : base(message)
    {
    }
}
