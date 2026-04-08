namespace ResumeMatcher.Api.Domain.Entities;

public class JobDescription
{
    public Guid Id { get; set; }
    public string SourceUrl { get; set; } = string.Empty;
    public string RawText { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
