namespace ResumeMatcher.Api.Domain.Entities;

public class Resume
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ExtractedText { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
