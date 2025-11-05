using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;
    private readonly ILogger<SettingsController> _logger;

    public SettingsController(ISettingsService settingsService, ILogger<SettingsController> logger)
    {
        _settingsService = settingsService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AppSetting>>> GetAllSettings(
        [FromQuery] string? category = null,
        [FromQuery] bool? isPublic = null)
    {
        try
        {
            var filter = new SettingsFilter
            {
                Category = category,
                IsPublic = isPublic
            };

            var settings = await _settingsService.GetAllSettingsAsync(filter);
            return Ok(settings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving settings");
            return StatusCode(500, new { message = "An error occurred while retrieving settings" });
        }
    }

    [HttpGet("{key}")]
    public async Task<ActionResult<AppSetting>> GetSettingByKey(string key)
    {
        try
        {
            var setting = await _settingsService.GetSettingByKeyAsync(key);

            if (setting == null)
                return NotFound(new { message = $"Setting with key '{key}' not found" });

            return Ok(setting);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving setting {Key}", key);
            return StatusCode(500, new { message = "An error occurred while retrieving setting" });
        }
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        try
        {
            var categories = await _settingsService.GetCategoriesAsync();
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories");
            return StatusCode(500, new { message = "An error occurred while retrieving categories" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<AppSetting>> CreateSetting([FromBody] CreateSettingDto dto)
    {
        try
        {
            var command = new CreateSettingCommand
            {
                Key = dto.Key,
                Value = dto.Value,
                Category = dto.Category,
                Description = dto.Description ?? string.Empty,
                DataType = dto.DataType ?? "string",
                IsPublic = dto.IsPublic
            };

            var setting = await _settingsService.CreateSettingAsync(command);

            _logger.LogInformation("Setting {Key} created successfully", setting.Key);

            return CreatedAtAction(nameof(GetSettingByKey), new { key = setting.Key }, setting);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Setting with key {Key} already exists", dto.Key);
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating setting");
            return StatusCode(500, new { message = "An error occurred while creating setting" });
        }
    }

    [HttpPut("{key}")]
    public async Task<ActionResult> UpdateSetting(string key, [FromBody] UpdateSettingDto dto)
    {
        try
        {
            var command = new UpdateSettingCommand
            {
                Value = dto.Value,
                Category = dto.Category,
                Description = dto.Description,
                DataType = dto.DataType,
                IsPublic = dto.IsPublic
            };

            await _settingsService.UpdateSettingAsync(key, command);

            _logger.LogInformation("Setting {Key} updated successfully", key);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Setting {Key} not found", key);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating setting {Key}", key);
            return StatusCode(500, new { message = "An error occurred while updating setting" });
        }
    }

    [HttpDelete("{key}")]
    public async Task<ActionResult> DeleteSetting(string key)
    {
        try
        {
            var deleted = await _settingsService.DeleteSettingAsync(key);

            if (!deleted)
            {
                return NotFound(new { message = $"Setting with key '{key}' not found" });
            }

            _logger.LogInformation("Setting {Key} deleted successfully", key);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting setting {Key}", key);
            return StatusCode(500, new { message = "An error occurred while deleting setting" });
        }
    }

    [HttpPost("reset-defaults")]
    public async Task<ActionResult> ResetToDefaults()
    {
        try
        {
            var count = await _settingsService.ResetToDefaultsAsync();

            _logger.LogInformation("Settings reset to defaults");
            return Ok(new { message = "Settings reset to defaults successfully", count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting settings to defaults");
            return StatusCode(500, new { message = "An error occurred while resetting settings" });
        }
    }
}

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
