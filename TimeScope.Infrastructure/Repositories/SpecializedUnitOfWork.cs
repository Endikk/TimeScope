using Microsoft.EntityFrameworkCore.Storage;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;
using TimeScope.Infrastructure.Data;

namespace TimeScope.Infrastructure.Repositories;

/// <summary>
/// Unit of Work pour la base Admin
/// </summary>
public class AdminUnitOfWork : IAdminUnitOfWork
{
    private readonly AdminDbContext _context;
    private IDbContextTransaction? _transaction;

    public AdminUnitOfWork(AdminDbContext context)
    {
        _context = context;
        Users = new Repository<User>(context);
        AppSettings = new Repository<AppSetting>(context);
        RefreshTokens = new Repository<RefreshToken>(context);
        UserRequests = new Repository<UserRequest>(context);
    }

    public IRepository<User> Users { get; }
    public IRepository<AppSetting> AppSettings { get; }
    public IRepository<RefreshToken> RefreshTokens { get; }
    public IRepository<UserRequest> UserRequests { get; }

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

/// <summary>
/// Unit of Work pour la base Projects
/// </summary>
public class ProjectsUnitOfWork : IProjectsUnitOfWork
{
    private readonly ProjectsDbContext _context;
    private IDbContextTransaction? _transaction;

    public ProjectsUnitOfWork(ProjectsDbContext context)
    {
        _context = context;
        Projects = new Repository<Project>(context);
        Groups = new Repository<Group>(context);
        Themes = new Repository<Theme>(context);
    }

    public IRepository<Project> Projects { get; }
    public IRepository<Group> Groups { get; }
    public IRepository<Theme> Themes { get; }

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

/// <summary>
/// Unit of Work pour la base Time
/// </summary>
public class TimeUnitOfWork : ITimeUnitOfWork
{
    private readonly TimeDbContext _context;
    private IDbContextTransaction? _transaction;

    public TimeUnitOfWork(TimeDbContext context)
    {
        _context = context;
        Tasks = new Repository<WorkTask>(context);
        TimeEntries = new Repository<TimeEntry>(context);
    }

    public IRepository<WorkTask> Tasks { get; }
    public IRepository<TimeEntry> TimeEntries { get; }

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

/// <summary>
/// Unit of Work pour la base Reports
/// </summary>
public class ReportsUnitOfWork : IReportsUnitOfWork
{
    private readonly ReportsDbContext _context;
    private IDbContextTransaction? _transaction;

    public ReportsUnitOfWork(ReportsDbContext context)
    {
        _context = context;
        AuditLogs = new Repository<AuditLog>(context);
    }

    public IRepository<AuditLog> AuditLogs { get; }

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
