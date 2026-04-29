using System.Net.Http.Json;
using System.Text.Json.Serialization;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Infrastructure.Helpers;

namespace ResumeMatcher.Api.Infrastructure.Services;

public class TheMuseJobSearchProvider : IJobSearchProvider
{
    private readonly HttpClient _httpClient;

    public TheMuseJobSearchProvider(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress ??= new Uri("https://www.themuse.com/");
    }

    public string ProviderName => "TheMuse";

    public async Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default)
    {
        var page = Math.Max(request.Page, 1) - 1; // The Muse uses 0-based pages
        var url = $"api/public/jobs?page={page}";

        if (!string.IsNullOrWhiteSpace(request.Location))
            url += $"&location={Uri.EscapeDataString(request.Location)}";

        var response = await _httpClient.GetFromJsonAsync<TheMuseApiResponse>(url, ct);

        if (response?.Results is null)
            return new JobSearchResponseDto { Page = request.Page, PageSize = request.PageSize, Sources = [ProviderName] };

        var jobs = response.Results.AsEnumerable();

        // Client-side filtering by query (API doesn't support text search)
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var query = request.Query;
            jobs = jobs.Where(j =>
                (j.Name?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.Contents?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.Company?.Name?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.Categories?.Any(c => c.Name?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ?? false));
        }

        var filtered = jobs.ToList();

        var results = filtered.Take(request.PageSize).Select(j => new JobSearchResultDto
        {
            Title = j.Name ?? string.Empty,
            Company = j.Company?.Name ?? string.Empty,
            Location = j.Locations is { Count: > 0 }
                ? string.Join(", ", j.Locations.Select(l => l.Name).Where(n => n is not null))
                : string.Empty,
            Description = HtmlHelper.StripHtml(j.Contents ?? string.Empty),
            Url = j.Refs?.LandingPage ?? string.Empty,
            Salary = null,
            PostedAt = DateTime.TryParse(j.PublicationDate, out var dt) ? dt : null,
            Source = ProviderName,
            Tags = j.Categories?.Select(c => c.Name ?? string.Empty).Where(n => n.Length > 0).ToList() ?? [],
            JobType = j.Type
        }).ToList();

        return new JobSearchResponseDto
        {
            Jobs = results,
            TotalCount = filtered.Count,
            Page = request.Page,
            PageSize = request.PageSize,
            Sources = [ProviderName]
        };
    }

    // --- The Muse API response models ---

    private sealed class TheMuseApiResponse
    {
        [JsonPropertyName("page_count")]
        public int PageCount { get; set; }

        [JsonPropertyName("total")]
        public int Total { get; set; }

        [JsonPropertyName("results")]
        public List<TheMuseJob>? Results { get; set; }
    }

    private sealed class TheMuseJob
    {
        [JsonPropertyName("id")]
        public long Id { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("contents")]
        public string? Contents { get; set; }

        [JsonPropertyName("publication_date")]
        public string? PublicationDate { get; set; }

        [JsonPropertyName("locations")]
        public List<TheMuseNamedItem>? Locations { get; set; }

        [JsonPropertyName("categories")]
        public List<TheMuseNamedItem>? Categories { get; set; }

        [JsonPropertyName("levels")]
        public List<TheMuseNamedItem>? Levels { get; set; }

        [JsonPropertyName("company")]
        public TheMuseCompany? Company { get; set; }

        [JsonPropertyName("refs")]
        public TheMuseRefs? Refs { get; set; }
    }

    private sealed class TheMuseNamedItem
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }

    private sealed class TheMuseCompany
    {
        [JsonPropertyName("name")]
        public string? Name { get; set; }
    }

    private sealed class TheMuseRefs
    {
        [JsonPropertyName("landing_page")]
        public string? LandingPage { get; set; }
    }
}
