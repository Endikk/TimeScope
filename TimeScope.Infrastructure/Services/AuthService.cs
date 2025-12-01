using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
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
    private readonly IPasswordHasher _passwordHasher;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthService(
        IAdminUnitOfWork adminUow,
        IConfiguration configuration,
        ILogger<AuthService> logger,
        IPasswordHasher passwordHasher,
        IHttpContextAccessor httpContextAccessor)
    {
        _adminUow = adminUow;
        _configuration = configuration;
        _logger = logger;
        _passwordHasher = passwordHasher;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto loginDto)
    {
        try
        {
            // Récupération de l'utilisateur par email (optimisé)
            var user = await _adminUow.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Login failed for email: {Email}", loginDto.Email);
                return null;
            }

            // Vérification du mot de passe (BCrypt)
            if (!_passwordHasher.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                _logger.LogWarning("Invalid password for email: {Email}", loginDto.Email);
                return null;
            }

            // Générer les tokens
            var token = GenerateJwtToken(user);
            var refreshTokenValue = GenerateRefreshToken();

            // Création et stockage du refresh token
            var refreshToken = new RefreshToken
            {
                Token = refreshTokenValue,
                UserId = user.Id,
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                CreatedByIp = GetIpAddress()
            };

            await _adminUow.RefreshTokens.AddAsync(refreshToken);
            await _adminUow.SaveChangesAsync();

            _logger.LogInformation("User {Email} logged in successfully", user.Email);

            return new LoginResponseDto
            {
                Token = token,
                RefreshToken = refreshTokenValue,
                User = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Avatar = user.Avatar,
                    Role = user.Role.ToString(),
                    IsActive = user.IsActive,
                    PhoneNumber = user.PhoneNumber,
                    JobTitle = user.JobTitle,
                    Department = user.Department,
                    HireDate = user.HireDate
                }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login for email: {Email}", loginDto.Email);
            return null;
        }
    }

    public async Task<LoginResponseDto?> RefreshTokenAsync(string refreshTokenValue)
    {
        // Recherche du refresh token en base
        var refreshTokens = await _adminUow.RefreshTokens.FindAsync(rt => rt.Token == refreshTokenValue);
        var refreshToken = refreshTokens.FirstOrDefault();

        if (refreshToken == null || !refreshToken.IsActive)
        {
            _logger.LogWarning("Invalid or expired refresh token");
            return null;
        }

        // Récupération de l'utilisateur associé
        var user = await _adminUow.Users.GetByIdAsync(refreshToken.UserId);
        if (user == null || !user.IsActive)
        {
            _logger.LogWarning("User not found or inactive for refresh token");
            return null;
        }

        // Révocation de l'ancien token
        refreshToken.RevokedAt = DateTime.UtcNow;
        refreshToken.RevokedByIp = GetIpAddress();
        refreshToken.ReasonRevoked = "Replaced by new token";

        // Génération des nouveaux tokens
        var newJwtToken = GenerateJwtToken(user);
        var newRefreshTokenValue = GenerateRefreshToken();

        var newRefreshToken = new RefreshToken
        {
            Token = newRefreshTokenValue,
            UserId = user.Id,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedByIp = GetIpAddress()
        };

        refreshToken.ReplacedByToken = newRefreshTokenValue;

        await _adminUow.RefreshTokens.AddAsync(newRefreshToken);
        await _adminUow.RefreshTokens.UpdateAsync(refreshToken);
        await _adminUow.SaveChangesAsync();

        _logger.LogInformation("Refresh token renewed for user {Email}", user.Email);

        return new LoginResponseDto
        {
            Token = newJwtToken,
            RefreshToken = newRefreshTokenValue,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Avatar = user.Avatar,
                Role = user.Role.ToString(),
                IsActive = user.IsActive,
                PhoneNumber = user.PhoneNumber,
                JobTitle = user.JobTitle,
                Department = user.Department,
                HireDate = user.HireDate
            }
        };
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

    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    private string? GetIpAddress()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return null;

        // Try to get IP from X-Forwarded-For header (if behind a proxy)
        var forwardedFor = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').FirstOrDefault()?.Trim();
        }

        // Otherwise get the remote IP address
        return httpContext.Connection.RemoteIpAddress?.ToString();
    }

}
