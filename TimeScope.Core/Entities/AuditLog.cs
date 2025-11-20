namespace TimeScope.Core.Entities;

/// <summary>
/// Représente un log d'audit pour tracer les actions des utilisateurs
/// </summary>
public class AuditLog : BaseEntity
{
    public string Action { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Nouveaux champs pour un meilleur audit
    /// <summary>
    /// Valeur avant modification (JSON sérialisé)
    /// </summary>
    public string? OldValue { get; set; }

    /// <summary>
    /// Valeur après modification (JSON sérialisé)
    /// </summary>
    public string? NewValue { get; set; }

    /// <summary>
    /// ID de session pour regrouper les actions d'une même session
    /// </summary>
    public string? SessionId { get; set; }

    /// <summary>
    /// ID de requête pour la corrélation avec les logs applicatifs
    /// </summary>
    public string? RequestId { get; set; }

    /// <summary>
    /// User-Agent du navigateur/client
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Durée de l'opération en millisecondes
    /// </summary>
    public int? DurationMs { get; set; }

    /// <summary>
    /// Indique si l'opération a réussi
    /// </summary>
    public bool Success { get; set; } = true;

    /// <summary>
    /// Message d'erreur en cas d'échec
    /// </summary>
    public string? ErrorMessage { get; set; }
}
