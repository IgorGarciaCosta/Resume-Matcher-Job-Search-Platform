using System.ClientModel;
using System.Text.Json;
using System.Text.RegularExpressions;
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
            Analyze the resume against the job description and respond ONLY with a single valid JSON object.
            Do NOT include any text, explanation, or markdown outside the JSON.
            All string values must be on a single line (use \\n for line breaks, never raw newlines inside strings).
            Use this exact structure:
            {"score": 75, "matchingKeywords": ["keyword1"], "missingKeywords": ["keyword1"], "improvementSuggestions": "suggestions here"}
            Rules:
            - score: integer 0 to 100, percentage of how well the resume fits the job
            - matchingKeywords: skills/technologies found in BOTH resume and job
            - missingKeywords: skills/technologies in the job but NOT in the resume
            - improvementSuggestions: a single string with actionable advice in English on how to improve the resume for this job
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

        var completionOptions = new ChatCompletionOptions
        {
            ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat()
        };

        var completion = await _chatClient.CompleteChatAsync(messages, completionOptions);
        var responseText = completion.Value.Content[0].Text;

        // Remove possíveis code fences e texto extra fora do JSON
        responseText = responseText
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        // Extrai o objeto JSON usando contagem balanceada de chaves
        responseText = ExtractBalancedJson(responseText);

        GeminiMatchResponse? parsed;
        try
        {
            parsed = JsonSerializer.Deserialize<GeminiMatchResponse>(responseText,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
        catch (JsonException)
        {
            // Tenta sanitizar: remove newlines dentro de strings JSON
            var sanitized = Regex.Replace(responseText, @"(?<=:""[^""]*?)\r?\n(?=[^""]*?"")", "\\n");
            parsed = JsonSerializer.Deserialize<GeminiMatchResponse>(sanitized,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

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

    /// <summary>
    /// Extracts the first balanced JSON object from the response text,
    /// properly handling nested braces and quoted strings.
    /// </summary>
    private static string ExtractBalancedJson(string text)
    {
        var start = text.IndexOf('{');
        if (start < 0)
            throw new InvalidOperationException("Resposta do Gemini não contém JSON válido.");

        var depth = 0;
        var inString = false;
        var escape = false;

        for (var i = start; i < text.Length; i++)
        {
            var c = text[i];

            if (escape) { escape = false; continue; }
            if (c == '\\' && inString) { escape = true; continue; }
            if (c == '"') { inString = !inString; continue; }
            if (inString) continue;

            if (c == '{') depth++;
            else if (c == '}')
            {
                depth--;
                if (depth == 0)
                    return text[start..(i + 1)];
            }
        }

        throw new InvalidOperationException("Resposta do Gemini não contém JSON válido.");
    }

    public async Task<string> ExtractJobDescriptionAsync(string rawPageText)
    {
        var systemPrompt = """
            You are a job description extractor. You receive raw text extracted from a web page.
            Your task is to identify and return ONLY the job description content, removing:
            - Navigation menus, headers, footers
            - Cookie banners, ads, sidebar content
            - Login prompts, "apply now" buttons text
            - Duplicate or repeated content
            
            Keep the actual job posting content: title, company, location, requirements, 
            responsibilities, qualifications, benefits, salary info, etc.
            
            Return the cleaned job description as plain text. Do NOT wrap in JSON or markdown.
            If you cannot find a job description in the text, respond with exactly: NO_JOB_FOUND
            """;

        var userPrompt = $"""
            Extract the job description from this web page text:
            
            {rawPageText}
            """;

        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        };

        var completion = await _chatClient.CompleteChatAsync(messages);
        var responseText = completion.Value.Content[0].Text?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(responseText) || responseText.Contains("NO_JOB_FOUND", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException(
                "Não foi possível identificar uma descrição de vaga na página. " +
                "Tente colar o texto da vaga diretamente.");

        return responseText;
    }
}
