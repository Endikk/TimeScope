namespace TimeScope.Core.Entities;

/// <summary>
/// Représente un paramètre de l'application
/// </summary>
public class AppSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DataType { get; set; } = "string"; // string, number, boolean, json
    public bool IsPublic { get; set; } = false; // Si true, accessible sans authentification
}
