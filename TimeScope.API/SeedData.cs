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
        
        // Appliquer les migrations en attente (crée la BDD et les tables si nécessaire)
        Console.WriteLine("🔄 Applying migrations...");
        await context.Database.MigrateAsync();
        Console.WriteLine("✓ Migrations applied");

        // Vérifier si des utilisateurs existent déjà
        // On ne retourne plus si la base est déjà seedée, on veut vérifier/mettre à jour l'admin
        // if (await context.Users.AnyAsync()) ...

        Console.WriteLine("🌱 Seeding Database...");

        await InitializeUsersAndSettingsAsync(context);
        await InitializeAuditLogAsync(context);
        
        await context.SaveChangesAsync();
        
        Console.WriteLine("✓ Database initialized successfully");
    }

    private static async Task InitializeUsersAndSettingsAsync(ApplicationDbContext context)
    {
        // 1. Admin User
        var adminEmail = "admin@timescope.com";
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail);

        if (adminUser == null)
        {
            adminUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Admin",
                LastName = "TimeScope",
                Email = adminEmail,
                Role = UserRole.Admin,
                IsActive = true,
                PhoneNumber = "+33 6 12 34 56 78",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            await context.Users.AddAsync(adminUser);
            Console.WriteLine($"✓ Created admin user: {adminUser.Email}");
        }
        
        // Always reset admin password to default
        adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", 12);
        Console.WriteLine($"✓ Reset admin password to: Admin123!");

        // 2. Manager User
        var managerEmail = "marie.dupont@timescope.com";
        var managerUser = await context.Users.FirstOrDefaultAsync(u => u.Email == managerEmail);

        if (managerUser == null)
        {
            managerUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Marie",
                LastName = "Dupont",
                Email = managerEmail,
                Role = UserRole.Manager,
                IsActive = true,
                PhoneNumber = "+33 6 98 76 54 32",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            await context.Users.AddAsync(managerUser);
            Console.WriteLine($"✓ Created manager user: {managerUser.Email}");
        }
        managerUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Manager123!", 12);

        // 3. Employee User
        var employeeEmail = "jean.martin@timescope.com";
        var employeeUser = await context.Users.FirstOrDefaultAsync(u => u.Email == employeeEmail);

        if (employeeUser == null)
        {
            employeeUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Jean",
                LastName = "Martin",
                Email = employeeEmail,
                Role = UserRole.Employee,
                IsActive = true,
                PhoneNumber = "+33 6 11 22 33 44",
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };
            await context.Users.AddAsync(employeeUser);
            Console.WriteLine($"✓ Created employee user: {employeeUser.Email}");
        }
        employeeUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Employee123!", 12);

        // 4. Settings (Only add if none exist to avoid duplicates or overwriting custom settings)
        if (!await context.AppSettings.AnyAsync())
        {
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

            await context.AppSettings.AddRangeAsync(settings);
            Console.WriteLine($"✓ Created {settings.Count} app settings");
        }
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
