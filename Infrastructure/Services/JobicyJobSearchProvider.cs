using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

public partial class JobicyJobSearchProvider : IJobSearchProvider
{
    private readonly HttpClient _httpClient;

    public JobicyJobSearchProvider(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress ??= new Uri("https://jobicy.com/");
    }

    public string ProviderName => "Jobicy";

    public async Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default)
    {
        var count = Math.Clamp(request.PageSize, 1, 50);
        var url = $"api/v2/remote-jobs?count={count}";

        if (!string.IsNullOrWhiteSpace(request.Query))
            url += $"&tag={Uri.EscapeDataString(request.Query)}";

        if (!string.IsNullOrWhiteSpace(request.Location))
            url += $"&geo={Uri.EscapeDataString(request.Location)}";

        var response = await _httpClient.GetFromJsonAsync<JobicyApiResponse>(url, ct);

        if (response?.Jobs is null)
            return new JobSearchResponseDto { Page = request.Page, PageSize = count, Sources = [ProviderName] };

        var jobs = response.Jobs.Select(j =>
        {
            var salary = FormatSalary(j.SalaryMin, j.SalaryMax, j.SalaryCurrency, j.SalaryPeriod);

            return new JobSearchResultDto
            {
                Title = j.JobTitle ?? string.Empty,
                Company = j.CompanyName ?? string.Empty,
                Location = j.JobGeo ?? "Remote",
                Description = StripHtml(j.JobDescription ?? j.JobExcerpt ?? string.Empty),
                Url = j.Url ?? string.Empty,
                Salary = salary,
                PostedAt = DateTime.TryParse(j.PubDate, out var dt) ? dt : null,
                Source = ProviderName,
                Tags = j.JobIndustry ?? [],
                JobType = j.JobType?.FirstOrDefault()
            };
        }).ToList();

        return new JobSearchResponseDto
        {
            Jobs = jobs,
            TotalCount = response.JobCount,
            Page = request.Page,
            PageSize = count,
            Sources = [ProviderName]
        };
    }

    private static string? FormatSalary(int? min, int? max, string? currency, string? period)
    {
        if (min is null && max is null) return null;
        var cur = currency ?? "USD";
        var per = period ?? "yearly";
        if (min is not null && max is not null)
            return $"{cur} {min:N0}-{max:N0}/{per}";
        if (min is not null)
            return $"{cur} {min:N0}+/{per}";
        return $"{cur} up to {max:N0}/{per}";
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

    // --- Jobicy API response models ---

    private sealed class JobicyApiResponse
    {
        [JsonPropertyName("jobCount")]
        public int JobCount { get; set; }

        [JsonPropertyName("jobs")]
        public List<JobicyJob>? Jobs { get; set; }
    }

    private sealed class JobicyJob
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("jobTitle")]
        public string? JobTitle { get; set; }

        [JsonPropertyName("companyName")]
        public string? CompanyName { get; set; }

        [JsonPropertyName("jobIndustry")]
        public List<string>? JobIndustry { get; set; }

        [JsonPropertyName("jobType")]
        public List<string>? JobType { get; set; }

        [JsonPropertyName("jobGeo")]
        public string? JobGeo { get; set; }

        [JsonPropertyName("jobLevel")]
        public string? JobLevel { get; set; }

        [JsonPropertyName("jobExcerpt")]
        public string? JobExcerpt { get; set; }

        [JsonPropertyName("jobDescription")]
        public string? JobDescription { get; set; }

        [JsonPropertyName("pubDate")]
        public string? PubDate { get; set; }

        [JsonPropertyName("salaryMin")]
        public int? SalaryMin { get; set; }

        [JsonPropertyName("salaryMax")]
        public int? SalaryMax { get; set; }

        [JsonPropertyName("salaryCurrency")]
        public string? SalaryCurrency { get; set; }

        [JsonPropertyName("salaryPeriod")]
        public string? SalaryPeriod { get; set; }
    }
}
