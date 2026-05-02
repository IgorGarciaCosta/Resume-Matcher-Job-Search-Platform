using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Application.Services;
using ResumeMatcher.Api.Domain.Entities;
using ResumeMatcher.Api.Infrastructure.Data;
using ResumeMatcher.Api.Infrastructure.Services;
using ResumeMatcher.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ── EF Core + PostgreSQL ──────────────────────────────────────────────────────
string GetConnectionString()
{
    // Render provides DATABASE_URL in postgres:// format
    var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (!string.IsNullOrEmpty(databaseUrl))
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':');
        var port = uri.Port > 0 ? uri.Port : 5432;
        return $"Host={uri.Host};Port={port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
    }
    return builder.Configuration.GetConnectionString("DefaultConnection")!;
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(GetConnectionString())
           .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

// ── ASP.NET Identity ──────────────────────────────────────────────────────────
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(jwtKey)
    };
    // Read JWT from HttpOnly cookie instead of Authorization header
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["access_token"];
            return Task.CompletedTask;
        }
    };
});

// ── Dependency Injection ──────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISavedAnalysisService, SavedAnalysisService>();
builder.Services.AddScoped<IPdfExtractorService, PdfExtractorService>();
builder.Services.AddScoped<IAiAnalyzerService, GeminiAnalyzerService>();
builder.Services.AddHttpClient("JobScraper", client =>
{
    client.Timeout = TimeSpan.FromSeconds(15);
    client.DefaultRequestHeaders.UserAgent.ParseAdd(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36");
    client.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml");
});
builder.Services.AddScoped<IJobScraperService, JobScraperService>();
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
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                  ?? ["http://localhost:5173"];
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  var uri = new Uri(origin);
                  return corsOrigins.Contains(origin)
                         || uri.Host.EndsWith(".vercel.app");
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ── Forwarded Headers (Render proxy) ──────────────────────────────────────────
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

// ── Global Exception Handling ─────────────────────────────────────────────────
app.UseMiddleware<GlobalExceptionMiddleware>();

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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ── Auto-apply pending migrations / ensure schema on startup ─────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    // Try to apply migrations first (works for fresh DBs or DBs with migration history)
    try { db.Database.Migrate(); }
    catch { db.Database.EnsureCreated(); }

    // Always ensure new columns exist (handles DBs originally created with EnsureCreated)
    try
    {
        db.Database.ExecuteSqlRaw(
            @"ALTER TABLE ""AspNetUsers"" ADD COLUMN IF NOT EXISTS ""PhotoBase64"" text;");
    }
    catch { /* Column already exists or DB provider doesn't support IF NOT EXISTS */ }
}

app.Run();
