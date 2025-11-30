using Microsoft.EntityFrameworkCore;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;
using TimeScope.Infrastructure.Data;

namespace TimeScope.API;

/// <summary>
/// Classe pour initialiser les données de test dans la base de données
/// </summary>
public static class SeedData
{
    /// <summary>
    /// Initialise les données de base (utilisateur admin, paramètres, etc.)
    /// </summary>
    public static async Task InitializeAsync(IServiceProvider serviceProvider, IAuthService authService)
    {
        using var scope = serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        // Créer les tables si elles n'existent pas (utile pour le dev, mais EF Migrations gère ça normalement)
        // await context.Database.EnsureCreatedAsync(); 
        // Note: Avec les migrations, on évite EnsureCreatedAsync qui peut bypasser les migrations

        // Vérifier si des utilisateurs existent déjà
        if (await context.Users.AnyAsync())
        {
            Console.WriteLine("✓ Database already seeded");
            return;
        }

        Console.WriteLine("🌱 Seeding Database...");

        await InitializeUsersAndSettingsAsync(context);
        await InitializeAuditLogAsync(context);
        
        await context.SaveChangesAsync();
        
        Console.WriteLine("✓ Database initialized successfully");
    }

    private static async Task InitializeUsersAndSettingsAsync(ApplicationDbContext context)
    {
        // Utiliser BCrypt directement pour hash les passwords
        // Créer un utilisateur admin par défaut
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Admin",
            LastName = "TimeScope",
            Email = "admin@timescope.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 12),
            Role = UserRole.Admin,
            IsActive = true,
            PhoneNumber = "+33 6 12 34 56 78",
            Avatar = null,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        // Créer un manager de test
        var managerUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Marie",
            LastName = "Dupont",
            Email = "marie.dupont@timescope.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!", 12),
            Role = UserRole.Manager,
            IsActive = true,
            PhoneNumber = "+33 6 98 76 54 32",
            Avatar = null,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        // Créer un employé de test
        var employeeUser = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Jean",
            LastName = "Martin",
            Email = "jean.martin@timescope.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employee123!", 12),
            Role = UserRole.Employee,
            IsActive = true,
            PhoneNumber = "+33 6 11 22 33 44",
            Avatar = null,
            CreatedAt = DateTime.UtcNow,
            IsDeleted = false
        };

        context.Users.AddRange(adminUser, managerUser, employeeUser);

        // Créer quelques paramètres par défaut
        var settings = new List<AppSetting>
        {
            new AppSetting
            {
                Id = Guid.NewGuid(),
                Key = "app.timezone",
                Value = "Europe/Paris",
                Category = "General",
                Description = "Fuseau horaire de l'application",
                DataType = "string",
                IsPublic = true,
                CreatedAt = DateTime.UtcNow
            },
            new AppSetting
            {
                Id = Guid.NewGuid(),
                Key = "app.work_hours_per_day",
                Value = "7",
                Category = "Time Tracking",
                Description = "Nombre d'heures de travail par jour",
                DataType = "number",
                IsPublic = true,
                CreatedAt = DateTime.UtcNow
            },
            new AppSetting
            {
                Id = Guid.NewGuid(),
                Key = "app.max_time_entry_duration",
                Value = "12",
                Category = "Time Tracking",
                Description = "Durée maximale d'une entrée de temps (en heures)",
                DataType = "number",
                IsPublic = false,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.AppSettings.AddRange(settings);

        Console.WriteLine($"✓ Created admin user: {adminUser.Email} (password: Admin123!)");
        Console.WriteLine($"✓ Created manager user: {managerUser.Email} (password: Manager123!)");
        Console.WriteLine($"✓ Created employee user: {employeeUser.Email} (password: Employee123!)");
        Console.WriteLine($"✓ Created {settings.Count} app settings");
    }

    private static async Task InitializeAuditLogAsync(ApplicationDbContext context)
    {
        // Créer un log d'audit pour l'initialisation
        var initLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "System.Initialize",
            EntityType = "System",
            EntityId = Guid.Empty,
            UserId = Guid.Empty,
            UserName = "System",
            Details = "Database initialized with seed data",
            IpAddress = "127.0.0.1",
            Timestamp = DateTime.UtcNow
        };

        context.AuditLogs.Add(initLog);
        Console.WriteLine("✓ Created initial audit log");
    }
}
