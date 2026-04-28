namespace ResumeMatcher.Api.Application.DTOs;

public class SavedAnalysisDto
{
    public Guid Id { get; set; }
    public string ResumeFileName { get; set; } = string.Empty;
    public string JobSource { get; set; } = string.Empty;
    public int Score { get; set; }
    public List<string> MatchingKeywords { get; set; } = [];
    public List<string> MissingKeywords { get; set; } = [];
    public string ImprovementSuggestions { get; set; } = string.Empty;
    public DateTime AnalyzedAt { get; set; }
}
