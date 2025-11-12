using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TimeScope.Core.Entities;
using TimeScope.Infrastructure.Services;

namespace TimeScope.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequestsController : ControllerBase
{
    private readonly IRequestService _requestService;
    private readonly ILogger<RequestsController> _logger;

    public RequestsController(
        IRequestService requestService,
        ILogger<RequestsController> logger)
    {
        _requestService = requestService;
        _logger = logger;
    }

    /// <summary>
    /// Crée une nouvelle demande utilisateur (pas d'authentification requise pour la page contact)
    /// </summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<UserRequest>> CreateRequest([FromBody] CreateUserRequestCommand command)
    {
        try
        {
            var request = await _requestService.CreateRequestAsync(command);

            _logger.LogInformation("User request {RequestId} created successfully by {Email}", request.Id, request.Email);

            return CreatedAtAction(nameof(GetRequestById), new { id = request.Id }, request);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request data");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user request");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Récupère toutes les demandes (Admin seulement)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<UserRequest>>> GetAllRequests()
    {
        try
        {
            var requests = await _requestService.GetAllRequestsAsync();
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all requests");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Récupère une demande par ID (Admin ou propriétaire)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<UserRequest>> GetRequestById(Guid id)
    {
        try
        {
            var request = await _requestService.GetRequestByIdAsync(id);
            if (request == null)
            {
                return NotFound(new { error = $"Request with ID {id} not found" });
            }

            return Ok(request);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving request {RequestId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Récupère les demandes par statut (Admin seulement)
    /// </summary>
    [HttpGet("status/{status}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<UserRequest>>> GetRequestsByStatus(string status)
    {
        try
        {
            var requests = await _requestService.GetRequestsByStatusAsync(status);
            return Ok(requests);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid status parameter");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving requests by status {Status}", status);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Récupère les demandes par email (Admin ou propriétaire)
    /// </summary>
    [HttpGet("email/{email}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<UserRequest>>> GetRequestsByEmail(string email)
    {
        try
        {
            var requests = await _requestService.GetRequestsByEmailAsync(email);
            return Ok(requests);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid email parameter");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving requests by email {Email}", email);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Met à jour le statut d'une demande (Admin seulement)
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<UserRequest>> UpdateRequestStatus(Guid id, [FromBody] UpdateRequestStatusCommand command)
    {
        try
        {
            var request = await _requestService.UpdateRequestStatusAsync(id, command);

            _logger.LogInformation("Request {RequestId} status updated to {Status} by {ReviewedBy}",
                id, command.Status, command.ReviewedBy);

            return Ok(request);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Request not found");
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid update data");
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating request {RequestId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Supprime une demande (Admin seulement - soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult> DeleteRequest(Guid id)
    {
        try
        {
            await _requestService.DeleteRequestAsync(id);
            _logger.LogInformation("Request {RequestId} deleted successfully", id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Request not found");
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting request {RequestId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}

