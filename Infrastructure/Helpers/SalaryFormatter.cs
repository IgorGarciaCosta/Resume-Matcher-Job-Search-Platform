namespace ResumeMatcher.Api.Infrastructure.Helpers;

public static class SalaryFormatter
{
    public static string? FormatSalary(double? min, double? max, string? currency = "USD", string? period = "year")
    {
        if (min is null && max is null) return null;

        var cur = currency ?? "USD";
        var per = NormalizePeriod(period);

        if (min is not null && max is not null)
        {
            if (Math.Abs(min.Value - max.Value) < 1)
                return $"{cur} {min:N0}{per}";
            return $"{cur} {min:N0}-{max:N0}{per}";
        }

        if (min is not null)
            return $"{cur} {min:N0}+{per}";

        return $"{cur} up to {max:N0}{per}";
    }

    private static string NormalizePeriod(string? period) => period?.ToLowerInvariant() switch
    {
        "year" or "yearly" => "/year",
        "month" or "monthly" => "/month",
        "hour" or "hourly" => "/hour",
        "week" or "weekly" => "/week",
        null or "" => "/year",
        _ => $"/{period}"
    };
}
