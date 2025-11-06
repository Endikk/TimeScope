using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IAdminUnitOfWork _adminUow;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;
    private readonly Dictionary<string, (User User, DateTime ExpiresAt)> _refreshTokens = new();

    public AuthService(
        IAdminUnitOfWork adminUow,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _adminUow = adminUow;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
    {
        try
        {
            // Récupérer tous les utilisateurs et filtrer par email
            var users = await _adminUow.Users.GetAllAsync();
            var user = users.FirstOrDefault(u => u.Email.ToLower() == loginDto.Email.ToLower());

            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Login failed for email: {Email}", loginDto.Email);
                return null;
            }

            // Vérifier le mot de passe
            if (!VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                _logger.LogWarning("Invalid password for email: {Email}", loginDto.Email);
                return null;
            }

            // Générer les tokens
            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            // Stocker le refresh token (en production, utiliser une base de données)
            _refreshTokens[refreshToken] = (user, DateTime.UtcNow.AddDays(7));

            _logger.LogInformation("User {Email} logged in successfully", user.Email);

            return new LoginResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                User = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    Role = user.Role.ToString(),
                    IsActive = user.IsActive
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
            return null;
        }
    }

    public Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken)
    {
        if (!_refreshTokens.TryGetValue(refreshToken, out var tokenData))
        {
            return Task.FromResult<LoginResponseDto?>(null);
        }

        if (tokenData.ExpiresAt < DateTime.UtcNow)
        {
            _refreshTokens.Remove(refreshToken);
            return Task.FromResult<LoginResponseDto?>(null);
        }

        // Générer un nouveau token JWT
        var newToken = GenerateJwtToken(tokenData.User);
        var newRefreshToken = GenerateRefreshToken();

        // Remplacer l'ancien refresh token
        _refreshTokens.Remove(refreshToken);
        _refreshTokens[newRefreshToken] = (tokenData.User, DateTime.UtcNow.AddDays(7));

        return Task.FromResult<LoginResponseDto?>(new LoginResponseDto
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
            User = new UserDto
            {
                Id = tokenData.User.Id,
                FirstName = tokenData.User.FirstName,
                LastName = tokenData.User.LastName,
                Email = tokenData.User.Email,
                Avatar = tokenData.User.Avatar,
                Role = tokenData.User.Role.ToString(),
                IsActive = tokenData.User.IsActive
            }
        });
    }

    public string GenerateJwtToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }
        catch
        {
            return false;
        }
    }
}
