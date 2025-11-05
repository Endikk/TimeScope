using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TimeScope.Core.Entities;
using TimeScope.Infrastructure.Data;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly AdminDbContext _adminContext;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(AdminDbContext adminContext, ILogger<SettingsController> logger)
    {
        _adminContext = adminContext;
        _logger = logger;
    }

    /// <summary>
    /// Récupère tous les paramètres
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppSetting>>> GetAllSettings(
        [FromQuery] string? category = null,
        [FromQuery] bool? isPublic = null)
    {
        try
        {
            var query = _adminContext.AppSettings.Where(s => !s.IsDeleted);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(s => s.Category == category);

            if (isPublic.HasValue)
                query = query.Where(s => s.IsPublic == isPublic.Value);

            var settings = await query.OrderBy(s => s.Category).ThenBy(s => s.Key).ToListAsync();

            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving settings");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère un paramètre par sa clé
    /// </summary>
    [HttpGet("{key}")]
    public async Task<ActionResult<AppSetting>> GetSettingByKey(string key)
    {
        try
        {
            var setting = await _adminContext.AppSettings
                .FirstOrDefaultAsync(s => s.Key == key && !s.IsDeleted);

            if (setting == null)
                return NotFound($"Setting with key '{key}' not found");

            return Ok(setting);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving setting {Key}", key);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère toutes les catégories de paramètres
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        try
        {
            var categories = await _adminContext.AppSettings
                .Where(s => !s.IsDeleted)
                .Select(s => s.Category)
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Crée un nouveau paramètre
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AppSetting>> CreateSetting([FromBody] CreateSettingDto dto)
    {
        try
        {
            // Vérifier si la clé existe déjà
            var existingSetting = await _adminContext.AppSettings
                .FirstOrDefaultAsync(s => s.Key == dto.Key);

            if (existingSetting != null)
                return Conflict($"Setting with key '{dto.Key}' already exists");

            var setting = new AppSetting
            {
                Key = dto.Key,
                Value = dto.Value,
                Category = dto.Category,
                Description = dto.Description ?? string.Empty,
                DataType = dto.DataType ?? "string",
                IsPublic = dto.IsPublic
            };

            await _adminContext.AppSettings.AddAsync(setting);
            await _adminContext.SaveChangesAsync();

            _logger.LogInformation("Setting {Key} created successfully", setting.Key);

            return CreatedAtAction(nameof(GetSettingByKey), new { key = setting.Key }, setting);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating setting");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour un paramètre existant
    /// </summary>
    [HttpPut("{key}")]
    public async Task<ActionResult> UpdateSetting(string key, [FromBody] UpdateSettingDto dto)
    {
        try
        {
            var setting = await _adminContext.AppSettings
                .FirstOrDefaultAsync(s => s.Key == key && !s.IsDeleted);

            if (setting == null)
                return NotFound($"Setting with key '{key}' not found");

            setting.Value = dto.Value ?? setting.Value;
            setting.Category = dto.Category ?? setting.Category;
            setting.Description = dto.Description ?? setting.Description;
            setting.DataType = dto.DataType ?? setting.DataType;

            if (dto.IsPublic.HasValue)
                setting.IsPublic = dto.IsPublic.Value;

            setting.UpdatedAt = DateTime.UtcNow;

            await _adminContext.SaveChangesAsync();

            _logger.LogInformation("Setting {Key} updated successfully", key);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating setting {Key}", key);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime un paramètre (soft delete)
    /// </summary>
    [HttpDelete("{key}")]
    public async Task<ActionResult> DeleteSetting(string key)
    {
        try
        {
            var setting = await _adminContext.AppSettings
                .FirstOrDefaultAsync(s => s.Key == key && !s.IsDeleted);

            if (setting == null)
                return NotFound($"Setting with key '{key}' not found");

            setting.IsDeleted = true;
            setting.UpdatedAt = DateTime.UtcNow;

            await _adminContext.SaveChangesAsync();

            _logger.LogInformation("Setting {Key} deleted successfully", key);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting setting {Key}", key);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Réinitialise tous les paramètres aux valeurs par défaut
    /// </summary>
    [HttpPost("reset-defaults")]
    public async Task<ActionResult> ResetToDefaults()
    {
        try
        {
            // Supprimer tous les paramètres existants
            var allSettings = await _adminContext.AppSettings.ToListAsync();
            _adminContext.AppSettings.RemoveRange(allSettings);

            // Ajouter les paramètres par défaut
            var defaultSettings = GetDefaultSettings();
            await _adminContext.AppSettings.AddRangeAsync(defaultSettings);

            await _adminContext.SaveChangesAsync();

            _logger.LogInformation("Settings reset to defaults");
            return Ok(new { message = "Settings reset to defaults successfully", count = defaultSettings.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting settings to defaults");
            return StatusCode(500, "Internal server error");
        }
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

// DTOs
public class CreateSettingDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DataType { get; set; }
    public bool IsPublic { get; set; } = false;
}

public class UpdateSettingDto
{
    public string? Value { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? DataType { get; set; }
    public bool? IsPublic { get; set; }
}
