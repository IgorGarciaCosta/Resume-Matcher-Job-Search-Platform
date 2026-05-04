using Microsoft.AspNetCore.Mvc;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatcherController : ControllerBase
{
    private readonly IMatcherService _matcherService;

    public MatcherController(IMatcherService matcherService)
    {
        _matcherService = matcherService;
    }

    /// <summary>
    /// Analyzes the match between a resume (PDF) and a job posting.
    /// Send the resume PDF + job URL OR job description text.
    /// </summary>
    [HttpPost("analyze")]
    [ProducesResponseType(typeof(MatchResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Analyze([FromForm] MatchUploadDto upload)
    {
        var request = new MatchRequestDto
        {
            ResumeStream = upload.ResumeFile?.OpenReadStream(),
            ResumeFileName = upload.ResumeFile?.FileName,
            JobUrl = upload.JobUrl,
            JobText = upload.JobText,
        };

        var result = await _matcherService.AnalyzeAsync(request);
        return Ok(result);
    }
}
