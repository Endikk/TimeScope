using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

/// <summary>
/// Unit of Work pour la base de données Admin
/// Gère les opérations sur les utilisateurs
/// </summary>
public interface IAdminUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Unit of Work pour la base de données Projects
/// Gère les opérations sur les projets, groupes et thèmes
/// </summary>
public interface IProjectsUnitOfWork : IDisposable
{
    IRepository<Project> Projects { get; }
    IRepository<Group> Groups { get; }
    IRepository<Theme> Themes { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Unit of Work pour la base de données Time
/// Gère les opérations sur les tâches et entrées de temps
/// </summary>
public interface ITimeUnitOfWork : IDisposable
{
    IRepository<WorkTask> Tasks { get; }
    IRepository<TimeEntry> TimeEntries { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
