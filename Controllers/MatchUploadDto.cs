namespace ResumeMatcher.Api.Controllers;

/// <summary>
/// HTTP-specific DTO for receiving multipart form file uploads.
/// Only used at the controller level — the Application layer uses <see cref="Application.DTOs.MatchRequestDto"/>.
/// </summary>
public class MatchUploadDto
{
    public IFormFile? ResumeFile { get; set; }
    public string? JobUrl { get; set; }
    public string? JobText { get; set; }
}
