using ResumeMatcher.Api.Application.DTOs;

namespace ResumeMatcher.Api.Application.Interfaces;

public interface IAiAnalyzerService
{
    Task<MatchResultDto> AnalyzeMatchAsync(string resumeText, string jobText);

    /// <summary>
    /// Extrai a descrição da vaga a partir do texto bruto de uma página web.
    /// </summary>
    Task<string> ExtractJobDescriptionAsync(string rawPageText);
}
