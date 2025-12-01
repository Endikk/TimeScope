using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly IAdminUnitOfWork _adminUow;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITimeUnitOfWork? _timeUow;
    private readonly IProjectsUnitOfWork? _projectsUow;

    public UserService(
        IAdminUnitOfWork adminUow,
        IPasswordHasher passwordHasher,
        ITimeUnitOfWork? timeUow = null,
        IProjectsUnitOfWork? projectsUow = null)
    {
        _adminUow = adminUow;
        _passwordHasher = passwordHasher;
        _timeUow = timeUow;
        _projectsUow = projectsUow;
    }

    public async Task<User> CreateUserAsync(CreateUserCommand command)
    {
        // Validation des règles métier
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

        // Vérification de l'unicité de l'email
        var existingUser = await _adminUow.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == command.Email.Trim().ToLowerInvariant());
        if (existingUser != null)
        {
            throw new ArgumentException("Un utilisateur avec cet email existe déjà");
        }

        // Hachage du mot de passe
        var passwordHash = _passwordHasher.HashPassword(command.Password);

        // Parsing du rôle utilisateur
        if (!Enum.TryParse<UserRole>(command.Role, true, out var userRole))
        {
            throw new ArgumentException($"Invalid role: {command.Role}");
        }

        // Parsing de la date d'embauche si fournie
        DateTime? hireDate = null;
        if (!string.IsNullOrWhiteSpace(command.HireDate))
        {
            if (DateTime.TryParse(command.HireDate, out var parsedDate))
            {
                // Conversion en UTC pour PostgreSQL
                hireDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Utc);
            }
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            FirstName = command.FirstName.Trim(),
            LastName = command.LastName.Trim(),
            Email = command.Email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHash,
            Role = userRole,
            IsActive = true,
            PhoneNumber = command.PhoneNumber,
            JobTitle = command.JobTitle,
            Department = command.Department,
            HireDate = hireDate
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

        // Validation des champs modifiables
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

        // Mise à jour des informations professionnelles
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
            // Conversion en UTC
            user.HireDate = DateTime.SpecifyKind(command.HireDate.Value, DateTimeKind.Utc);
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

        // Vérification du mot de passe actuel
        if (!_passwordHasher.VerifyPassword(command.CurrentPassword, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        // Validation du nouveau mot de passe
        ValidatePassword(command.NewPassword);

        // Hachage du nouveau mot de passe
        user.PasswordHash = _passwordHasher.HashPassword(command.NewPassword);

        await _adminUow.Users.UpdateAsync(user);
        await _adminUow.SaveChangesAsync();
    }

    public async Task<UserStatsDto?> GetUserStatsAsync(Guid userId)
    {
        // Vérification de l'existence de l'utilisateur
        var user = await _adminUow.Users.GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        int tasksCompleted = 0;
        int tasksInProgress = 0;
        double totalHours = 0;
        int projectsCount = 0;

        // Récupération des statistiques de tâches (si TimeDB disponible)
        if (_timeUow != null)
        {
            try
            {
                var allTasks = await _timeUow.Tasks.GetAllAsync();
                var userTasks = allTasks.Where(t => t.AssigneeId == userId).ToList();

                tasksCompleted = userTasks.Count(t => t.Status == Core.Entities.TaskStatus.Termine);
                tasksInProgress = userTasks.Count(t => t.Status == Core.Entities.TaskStatus.EnCours);

                // Calcul du temps total passé
                var allTimeEntries = await _timeUow.TimeEntries.GetAllAsync();
                var userTimeEntries = allTimeEntries.Where(te => te.UserId == userId);

                foreach (var entry in userTimeEntries)
                {
                    totalHours += entry.Duration.TotalHours;
                }
            }
            catch
            {
                // Si TimeDB indisponible, on utilise les valeurs par défaut
            }
        }

        // Récupération du nombre de projets (si ProjectsDB disponible)
        if (_projectsUow != null)
        {
            try
            {
                var allProjects = await _projectsUow.Projects.GetAllAsync();
                // Compte tous les projets (amélioration future : filtrer par membre)
                projectsCount = allProjects.Count();
            }
            catch
            {
                // Si ProjectsDB indisponible, valeur par défaut
            }
        }

        var stats = new UserStatsDto
        {
            TasksCompleted = tasksCompleted,
            TasksInProgress = tasksInProgress,
            TotalHours = Math.Round(totalHours, 2),
            ProjectsCount = projectsCount
        };

        return stats;
    }

    public async Task<User> UpdateAvatarAsync(Guid id, string base64Image)
    {
        var user = await _adminUow.Users.GetByIdAsync(id);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        user.Avatar = base64Image;

        await _adminUow.Users.UpdateAsync(user);
        await _adminUow.SaveChangesAsync();

        return user;
    }

    public async Task<User> UpdateBannerAsync(Guid id, string base64Image)
    {
        var user = await _adminUow.Users.GetByIdAsync(id);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        user.Banner = base64Image;

        await _adminUow.Users.UpdateAsync(user);
        await _adminUow.SaveChangesAsync();

        return user;
    }

    public async Task<User> DeleteAvatarAsync(Guid id)
    {
        var user = await _adminUow.Users.GetByIdAsync(id);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        user.Avatar = null;

        await _adminUow.Users.UpdateAsync(user);
        await _adminUow.SaveChangesAsync();

        return user;
    }

    public async Task<User> DeleteBannerAsync(Guid id)
    {
        var user = await _adminUow.Users.GetByIdAsync(id);

        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {id} not found");
        }

        user.Banner = null;

        await _adminUow.Users.UpdateAsync(user);
        await _adminUow.SaveChangesAsync();

        return user;
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
