using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Core.Entities;
using CemeteryIQ.Core.Interfaces;
using CemeteryIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class MaintenanceController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _email;

    public MaintenanceController(AppDbContext db, IEmailService email)
    {
        _db = db;
        _email = email;
    }

    /// <summary>
    /// Lấy danh sách phí duy tu (có filter theo trạng thái)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<MaintenanceDto>>> GetAll([FromQuery] string? status = null)
    {
        var query = _db.MaintenancePlans.Include(m => m.Plot).AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<FeeStatus>(status, true, out var fs))
            query = query.Where(m => m.Status == fs);

        var items = await query.OrderBy(m => m.DaysLeft).ToListAsync();

        return Ok(items.Select(m => new MaintenanceDto(
            m.Package, m.Price, m.ExpiryDate, m.DaysLeft, m.Status.ToString().ToLower()
        )).ToList());
    }

    /// <summary>
    /// Gia hạn phí duy tu cho một mộ phần
    /// </summary>
    [HttpPost("{plotId}/renew")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Renew(string plotId, [FromBody] RenewRequest req)
    {
        var plan = await _db.Set<MaintenancePlan>()
            .FirstOrDefaultAsync(m => m.PlotId == plotId);

        if (plan == null)
            return NotFound(new { error = "Không tìm thấy kế hoạch bảo trì" });

        // Tính ExpiryDate mới dựa trên package
        var today = DateTime.Today;
        var baseDate = plan.Status == FeeStatus.Expired ? today : (
            DateTime.TryParseExact(plan.ExpiryDate, "dd/MM/yyyy",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var existingExpiry)
                ? existingExpiry : today);

        var newExpiry = req.Package switch
        {
            "5 năm" => baseDate.AddYears(5),
            "Trọn đời" => baseDate.AddYears(50),
            _ => baseDate.AddYears(1) // "1 năm" mặc định
        };

        plan.Package = req.Package;
        plan.ExpiryDate = newExpiry.ToString("dd/MM/yyyy");
        plan.DaysLeft = (int)(newExpiry - today).TotalDays;
        plan.Status = FeeStatus.Active;
        plan.Price = req.Package switch
        {
            "5 năm" => 6_000_000,
            "Trọn đời" => 20_000_000,
            _ => 1_500_000
        };

        await _db.SaveChangesAsync();
        return Ok(new { message = "Gia hạn thành công", expiryDate = plan.ExpiryDate, daysLeft = plan.DaysLeft });
    }
    /// <summary>
    /// [Demo] Gửi email test nhắc nhở bảo trì tới địa chỉ email chỉ định
    /// </summary>
    [HttpPost("test-email")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> TestEmail([FromBody] TestEmailRequest req)
    {
        await _email.SendMaintenanceReminderAsync(
            req.Email,
            req.Name ?? "Quý khách",
            "DEMO-01",
            "Nguyễn Văn A",
            15
        );
        return Ok(new { message = $"Email test đã gửi tới {req.Email}" });
    }
}

public record RenewRequest(string Package);
public record TestEmailRequest(string Email, string? Name);
