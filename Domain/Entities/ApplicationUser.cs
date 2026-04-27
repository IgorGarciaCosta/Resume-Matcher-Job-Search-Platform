using Microsoft.AspNetCore.Identity;

namespace ResumeMatcher.Api.Domain.Entities;

/// <summary>
/// Extended Identity user with profile data. Inherits all default fields (Id, Email, PasswordHash, etc.) from IdentityUser.
/// </summary>
public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
