using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ResumeMatcher.Api.Application.DTOs.Auth;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Domain.Entities;

namespace ResumeMatcher.Api.Controllers;

/// <summary>
/// Authentication API. Handles email/password registration and login,
/// session management via HttpOnly JWT cookies, and current-user retrieval.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthController(
        IAuthService authService,
        UserManager<ApplicationUser> userManager)
    {
        _authService = authService;
        _userManager = userManager;
    }

    /// <summary>Registers a new user, generates a JWT, and sets it as an HttpOnly cookie.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Success)
            return BadRequest(result);

        var token = _authService.GenerateJwtToken(result.User!.Id, result.User.Email, result.User.FullName);
        SetTokenCookie(token);

        return Ok(result);
    }

    /// <summary>Validates credentials, generates a JWT, and sets it as an HttpOnly cookie.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.Success)
            return BadRequest(result);

        var token = _authService.GenerateJwtToken(result.User!.Id, result.User.Email, result.User.FullName);
        SetTokenCookie(token);

        return Ok(result);
    }

    /// <summary>Clears the access_token cookie, effectively ending the session.</summary>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token", new CookieOptions
        {
            Path = "/",
            SameSite = SameSiteMode.Lax
        });
        return Ok(new { message = "Logged out successfully." });
    }

    /// <summary>Returns the current authenticated user's profile from the JWT claims.</summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");
        if (userId is null)
            return Unauthorized();

        var user = await _authService.GetCurrentUserAsync(userId);
        if (user is null)
            return Unauthorized();

        return Ok(user);
    }

    /// <summary>Appends a signed JWT as an HttpOnly, SameSite=Lax cookie with 24h expiration.</summary>
    private void SetTokenCookie(string token)
    {
        Response.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // Set to true in production with HTTPS
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddHours(24),
            Path = "/"
        });
    }
}
