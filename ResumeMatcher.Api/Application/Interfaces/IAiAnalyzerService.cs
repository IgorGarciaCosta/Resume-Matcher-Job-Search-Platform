using ResumeMatcher.Api.Application.DTOs;

namespace ResumeMatcher.Api.Application.Interfaces;

public interface IAiAnalyzerService
{
    Task<MatchResultDto> AnalyzeMatchAsync(string resumeText, string jobText);
}
