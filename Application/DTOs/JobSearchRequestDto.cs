namespace ResumeMatcher.Api.Application.DTOs;

public class JobSearchRequestDto
{
    public string? Query { get; set; }
    public string? Location { get; set; }
    public bool RemoteOnly { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
