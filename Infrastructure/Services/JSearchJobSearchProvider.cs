using System.Net.Http.Json;
using System.Text.Json.Serialization;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Infrastructure.Helpers;

namespace ResumeMatcher.Api.Infrastructure.Services;

public class JSearchJobSearchProvider : IJobSearchProvider
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;

    public JSearchJobSearchProvider(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress ??= new Uri("https://jsearch.p.rapidapi.com/");
        _apiKey = configuration["JSearch:ApiKey"];
    }

    public string ProviderName => "JSearch";

    public async Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
            return new JobSearchResponseDto { Sources = [ProviderName], Errors = [$"{ProviderName}: API key not configured"] };

        var query = request.Query ?? "developer";
        var pageSize = Math.Clamp(request.PageSize, 1, 20);
        var page = Math.Max(request.Page, 1);

        var searchQuery = !string.IsNullOrWhiteSpace(request.Location)
            ? $"{query} in {request.Location}"
            : query;

        var url = $"search?query={Uri.EscapeDataString(searchQuery)}&page={page}&num_pages=1";

        if (request.RemoteOnly)
            url += "&remote_jobs_only=true";

        using var msg = new HttpRequestMessage(HttpMethod.Get, url);
        msg.Headers.Add("X-RapidAPI-Key", _apiKey);
        msg.Headers.Add("X-RapidAPI-Host", "jsearch.p.rapidapi.com");

        var httpResponse = await _httpClient.SendAsync(msg, ct);
        httpResponse.EnsureSuccessStatusCode();

        var response = await httpResponse.Content.ReadFromJsonAsync<JSearchApiResponse>(cancellationToken: ct);

        if (response?.Data is null)
            return new JobSearchResponseDto { Page = page, PageSize = pageSize, Sources = [ProviderName] };

        var jobs = response.Data.Take(pageSize).Select(j => new JobSearchResultDto
        {
            Title = j.JobTitle ?? string.Empty,
            Company = j.EmployerName ?? string.Empty,
            Location = j.JobLocation ?? (j.JobIsRemote == true ? "Remote" : string.Empty),
            Description = j.JobDescription ?? string.Empty,
            Url = j.JobApplyLink ?? j.JobGoogleLink ?? string.Empty,
            Salary = SalaryFormatter.FormatSalary(j.JobMinSalary, j.JobMaxSalary, period: j.JobSalaryPeriod),
            PostedAt = j.JobPostedAtTimestamp is not null
                ? DateTimeOffset.FromUnixTimeSeconds(j.JobPostedAtTimestamp.Value).UtcDateTime
                : null,
            Source = ProviderName,
            Tags = [],
            JobType = j.JobEmploymentType
        }).ToList();

        return new JobSearchResponseDto
        {
            Jobs = jobs,
            TotalCount = jobs.Count,
            Page = page,
            PageSize = pageSize,
            Sources = [ProviderName]
        };
    }

    // --- JSearch API response models ---

    private sealed class JSearchApiResponse
    {
        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("data")]
        public List<JSearchJob>? Data { get; set; }
    }

    private sealed class JSearchJob
    {
        [JsonPropertyName("job_id")]
        public string? JobId { get; set; }

        [JsonPropertyName("job_title")]
        public string? JobTitle { get; set; }

        [JsonPropertyName("employer_name")]
        public string? EmployerName { get; set; }

        [JsonPropertyName("job_apply_link")]
        public string? JobApplyLink { get; set; }

        [JsonPropertyName("job_google_link")]
        public string? JobGoogleLink { get; set; }

        [JsonPropertyName("job_description")]
        public string? JobDescription { get; set; }

        [JsonPropertyName("job_is_remote")]
        public bool? JobIsRemote { get; set; }

        [JsonPropertyName("job_posted_at_timestamp")]
        public long? JobPostedAtTimestamp { get; set; }

        [JsonPropertyName("job_location")]
        public string? JobLocation { get; set; }

        [JsonPropertyName("job_city")]
        public string? JobCity { get; set; }

        [JsonPropertyName("job_state")]
        public string? JobState { get; set; }

        [JsonPropertyName("job_country")]
        public string? JobCountry { get; set; }

        [JsonPropertyName("job_employment_type")]
        public string? JobEmploymentType { get; set; }

        [JsonPropertyName("job_min_salary")]
        public double? JobMinSalary { get; set; }

        [JsonPropertyName("job_max_salary")]
        public double? JobMaxSalary { get; set; }

        [JsonPropertyName("job_salary_period")]
        public string? JobSalaryPeriod { get; set; }
    }
}
