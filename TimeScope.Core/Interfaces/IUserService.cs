using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface IUserService
{
    /// <summary>
    /// Crée un nouvel utilisateur
    /// </summary>
    Task<User> CreateUserAsync(CreateUserCommand command);

    /// <summary>
    /// Met à jour les informations d'un utilisateur
    /// </summary>
    Task<User> UpdateUserAsync(Guid id, UpdateUserCommand command);

    /// <summary>
    /// Supprime un utilisateur (soft delete)
    /// </summary>
    Task<bool> DeleteUserAsync(Guid id);

    /// <summary>
    /// Récupère un utilisateur par son ID
    /// </summary>
    Task<User?> GetUserByIdAsync(Guid id);

    /// <summary>
    /// Liste tous les utilisateurs
    /// </summary>
    Task<IEnumerable<User>> GetAllUsersAsync();

    /// <summary>
    /// Change le mot de passe d'un utilisateur
    /// </summary>
    Task ChangePasswordAsync(ChangePasswordCommand command);

    /// <summary>
    /// Calcule les statistiques d'activité d'un utilisateur
    /// </summary>
    Task<UserStatsDto?> GetUserStatsAsync(Guid userId);

    /// <summary>
    /// Met à jour l'avatar (image de profil)
    /// </summary>
    Task<User> UpdateAvatarAsync(Guid id, string base64Image);

    /// <summary>
    /// Met à jour la bannière de profil
    /// </summary>
    Task<User> UpdateBannerAsync(Guid id, string base64Image);

    /// <summary>
    /// Supprime l'avatar
    /// </summary>
    Task<User> DeleteAvatarAsync(Guid id);

    /// <summary>
    /// Supprime la bannière
    /// </summary>
    Task<User> DeleteBannerAsync(Guid id);
}

public class CreateUserCommand
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public string? HireDate { get; set; }
}

public class UpdateUserCommand
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public bool? IsActive { get; set; }
    public string? PhoneNumber { get; set; }
    public string? JobTitle { get; set; }
    public string? Department { get; set; }
    public DateTime? HireDate { get; set; }
}

public class ChangePasswordCommand
{
    public Guid UserId { get; set; }
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class UserStatsDto
{
    public int TasksCompleted { get; set; }
    public int TasksInProgress { get; set; }
    public double TotalHours { get; set; }
    public int ProjectsCount { get; set; }
}
