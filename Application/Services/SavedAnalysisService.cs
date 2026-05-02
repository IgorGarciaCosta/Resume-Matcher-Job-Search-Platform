using Microsoft.EntityFrameworkCore;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Domain.Entities;
using ResumeMatcher.Api.Infrastructure.Data;

namespace ResumeMatcher.Api.Application.Services;

public class SavedAnalysisService : ISavedAnalysisService
{
    private readonly AppDbContext _db;

    public SavedAnalysisService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SavedAnalysisDto> SaveAsync(string userId, SaveAnalysisRequestDto request)
    {
        var entity = new SavedAnalysis
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ResumeFileName = request.ResumeFileName,
            JobSource = request.JobSource.Length > 2048
                ? request.JobSource[..2048]
                : request.JobSource,
            Score = request.Score,
            MatchingKeywords = request.MatchingKeywords,
            MissingKeywords = request.MissingKeywords,
            ImprovementSuggestions = request.ImprovementSuggestions,
            AnalyzedAt = DateTime.UtcNow,
        };

        _db.SavedAnalyses.Add(entity);
        await _db.SaveChangesAsync();

        return MapToDto(entity);
    }

    public async Task<List<SavedAnalysisDto>> GetAllByUserAsync(string userId)
    {
        var analyses = await _db.SavedAnalyses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.AnalyzedAt)
            .ToListAsync();

        return analyses.Select(MapToDto).ToList();
    }

    public async Task<SavedAnalysisDto?> GetByIdAsync(Guid id, string userId)
    {
        var entity = await _db.SavedAnalyses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        return entity is null ? null : MapToDto(entity);
    }

    public async Task<bool> DeleteAsync(Guid id, string userId)
    {
        var entity = await _db.SavedAnalyses
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (entity is null)
            return false;

        _db.SavedAnalyses.Remove(entity);
        await _db.SaveChangesAsync();
        return true;
    }

    private static SavedAnalysisDto MapToDto(SavedAnalysis entity) => new()
    {
        Id = entity.Id,
        ResumeFileName = entity.ResumeFileName,
        JobSource = entity.JobSource,
        Score = entity.Score,
        MatchingKeywords = entity.MatchingKeywords,
        MissingKeywords = entity.MissingKeywords,
        ImprovementSuggestions = entity.ImprovementSuggestions,
        AnalyzedAt = entity.AnalyzedAt,
    };
}
