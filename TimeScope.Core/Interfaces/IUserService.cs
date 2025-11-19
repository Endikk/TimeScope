using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

public interface IUserService
{
    Task<User> CreateUserAsync(CreateUserCommand command);
    Task<User> UpdateUserAsync(Guid id, UpdateUserCommand command);
    Task<bool> DeleteUserAsync(Guid id);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task ChangePasswordAsync(ChangePasswordCommand command);
    Task<UserStatsDto?> GetUserStatsAsync(Guid userId);
    Task<User> UpdateAvatarAsync(Guid id, string base64Image);
    Task<User> UpdateBannerAsync(Guid id, string base64Image);
    Task<User> DeleteAvatarAsync(Guid id);
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
