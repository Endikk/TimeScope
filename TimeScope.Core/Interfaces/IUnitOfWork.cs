using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<WorkTask> Tasks { get; }
    IRepository<TimeEntry> TimeEntries { get; }
    IRepository<Theme> Themes { get; }
    IRepository<Group> Groups { get; }
    IRepository<Project> Projects { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
