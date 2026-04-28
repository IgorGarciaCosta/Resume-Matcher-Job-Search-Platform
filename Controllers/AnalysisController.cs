using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Domain.Entities;
using ResumeMatcher.Api.Infrastructure.Data;

namespace ResumeMatcher.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnalysisController(AppDbContext db)
    {
        _db = db;
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

        var entity = new SavedAnalysis
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ResumeFileName = request.ResumeFileName,
            JobSource = request.JobSource.Length > 2048
                ? request.JobSource[..2048]
                : request.JobSource,
            Score = request.Score,
            MatchingKeywordsJson = JsonSerializer.Serialize(request.MatchingKeywords),
            MissingKeywordsJson = JsonSerializer.Serialize(request.MissingKeywords),
            ImprovementSuggestions = request.ImprovementSuggestions,
            AnalyzedAt = DateTime.UtcNow,
        };

        _db.SavedAnalyses.Add(entity);
        await _db.SaveChangesAsync();

        var dto = MapToDto(entity);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>Returns all saved analyses for the authenticated user, newest first.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<SavedAnalysisDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();

        var analyses = await _db.SavedAnalyses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.AnalyzedAt)
            .ToListAsync();

        return Ok(analyses.Select(MapToDto));
    }

    /// <summary>Returns a single saved analysis by ID (must belong to the authenticated user).</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SavedAnalysisDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();

        var entity = await _db.SavedAnalyses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (entity is null)
            return NotFound();

        return Ok(MapToDto(entity));
    }

    /// <summary>Deletes a saved analysis by ID (must belong to the authenticated user).</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();

        var entity = await _db.SavedAnalyses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (entity is null)
            return NotFound();

        _db.SavedAnalyses.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static SavedAnalysisDto MapToDto(SavedAnalysis entity) => new()
    {
        Id = entity.Id,
        ResumeFileName = entity.ResumeFileName,
        JobSource = entity.JobSource,
        Score = entity.Score,
        MatchingKeywords = JsonSerializer.Deserialize<List<string>>(entity.MatchingKeywordsJson) ?? [],
        MissingKeywords = JsonSerializer.Deserialize<List<string>>(entity.MissingKeywordsJson) ?? [],
        ImprovementSuggestions = entity.ImprovementSuggestions,
        AnalyzedAt = entity.AnalyzedAt,
    };
}
