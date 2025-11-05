using Microsoft.EntityFrameworkCore;
using TimeScope.Core.Entities;

namespace TimeScope.Infrastructure.Data;

/// <summary>
/// DbContext pour la base de données Projects
/// Gère: Projects, Groups, Themes (organisation hiérarchique)
/// </summary>
public class ProjectsDbContext : DbContext
{
    public ProjectsDbContext(DbContextOptions<ProjectsDbContext> options) : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Theme> Themes => Set<Theme>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Project
        modelBuilder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects", "projects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasOne(e => e.Group)
                  .WithMany(g => g.Projects)
                  .HasForeignKey(e => e.GroupId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Configure Group
        modelBuilder.Entity<Group>(entity =>
        {
            entity.ToTable("Groups", "projects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.HasQueryFilter(e => !e.IsDeleted);
        });

        // Configure Theme
        modelBuilder.Entity<Theme>(entity =>
        {
            entity.ToTable("Themes", "projects");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Color).IsRequired().HasMaxLength(7);
            entity.HasOne(e => e.Group)
                  .WithMany(g => g.Themes)
                  .HasForeignKey(e => e.GroupId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.Project)
                  .WithMany(p => p.Themes)
                  .HasForeignKey(e => e.ProjectId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasQueryFilter(e => !e.IsDeleted);
            
            // Ignore navigation properties (managed in TimeDbContext)
            entity.Ignore(e => e.Tasks);
        });
    }
}
