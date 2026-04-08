using Microsoft.AspNetCore.Mvc;
using ResumeMatcher.Api.Application.DTOs;
using ResumeMatcher.Api.Application.Services;

namespace ResumeMatcher.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatcherController : ControllerBase
{
    private readonly MatcherService _matcherService;

    public MatcherController(MatcherService matcherService)
    {
        _matcherService = matcherService;
    }

    /// <summary>
    /// Analisa o match entre um currículo (PDF) e uma vaga de emprego.
    /// Envie o PDF do currículo + URL da vaga OU texto da descrição da vaga.
    /// </summary>
    [HttpPost("analyze")]
    [ProducesResponseType(typeof(MatchResultDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Analyze([FromForm] MatchRequestDto request)
    {
        try
        {
            var result = await _matcherService.AnalyzeAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Requisição inválida",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (NotImplementedException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Funcionalidade não disponível",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Erro no processamento",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest
            });
        }
    }

    /// <summary>
    /// Health check simples da API.
    /// </summary>
    [HttpGet("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
    }
}
