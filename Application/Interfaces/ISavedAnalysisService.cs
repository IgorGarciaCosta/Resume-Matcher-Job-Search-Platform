using ResumeMatcher.Api.Application.DTOs;

namespace ResumeMatcher.Api.Application.Interfaces;

public interface ISavedAnalysisService
{
    Task<SavedAnalysisDto> SaveAsync(string userId, SaveAnalysisRequestDto request);
    Task<List<SavedAnalysisDto>> GetAllByUserAsync(string userId);
    Task<SavedAnalysisDto?> GetByIdAsync(Guid id, string userId);
    Task<bool> DeleteAsync(Guid id, string userId);
}
