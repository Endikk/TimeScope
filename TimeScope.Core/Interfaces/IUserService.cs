using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface IUserService
{
    Task<User> CreateUserAsync(CreateUserCommand command);
    Task<User> UpdateUserAsync(Guid id, UpdateUserCommand command);
    Task<bool> DeleteUserAsync(Guid id);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<IEnumerable<User>> GetAllUsersAsync();
}

public class CreateUserCommand
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}

public class UpdateUserCommand
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public bool? IsActive { get; set; }
}
