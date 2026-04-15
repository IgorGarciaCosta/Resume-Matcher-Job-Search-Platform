using ResumeMatcher.Api.Application.DTOs;

namespace ResumeMatcher.Api.Application.Interfaces;

public interface IJobSearchProvider
{
    string ProviderName { get; }
    Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default);
}
