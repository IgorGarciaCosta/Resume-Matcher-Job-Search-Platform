using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

public partial class RemotiveJobSearchProvider : IJobSearchProvider
{
    private readonly HttpClient _httpClient;

    public RemotiveJobSearchProvider(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress ??= new Uri("https://remotive.com/");
    }

    public string ProviderName => "Remotive";

    public async Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default)
    {
        var limit = Math.Clamp(request.PageSize, 1, 50);
        var url = $"api/remote-jobs?limit={limit}";

        if (!string.IsNullOrWhiteSpace(request.Query))
            url += $"&search={Uri.EscapeDataString(request.Query)}";

        var response = await _httpClient.GetFromJsonAsync<RemotiveApiResponse>(url, ct);

        if (response?.Jobs is null)
            return new JobSearchResponseDto { Page = request.Page, PageSize = limit, Sources = [ProviderName] };

        var jobs = response.Jobs.Select(j => new JobSearchResultDto
        {
            Title = j.Title ?? string.Empty,
            Company = j.CompanyName ?? string.Empty,
            Location = j.CandidateRequiredLocation ?? "Remote",
            Description = StripHtml(j.Description ?? string.Empty),
            Url = j.Url ?? string.Empty,
            Salary = j.Salary,
            PostedAt = DateTime.TryParse(j.PublicationDate, out var dt) ? dt : null,
            Source = ProviderName,
            Tags = j.Tags ?? [],
            JobType = j.JobType
        }).ToList();

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var loc = request.Location;
            jobs = jobs.Where(j =>
                j.Location.Contains(loc, StringComparison.OrdinalIgnoreCase) ||
                j.Location.Equals("Worldwide", StringComparison.OrdinalIgnoreCase) ||
                j.Location.Equals("Anywhere", StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        return new JobSearchResponseDto
        {
            Jobs = jobs,
            TotalCount = response.JobCount,
            Page = request.Page,
            PageSize = limit,
            Sources = [ProviderName]
        };
    }

    private static string StripHtml(string html)
    {
        if (string.IsNullOrEmpty(html)) return html;
        var text = HtmlTagRegex().Replace(html, " ");
        text = System.Net.WebUtility.HtmlDecode(text);
        return WhitespaceRegex().Replace(text, " ").Trim();
    }

    [GeneratedRegex("<[^>]+>")]
    private static partial Regex HtmlTagRegex();

    [GeneratedRegex(@"\s{2,}")]
    private static partial Regex WhitespaceRegex();

    // --- Remotive API response models ---

    private sealed class RemotiveApiResponse
    {
        [JsonPropertyName("job-count")]
        public int JobCount { get; set; }

        [JsonPropertyName("jobs")]
        public List<RemotiveJob>? Jobs { get; set; }
    }

    private sealed class RemotiveJob
    {
        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("candidate_required_location")]
        public string? CandidateRequiredLocation { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("salary")]
        public string? Salary { get; set; }

        [JsonPropertyName("publication_date")]
        public string? PublicationDate { get; set; }

        [JsonPropertyName("tags")]
        public List<string>? Tags { get; set; }

        [JsonPropertyName("job_type")]
        public string? JobType { get; set; }
    }
}
