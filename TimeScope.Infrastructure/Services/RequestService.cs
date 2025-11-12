using TimeScope.Core.Entities;
using TimeScope.Core.Interfaces;

namespace TimeScope.Infrastructure.Services;

public class RequestService : IRequestService
{
    private readonly IAdminUnitOfWork _adminUow;

    public RequestService(IAdminUnitOfWork adminUow)
    {
        _adminUow = adminUow;
    }

    public async Task<UserRequest> CreateRequestAsync(CreateUserRequestCommand command)
    {
        // Validation des champs obligatoires
        if (string.IsNullOrWhiteSpace(command.Name))
            throw new ArgumentException("Name is required");

        if (string.IsNullOrWhiteSpace(command.Email))
            throw new ArgumentException("Email is required");

        if (string.IsNullOrWhiteSpace(command.RequestType))
            throw new ArgumentException("Request type is required");

        if (string.IsNullOrWhiteSpace(command.Title))
            throw new ArgumentException("Title is required");

        if (string.IsNullOrWhiteSpace(command.Description))
            throw new ArgumentException("Description is required");

        if (string.IsNullOrWhiteSpace(command.Justification))
            throw new ArgumentException("Justification is required");

        if (string.IsNullOrWhiteSpace(command.Priority))
            throw new ArgumentException("Priority is required");

        // Validation du format email
        if (!IsValidEmail(command.Email))
            throw new ArgumentException("Invalid email format");

        // Validation du type de demande
        var validRequestTypes = new[] { "project", "activity", "template", "other" };
        if (!validRequestTypes.Contains(command.RequestType.ToLower()))
            throw new ArgumentException($"Invalid request type. Must be one of: {string.Join(", ", validRequestTypes)}");

        // Validation de la priorité
        var validPriorities = new[] { "low", "medium", "high" };
        if (!validPriorities.Contains(command.Priority.ToLower()))
            throw new ArgumentException($"Invalid priority. Must be one of: {string.Join(", ", validPriorities)}");

        var request = new UserRequest
        {
            Name = command.Name.Trim(),
            Email = command.Email.Trim().ToLower(),
            RequestType = command.RequestType.ToLower(),
            Title = command.Title.Trim(),
            Description = command.Description.Trim(),
            Justification = command.Justification.Trim(),
            Priority = command.Priority.ToLower(),
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        await _adminUow.UserRequests.AddAsync(request);
        await _adminUow.SaveChangesAsync();

        return request;
    }

    public async Task<UserRequest?> GetRequestByIdAsync(Guid id)
    {
        return await _adminUow.UserRequests.GetByIdAsync(id);
    }

    public async Task<IEnumerable<UserRequest>> GetAllRequestsAsync()
    {
        return await _adminUow.UserRequests.GetAllAsync();
    }

    public async Task<IEnumerable<UserRequest>> GetRequestsByStatusAsync(string status)
    {
        if (string.IsNullOrWhiteSpace(status))
            throw new ArgumentException("Status is required");

        return await _adminUow.UserRequests.FindAsync(r => r.Status == status.ToLower());
    }

    public async Task<IEnumerable<UserRequest>> GetRequestsByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required");

        return await _adminUow.UserRequests.FindAsync(r => r.Email == email.ToLower());
    }

    public async Task<UserRequest> UpdateRequestStatusAsync(Guid id, UpdateRequestStatusCommand command)
    {
        var request = await _adminUow.UserRequests.GetByIdAsync(id);
        if (request == null)
            throw new KeyNotFoundException($"Request with ID {id} not found");

        // Validation du statut
        var validStatuses = new[] { "pending", "approved", "rejected", "completed" };
        if (!validStatuses.Contains(command.Status.ToLower()))
            throw new ArgumentException($"Invalid status. Must be one of: {string.Join(", ", validStatuses)}");

        request.Status = command.Status.ToLower();
        request.AdminResponse = command.AdminResponse;
        request.ReviewedBy = command.ReviewedBy;
        request.ReviewedAt = DateTime.UtcNow;
        request.UpdatedAt = DateTime.UtcNow;

        await _adminUow.UserRequests.UpdateAsync(request);
        await _adminUow.SaveChangesAsync();

        return request;
    }

    public async Task DeleteRequestAsync(Guid id)
    {
        var request = await _adminUow.UserRequests.GetByIdAsync(id);
        if (request == null)
            throw new KeyNotFoundException($"Request with ID {id} not found");

        await _adminUow.UserRequests.DeleteAsync(id);
        await _adminUow.SaveChangesAsync();
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
}
