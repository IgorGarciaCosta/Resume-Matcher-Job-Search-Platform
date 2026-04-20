using Microsoft.EntityFrameworkCore;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Application.Services;
using ResumeMatcher.Api.Infrastructure.Data;
using ResumeMatcher.Api.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ── EF Core + SQLite ──────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Dependency Injection ──────────────────────────────────────────────────────
builder.Services.AddScoped<IPdfExtractorService, PdfExtractorService>();
builder.Services.AddScoped<IJobScraperService, JobScraperService>();
builder.Services.AddScoped<IAiAnalyzerService, GeminiAnalyzerService>();
builder.Services.AddScoped<MatcherService>();

// ── Job Search Providers ──────────────────────────────────────────────────────
builder.Services.AddHttpClient<RemotiveJobSearchProvider>();
builder.Services.AddHttpClient<ArbeitnowJobSearchProvider>();
builder.Services.AddHttpClient<JobicyJobSearchProvider>();
builder.Services.AddHttpClient<HimalayasJobSearchProvider>();
builder.Services.AddHttpClient<JSearchJobSearchProvider>();
builder.Services.AddHttpClient<AdzunaJobSearchProvider>();
builder.Services.AddHttpClient<TheMuseJobSearchProvider>();
builder.Services.AddScoped<IJobSearchProvider, RemotiveJobSearchProvider>();
builder.Services.AddScoped<IJobSearchProvider, ArbeitnowJobSearchProvider>();
builder.Services.AddScoped<IJobSearchProvider, JobicyJobSearchProvider>();
builder.Services.AddScoped<IJobSearchProvider, HimalayasJobSearchProvider>();
builder.Services.AddScoped<IJobSearchProvider, JSearchJobSearchProvider>();
builder.Services.AddScoped<IJobSearchProvider, AdzunaJobSearchProvider>();
builder.Services.AddScoped<IJobSearchProvider, TheMuseJobSearchProvider>();
builder.Services.AddScoped<JobSearchService>();

// ── Controllers ───────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ── Swagger / OpenAPI ─────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ── CORS (para frontend React no Vite) ────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Resume Matcher API v1");
        options.RoutePrefix = string.Empty; // Swagger abre na raiz (http://localhost:5xxx/)
    });
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// ── Auto-create database on startup ──────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
