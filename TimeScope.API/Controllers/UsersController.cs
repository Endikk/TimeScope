using Microsoft.AspNetCore.Mvc;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IAdminUnitOfWork _adminUow;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IAdminUnitOfWork adminUow, ILogger<UsersController> logger)
    {
        _adminUow = adminUow;
        _logger = logger;
    }

    /// <summary>
    /// Récupère tous les utilisateurs depuis la base Admin
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        try
        {
            var users = await _adminUow.Users.GetAllAsync();
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
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(Guid id)
    {
        try
        {
            var user = await _adminUow.Users.GetByIdAsync(id);

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
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserDto dto)
    {
        try
        {
            var user = new User
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PasswordHash = dto.Password, // TODO: Hash the password properly
                Role = dto.Role,
                IsActive = true
            };

            await _adminUow.Users.AddAsync(user);
            await _adminUow.SaveChangesAsync();

            _logger.LogInformation("User {UserId} created successfully in Admin database", user.Id);

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user in Admin database");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Met à jour un utilisateur existant dans la base Admin
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto dto)
    {
        try
        {
            var user = await _adminUow.Users.GetByIdAsync(id);

            if (user == null)
            {
                return NotFound($"User with ID {id} not found");
            }

            user.FirstName = dto.FirstName ?? user.FirstName;
            user.LastName = dto.LastName ?? user.LastName;
            user.Email = dto.Email ?? user.Email;
            user.IsActive = dto.IsActive ?? user.IsActive;

            await _adminUow.Users.UpdateAsync(user);
            await _adminUow.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated successfully in Admin database", id);

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId} in Admin database", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// Supprime (soft delete) un utilisateur de la base Admin
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        try
        {
            await _adminUow.Users.DeleteAsync(id);
            await _adminUow.SaveChangesAsync();

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
