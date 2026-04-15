using Microsoft.AspNetCore.Mvc;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Services;

namespace ResumeMatcher.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobSearchController : ControllerBase
{
    private readonly JobSearchService _jobSearchService;

    public JobSearchController(JobSearchService jobSearchService)
    {
        _jobSearchService = jobSearchService;
    }

    /// <summary>
    /// Busca vagas de emprego em múltiplas fontes simultaneamente.
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(JobSearchResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string? query,
        [FromQuery] string? location,
        [FromQuery] bool remoteOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var request = new JobSearchRequestDto
        {
            Query = query,
            Location = location,
            RemoteOnly = remoteOnly,
            Page = page,
            PageSize = pageSize
        };

        var result = await _jobSearchService.SearchAsync(request, ct);
        return Ok(result);
    }
}
