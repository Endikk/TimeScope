using System;

namespace TimeScope.Core.Entities
{
    public class Notification : BaseEntity
    {
        public Guid UserId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public string Type { get; set; } = "General"; // Info, Warning, Success, Error
        public string? Link { get; set; } // Optional link to redirect user
        
        // Navigation property if needed, but keeping it simple with UserId string for now as it seems to be the pattern or we can link to User.
        // Looking at other entities might be useful, but string UserId is safe for Identityuser usually.
        // Let's check User.cs to be sure.
        public virtual User? User { get; set; }
    }
}
