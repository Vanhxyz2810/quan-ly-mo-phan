using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Core.Entities;
using CemeteryIQ.Core.Interfaces;
using CemeteryIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlotsController : ControllerBase
{
    private readonly IPlotRepository _plotRepo;
    private readonly AppDbContext _db;

    public PlotsController(IPlotRepository plotRepo, AppDbContext db)
    {
        _plotRepo = plotRepo;
        _db = db;
    }

    /// <summary>
    /// Lấy tất cả ô mộ (có filter theo zone, status)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<PlotDto>>> GetAll(
        [FromQuery] string? zone = null,
        [FromQuery] string? status = null)
    {
        PlotStatus? statusFilter = null;
        if (!string.IsNullOrEmpty(status) && Enum.TryParse<PlotStatus>(status, true, out var s))
            statusFilter = s;

        var plots = await _plotRepo.GetAllAsync(zone, statusFilter);
        return Ok(plots.Select(MapToDto).ToList());
    }

    /// <summary>
    /// Lấy thông tin 1 ô mộ
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PlotDto>> GetById(string id)
    {
        var plot = await _plotRepo.GetByIdAsync(id);
        if (plot is null) return NotFound(new { error = $"Không tìm thấy ô mộ {id}" });
        return Ok(MapToDto(plot));
    }

    /// <summary>
    /// Thêm ô mộ mới (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlotDto>> Create(CreatePlotRequest request)
    {
        var plotId = $"{request.Zone}-{(request.Row * 10 + request.Col + 1):D2}";
        var existing = await _plotRepo.GetByIdAsync(plotId);
        if (existing is not null) return Conflict(new { error = "Ô mộ đã tồn tại" });

        if (!Enum.TryParse<PlotStatus>(request.Status, true, out var status))
            status = PlotStatus.Available;

        var plot = new Plot
        {
            Id = plotId,
            ZoneId = request.Zone,
            Row = request.Row,
            Col = request.Col,
            Status = status,
            Width = 110,
            Height = 70
        };

        await _plotRepo.CreateAsync(plot);
        return CreatedAtAction(nameof(GetById), new { id = plot.Id }, MapToDto(plot));
    }

    /// <summary>
    /// Cập nhật ô mộ (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlotDto>> Update(string id, UpdatePlotRequest request)
    {
        var plot = await _plotRepo.GetByIdAsync(id);
        if (plot is null) return NotFound(new { error = $"Không tìm thấy ô mộ {id}" });

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<PlotStatus>(request.Status, true, out var status))
            plot.Status = status;

        // Update deceased
        if (request.Deceased is not null)
        {
            if (plot.Deceased is null)
            {
                plot.Deceased = new Deceased { PlotId = plot.Id };
                _db.Deceaseds.Add(plot.Deceased);
            }
            plot.Deceased.Name = request.Deceased.Name;
            plot.Deceased.BirthDate = request.Deceased.BirthDate;
            plot.Deceased.DeathDate = request.Deceased.DeathDate;
            plot.Deceased.Quote = request.Deceased.Quote;
        }

        // Update next of kin
        if (request.NextOfKin is not null)
        {
            if (plot.NextOfKin is null)
            {
                plot.NextOfKin = new NextOfKin { PlotId = plot.Id };
                _db.NextOfKins.Add(plot.NextOfKin);
            }
            plot.NextOfKin.Name = request.NextOfKin.Name;
            plot.NextOfKin.Relationship = request.NextOfKin.Relationship;
            plot.NextOfKin.Phone = request.NextOfKin.Phone;
            plot.NextOfKin.Email = request.NextOfKin.Email;
        }

        // Update maintenance
        if (request.Maintenance is not null)
        {
            if (plot.Maintenance is null)
            {
                plot.Maintenance = new MaintenancePlan { PlotId = plot.Id };
                _db.MaintenancePlans.Add(plot.Maintenance);
            }
            plot.Maintenance.Package = request.Maintenance.Package;
            plot.Maintenance.Price = request.Maintenance.Price;
            plot.Maintenance.ExpiryDate = request.Maintenance.ExpiryDate;
            plot.Maintenance.DaysLeft = request.Maintenance.DaysLeft;
            if (Enum.TryParse<FeeStatus>(request.Maintenance.Status, true, out var fs))
                plot.Maintenance.Status = fs;
        }

        await _plotRepo.UpdateAsync(plot);
        return Ok(MapToDto(plot));
    }

    /// <summary>
    /// Di chuyển ô mộ (Admin only)
    /// </summary>
    [HttpPut("{id}/move")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlotDto>> Move(string id, MovePlotRequest request)
    {
        var plot = await _plotRepo.GetByIdAsync(id);
        if (plot is null) return NotFound(new { error = $"Không tìm thấy ô mộ {id}" });

        plot.Row = request.ToRow;
        plot.Col = request.ToCol;
        await _plotRepo.UpdateAsync(plot);
        return Ok(MapToDto(plot));
    }

    /// <summary>
    /// Khách đặt mộ trực tuyến (cần đăng nhập)
    /// </summary>
    [HttpPost("{id}/reserve")]
    [Authorize]
    public async Task<ActionResult<PlotDto>> Reserve(string id, [FromBody] ReserveRequest request)
    {
        var plot = await _plotRepo.GetByIdAsync(id);
        if (plot is null) return NotFound(new { error = $"Không tìm thấy ô mộ {id}" });
        if (plot.Status != PlotStatus.Available)
            return BadRequest(new { error = "Ô mộ này hiện không còn trống" });

        // Lưu thông tin người mất
        if (plot.Deceased is null)
        {
            plot.Deceased = new Deceased { PlotId = plot.Id };
            _db.Deceaseds.Add(plot.Deceased);
        }
        plot.Deceased.Name = request.Deceased.Name;
        plot.Deceased.BirthDate = request.Deceased.BirthDate;
        plot.Deceased.DeathDate = request.Deceased.DeathDate;
        plot.Deceased.Quote = request.Deceased.Quote;

        // Lưu thông tin thân nhân
        if (plot.NextOfKin is null)
        {
            plot.NextOfKin = new NextOfKin { PlotId = plot.Id };
            _db.NextOfKins.Add(plot.NextOfKin);
        }
        plot.NextOfKin.Name = request.NextOfKin.Name;
        plot.NextOfKin.Relationship = request.NextOfKin.Relationship;
        plot.NextOfKin.Phone = request.NextOfKin.Phone;
        plot.NextOfKin.Email = request.NextOfKin.Email;

        // Tạo gói bảo trì
        var (price, months) = request.Package switch
        {
            "5 năm" => (6_000_000m, 60),
            "Trọn đời" => (20_000_000m, 1200),
            _ => (1_500_000m, 12)
        };
        if (plot.Maintenance is null)
        {
            plot.Maintenance = new MaintenancePlan { PlotId = plot.Id };
            _db.MaintenancePlans.Add(plot.Maintenance);
        }
        plot.Maintenance.Package = request.Package;
        plot.Maintenance.Price = price;
        var expiry = DateTime.Now.AddMonths(months);
        plot.Maintenance.ExpiryDate = expiry.ToString("dd/MM/yyyy");
        plot.Maintenance.DaysLeft = (int)(expiry - DateTime.Now).TotalDays;
        plot.Maintenance.Status = FeeStatus.Active;

        plot.Status = PlotStatus.Reserved;
        await _plotRepo.UpdateAsync(plot);
        return Ok(MapToDto(plot));
    }

    /// <summary>
    /// Xóa ô mộ (Admin only)
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var plot = await _plotRepo.GetByIdAsync(id);
        if (plot is null) return NotFound(new { error = $"Không tìm thấy ô mộ {id}" });

        await _plotRepo.DeleteAsync(id);
        return NoContent();
    }

    // ── Helper ──
    private static PlotDto MapToDto(Plot p) => new(
        p.Id,
        p.ZoneId,
        p.Row,
        p.Col,
        p.Status.ToString().ToLower(),
        p.Width,
        p.Height,
        (p.Deceased is not null || p.NextOfKin is not null || p.Maintenance is not null)
            ? new PlotDataDto(
                p.Deceased is not null ? new DeceasedDto(p.Deceased.Name, p.Deceased.BirthDate, p.Deceased.DeathDate, p.Deceased.Quote) : null,
                p.NextOfKin is not null ? new NextOfKinDto(p.NextOfKin.Name, p.NextOfKin.Relationship, p.NextOfKin.Phone, p.NextOfKin.Email) : null,
                p.Maintenance is not null ? new MaintenanceDto(p.Maintenance.Package, p.Maintenance.Price, p.Maintenance.ExpiryDate, p.Maintenance.DaysLeft, p.Maintenance.Status.ToString().ToLower()) : null)
            : null);
}
