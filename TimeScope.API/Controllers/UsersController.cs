using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Tous les endpoints nécessitent une authentification
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ISettingsService _settingsService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ISettingsService settingsService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _settingsService = settingsService;
        _logger = logger;
    }

    /// <summary>
    /// Liste tous les utilisateurs (Admin/Manager uniquement)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users from Admin database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Récupère un utilisateur spécifique
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(Guid id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);

            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId} from Admin database", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Crée un nouvel utilisateur (Admin uniquement)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var command = new CreateUserCommand
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Password = dto.Password,
                Role = dto.Role,
                PhoneNumber = dto.PhoneNumber,
                JobTitle = dto.JobTitle,
                Department = dto.Department,
                HireDate = dto.HireDate
            };

            var user = await _userService.CreateUserAsync(command);

            _logger.LogInformation("User {UserId} created successfully in Admin database", user.Id);

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating user");
            return BadRequest(new { message = ex.Message });
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex) when (ex.InnerException?.Message?.Contains("IX_Users_Email") == true)
        {
            _logger.LogWarning(ex, "Email already exists in database");
            return Conflict(new { message = "Un utilisateur avec cet email existe déjà" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user in Admin database");
            return StatusCode(500, new { message = "Internal server error", details = ex.Message, innerException = ex.InnerException?.Message });
        }
    }

    /// <summary>
    /// Met à jour un utilisateur (Admin/Manager uniquement)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            DateTime? hireDate = null;
            if (!string.IsNullOrEmpty(dto.HireDate))
            {
                if (DateTime.TryParse(dto.HireDate, out var parsedDate))
                {
                    hireDate = parsedDate;
                }
            }

            var command = new UpdateUserCommand
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                IsActive = dto.IsActive,
                PhoneNumber = dto.PhoneNumber,
                JobTitle = dto.JobTitle,
                Department = dto.Department,
                HireDate = hireDate
            };

            await _userService.UpdateUserAsync(id, command);

            _logger.LogInformation("User {UserId} updated successfully in Admin database", id);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "User {UserId} not found", id);
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while updating user {UserId}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId} in Admin database", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime un utilisateur (Admin uniquement)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        try
        {
            var deleted = await _userService.DeleteUserAsync(id);

            if (!deleted)
            {
                return NotFound($"User with ID {id} not found");
            }

            _logger.LogInformation("User {UserId} deleted successfully from Admin database", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId} from Admin database", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Change le mot de passe de l'utilisateur
    /// </summary>
    [HttpPost("{id}/change-password")]
    public async Task<ActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordDto dto)
    {
        // Vérification de sécurité : on ne peut changer que son propre mot de passe
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (currentUserId == null || (id.ToString() != currentUserId && !User.IsInRole("Admin")))
        {
            return Forbid();
        }

        try
        {
            var command = new ChangePasswordCommand
            {
                UserId = id,
                CurrentPassword = dto.CurrentPassword,
                NewPassword = dto.NewPassword
            };

            await _userService.ChangePasswordAsync(command);

            _logger.LogInformation("Password changed successfully for user {UserId}", id);

            return Ok(new { message = "Password changed successfully" });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized password change attempt for user {UserId}", id);
            return Unauthorized(new { message = "Current password is incorrect" });
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "User {UserId} not found", id);
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while changing password for user {UserId}", id);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Statistiques d'activité de l'utilisateur
    /// </summary>
    [HttpGet("{id}/stats")]
    public async Task<ActionResult<UserStatsDto>> GetUserStats(Guid id)
    {
        try
        {
            var stats = await _userService.GetUserStatsAsync(id);

            if (stats == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stats for user {UserId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour l'avatar
    /// </summary>
    [HttpPost("{id}/avatar")]
    public async Task<ActionResult<User>> UploadAvatar(Guid id, IFormFile avatar)
    {
        // Vérification : modification de son propre profil uniquement (sauf Admin)
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (currentUserId == null || (id.ToString() != currentUserId && !isAdmin))
        {
            return Forbid();
        }

        // Vérification du paramètre global (si pas admin)
        if (!isAdmin)
        {
            var allowProfilePicture = await _settingsService.GetSettingByKeyAsync("profile.allowProfilePicture");
            if (allowProfilePicture != null && allowProfilePicture.Value.ToLower() == "false")
            {
                return StatusCode(403, new { message = "La modification de la photo de profil est désactivée par l'administrateur." });
            }
        }

        try
        {
            if (avatar == null || avatar.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(avatar.ContentType.ToLower()))
            {
                return BadRequest(new { message = "Invalid file type. Allowed: JPEG, PNG, GIF, WebP" });
            }

            // Validate file size (max 5MB)
            if (avatar.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size exceeds 5MB limit" });
            }

            // Convert to base64
            using var memoryStream = new MemoryStream();
            await avatar.CopyToAsync(memoryStream);
            var bytes = memoryStream.ToArray();
            var base64String = $"data:{avatar.ContentType};base64,{Convert.ToBase64String(bytes)}";

            var user = await _userService.UpdateAvatarAsync(id, base64String);

            _logger.LogInformation("Avatar updated successfully for user {UserId}", id);

            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "User {UserId} not found", id);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading avatar for user {UserId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour la bannière
    /// </summary>
    [HttpPost("{id}/banner")]
    public async Task<ActionResult<User>> UploadBanner(Guid id, IFormFile banner)
    {
        // Vérification : modification de son propre profil uniquement (sauf Admin)
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (currentUserId == null || (id.ToString() != currentUserId && !isAdmin))
        {
            return Forbid();
        }

        // Vérification du paramètre global (si pas admin)
        if (!isAdmin)
        {
            var allowBanner = await _settingsService.GetSettingByKeyAsync("profile.allowBanner");
            if (allowBanner != null && allowBanner.Value.ToLower() == "false")
            {
                return StatusCode(403, new { message = "La modification de la bannière est désactivée par l'administrateur." });
            }
        }

        try
        {
            if (banner == null || banner.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(banner.ContentType.ToLower()))
            {
                return BadRequest(new { message = "Invalid file type. Allowed: JPEG, PNG, GIF, WebP" });
            }

            // Validate file size (max 10MB for banners)
            if (banner.Length > 10 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size exceeds 10MB limit" });
            }

            // Convert to base64
            using var memoryStream = new MemoryStream();
            await banner.CopyToAsync(memoryStream);
            var bytes = memoryStream.ToArray();
            var base64String = $"data:{banner.ContentType};base64,{Convert.ToBase64String(bytes)}";

            var user = await _userService.UpdateBannerAsync(id, base64String);

            _logger.LogInformation("Banner updated successfully for user {UserId}", id);

            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "User {UserId} not found", id);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading banner for user {UserId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime l'avatar
    /// </summary>
    [HttpDelete("{id}/avatar")]
    public async Task<ActionResult<User>> DeleteAvatar(Guid id)
    {
        // Vérification : modification de son propre profil uniquement (sauf Admin)
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (currentUserId == null || (id.ToString() != currentUserId && !isAdmin))
        {
            return Forbid();
        }

        // Vérification du paramètre global (si pas admin)
        if (!isAdmin)
        {
            var allowProfilePicture = await _settingsService.GetSettingByKeyAsync("profile.allowProfilePicture");
            if (allowProfilePicture != null && allowProfilePicture.Value.ToLower() == "false")
            {
                return StatusCode(403, new { message = "La suppression de la photo de profil est désactivée par l'administrateur." });
            }
        }

        try
        {
            var user = await _userService.DeleteAvatarAsync(id);

            _logger.LogInformation("Avatar deleted successfully for user {UserId}", id);

            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "User {UserId} not found", id);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting avatar for user {UserId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime la bannière
    /// </summary>
    [HttpDelete("{id}/banner")]
    public async Task<ActionResult<User>> DeleteBanner(Guid id)
    {
        // Vérification : modification de son propre profil uniquement (sauf Admin)
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (currentUserId == null || (id.ToString() != currentUserId && !isAdmin))
        {
            return Forbid();
        }

        // Vérification du paramètre global (si pas admin)
        if (!isAdmin)
        {
            var allowBanner = await _settingsService.GetSettingByKeyAsync("profile.allowBanner");
            if (allowBanner != null && allowBanner.Value.ToLower() == "false")
            {
                return StatusCode(403, new { message = "La suppression de la bannière est désactivée par l'administrateur." });
            }
        }

        try
        {
            var user = await _userService.DeleteBannerAsync(id);

            _logger.LogInformation("Banner deleted successfully for user {UserId}", id);

            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "User {UserId} not found", id);
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting banner for user {UserId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour les préférences utilisateur
    /// </summary>
    [HttpPut("{id}/preferences")]
    public async Task<ActionResult<User>> UpdatePreferences(Guid id, [FromBody] UpdatePreferencesDto dto)
    {
        // Vérification : modification de ses propres préférences uniquement (sauf Admin)
        var currentUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        if (currentUserId == null || (id.ToString() != currentUserId && !isAdmin))
        {
            return Forbid();
        }

        try
        {
            // Sérialisation du JSON si reçu comme objet ou utilisation directe si string
            // Ici on suppose qu'on reçoit un objet structuré qu'on convertit en string pour le stockage
            var jsonPreferences = System.Text.Json.JsonSerializer.Serialize(dto.Preferences);
            
            var user = await _userService.UpdatePreferencesAsync(id, jsonPreferences);

            return Ok(user);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating preferences for user {UserId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class UpdatePreferencesDto
{
    public object Preferences { get; set; } = new object();
}

// DTOs
public record CreateUserDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string Role,
    string? PhoneNumber = null,
    string? JobTitle = null,
    string? Department = null,
    string? HireDate = null
);

public record UpdateUserDto(
    string? FirstName,
    string? LastName,
    string? Email,
    bool? IsActive,
    string? PhoneNumber,
    string? JobTitle,
    string? Department,
    string? HireDate
);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword
);

public record UserStatsDto(
    int TasksCompleted,
    int TasksInProgress,
    double TotalHours,
    int ProjectsCount
);
