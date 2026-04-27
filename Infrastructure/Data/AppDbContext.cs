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
    }
}
