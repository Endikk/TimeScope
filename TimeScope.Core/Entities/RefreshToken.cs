namespace TimeScope.Core.Entities;

/// <summary>
/// Token de rafraîchissement pour l'authentification JWT.
/// Stocké en base pour la persistance entre les redémarrages.
/// </summary>
public class RefreshToken : BaseEntity
{
    /// <summary>
    /// La valeur du token (chaîne aléatoire sécurisée).
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// ID de l'utilisateur propriétaire du token.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Date d'expiration du token.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Date de révocation (null si actif).
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// Adresse IP de création.
    /// </summary>
    public string? CreatedByIp { get; set; }

    /// <summary>
    /// Adresse IP de révocation.
    /// </summary>
    public string? RevokedByIp { get; set; }

    /// <summary>
    /// Token de remplacement (si rotation).
    /// </summary>
    public string? ReplacedByToken { get; set; }

    /// <summary>
    /// Raison de la révocation.
    /// </summary>
    public string? ReasonRevoked { get; set; }

    /// <summary>
    /// Hash du token pour stockage sécurisé (SHA256).
    /// Le token en clair n'est jamais stocké.
    /// </summary>
    public string? TokenHash { get; set; }

    /// <summary>
    /// Informations sur l'appareil/navigateur.
    /// </summary>
    public string? DeviceInfo { get; set; }

    /// <summary>
    /// User-Agent du navigateur.
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Nom de l'appareil (optionnel, défini par l'utilisateur).
    /// </summary>
    public string? DeviceName { get; set; }

    /// <summary>
    /// Géolocalisation approximative (pays/ville).
    /// </summary>
    public string? Location { get; set; }

    /// <summary>
    /// Vérifie si le token est actif (non expiré et non révoqué).
    /// </summary>
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;

    /// <summary>
    /// Vérifie si le token est expiré.
    /// </summary>
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    // Navigation property
    public User? User { get; set; }
}
