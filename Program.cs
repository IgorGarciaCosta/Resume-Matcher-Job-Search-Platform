using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ResumeMatcher.Api.Application.Interfaces;
using ResumeMatcher.Api.Application.Services;
using ResumeMatcher.Api.Domain.Entities;
using ResumeMatcher.Api.Infrastructure.Data;
using ResumeMatcher.Api.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// ── EF Core + SQLite ──────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

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
    options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
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
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["Authentication:Google:ClientId"]!;
    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"]!;
});

// ── Dependency Injection ──────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();
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
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ── Auto-create database on startup ──────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
