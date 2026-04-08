using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

/// <summary>
/// Mock da análise de IA que retorna dados simulados.
/// Substitua pela integração real com a OpenAI quando tiver a API key configurada.
/// </summary>
public class MockAiAnalyzerService : IAiAnalyzerService
{
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
        // Lista de tech keywords comuns para filtrar do texto
        var techTerms = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "c#", "csharp", ".net", "asp.net", "javascript", "typescript", "react",
            "angular", "vue", "node.js", "python", "java", "sql", "nosql", "mongodb",
            "postgresql", "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd",
            "git", "rest", "api", "microservices", "agile", "scrum", "tdd", "solid",
            "clean architecture", "entity framework", "ef core", "blazor", "redis",
            "rabbitmq", "kafka", "graphql", "html", "css", "tailwind", "sass",
            "webpack", "vite", "linux", "devops", "terraform", "jenkins",
            "github actions", "azure devops", "jira", "confluence", "figma",
            "machine learning", "ai", "openai", "llm", "data engineering",
            "etl", "spark", "databricks", "power bi", "tableau",
            "communication", "leadership", "teamwork", "problem-solving",
            "senior", "lead", "architect", "full-stack", "backend", "frontend",
            "web scraping", "selenium", "playwright", "xunit", "nunit", "jest",
            "testing", "unit test", "integration test", "swagger", "openapi",
            "oauth", "jwt", "authentication", "authorization", "security",
            "performance", "scalability", "design patterns", "ddd",
            "domain-driven design", "cqrs", "event sourcing", "signalr",
            "grpc", "wcf", "wpf", "maui", "xamarin", "flutter", "dart",
            "go", "golang", "rust", "ruby", "rails", "django", "flask",
            "spring", "spring boot", "hibernate", "maven", "gradle"
        };

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
}
