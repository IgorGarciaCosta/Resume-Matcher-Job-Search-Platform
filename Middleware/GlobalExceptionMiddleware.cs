using System.ClientModel;
using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace ResumeMatcher.Api.Middleware;

/// <summary>
/// Global middleware that catches unhandled exceptions and returns
/// standardized responses in ProblemDetails format (RFC 7807).
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title) = MapException(exception);

        var problemDetails = new ProblemDetails
        {
            Type = $"https://httpstatuses.com/{(int)statusCode}",
            Title = title,
            Status = (int)statusCode,
            Detail = GetDetail(exception, statusCode),
            Instance = context.Request.Path
        };

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = (int)statusCode;

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        await context.Response.WriteAsJsonAsync(problemDetails, options);
    }

    private (HttpStatusCode statusCode, string title) MapException(Exception exception) => exception switch
    {
        ArgumentNullException => (HttpStatusCode.BadRequest, "Invalid request"),
        ArgumentException => (HttpStatusCode.BadRequest, "Invalid request"),
        InvalidOperationException => (HttpStatusCode.BadRequest, "Processing error"),
        UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized"),
        KeyNotFoundException => (HttpStatusCode.NotFound, "Resource not found"),
        NotImplementedException => (HttpStatusCode.BadRequest, "Feature not available"),
        ClientResultException => (HttpStatusCode.BadGateway, "AI API error"),
        JsonException => (HttpStatusCode.BadGateway, "AI API error"),
        _ => (HttpStatusCode.InternalServerError, "Internal server error")
    };

    private string GetDetail(Exception exception, HttpStatusCode statusCode)
    {
        // For 5xx errors in production, do not leak internal details
        if (!_env.IsDevelopment() && (int)statusCode >= 500 && statusCode != HttpStatusCode.BadGateway)
        {
            return "An unexpected error occurred. Please try again later.";
        }

        return exception switch
        {
            ClientResultException cre =>
                $"The Gemini API returned an error ({cre.Status}). Please try again shortly.",
            JsonException =>
                "The AI returned an invalid response. Please try again shortly.",
            _ => exception.Message
        };
    }
}
