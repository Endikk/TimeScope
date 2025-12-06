namespace TimeScope.Core.Entities;

public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Avatar { get; set; }
    public string? Banner { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;

    // Informations professionnelles
    public string? PhoneNumber { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public DateTime? HireDate { get; set; }

    // Sécurité et gestion des mots de passe
    /// <summary>
    /// Date du dernier changement de mot de passe
    /// </summary>
    public DateTime? PasswordChangedAt { get; set; }

    /// <summary>
    /// Nombre de tentatives de connexion échouées
    /// </summary>
    public int FailedLoginAttempts { get; set; }

    /// <summary>
    /// Date de fin de verrouillage du compte
    /// </summary>
    public DateTime? LockoutEnd { get; set; }

    /// <summary>
    /// Date de la dernière connexion réussie
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// IP de la dernière connexion
    /// </summary>
    public string? LastLoginIp { get; set; }

    /// <summary>
    /// Indique si l'authentification à deux facteurs est activée
    /// </summary>
    public bool TwoFactorEnabled { get; set; }

    /// <summary>
    /// Secret pour l'authentification à deux facteurs (TOTP)
    /// </summary>
    public string? TwoFactorSecret { get; set; }

    // Préférences utilisateur (stockées en JSON)
    public string? Preferences { get; set; }

    // Relations avec les autres entités
    public ICollection<WorkTask> AssignedTasks { get; set; } = new List<WorkTask>();
    public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
}

public enum UserRole
{
    Admin,
    Manager,
    Employee
}
