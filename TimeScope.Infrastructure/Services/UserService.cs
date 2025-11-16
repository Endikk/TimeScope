using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IAdminUnitOfWork _adminUow;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IAdminUnitOfWork adminUow, IPasswordHasher passwordHasher)
    {
        _adminUow = adminUow;
        _passwordHasher = passwordHasher;
    }

    public async Task<User> CreateUserAsync(CreateUserCommand command)
    {
        // Règles métier : validation
        ValidateEmail(command.Email);
        ValidatePassword(command.Password);

        if (string.IsNullOrWhiteSpace(command.FirstName))
        {
            throw new ArgumentException("First name is required");
        }

        if (string.IsNullOrWhiteSpace(command.LastName))
        {
            throw new ArgumentException("Last name is required");
        }

        // Logique métier : hash du password avec BCrypt
        var passwordHash = _passwordHasher.HashPassword(command.Password);

        // Parse UserRole from string
        if (!Enum.TryParse<UserRole>(command.Role, true, out var userRole))
        {
            throw new ArgumentException($"Invalid role: {command.Role}");
        }

        var user = new User
        {
            FirstName = command.FirstName.Trim(),
            LastName = command.LastName.Trim(),
            Email = command.Email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHash,
            Role = userRole,
            IsActive = true
        };

        await _adminUow.Users.AddAsync(user);
        await _adminUow.SaveChangesAsync();

        return user;
    }

    public async Task<User> UpdateUserAsync(Guid id, UpdateUserCommand command)
    {
        var user = await _adminUow.Users.GetByIdAsync(id);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        // Règles métier : validation
        if (!string.IsNullOrWhiteSpace(command.Email))
        {
            ValidateEmail(command.Email);
            user.Email = command.Email.Trim().ToLowerInvariant();
        }

        if (!string.IsNullOrWhiteSpace(command.FirstName))
        {
            user.FirstName = command.FirstName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(command.LastName))
        {
            user.LastName = command.LastName.Trim();
        }

        if (command.IsActive.HasValue)
        {
            user.IsActive = command.IsActive.Value;
        }

        // Update professional information
        if (command.PhoneNumber != null)
        {
            user.PhoneNumber = string.IsNullOrWhiteSpace(command.PhoneNumber) ? null : command.PhoneNumber.Trim();
        }

        if (command.JobTitle != null)
        {
            user.JobTitle = string.IsNullOrWhiteSpace(command.JobTitle) ? null : command.JobTitle.Trim();
        }

        if (command.Department != null)
        {
            user.Department = string.IsNullOrWhiteSpace(command.Department) ? null : command.Department.Trim();
        }

        if (command.HireDate.HasValue)
        {
            user.HireDate = command.HireDate.Value;
        }

        await _adminUow.Users.UpdateAsync(user);
        await _adminUow.SaveChangesAsync();

        return user;
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _adminUow.Users.GetByIdAsync(id);
        
        if (user == null)
        {
            return false;
        }

        await _adminUow.Users.DeleteAsync(id);
        await _adminUow.SaveChangesAsync();

        return true;
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _adminUow.Users.GetByIdAsync(id);
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await _adminUow.Users.GetAllAsync();
    }

    public async Task ChangePasswordAsync(ChangePasswordCommand command)
    {
        var user = await _adminUow.Users.GetByIdAsync(command.UserId);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {command.UserId} not found");
        }

        // Verify current password
        if (!_passwordHasher.VerifyPassword(command.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        // Validate new password
        ValidatePassword(command.NewPassword);

        // Hash new password
        user.PasswordHash = _passwordHasher.HashPassword(command.NewPassword);

        await _adminUow.Users.UpdateAsync(user);
        await _adminUow.SaveChangesAsync();
    }

    #region Private Helper Methods - Logique métier

    private static void ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ArgumentException("Email is required");
        }

        // Validation basique d'email
        var emailParts = email.Split('@');
        if (emailParts.Length != 2 || string.IsNullOrWhiteSpace(emailParts[0]) || string.IsNullOrWhiteSpace(emailParts[1]))
        {
            throw new ArgumentException("Invalid email format");
        }
    }

    private static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ArgumentException("Password is required");
        }

        if (password.Length < 6)
        {
            throw new ArgumentException("Password must be at least 6 characters long");
        }
    }


    #endregion
}
