using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface ISettingsService
{
    Task<AppSetting> CreateSettingAsync(CreateSettingCommand command);
    Task<AppSetting> UpdateSettingAsync(string key, UpdateSettingCommand command);
    Task<bool> DeleteSettingAsync(string key);
    Task<AppSetting?> GetSettingByKeyAsync(string key);
    Task<IEnumerable<AppSetting>> GetAllSettingsAsync(SettingsFilter? filter = null);
    Task<IEnumerable<string>> GetCategoriesAsync();
    Task<int> ResetToDefaultsAsync();
}

public class CreateSettingCommand
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? DataType { get; set; }
    public bool IsPublic { get; set; }
}

public class UpdateSettingCommand
{
    public string? Value { get; set; }
    public string? Category { get; set; }
    public string? Description { get; set; }
    public string? DataType { get; set; }
    public bool? IsPublic { get; set; }
}

public class SettingsFilter
{
    public string? Category { get; set; }
    public bool? IsPublic { get; set; }
}
