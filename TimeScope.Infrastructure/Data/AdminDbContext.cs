using Microsoft.EntityFrameworkCore;
using TimeScope.Core.Entities;

namespace TimeScope.Infrastructure.Data;

/// <summary>
/// DbContext pour la base de données Admin
/// Gère: Users (utilisateurs, rôles, authentification)
/// </summary>
public class AdminDbContext : DbContext
{
    public AdminDbContext(DbContextOptions<AdminDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users", "admin");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).IsRequired();
            entity.Property(e => e.IsActive).IsRequired();
            entity.HasQueryFilter(e => !e.IsDeleted);
            
            // Ignore navigation properties (managed in other contexts)
            entity.Ignore(e => e.AssignedTasks);
            entity.Ignore(e => e.TimeEntries);
        });

        // Configure AppSetting
        modelBuilder.Entity<AppSetting>(entity =>
        {
            entity.ToTable("AppSettings", "admin");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Key).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Value).IsRequired();
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.DataType).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Key).IsUnique();
            entity.HasIndex(e => e.Category);
        });

        // Configure RefreshToken
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens", "admin");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.CreatedByIp).HasMaxLength(45); // IPv6 max length
            entity.Property(e => e.RevokedByIp).HasMaxLength(45);
            entity.Property(e => e.ReplacedByToken).HasMaxLength(500);
            entity.Property(e => e.ReasonRevoked).HasMaxLength(200);

            // Indexes for performance
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ExpiresAt);

            // Foreign key relationship (navigation ignored to avoid cross-db issues)
            entity.Ignore(e => e.User);
        });
    }
}
