using Microsoft.EntityFrameworkCore;
using TimeScope.Core.Entities;

namespace TimeScope.Infrastructure.Data;

/// <summary>
/// DbContext pour la base de données Time
/// Gère: WorkTasks, TimeEntries (suivi du temps et des tâches)
/// </summary>
public class TimeDbContext : DbContext
{
    public TimeDbContext(DbContextOptions<TimeDbContext> options) : base(options)
    {
    }

    public DbSet<WorkTask> Tasks => Set<WorkTask>();
    public DbSet<TimeEntry> TimeEntries => Set<TimeEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure WorkTask
        modelBuilder.Entity<WorkTask>(entity =>
        {
            entity.ToTable("Tasks", "time");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.ThemeId).IsRequired();
            entity.Property(e => e.AssigneeId);
            entity.HasQueryFilter(e => !e.IsDeleted);
            
            // Ignore navigation properties (managed in other contexts)
            entity.Ignore(e => e.Theme);
            entity.Ignore(e => e.Assignee);
        });

        // Configure TimeEntry
        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.ToTable("TimeEntries", "time");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TaskId).IsRequired();
            entity.Property(e => e.UserId).IsRequired();
            entity.HasOne(e => e.Task)
                  .WithMany(t => t.TimeEntries)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasQueryFilter(e => !e.IsDeleted);
            
            // Ignore navigation properties (managed in AdminDbContext)
            entity.Ignore(e => e.User);
        });
    }
}
