using ResumeMatcher.Api.Domain.Enums;

namespace ResumeMatcher.Api.Domain.Entities;

public class JobApplication
{
    public Guid Id { get; set; }
    public Guid ResumeId { get; set; }
    public Resume Resume { get; set; } = null!;
    public Guid JobDescriptionId { get; set; }
    public JobDescription JobDescription { get; set; } = null!;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;
}
