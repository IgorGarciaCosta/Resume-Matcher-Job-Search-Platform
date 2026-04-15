namespace ResumeMatcher.Api.Application.Interfaces;

public interface IPdfExtractorService
{
    Task<string> ExtractTextAsync(Stream pdfStream);
}
