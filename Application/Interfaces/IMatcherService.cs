using ResumeMatcher.Api.Application.DTOs;

namespace ResumeMatcher.Api.Application.Interfaces;

public interface IMatcherService
{
    Task<MatchResultDto> AnalyzeAsync(MatchRequestDto request);
}
