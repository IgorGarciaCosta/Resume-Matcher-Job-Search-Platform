using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly ISavedAnalysisService _analysisService;

    public AnalysisController(ISavedAnalysisService analysisService)
    {
        _analysisService = analysisService;
    }

    private string GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException();

    /// <summary>Saves a completed resume analysis for the authenticated user.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(SavedAnalysisDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Save([FromBody] SaveAnalysisRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.ResumeFileName))
            return BadRequest(new ProblemDetails { Title = "ResumeFileName is required." });

        if (request.Score < 0 || request.Score > 100)
            return BadRequest(new ProblemDetails { Title = "Score must be between 0 and 100." });

        var userId = GetUserId();
        var dto = await _analysisService.SaveAsync(userId, request);

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>Returns all saved analyses for the authenticated user, newest first.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SavedAnalysisDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var analyses = await _analysisService.GetAllByUserAsync(userId);
        return Ok(analyses);
    }

    /// <summary>Returns a single saved analysis by ID (must belong to the authenticated user).</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SavedAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        var dto = await _analysisService.GetByIdAsync(id, userId);

        if (dto is null)
            return NotFound();

        return Ok(dto);
    }

    /// <summary>Deletes a saved analysis by ID (must belong to the authenticated user).</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var deleted = await _analysisService.DeleteAsync(id, userId);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}
