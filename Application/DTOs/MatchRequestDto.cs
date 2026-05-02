namespace ResumeMatcher.Api.Application.DTOs;

/// <summary>
/// Application-layer DTO — transport-agnostic (no IFormFile dependency).
/// </summary>
public class MatchRequestDto
{
    public Stream? ResumeStream { get; set; }
    public string? ResumeFileName { get; set; }
    public string? JobUrl { get; set; }
    public string? JobText { get; set; }
}
