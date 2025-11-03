using Microsoft.EntityFrameworkCore.Storage;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;
using TimeScope.Infrastructure.Data;

namespace TimeScope.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        Users = new Repository<User>(context);
        Tasks = new Repository<WorkTask>(context);
        TimeEntries = new Repository<TimeEntry>(context);
        Themes = new Repository<Theme>(context);
        Groups = new Repository<Group>(context);
        Projects = new Repository<Project>(context);
    }

    public IRepository<User> Users { get; }
    public IRepository<WorkTask> Tasks { get; }
    public IRepository<TimeEntry> TimeEntries { get; }
    public IRepository<Theme> Themes { get; }
    public IRepository<Group> Groups { get; }
    public IRepository<Project> Projects { get; }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await SaveChangesAsync(cancellationToken);
            if (_transaction != null)
            {
                await _transaction.CommitAsync(cancellationToken);
            }
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(cancellationToken);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
