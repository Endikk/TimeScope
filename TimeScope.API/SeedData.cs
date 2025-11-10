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

        // Admin Database
        var adminContext = scope.ServiceProvider.GetRequiredService<AdminDbContext>();
        await InitializeAdminDataAsync(adminContext, authService);

        // Projects Database
        var projectsContext = scope.ServiceProvider.GetRequiredService<ProjectsDbContext>();
        await InitializeProjectsDataAsync(projectsContext);

        // Time Database
        var timeContext = scope.ServiceProvider.GetRequiredService<TimeDbContext>();
        await InitializeTimeDataAsync(timeContext);

        // Reports Database
        var reportsContext = scope.ServiceProvider.GetRequiredService<ReportsDbContext>();
        await InitializeReportsDataAsync(reportsContext);
    }

    private static async Task InitializeAdminDataAsync(AdminDbContext context, IAuthService authService)
    {
        // Créer les tables si elles n'existent pas
        await context.Database.EnsureCreatedAsync();

        // Vérifier si des utilisateurs existent déjà
        if (await context.Users.AnyAsync())
        {
            Console.WriteLine("✓ Admin database already seeded");
            return;
        }

        Console.WriteLine("🌱 Seeding Admin database...");

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

        await context.SaveChangesAsync();

        Console.WriteLine($"✓ Created admin user: {adminUser.Email} (password: Admin123!)");
        Console.WriteLine($"✓ Created manager user: {managerUser.Email} (password: Manager123!)");
        Console.WriteLine($"✓ Created employee user: {employeeUser.Email} (password: Employee123!)");
        Console.WriteLine($"✓ Created {settings.Count} app settings");
    }

    private static async Task InitializeProjectsDataAsync(ProjectsDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Projects.AnyAsync())
        {
            Console.WriteLine("✓ Projects database already seeded");
            return;
        }

        Console.WriteLine("🌱 Seeding Projects database...");

        // Les données de projet peuvent être ajoutées ici si nécessaire
        // Pour l'instant, on laisse vide pour que l'utilisateur crée ses propres projets

        Console.WriteLine("✓ Projects database initialized (empty)");
    }

    private static async Task InitializeTimeDataAsync(TimeDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Tasks.AnyAsync())
        {
            Console.WriteLine("✓ Time database already seeded");
            return;
        }

        Console.WriteLine("🌱 Seeding Time database...");

        // Les données de tâches peuvent être ajoutées ici si nécessaire

        Console.WriteLine("✓ Time database initialized (empty)");
    }

    private static async Task InitializeReportsDataAsync(ReportsDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.AuditLogs.AnyAsync())
        {
            Console.WriteLine("✓ Reports database already seeded");
            return;
        }

        Console.WriteLine("🌱 Seeding Reports database...");

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
        await context.SaveChangesAsync();

        Console.WriteLine("✓ Reports database initialized");
    }
}
