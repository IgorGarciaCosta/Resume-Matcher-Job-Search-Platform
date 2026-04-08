namespace ResumeMatcher.Api.Application.DTOs;

public class MatchResultDto
{
    public int Score { get; set; }
    public List<string> MatchingKeywords { get; set; } = [];
    public List<string> MissingKeywords { get; set; } = [];
    public string ImprovementSuggestions { get; set; } = string.Empty;
}
