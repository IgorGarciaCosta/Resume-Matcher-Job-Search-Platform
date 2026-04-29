using System.Text.Json;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

/// <summary>
/// Mock da análise de IA que retorna dados simulados.
/// Substitua pela integração real com a OpenAI quando tiver a API key configurada.
/// </summary>
public class MockAiAnalyzerService : IAiAnalyzerService
{
    private static readonly Lazy<HashSet<string>> TechTerms = new(() =>
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Infrastructure", "Data", "tech-terms.json");
        if (!File.Exists(path))
            return new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var json = File.ReadAllText(path);
        var terms = JsonSerializer.Deserialize<List<string>>(json) ?? [];
        return new HashSet<string>(terms, StringComparer.OrdinalIgnoreCase);
    });
    public Task<MatchResultDto> AnalyzeMatchAsync(string resumeText, string jobText)
    {
        // Extrai palavras do texto da vaga (simplificado)
        var jobKeywords = ExtractKeywords(jobText);
        var resumeKeywords = ExtractKeywords(resumeText);

        var matching = jobKeywords.Intersect(resumeKeywords, StringComparer.OrdinalIgnoreCase).ToList();
        var missing = jobKeywords.Except(resumeKeywords, StringComparer.OrdinalIgnoreCase).ToList();

        // Score simples: porcentagem de keywords da vaga encontradas no currículo
        var score = jobKeywords.Count > 0
            ? (int)Math.Round((double)matching.Count / jobKeywords.Count * 100)
            : 0;

        var result = new MatchResultDto
        {
            Score = Math.Clamp(score, 0, 100),
            MatchingKeywords = matching,
            MissingKeywords = missing,
            ImprovementSuggestions = GenerateSuggestions(missing)
        };

        return Task.FromResult(result);
    }

    private static List<string> ExtractKeywords(string text)
    {
        var techTerms = TechTerms.Value;

        // Normaliza o texto e procura matches
        var words = text.ToLowerInvariant()
            .Split([' ', '\n', '\r', '\t', ',', '.', ';', ':', '(', ')', '[', ']', '{', '}', '/', '\\', '"', '\''],
                   StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        var found = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var lowerText = text.ToLowerInvariant();

        foreach (var term in techTerms)
        {
            if (lowerText.Contains(term.ToLowerInvariant()))
            {
                found.Add(term);
            }
        }

        return found.ToList();
    }

    private static string GenerateSuggestions(List<string> missingKeywords)
    {
        if (missingKeywords.Count == 0)
            return "Excelente! Seu currículo cobre todas as palavras-chave da vaga.";

        return $"[MOCK] Considere adicionar experiência ou menções a: {string.Join(", ", missingKeywords)}. " +
               "Destaque projetos onde você utilizou essas tecnologias, mesmo que em contextos pessoais ou de estudo.";
    }

    public Task<string> ExtractJobDescriptionAsync(string rawPageText)
    {
        // Mock: retorna o texto bruto sem processamento de IA
        return Task.FromResult(rawPageText);
    }
}
