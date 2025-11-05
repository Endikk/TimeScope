using TimeScope.API.DTOs;
using TimeScope.Core.Entities;

namespace TimeScope.API.Services;

public interface IAuthService
{
    Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
    Task<LoginResponseDto?> RefreshTokenAsync(string refreshToken);
    string GenerateJwtToken(User user);
    string GenerateRefreshToken();
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}
