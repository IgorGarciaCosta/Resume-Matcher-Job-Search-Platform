using ResumeMatcher.Api.Application.DTOs;

namespace ResumeMatcher.Api.Application.Interfaces;

public interface IJobSearchService
{
    Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default);
}
