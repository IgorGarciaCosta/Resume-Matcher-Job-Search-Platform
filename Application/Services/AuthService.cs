using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ResumeMatcher.Api.Application.DTOs.Auth;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Domain.Entities;

namespace ResumeMatcher.Api.Application.Services;

/// <summary>
/// Handles user registration, login validation, and JWT token generation.
/// Delegates password hashing and user persistence to ASP.NET Identity's UserManager.
/// </summary>
public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    /// <summary>Creates a new user. Returns failure if email is already taken or password doesn't meet policy.</summary>
    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            return new AuthResponseDto { Success = false, Message = "Email already registered." };

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            return new AuthResponseDto { Success = false, Message = errors };
        }

        return new AuthResponseDto
        {
            Success = true,
            Message = "Registration successful.",
            User = new UserDto { Id = user.Id, Email = user.Email!, FullName = user.FullName }
        };
    }

    /// <summary>Validates email + password. Returns generic error message to prevent user enumeration.</summary>
    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return new AuthResponseDto { Success = false, Message = "Invalid email or password." };

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
            return new AuthResponseDto { Success = false, Message = "Invalid email or password." };

        return new AuthResponseDto
        {
            Success = true,
            Message = "Login successful.",
            User = new UserDto { Id = user.Id, Email = user.Email!, FullName = user.FullName }
        };
    }

    /// <summary>Looks up a user by ID and maps to a safe DTO.</summary>
    public async Task<UserDto?> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return null;

        return new UserDto { Id = user.Id, Email = user.Email!, FullName = user.FullName };
    }

    /// <summary>Builds a signed JWT with sub/email/fullName claims. Expiration is read from appsettings (default 24h).</summary>
    public string GenerateJwtToken(string userId, string email, string fullName)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim("fullName", fullName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "1440");

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
