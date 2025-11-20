namespace TimeScope.Core.Entities;

/// <summary>
/// Table de référence pour les départements
/// </summary>
public class Department : BaseEntity
{
    /// <summary>
    /// Nom du département
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Code court du département (ex: IT, HR, FIN)
    /// </summary>
    public string? Code { get; set; }

    /// <summary>
    /// Description du département
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Département actif
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Ordre d'affichage
    /// </summary>
    public int DisplayOrder { get; set; }

    // Relations
    public ICollection<User> Users { get; set; } = new List<User>();
}
