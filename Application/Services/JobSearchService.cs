using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Application.Services;

public class JobSearchService
{
    private readonly IEnumerable<IJobSearchProvider> _providers;
    private readonly ILogger<JobSearchService> _logger;

    public JobSearchService(IEnumerable<IJobSearchProvider> providers, ILogger<JobSearchService> logger)
    {
        _providers = providers;
        _logger = logger;
    }

    public async Task<JobSearchResponseDto> SearchAsync(JobSearchRequestDto request, CancellationToken ct = default)
    {
        var tasks = _providers.Select(p => SearchProviderSafe(p, request, ct));
        var results = await Task.WhenAll(tasks);

        var allJobs = new List<JobSearchResultDto>();
        var sources = new List<string>();
        var errors = new List<string>();

        foreach (var result in results)
        {
            allJobs.AddRange(result.Jobs);
            sources.AddRange(result.Sources);
            errors.AddRange(result.Errors);
        }

        // Filter by location if specified (safety-net for providers that don't filter server-side)
        if (!string.IsNullOrWhiteSpace(request.Location))
        {
            var loc = request.Location;
            allJobs = allJobs.Where(j =>
                string.IsNullOrWhiteSpace(j.Location) ||
                j.Location.Contains(loc, StringComparison.OrdinalIgnoreCase) ||
                j.Location.Contains("Remote", StringComparison.OrdinalIgnoreCase) ||
                j.Location.Contains("Worldwide", StringComparison.OrdinalIgnoreCase) ||
                j.Location.Contains("Anywhere", StringComparison.OrdinalIgnoreCase)
            ).ToList();
        }

        // Filter remote-only (safety-net for providers that don't filter server-side)
        if (request.RemoteOnly)
        {
            allJobs = allJobs.Where(j =>
                (!string.IsNullOrWhiteSpace(j.Location) &&
                    (j.Location.Contains("Remote", StringComparison.OrdinalIgnoreCase) ||
                     j.Location.Contains("Anywhere", StringComparison.OrdinalIgnoreCase) ||
                     j.Location.Contains("Worldwide", StringComparison.OrdinalIgnoreCase))) ||
                string.Equals(j.JobType, "remote", StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrWhiteSpace(j.Title) &&
                    j.Title.Contains("Remote", StringComparison.OrdinalIgnoreCase))
            ).ToList();
        }

        // Deduplicate by title + company (case-insensitive)
        var deduplicated = allJobs
            .GroupBy(j => $"{j.Title.ToLowerInvariant()}|{j.Company.ToLowerInvariant()}")
            .Select(g => g.First())
            .OrderByDescending(j => j.PostedAt ?? DateTime.MinValue)
            .ToList();

        // Apply pagination on the merged set
        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var paged = deduplicated
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return new JobSearchResponseDto
        {
            Jobs = paged,
            TotalCount = deduplicated.Count,
            Page = page,
            PageSize = pageSize,
            Sources = sources.Distinct().ToList(),
            Errors = errors
        };
    }

    private async Task<JobSearchResponseDto> SearchProviderSafe(
        IJobSearchProvider provider, JobSearchRequestDto request, CancellationToken ct)
    {
        try
        {
            return await provider.SearchAsync(request, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Provider {Provider} failed: {Message}", provider.ProviderName, ex.Message);
            return new JobSearchResponseDto
            {
                Sources = [provider.ProviderName],
                Errors = [$"{provider.ProviderName}: {ex.Message}"]
            };
        }
    }
}
