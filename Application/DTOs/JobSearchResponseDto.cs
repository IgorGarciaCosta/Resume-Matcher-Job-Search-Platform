namespace ResumeMatcher.Api.Application.DTOs;

public class JobSearchResponseDto
{
    public List<JobSearchResultDto> Jobs { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public List<string> Sources { get; set; } = [];
    public List<string> Errors { get; set; } = [];
}
