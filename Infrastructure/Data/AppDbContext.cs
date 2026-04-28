using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ResumeMatcher.Api.Domain.Entities;

namespace ResumeMatcher.Api.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Resume> Resumes => Set<Resume>();
    public DbSet<JobDescription> JobDescriptions => Set<JobDescription>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<SavedAnalysis> SavedAnalyses => Set<SavedAnalysis>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Resume>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(256).IsRequired();
            entity.Property(e => e.ExtractedText).IsRequired();
        });

        modelBuilder.Entity<JobDescription>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SourceUrl).HasMaxLength(2048);
            entity.Property(e => e.Title).HasMaxLength(512);
            entity.Property(e => e.RawText).IsRequired();
        });

        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Resume)
                  .WithMany()
                  .HasForeignKey(e => e.ResumeId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(e => e.JobDescription)
                  .WithMany()
                  .HasForeignKey(e => e.JobDescriptionId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SavedAnalysis>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.ResumeFileName).HasMaxLength(256).IsRequired();
            entity.Property(e => e.JobSource).HasMaxLength(2048).IsRequired();
            entity.Property(e => e.MatchingKeywordsJson).IsRequired();
            entity.Property(e => e.MissingKeywordsJson).IsRequired();
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
