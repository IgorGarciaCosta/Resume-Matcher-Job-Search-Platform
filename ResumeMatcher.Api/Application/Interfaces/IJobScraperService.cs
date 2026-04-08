namespace ResumeMatcher.Api.Application.Interfaces;

public interface IJobScraperService
{
    Task<string> GetJobTextFromUrlAsync(string url);
}
