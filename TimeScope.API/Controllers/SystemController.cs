using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Core.Interfaces;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SystemController : ControllerBase
{
    private readonly ISettingsService _settingsService;
    private readonly ILogger<SystemController> _logger;

    public SystemController(ISettingsService settingsService, ILogger<SystemController> logger)
    {
        _settingsService = settingsService;
        _logger = logger;
    }

    /// <summary>
    /// Récupère l'état du système (Maintenance, etc.)
    /// Accessible publiquement
    /// </summary>
    [HttpGet("status")]
    [AllowAnonymous]
    public async Task<ActionResult<SystemStatusDto>> GetSystemStatus()
    {
        try
        {
            var maintenanceSetting = await _settingsService.GetSettingByKeyAsync("admin.system.maintenanceMode");
            var isMaintenanceMode = maintenanceSetting?.Value?.ToLower() == "true";

            return Ok(new SystemStatusDto
            {
                MaintenanceMode = isMaintenanceMode,
                Message = isMaintenanceMode ? "Le système est en maintenance." : "Système opérationnel."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving system status");
            // En cas d'erreur, on renvoie un statut par défaut (pas de maintenance) pour ne pas bloquer
            return Ok(new SystemStatusDto
            {
                MaintenanceMode = false,
                Message = "Erreur lors de la vérification du statut."
            });
        }
    }
}

public class SystemStatusDto
{
    public bool MaintenanceMode { get; set; }
    public string Message { get; set; } = string.Empty;
}
