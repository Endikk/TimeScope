namespace TimeScope.Core.Entities;

/// <summary>
/// Represents a refresh token for JWT authentication.
/// Stored in database for persistence across app restarts.
/// </summary>
public class RefreshToken : BaseEntity
{
    /// <summary>
    /// The actual refresh token value (cryptographically secure random string).
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// User ID this token belongs to.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// When this token expires.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// When this token was actually used (null if never used).
    /// </summary>
    public DateTime? RevokedAt { get; set; }

    /// <summary>
    /// IP address where the token was created.
    /// </summary>
    public string? CreatedByIp { get; set; }

    /// <summary>
    /// IP address where the token was revoked.
    /// </summary>
    public string? RevokedByIp { get; set; }

    /// <summary>
    /// Token that replaced this one (if refreshed).
    /// </summary>
    public string? ReplacedByToken { get; set; }

    /// <summary>
    /// Reason for revocation (if revoked).
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
    /// Check if token is currently active (not expired and not revoked).
    /// </summary>
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;

    /// <summary>
    /// Check if token is expired.
    /// </summary>
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    // Navigation property
    public User? User { get; set; }
}
