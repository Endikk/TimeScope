using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

/// <summary>
/// Service permettant de récupérer les informations de l'utilisateur authentifié depuis le contexte HTTP.
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return userIdClaim != null && Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }

    public string? Email =>
        _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;

    public UserRole? Role
    {
        get
        {
            var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
            return roleClaim != null && Enum.TryParse<UserRole>(roleClaim, out var role) ? role : null;
        }
    }

    public bool IsAdmin => Role == UserRole.Admin;

    public bool IsManagerOrAdmin => Role == UserRole.Manager || Role == UserRole.Admin;

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}
