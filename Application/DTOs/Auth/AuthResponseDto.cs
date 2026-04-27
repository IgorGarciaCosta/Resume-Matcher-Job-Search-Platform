namespace ResumeMatcher.Api.Application.DTOs.Auth;

/// <summary>
/// Standardized response for register/login operations. Includes success flag, message, and optional user data.
/// </summary>
public class AuthResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public UserDto? User { get; set; }
}
