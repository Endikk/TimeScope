using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace TimeScope.API.Middleware;

/// <summary>
/// Global exception handling middleware.
/// Catches all unhandled exceptions and returns consistent error responses.
/// </summary>
public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred while processing the request");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message, errorCode) = exception switch
        {
            ArgumentNullException => (HttpStatusCode.BadRequest, "Required argument is missing", "MISSING_ARGUMENT"),
            ArgumentException => (HttpStatusCode.BadRequest, exception.Message, "INVALID_ARGUMENT"),
            KeyNotFoundException => (HttpStatusCode.NotFound, exception.Message, "NOT_FOUND"),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized access", "UNAUTHORIZED"),
            InvalidOperationException => (HttpStatusCode.Conflict, exception.Message, "INVALID_OPERATION"),
            NotImplementedException => (HttpStatusCode.NotImplemented, "Feature not implemented", "NOT_IMPLEMENTED"),
            _ => (HttpStatusCode.InternalServerError, "An internal server error occurred", "INTERNAL_ERROR")
        };

        context.Response.StatusCode = (int)statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Type = $"https://httpstatuses.com/{(int)statusCode}",
            Title = GetTitle(statusCode),
            Detail = _environment.IsDevelopment() ? exception.Message : message,
            Instance = context.Request.Path
        };

        // Add error code extension
        problemDetails.Extensions["errorCode"] = errorCode;
        problemDetails.Extensions["timestamp"] = DateTime.UtcNow;

        // Add trace ID for correlation
        if (context.TraceIdentifier != null)
        {
            problemDetails.Extensions["traceId"] = context.TraceIdentifier;
        }

        // Include stack trace only in development
        if (_environment.IsDevelopment() && exception.StackTrace != null)
        {
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;
        }

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(problemDetails, options);
        await context.Response.WriteAsync(json);
    }

    private static string GetTitle(HttpStatusCode statusCode) => statusCode switch
    {
        HttpStatusCode.BadRequest => "Bad Request",
        HttpStatusCode.Unauthorized => "Unauthorized",
        HttpStatusCode.Forbidden => "Forbidden",
        HttpStatusCode.NotFound => "Not Found",
        HttpStatusCode.Conflict => "Conflict",
        HttpStatusCode.InternalServerError => "Internal Server Error",
        HttpStatusCode.NotImplemented => "Not Implemented",
        _ => "Error"
    };
}
