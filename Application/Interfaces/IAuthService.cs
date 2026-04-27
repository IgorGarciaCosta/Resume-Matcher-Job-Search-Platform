using ResumeMatcher.Api.Application.DTOs.Auth;

namespace ResumeMatcher.Api.Application.Interfaces;

/// <summary>
/// Contract for authentication operations: registration, login, user retrieval, and JWT generation.
/// </summary>
public interface IAuthService
{
    /// <summary>Creates a new user with hashed password via ASP.NET Identity.</summary>
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);

    /// <summary>Validates credentials and returns user data (JWT is set by the controller).</summary>
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);

    /// <summary>Fetches the user profile from the database by their Identity ID.</summary>
    Task<UserDto?> GetCurrentUserAsync(string userId);

    /// <summary>Generates a signed JWT containing user claims (sub, email, fullName).</summary>
    string GenerateJwtToken(string userId, string email, string fullName);
}
