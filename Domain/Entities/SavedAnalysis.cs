namespace ResumeMatcher.Api.Domain.Entities;

public class SavedAnalysis
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;
    public string ResumeFileName { get; set; } = string.Empty;
    public string JobSource { get; set; } = string.Empty;
    public int Score { get; set; }
    public List<string> MatchingKeywords { get; set; } = [];
    public List<string> MissingKeywords { get; set; } = [];
    public string ImprovementSuggestions { get; set; } = string.Empty;
    public DateTime AnalyzedAt { get; set; } = DateTime.UtcNow;
}
