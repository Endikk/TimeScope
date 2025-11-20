namespace TimeScope.Core.Entities;

/// <summary>
/// Table de référence pour les postes/titres
/// </summary>
public class JobTitle : BaseEntity
{
    /// <summary>
    /// Titre du poste
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Code court du poste
    /// </summary>
    public string? Code { get; set; }

    /// <summary>
    /// Description du poste
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Niveau hiérarchique (1 = junior, 5 = senior/directeur)
    /// </summary>
    public int Level { get; set; } = 1;

    /// <summary>
    /// Poste actif
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Ordre d'affichage
    /// </summary>
    public int DisplayOrder { get; set; }

    // Relations
    public ICollection<User> Users { get; set; } = new List<User>();
}
