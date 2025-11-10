using TimeScope.Core.Entities;

namespace TimeScope.Core.Interfaces;

/// <summary>
/// Service to retrieve information about the currently authenticated user.
/// Used for data isolation and authorization.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the ID of the currently authenticated user.
    /// </summary>
    Guid? UserId { get; }

    /// <summary>
    /// Gets the email of the currently authenticated user.
    /// </summary>
    string? Email { get; }

    /// <summary>
    /// Gets the role of the currently authenticated user.
    /// </summary>
    UserRole? Role { get; }

    /// <summary>
    /// Checks if the current user is an admin.
    /// </summary>
    bool IsAdmin { get; }

    /// <summary>
    /// Checks if the current user is a manager or admin.
    /// </summary>
    bool IsManagerOrAdmin { get; }

    /// <summary>
    /// Checks if the current user is authenticated.
    /// </summary>
    bool IsAuthenticated { get; }
}
