using System.ClientModel;
using System.Text.Json;
using OpenAI;
using OpenAI.Chat;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

public class GeminiAnalyzerService : IAiAnalyzerService
{
    private readonly ChatClient _chatClient;

    public GeminiAnalyzerService(IConfiguration configuration)
    {
        var apiKey = configuration["Gemini:ApiKey"]
            ?? throw new InvalidOperationException("Gemini:ApiKey não configurada. Use: dotnet user-secrets set \"Gemini:ApiKey\" \"SUA_CHAVE\"");

        var model = configuration["Gemini:Model"] ?? "gemini-2.5-flash";

        var options = new OpenAIClientOptions
        {
            Endpoint = new Uri("https://generativelanguage.googleapis.com/v1beta/openai/")
        };

        var client = new OpenAIClient(new ApiKeyCredential(apiKey), options);
        _chatClient = client.GetChatClient(model);
    }

    public async Task<MatchResultDto> AnalyzeMatchAsync(string resumeText, string jobText)
    {
        var systemPrompt = """
            You are an expert resume-job matching analyst.
            Analyze the resume against the job description and respond ONLY with valid JSON (no markdown, no code fences).
            Use this exact structure:
            {
              "score": <integer 0 to 100>,
              "matchingKeywords": ["keyword1", "keyword2"],
              "missingKeywords": ["keyword1", "keyword2"],
              "improvementSuggestions": "suggestions text in Portuguese (pt-BR)"
            }
            Rules:
            - score: percentage of how well the resume fits the job (0 = no match, 100 = perfect)
            - matchingKeywords: skills/technologies found in BOTH resume and job
            - missingKeywords: skills/technologies in the job but NOT in the resume
            - improvementSuggestions: actionable advice in pt-BR on how to improve the resume for this job
            """;

        var userPrompt = $"""
            ## Currículo (Resume):
            {resumeText}

            ## Vaga (Job Description):
            {jobText}
            """;

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        };

        var completion = await _chatClient.CompleteChatAsync(messages);
        var responseText = completion.Value.Content[0].Text;

        // Remove possíveis code fences e texto extra fora do JSON
        responseText = responseText
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        // Extrai apenas o objeto JSON, ignorando texto antes/depois
        var jsonStart = responseText.IndexOf('{');
        var jsonEnd = responseText.LastIndexOf('}');
        if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart)
            throw new InvalidOperationException("Resposta do Gemini não contém JSON válido.");
        responseText = responseText[jsonStart..(jsonEnd + 1)];

        var parsed = JsonSerializer.Deserialize<GeminiMatchResponse>(responseText,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        return new MatchResultDto
        {
            Score = Math.Clamp(parsed?.Score ?? 0, 0, 100),
            MatchingKeywords = parsed?.MatchingKeywords ?? [],
            MissingKeywords = parsed?.MissingKeywords ?? [],
            ImprovementSuggestions = parsed?.ImprovementSuggestions ?? string.Empty
        };
    }

    private sealed class GeminiMatchResponse
    {
        public int Score { get; set; }
        public List<string> MatchingKeywords { get; set; } = [];
        public List<string> MissingKeywords { get; set; } = [];
        public string ImprovementSuggestions { get; set; } = string.Empty;
    }
}
