using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

public class AdzunaJobSearchProvider : IJobSearchProvider
{
    private readonly HttpClient _httpClient;
    private readonly string? _appId;
    private readonly string? _appKey;

    public AdzunaJobSearchProvider(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress ??= new Uri("https://api.adzuna.com/");
        _appId = configuration["Adzuna:AppId"];
        _appKey = configuration["Adzuna:AppKey"];
    }

    public string ProviderName => "Adzuna";

    public async Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_appId) || string.IsNullOrWhiteSpace(_appKey))
            return new JobSearchResponseDto { Sources = [ProviderName], Errors = [$"{ProviderName}: API credentials not configured"] };

        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 50);

        var url = $"v1/api/jobs/us/search/{page}?app_id={_appId}&app_key={_appKey}&results_per_page={pageSize}&content-type=application/json";

        if (!string.IsNullOrWhiteSpace(request.Query))
            url += $"&what={Uri.EscapeDataString(request.Query)}";

        if (!string.IsNullOrWhiteSpace(request.Location))
            url += $"&where={Uri.EscapeDataString(request.Location)}";

        // Read as string to avoid .NET encoding issue with Adzuna's 'utf8' charset header
        var httpResponse = await _httpClient.GetAsync(url, ct);
        httpResponse.EnsureSuccessStatusCode();
        var json = await httpResponse.Content.ReadAsStringAsync(ct);
        var response = JsonSerializer.Deserialize<AdzunaApiResponse>(json);

        if (response?.Results is null)
            return new JobSearchResponseDto { Page = page, PageSize = pageSize, Sources = [ProviderName] };

        var jobs = response.Results.Select(j => new JobSearchResultDto
        {
            Title = j.Title ?? string.Empty,
            Company = j.Company?.DisplayName ?? string.Empty,
            Location = j.Location?.DisplayName ?? string.Empty,
            Description = j.Description ?? string.Empty,
            Url = j.RedirectUrl ?? string.Empty,
            Salary = FormatSalary(j.SalaryMin, j.SalaryMax),
            PostedAt = DateTime.TryParse(j.Created, out var dt) ? dt : null,
            Source = ProviderName,
            Tags = j.Category?.Tag is not null ? [j.Category.Tag] : [],
            JobType = j.ContractType
        }).ToList();

        return new JobSearchResponseDto
        {
            Jobs = jobs,
            TotalCount = response.Count,
            Page = page,
            PageSize = pageSize,
            Sources = [ProviderName]
        };
    }

    private static string? FormatSalary(double? min, double? max)
    {
        if (min is null && max is null) return null;
        if (min is not null && max is not null)
        {
            if (Math.Abs(min.Value - max.Value) < 1)
                return $"${min:N0}/year";
            return $"${min:N0}-${max:N0}/year";
        }
        if (min is not null)
            return $"${min:N0}+/year";
        return $"up to ${max:N0}/year";
    }

    // --- Adzuna API response models ---

    private sealed class AdzunaApiResponse
    {
        [JsonPropertyName("count")]
        public int Count { get; set; }

        [JsonPropertyName("results")]
        public List<AdzunaJob>? Results { get; set; }
    }

    private sealed class AdzunaJob
    {
        [JsonPropertyName("id")]
        public string? Id { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("redirect_url")]
        public string? RedirectUrl { get; set; }

        [JsonPropertyName("created")]
        public string? Created { get; set; }

        [JsonPropertyName("salary_min")]
        public double? SalaryMin { get; set; }

        [JsonPropertyName("salary_max")]
        public double? SalaryMax { get; set; }

        [JsonPropertyName("company")]
        public AdzunaCompany? Company { get; set; }

        [JsonPropertyName("location")]
        public AdzunaLocation? Location { get; set; }

        [JsonPropertyName("category")]
        public AdzunaCategory? Category { get; set; }

        [JsonPropertyName("contract_type")]
        public string? ContractType { get; set; }

        [JsonPropertyName("contract_time")]
        public string? ContractTime { get; set; }
    }

    private sealed class AdzunaCompany
    {
        [JsonPropertyName("display_name")]
        public string? DisplayName { get; set; }
    }

    private sealed class AdzunaLocation
    {
        [JsonPropertyName("display_name")]
        public string? DisplayName { get; set; }

        [JsonPropertyName("area")]
        public List<string>? Area { get; set; }
    }

    private sealed class AdzunaCategory
    {
        [JsonPropertyName("tag")]
        public string? Tag { get; set; }

        [JsonPropertyName("label")]
        public string? Label { get; set; }
    }
}
