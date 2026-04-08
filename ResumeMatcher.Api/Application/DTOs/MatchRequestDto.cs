namespace ResumeMatcher.Api.Application.DTOs;

public class MatchRequestDto
{
    public IFormFile? ResumeFile { get; set; }
    public string? JobUrl { get; set; }
    public string? JobText { get; set; }
}
