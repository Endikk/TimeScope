using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

public class SettingsService : ISettingsService
{
    private readonly IAdminUnitOfWork _adminUow;

    public SettingsService(IAdminUnitOfWork adminUow)
    {
        _adminUow = adminUow;
    }

    public async Task<AppSetting> CreateSettingAsync(CreateSettingCommand command)
    {
        // Validation des règles métier
        if (string.IsNullOrWhiteSpace(command.Key))
        {
            throw new ArgumentException("Setting key is required");
        }

        if (string.IsNullOrWhiteSpace(command.Value))
        {
            throw new ArgumentException("Setting value is required");
        }

        if (string.IsNullOrWhiteSpace(command.Category))
        {
            throw new ArgumentException("Setting category is required");
        }

        // Vérification de l'unicité de la clé
        var allSettings = await _adminUow.AppSettings.GetAllAsync();
        var existing = allSettings.FirstOrDefault(s => s.Key == command.Key && !s.IsDeleted);
        
        if (existing != null)
        {
            throw new InvalidOperationException($"Setting with key '{command.Key}' already exists");
        }

        var setting = new AppSetting
        {
            Key = command.Key.Trim(),
            Value = command.Value.Trim(),
            Category = command.Category.Trim(),
            Description = command.Description?.Trim() ?? string.Empty,
            DataType = command.DataType?.Trim() ?? "string",
            IsPublic = command.IsPublic
        };

        await _adminUow.AppSettings.AddAsync(setting);
        await _adminUow.SaveChangesAsync();

        return setting;
    }

    public async Task<AppSetting> UpdateSettingAsync(string key, UpdateSettingCommand command)
    {
        var allSettings = await _adminUow.AppSettings.GetAllAsync();
        var setting = allSettings.FirstOrDefault(s => s.Key == key && !s.IsDeleted);

        if (setting == null)
        {
            throw new KeyNotFoundException($"Setting with key '{key}' not found");
        }

        // Mise à jour conditionnelle des valeurs
        if (!string.IsNullOrWhiteSpace(command.Value))
        {
            setting.Value = command.Value.Trim();
        }

        if (!string.IsNullOrWhiteSpace(command.Category))
        {
            setting.Category = command.Category.Trim();
        }

        if (command.Description != null)
        {
            setting.Description = command.Description.Trim();
        }

        if (!string.IsNullOrWhiteSpace(command.DataType))
        {
            setting.DataType = command.DataType.Trim();
        }

        if (command.IsPublic.HasValue)
        {
            setting.IsPublic = command.IsPublic.Value;
        }

        setting.UpdatedAt = DateTime.UtcNow;

        await _adminUow.AppSettings.UpdateAsync(setting);
        await _adminUow.SaveChangesAsync();

        return setting;
    }

    public async Task<bool> DeleteSettingAsync(string key)
    {
        var allSettings = await _adminUow.AppSettings.GetAllAsync();
        var setting = allSettings.FirstOrDefault(s => s.Key == key && !s.IsDeleted);

        if (setting == null)
        {
            return false;
        }

        // Suppression logique (Soft delete)
        setting.IsDeleted = true;
        setting.UpdatedAt = DateTime.UtcNow;

        await _adminUow.AppSettings.UpdateAsync(setting);
        await _adminUow.SaveChangesAsync();

        return true;
    }

    public async Task<AppSetting?> GetSettingByKeyAsync(string key)
    {
        var allSettings = await _adminUow.AppSettings.GetAllAsync();
        return allSettings.FirstOrDefault(s => s.Key == key && !s.IsDeleted);
    }

    public async Task<IEnumerable<AppSetting>> GetAllSettingsAsync(SettingsFilter? filter = null)
    {
        var allSettings = await _adminUow.AppSettings.GetAllAsync();
        var query = allSettings.Where(s => !s.IsDeleted);

        if (filter != null)
        {
            if (!string.IsNullOrWhiteSpace(filter.Category))
            {
                query = query.Where(s => s.Category == filter.Category);
            }

            if (filter.IsPublic.HasValue)
            {
                query = query.Where(s => s.IsPublic == filter.IsPublic.Value);
            }
        }

        return query.OrderBy(s => s.Category).ThenBy(s => s.Key).ToList();
    }

    public async Task<IEnumerable<string>> GetCategoriesAsync()
    {
        var allSettings = await _adminUow.AppSettings.GetAllAsync();
        
        return allSettings
            .Where(s => !s.IsDeleted)
            .Select(s => s.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToList();
    }

    public async Task<int> ResetToDefaultsAsync()
    {
        // Suppression de tous les paramètres existants (suppression physique)
        var allSettings = await _adminUow.AppSettings.GetAllAsync();
        foreach (var setting in allSettings)
        {
            await _adminUow.AppSettings.DeleteAsync(setting.Id);
        }

        // Ajout des paramètres par défaut
        var defaultSettings = GetDefaultSettings();
        foreach (var setting in defaultSettings)
        {
            await _adminUow.AppSettings.AddAsync(setting);
        }

        await _adminUow.SaveChangesAsync();

        return defaultSettings.Count;
    }

    private List<AppSetting> GetDefaultSettings()
    {
        return new List<AppSetting>
        {
            new AppSetting
            {
                Key = "app.name",
                Value = "TimeScope",
                Category = "Application",
                Description = "Application name",
                DataType = "string",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "app.version",
                Value = "1.0.0",
                Category = "Application",
                Description = "Application version",
                DataType = "string",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "app.language",
                Value = "fr",
                Category = "Application",
                Description = "Default application language",
                DataType = "string",
                IsPublic = true
            },
            // Autorisations par défaut pour les employés
            new AppSetting
            {
                Key = "allowed.profile.allowProfilePicture",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure profile picture visibility",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.profile.allowShowEmail",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure email visibility",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.profile.allowShowPhone",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure phone visibility",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.notifications.allowEmailOnTaskAssign",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure task assignment notifications",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.notifications.allowEmailOnTaskUpdate",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure task update notifications",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.notifications.allowEmailOnMention",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure mention notifications",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.notifications.allowDesktopNotifications",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure desktop notifications",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.notifications.allowSummaryFrequency",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure summary frequency",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.appearance.allowTheme",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to change theme",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.appearance.allowColorScheme",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to change color scheme",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.appearance.allowCompactView",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to enable compact view",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.appearance.allowShowAvatars",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to configure avatar display",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.regional.allowLanguage",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to change language",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.regional.allowTimezone",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to change timezone",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.regional.allowDateFormat",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to change date format",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "allowed.regional.allowTimeFormat",
                Value = "true",
                Category = "allowed",
                Description = "Allow employees to change time format",
                DataType = "boolean",
                IsPublic = true
            },
            new AppSetting
            {
                Key = "time.workday_hours",
                Value = "8",
                Category = "Time Tracking",
                Description = "Standard workday hours",
                DataType = "number",
                IsPublic = false
            },
            new AppSetting
            {
                Key = "time.week_days",
                Value = "5",
                Category = "Time Tracking",
                Description = "Working days per week",
                DataType = "number",
                IsPublic = false
            },
            new AppSetting
            {
                Key = "security.session_timeout",
                Value = "30",
                Category = "Security",
                Description = "Session timeout in minutes",
                DataType = "number",
                IsPublic = false
            },
            new AppSetting
            {
                Key = "security.password_min_length",
                Value = "8",
                Category = "Security",
                Description = "Minimum password length",
                DataType = "number",
                IsPublic = false
            },
            new AppSetting
            {
                Key = "notifications.enabled",
                Value = "true",
                Category = "Notifications",
                Description = "Enable notifications",
                DataType = "boolean",
                IsPublic = false
            },
            new AppSetting
            {
                Key = "reports.retention_days",
                Value = "90",
                Category = "Reports",
                Description = "Number of days to keep report data",
                DataType = "number",
                IsPublic = false
            }
        };
    }
}
