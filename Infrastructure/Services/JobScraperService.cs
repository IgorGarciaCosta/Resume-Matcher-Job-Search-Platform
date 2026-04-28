using System.Net;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using ResumeMatcher.Api.Application.Interfaces;

namespace ResumeMatcher.Api.Infrastructure.Services;

/// <summary>
/// Extrai texto de descrição de vaga a partir de uma URL.
/// Pipeline: fetch HTML → HtmlAgilityPack (limpeza estrutural) → Gemini (extração inteligente).
/// </summary>
public class JobScraperService : IJobScraperService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IAiAnalyzerService _aiAnalyzer;
    private readonly ILogger<JobScraperService> _logger;

    private const int MaxTextLength = 15_000;
    private const int MinTextLength = 50;
    private const int TimeoutSeconds = 15;

    // Tags HTML que não contêm conteúdo relevante da vaga
    private static readonly string[] TagsToRemove =
        ["script", "style", "nav", "header", "footer", "aside", "noscript", "svg", "iframe", "form"];

    public JobScraperService(
        IHttpClientFactory httpClientFactory,
        IAiAnalyzerService aiAnalyzer,
        ILogger<JobScraperService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _aiAnalyzer = aiAnalyzer;
        _logger = logger;
    }

    public async Task<string> GetJobTextFromUrlAsync(string url)
    {
        // 1. Validar URL (SSRF protection)
        ValidateUrl(url);

        // 2. Fetch HTML
        var html = await FetchHtmlAsync(url);

        // 3. Extrair texto com HtmlAgilityPack (limpeza estrutural)
        var rawText = ExtractTextFromHtml(html);

        if (rawText.Length < MinTextLength)
            throw new InvalidOperationException(
                "Não foi possível extrair conteúdo suficiente da página. " +
                "O site pode exigir login ou bloquear acesso automatizado. " +
                "Tente colar o texto da vaga diretamente.");

        // 4. Truncar se necessário (limite de tokens do Gemini)
        if (rawText.Length > MaxTextLength)
            rawText = rawText[..MaxTextLength];

        // 5. Usar Gemini para extrair apenas a descrição da vaga do texto bruto
        _logger.LogInformation("Extraindo job description via IA ({Length} chars de texto bruto)", rawText.Length);
        var jobDescription = await _aiAnalyzer.ExtractJobDescriptionAsync(rawText);

        return jobDescription;
    }

    /// <summary>
    /// Valida a URL contra SSRF: só permite http/https, bloqueia IPs privados e localhost.
    /// </summary>
    private static void ValidateUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("A URL da vaga é obrigatória.");

        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            throw new ArgumentException("URL inválida. Informe uma URL completa (ex: https://example.com/job/123).");

        // Só permite http e https
        if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
            throw new ArgumentException("Apenas URLs HTTP/HTTPS são permitidas.");

        var host = uri.Host.ToLowerInvariant();

        // Bloqueia localhost
        if (host is "localhost" || host.EndsWith(".local"))
            throw new ArgumentException("URLs locais não são permitidas.");

        // Bloqueia IPs privados
        if (IPAddress.TryParse(host, out var ip))
        {
            var bytes = ip.GetAddressBytes();
            var isPrivate = bytes[0] switch
            {
                10 => true,                                          // 10.0.0.0/8
                127 => true,                                         // 127.0.0.0/8 (loopback)
                172 => bytes[1] >= 16 && bytes[1] <= 31,             // 172.16.0.0/12
                192 => bytes[1] == 168,                              // 192.168.0.0/16
                169 => bytes[1] == 254,                              // 169.254.0.0/16 (link-local)
                0 => true,                                           // 0.0.0.0/8
                _ => false
            };

            if (isPrivate)
                throw new ArgumentException("URLs apontando para redes internas não são permitidas.");
        }
    }

    /// <summary>
    /// Busca o HTML da URL com timeout, User-Agent e tratamento de erros HTTP.
    /// </summary>
    private async Task<string> FetchHtmlAsync(string url)
    {
        var client = _httpClientFactory.CreateClient("JobScraper");

        try
        {
            var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                var message = response.StatusCode switch
                {
                    HttpStatusCode.Forbidden or HttpStatusCode.Unauthorized =>
                        "O site bloqueou o acesso automatizado (403/401). Tente colar o texto da vaga diretamente.",
                    HttpStatusCode.NotFound =>
                        "Página não encontrada (404). Verifique se a URL está correta.",
                    _ =>
                        $"O site retornou erro HTTP {(int)response.StatusCode}. Tente colar o texto da vaga diretamente."
                };
                throw new InvalidOperationException(message);
            }

            return await response.Content.ReadAsStringAsync();
        }
        catch (TaskCanceledException)
        {
            throw new InvalidOperationException(
                "O site demorou demais para responder (timeout). Tente colar o texto da vaga diretamente.");
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "Erro ao buscar URL {Url}", url);
            throw new InvalidOperationException(
                "Não foi possível acessar o site. Verifique se a URL está correta e tente novamente.");
        }
    }

    /// <summary>
    /// Remove tags não relevantes e extrai texto limpo usando HtmlAgilityPack.
    /// </summary>
    private static string ExtractTextFromHtml(string html)
    {
        var doc = new HtmlDocument();
        doc.LoadHtml(html);

        // Remove tags irrelevantes
        foreach (var tag in TagsToRemove)
        {
            var nodes = doc.DocumentNode.SelectNodes($"//{tag}");
            if (nodes is null) continue;
            foreach (var node in nodes)
                node.Remove();
        }

        // Extrai texto interno
        var rawText = doc.DocumentNode.InnerText;

        // Decodifica entidades HTML (&amp; → &, etc.)
        rawText = WebUtility.HtmlDecode(rawText);

        // Limpa whitespace excessivo: múltiplos espaços/newlines → single
        rawText = Regex.Replace(rawText, @"[ \t]+", " ");
        rawText = Regex.Replace(rawText, @"(\r?\n\s*){3,}", "\n\n");

        return rawText.Trim();
    }
}
