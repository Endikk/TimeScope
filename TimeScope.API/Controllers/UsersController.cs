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
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère tous les utilisateurs depuis la base Admin
    /// Accessible par Admin et Manager
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
    /// Récupère un utilisateur par son ID depuis la base Admin
    /// Accessible par tous les utilisateurs authentifiés
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
    /// Crée un nouvel utilisateur dans la base Admin
    /// Accessible uniquement par Admin
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
                Role = dto.Role.ToString()
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
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user in Admin database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour un utilisateur existant dans la base Admin
    /// Accessible par Admin et Manager
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var command = new UpdateUserCommand
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                IsActive = dto.IsActive
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
    /// Supprime (soft delete) un utilisateur de la base Admin
    /// Accessible uniquement par Admin
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
}

// DTOs
public record CreateUserDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    UserRole Role
);

public record UpdateUserDto(
    string? FirstName,
    string? LastName,
    string? Email,
    bool? IsActive
);
