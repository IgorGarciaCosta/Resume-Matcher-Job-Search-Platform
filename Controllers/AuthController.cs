using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ResumeMatcher.Api.Application.DTOs.Auth;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Domain.Entities;

namespace ResumeMatcher.Api.Controllers;

/// <summary>
/// Authentication API. Handles email/password registration and login, OAuth flows (Google, LinkedIn),
/// session management via HttpOnly JWT cookies, and current-user retrieval.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AuthController(
        IAuthService authService,
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        _authService = authService;
        _userManager = userManager;
        _signInManager = signInManager;
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

    /// <summary>Initiates an OAuth challenge, redirecting the user to the external provider (Google/LinkedIn).</summary>
    [HttpGet("external/{provider}")]
    public IActionResult ExternalLogin(string provider)
    {
        var redirectUrl = Url.Action(nameof(ExternalLoginCallback));
        var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
        return Challenge(properties, provider);
    }

    /// <summary>
    /// Handles the OAuth callback. Creates or links the user account, sets the JWT cookie,
    /// and redirects to the frontend callback page.
    /// </summary>
    [HttpGet("external/callback")]
    public async Task<IActionResult> ExternalLoginCallback()
    {
        var info = await _signInManager.GetExternalLoginInfoAsync();
        if (info is null)
            return Redirect("http://localhost:5173/login?error=external_login_failed");

        // Try to sign in with the external login
        var signInResult = await _signInManager.ExternalLoginSignInAsync(
            info.LoginProvider, info.ProviderKey, isPersistent: false);

        ApplicationUser? user;

        if (signInResult.Succeeded)
        {
            user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
        }
        else
        {
            // Create new user from external provider
            var email = info.Principal.FindFirstValue(ClaimTypes.Email);
            var name = info.Principal.FindFirstValue(ClaimTypes.Name) ?? "User";

            if (email is null)
                return Redirect("http://localhost:5173/login?error=no_email");

            user = await _userManager.FindByEmailAsync(email);
            if (user is null)
            {
                user = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    FullName = name,
                    EmailConfirmed = true
                };
                var createResult = await _userManager.CreateAsync(user);
                if (!createResult.Succeeded)
                    return Redirect("http://localhost:5173/login?error=creation_failed");
            }

            await _userManager.AddLoginAsync(user, info);
        }

        if (user is null)
            return Redirect("http://localhost:5173/login?error=user_not_found");

        var token = _authService.GenerateJwtToken(user.Id, user.Email!, user.FullName);
        SetTokenCookie(token);

        return Redirect("http://localhost:5173/auth/callback");
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
