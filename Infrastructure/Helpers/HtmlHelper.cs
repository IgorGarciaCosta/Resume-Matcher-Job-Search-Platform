using System.Text.RegularExpressions;

namespace ResumeMatcher.Api.Infrastructure.Helpers;

public static partial class HtmlHelper
{
    public static string StripHtml(string html)
    {
        if (string.IsNullOrEmpty(html)) return html;
        var text = HtmlTagRegex().Replace(html, " ");
        text = System.Net.WebUtility.HtmlDecode(text);
        return WhitespaceRegex().Replace(text, " ").Trim();
    }

    [GeneratedRegex("<[^>]+>")]
    private static partial Regex HtmlTagRegex();

    [GeneratedRegex(@"\s{2,}")]
    private static partial Regex WhitespaceRegex();
}
