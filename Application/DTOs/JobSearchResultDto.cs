namespace ResumeMatcher.Api.Application.DTOs;

public class JobSearchResultDto
{
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public string? Salary { get; set; }
    public DateTime? PostedAt { get; set; }
    public string Source { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = [];
    public string? JobType { get; set; }
}
