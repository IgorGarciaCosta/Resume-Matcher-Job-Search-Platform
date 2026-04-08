using System.Text;
using ResumeMatcher.Api.Application.Interfaces;
using UglyToad.PdfPig;

namespace ResumeMatcher.Api.Infrastructure.Services;

public class PdfExtractorService : IPdfExtractorService
{
    public Task<string> ExtractTextAsync(Stream pdfStream)
    {
        using var document = PdfDocument.Open(pdfStream);

        var sb = new StringBuilder();

        foreach (var page in document.GetPages())
        {
            sb.AppendLine(page.Text);
        }

        return Task.FromResult(sb.ToString().Trim());
    }
}
