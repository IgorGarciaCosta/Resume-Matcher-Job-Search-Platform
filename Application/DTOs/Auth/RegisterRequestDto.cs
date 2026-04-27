using System.ComponentModel.DataAnnotations;

namespace ResumeMatcher.Api.Application.DTOs.Auth;

/// <summary>
/// Payload for POST /api/auth/register. Validated via DataAnnotations.
/// </summary>
public class RegisterRequestDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required, MinLength(2)]
    public string FullName { get; set; } = string.Empty;
}
