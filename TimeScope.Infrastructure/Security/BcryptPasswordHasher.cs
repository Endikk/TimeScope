using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Security;

/// <summary>
/// Password hasher implementation using BCrypt algorithm.
/// BCrypt is specifically designed for password hashing and includes:
/// - Built-in salting
/// - Adaptive cost factor (can be increased over time)
/// - Resistance to rainbow table attacks
/// </summary>
public class BcryptPasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12; // Cost factor (higher = more secure but slower)

    /// <summary>
    /// Hashes a password using BCrypt with automatic salt generation.
    /// </summary>
    /// <param name="password">Plain text password</param>
    /// <returns>BCrypt hashed password (includes salt)</returns>
    public string HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be null or empty", nameof(password));

        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    /// <summary>
    /// Verifies a password against a BCrypt hash.
    /// </summary>
    /// <param name="password">Plain text password to verify</param>
    /// <param name="hashedPassword">BCrypt hash to verify against</param>
    /// <returns>True if password matches, false otherwise</returns>
    public bool VerifyPassword(string password, string hashedPassword)
    {
        if (string.IsNullOrWhiteSpace(password))
            return false;

        if (string.IsNullOrWhiteSpace(hashedPassword))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
        catch
        {
            // Invalid hash format or other BCrypt errors
            return false;
        }
    }
}
