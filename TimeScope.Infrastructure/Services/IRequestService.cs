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

public record CreateUserRequestCommand(
    string Name,
    string Email,
    string RequestType,
    string Title,
    string Description,
    string Justification,
    string Priority
);

public record UpdateRequestStatusCommand(
    string Status,
    string? AdminResponse,
    Guid? ReviewedBy
);
