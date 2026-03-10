using CemeteryIQ.Core.Entities;
using CemeteryIQ.Core.Interfaces;
using CemeteryIQ.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CemeteryIQ.Infrastructure.Services;

public class MaintenanceWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MaintenanceWorker> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(24);

    public MaintenanceWorker(IServiceScopeFactory scopeFactory, ILogger<MaintenanceWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[MaintenanceWorker] Started");
        while (!stoppingToken.IsCancellationRequested)
        {
            await RunAsync();
            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task RunAsync()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var today = DateTime.Today;
        var plans = await db.Set<MaintenancePlan>()
            .Include(m => m.Plot)
                .ThenInclude(p => p.Deceased)
            .Include(m => m.Plot)
                .ThenInclude(p => p.NextOfKin)
            .ToListAsync();

        int updated = 0, emailsSent = 0;

        foreach (var plan in plans)
        {
            if (DateTime.TryParseExact(plan.ExpiryDate, "dd/MM/yyyy",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var expiry))
            {
                var daysLeft = (int)(expiry - today).TotalDays;
                var newStatus = daysLeft < 0 ? FeeStatus.Expired
                             : daysLeft <= 30 ? FeeStatus.Expiring
                             : FeeStatus.Active;

                if (plan.DaysLeft != daysLeft || plan.Status != newStatus)
                {
                    plan.DaysLeft = daysLeft;
                    plan.Status = newStatus;
                    updated++;
                }

                // Gửi email khi expiring hoặc expired và có NextOfKin email
                if (newStatus != FeeStatus.Active
                    && plan.Plot?.NextOfKin?.Email is { Length: > 0 } email)
                {
                    var nokName = plan.Plot.NextOfKin.Name;
                    var deceasedName = plan.Plot.Deceased?.Name ?? plan.Plot.Id;
                    await emailService.SendMaintenanceReminderAsync(
                        email, nokName, plan.PlotId, deceasedName, daysLeft);
                    emailsSent++;
                }
            }
        }

        await db.SaveChangesAsync();
        _logger.LogInformation("[MaintenanceWorker] Updated {Updated} plans, sent {Emails} email notifications", updated, emailsSent);
    }
}
