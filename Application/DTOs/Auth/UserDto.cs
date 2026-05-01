namespace ResumeMatcher.Api.Application.DTOs.Auth;

/// <summary>
/// Public-facing user representation returned by auth endpoints. Never exposes sensitive fields.
/// </summary>
public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? PhotoBase64 { get; set; }
}
