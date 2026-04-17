using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

public partial class HimalayasJobSearchProvider : IJobSearchProvider
{
    private readonly HttpClient _httpClient;

    public HimalayasJobSearchProvider(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress ??= new Uri("https://himalayas.app/");
    }

    public string ProviderName => "Himalayas";

    public async Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default)
    {
        var limit = Math.Clamp(request.PageSize, 1, 50);
        var offset = (Math.Max(request.Page, 1) - 1) * limit;
        var url = $"jobs/api?limit={limit}&offset={offset}";

        var response = await _httpClient.GetFromJsonAsync<HimalayasApiResponse>(url, ct);

        if (response?.Jobs is null)
            return new JobSearchResponseDto { Page = request.Page, PageSize = limit, Sources = [ProviderName] };

        var jobs = response.Jobs.AsEnumerable();

        // Client-side filtering (API doesn't support search parameter reliably)
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var query = request.Query;
            jobs = jobs.Where(j =>
                (j.Title?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.Excerpt?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.CompanyName?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.Categories?.Any(c => c.Contains(query, StringComparison.OrdinalIgnoreCase)) ?? false));
        }

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var loc = request.Location;
            jobs = jobs.Where(j =>
                j.LocationRestrictions?.Any(l => l.Contains(loc, StringComparison.OrdinalIgnoreCase)) ?? false);
        }

        var filtered = jobs.ToList();

        var results = filtered.Select(j =>
        {
            var salary = FormatSalary(j.MinSalary, j.MaxSalary, j.Currency);

            return new JobSearchResultDto
            {
                Title = j.Title ?? string.Empty,
                Company = j.CompanyName ?? string.Empty,
                Location = j.LocationRestrictions is { Count: > 0 }
                    ? string.Join(", ", j.LocationRestrictions)
                    : "Remote",
                Description = StripHtml(j.Description ?? j.Excerpt ?? string.Empty),
                Url = j.ApplicationLink ?? j.Guid ?? string.Empty,
                Salary = salary,
                PostedAt = j.PubDate is not null
                    ? DateTimeOffset.FromUnixTimeSeconds(j.PubDate.Value).UtcDateTime
                    : null,
                Source = ProviderName,
                Tags = j.Categories ?? [],
                JobType = j.EmploymentType
            };
        }).ToList();

        return new JobSearchResponseDto
        {
            Jobs = results,
            TotalCount = filtered.Count,
            Page = request.Page,
            PageSize = limit,
            Sources = [ProviderName]
        };
    }

    private static string? FormatSalary(int? min, int? max, string? currency)
    {
        if (min is null && max is null) return null;
        var cur = currency ?? "USD";
        if (min is not null && max is not null)
            return $"{cur} {min:N0}-{max:N0}/year";
        if (min is not null)
            return $"{cur} {min:N0}+/year";
        return $"{cur} up to {max:N0}/year";
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

    // --- Himalayas API response models ---

    private sealed class HimalayasApiResponse
    {
        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }

        [JsonPropertyName("offset")]
        public int Offset { get; set; }

        [JsonPropertyName("limit")]
        public int Limit { get; set; }

        [JsonPropertyName("jobs")]
        public List<HimalayasJob>? Jobs { get; set; }
    }

    private sealed class HimalayasJob
    {
        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("excerpt")]
        public string? Excerpt { get; set; }

        [JsonPropertyName("companyName")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("employmentType")]
        public string? EmploymentType { get; set; }

        [JsonPropertyName("minSalary")]
        public int? MinSalary { get; set; }

        [JsonPropertyName("maxSalary")]
        public int? MaxSalary { get; set; }

        [JsonPropertyName("currency")]
        public string? Currency { get; set; }

        [JsonPropertyName("locationRestrictions")]
        public List<string>? LocationRestrictions { get; set; }

        [JsonPropertyName("categories")]
        public List<string>? Categories { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("pubDate")]
        public long? PubDate { get; set; }

        [JsonPropertyName("applicationLink")]
        public string? ApplicationLink { get; set; }

        [JsonPropertyName("guid")]
        public string? Guid { get; set; }
    }
}
