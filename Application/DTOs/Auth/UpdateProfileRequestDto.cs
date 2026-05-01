namespace ResumeMatcher.Api.Application.DTOs.Auth;

public class UpdateProfileRequestDto
{
    public string? FullName { get; set; }
    public string? PhotoBase64 { get; set; }
}
