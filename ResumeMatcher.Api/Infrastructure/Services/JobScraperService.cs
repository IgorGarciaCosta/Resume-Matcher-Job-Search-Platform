using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

/// <summary>
/// Implementação placeholder do scraper de vagas.
/// LinkedIn bloqueia scraping, então por enquanto retorna erro orientando o usuário a colar o texto.
/// Será implementado de verdade na fase de Job Search.
/// </summary>
public class JobScraperService : IJobScraperService
{
    public Task<string> GetJobTextFromUrlAsync(string url)
    {
        // TODO: Implementar scraping real com HtmlAgilityPack ou PuppeteerSharp
        // Por enquanto, retornamos uma mensagem orientando o usuário a usar o campo de texto
        throw new NotImplementedException(
            "Scraping de URLs ainda não está implementado. " +
            "Por favor, copie e cole o texto da vaga diretamente no campo 'jobText'.");
    }
}
