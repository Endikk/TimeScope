using TimeScope.Core.Entities;

namespace TimeScope.Infrastructure.Services;

public interface IRequestService
{
    Task<UserRequest> CreateRequestAsync(CreateUserRequestCommand command);
    Task<UserRequest?> GetRequestByIdAsync(Guid id);
    Task<IEnumerable<UserRequest>> GetAllRequestsAsync();
    Task<IEnumerable<UserRequest>> GetRequestsByStatusAsync(string status);
    Task<IEnumerable<UserRequest>> GetRequestsByEmailAsync(string email);
    Task<UserRequest> UpdateRequestStatusAsync(Guid id, UpdateRequestStatusCommand command);
    Task DeleteRequestAsync(Guid id);
}

public class CreateUserRequestCommand
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RequestType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
}

public class UpdateRequestStatusCommand
{
    public string Status { get; set; } = string.Empty;
    public string? AdminResponse { get; set; }
    public Guid? ReviewedBy { get; set; }
}
