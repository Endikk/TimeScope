using System.Net;
using Microsoft.AspNetCore.Http;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Middleware;

public class MaintenanceMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<MaintenanceMiddleware> _logger;

    public MaintenanceMiddleware(RequestDelegate next, ILogger<MaintenanceMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, ISettingsService settingsService)
    {
        // Skip for Admin users (if authenticated)
        // Note: Authentication middleware runs before this only if configured in Program.cs
        // If this runs before Auth, we can't check roles easily unless we parse token manually
        // But usually maintenance mode should block everyone except maybe whitelisted IPs or special headers
        // For simplicity, we'll check if the user is authenticated and is Admin
        
        // However, middleware order in Program.cs matters. 
        // If Maintenance is before Auth, User is not set.
        // It's safer to check maintenance setting first, then decide.
        
        try 
        {
            var maintenanceSetting = await settingsService.GetSettingByKeyAsync("admin.system.maintenanceMode");
            bool isMaintenanceMode = maintenanceSetting != null && maintenanceSetting.Value.ToLower() == "true";

            if (isMaintenanceMode)
            {
                // Allow login and admin endpoints so admins can disable it
                var path = context.Request.Path.Value?.ToLower() ?? "";
                if (path.StartsWith("/api/auth/login") || 
                    path.StartsWith("/api/settings") || 
                    path.StartsWith("/api/auth/me") || // AuthController me endpoint
                    path.StartsWith("/api/users/me")) // Just in case UsersController has one
                {
                    await _next(context);
                    return;
                }

                // If user is authenticated and is Admin, allow access
                // This requires UseAuthentication/UseAuthorization to run BEFORE this middleware
                if (context.User.Identity?.IsAuthenticated == true && context.User.IsInRole("Admin"))
                {
                    await _next(context);
                    return;
                }

                _logger.LogWarning("Maintenance mode is active. Request blocked: {Path}", path);
                context.Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
                await context.Response.WriteAsJsonAsync(new { message = "Le système est en maintenance. Veuillez réessayer plus tard." });
                return;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking maintenance mode");
            // Fail open or closed? Closed is safer for maintenance.
            // But if DB is down, we might want to let it pass or show error.
        }

        await _next(context);
    }
}
