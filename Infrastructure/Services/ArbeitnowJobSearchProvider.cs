using System.Net.Http.Json;
using System.Text.Json.Serialization;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Infrastructure.Helpers;

namespace ResumeMatcher.Api.Infrastructure.Services;

public class ArbeitnowJobSearchProvider : IJobSearchProvider
{
    private readonly HttpClient _httpClient;

    public ArbeitnowJobSearchProvider(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress ??= new Uri("https://www.arbeitnow.com/");
    }

    public string ProviderName => "Arbeitnow";

    public async Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default)
    {
        var page = Math.Max(request.Page, 1);
        var url = $"api/job-board-api?page={page}";

        var response = await _httpClient.GetFromJsonAsync<ArbeitnowApiResponse>(url, ct);

        if (response?.Data is null)
            return new JobSearchResponseDto { Page = page, PageSize = request.PageSize, Sources = [ProviderName] };

        var jobs = response.Data.AsEnumerable();

        // Client-side filtering by query (API doesn't support search parameter)
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var query = request.Query.ToLowerInvariant();
            jobs = jobs.Where(j =>
                (j.Title?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.Description?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.CompanyName?.Contains(query, StringComparison.OrdinalIgnoreCase) ?? false) ||
                (j.Tags?.Any(t => t.Contains(query, StringComparison.OrdinalIgnoreCase)) ?? false));
        }

        if (request.RemoteOnly)
            jobs = jobs.Where(j => j.Remote == true);

        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var loc = request.Location;
            jobs = jobs.Where(j => j.Location?.Contains(loc, StringComparison.OrdinalIgnoreCase) ?? false);
        }

        var filtered = jobs.ToList();

        var results = filtered.Take(request.PageSize).Select(j => new JobSearchResultDto
        {
            Title = j.Title ?? string.Empty,
            Company = j.CompanyName ?? string.Empty,
            Location = j.Location ?? (j.Remote == true ? "Remote" : string.Empty),
            Description = HtmlHelper.StripHtml(j.Description ?? string.Empty),
            Url = j.Url ?? string.Empty,
            Salary = j.Salary,
            PostedAt = j.CreatedAt is not null ? DateTimeOffset.FromUnixTimeSeconds(j.CreatedAt.Value).UtcDateTime : null,
            Source = ProviderName,
            Tags = j.Tags ?? [],
            JobType = j.Remote == true ? "remote" : null
        }).ToList();

        return new JobSearchResponseDto
        {
            Jobs = results,
            TotalCount = filtered.Count,
            Page = page,
            PageSize = request.PageSize,
            Sources = [ProviderName]
        };
    }

    // --- Arbeitnow API response models ---

    private sealed class ArbeitnowApiResponse
    {
        [JsonPropertyName("data")]
        public List<ArbeitnowJob>? Data { get; set; }
    }

    private sealed class ArbeitnowJob
    {
        [JsonPropertyName("slug")]
        public string? Slug { get; set; }

        [JsonPropertyName("company_name")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("remote")]
        public bool? Remote { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("tags")]
        public List<string>? Tags { get; set; }

        [JsonPropertyName("job_types")]
        public List<string>? JobTypes { get; set; }

        [JsonPropertyName("location")]
        public string? Location { get; set; }

        [JsonPropertyName("created_at")]
        public long? CreatedAt { get; set; }

        [JsonPropertyName("salary")]
        public string? Salary { get; set; }
    }
}
