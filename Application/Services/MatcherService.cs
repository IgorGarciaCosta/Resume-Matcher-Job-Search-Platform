using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Application.Services;

public class MatcherService : IMatcherService
{
    private readonly IPdfExtractorService _pdfExtractor;
    private readonly IJobScraperService _jobScraper;
    private readonly IAiAnalyzerService _aiAnalyzer;

    public MatcherService(
        IPdfExtractorService pdfExtractor,
        IJobScraperService jobScraper,
        IAiAnalyzerService aiAnalyzer)
    {
        _pdfExtractor = pdfExtractor;
        _jobScraper = jobScraper;
        _aiAnalyzer = aiAnalyzer;
    }

    public async Task<MatchResultDto> AnalyzeAsync(MatchRequestDto request)
    {
        // 1. Extrair texto do PDF
        if (request.ResumeStream is null || request.ResumeStream.Length == 0)
            throw new ArgumentException("Um arquivo PDF de currículo é obrigatório.");

        var resumeText = await _pdfExtractor.ExtractTextAsync(request.ResumeStream);

        if (string.IsNullOrWhiteSpace(resumeText))
            throw new InvalidOperationException("Não foi possível extrair texto do PDF. Verifique se o arquivo é um PDF válido.");

        // 2. Obter texto da vaga (prioridade: texto direto > scraping da URL)
        var jobText = request.JobText;

        if (string.IsNullOrWhiteSpace(jobText))
        {
            if (string.IsNullOrWhiteSpace(request.JobUrl))
                throw new ArgumentException("É necessário informar a URL da vaga ou colar o texto da descrição.");

            jobText = await _jobScraper.GetJobTextFromUrlAsync(request.JobUrl);
        }

        if (string.IsNullOrWhiteSpace(jobText))
            throw new InvalidOperationException("Não foi possível obter o texto da vaga.");

        // 3. Analisar match com IA
        var result = await _aiAnalyzer.AnalyzeMatchAsync(resumeText, jobText);

        return result;
    }
}
