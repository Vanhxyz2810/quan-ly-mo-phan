using System.Security.Claims;
using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Core.Entities;
using CemeteryIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceOrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    public ServiceOrdersController(AppDbContext db) => _db = db;

    private static readonly Dictionary<string, (string Label, decimal Price)> ServiceCatalog = new()
    {
        ["care"]    = ("Chăm sóc mộ phần", 500_000m),
        ["flower"]  = ("Đặt hoa tươi", 200_000m),
        ["incense"] = ("Dâng hương thay", 100_000m),
    };

    /// <summary>
    /// Khách đặt dịch vụ (care / flower / incense)
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ServiceOrderDto>> Create([FromBody] CreateServiceOrderRequest request)
    {
        var plot = await _db.Plots.FindAsync(request.PlotId);
        if (plot is null)
            return NotFound(new { error = "Không tìm thấy ô mộ" });

        if (!ServiceCatalog.TryGetValue(request.ServiceType, out var svc))
            return BadRequest(new { error = "Loại dịch vụ không hợp lệ (care | flower | incense)" });

        var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var order = new ServiceOrder
        {
            PlotId = request.PlotId,
            CustomerId = customerId,
            ServiceType = request.ServiceType,
            ScheduledDate = request.ScheduledDate,
            Note = request.Note,
            Price = svc.Price,
            Status = ServiceOrderStatus.Pending,
            CreatedAt = DateTime.UtcNow,
        };

        _db.ServiceOrders.Add(order);
        await _db.SaveChangesAsync();

        return Ok(MapToDto(order, User.FindFirstValue(ClaimTypes.Name) ?? ""));
    }

    /// <summary>
    /// Xem đơn dịch vụ theo plot
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<ServiceOrderDto>>> GetAll([FromQuery] string? plotId)
    {
        var query = _db.ServiceOrders.Include(s => s.Customer).AsQueryable();

        if (!string.IsNullOrEmpty(plotId))
            query = query.Where(s => s.PlotId == plotId);

        // Customer chỉ thấy đơn của mình
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (role != "Admin" && role != "Staff")
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            query = query.Where(s => s.CustomerId == userId);
        }

        var orders = await query.OrderByDescending(s => s.CreatedAt).ToListAsync();
        return Ok(orders.Select(o => MapToDto(o, o.Customer?.FullName ?? "")).ToList());
    }

    /// <summary>
    /// Admin/Staff cập nhật trạng thái đơn
    /// </summary>
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<ServiceOrderDto>> UpdateStatus(int id, [FromBody] UpdateServiceOrderStatusRequest request)
    {
        var order = await _db.ServiceOrders.Include(s => s.Customer).FirstOrDefaultAsync(s => s.Id == id);
        if (order is null)
            return NotFound(new { error = "Không tìm thấy đơn dịch vụ" });

        if (!Enum.TryParse<ServiceOrderStatus>(request.Status, true, out var status))
            return BadRequest(new { error = "Trạng thái không hợp lệ" });

        order.Status = status;
        await _db.SaveChangesAsync();

        return Ok(MapToDto(order, order.Customer?.FullName ?? ""));
    }

    /// <summary>
    /// Lấy catalog dịch vụ (public)
    /// </summary>
    [HttpGet("catalog")]
    public ActionResult GetCatalog()
    {
        var catalog = ServiceCatalog.Select(kv => new
        {
            type = kv.Key,
            label = kv.Value.Label,
            price = kv.Value.Price,
        });
        return Ok(catalog);
    }

    private static ServiceOrderDto MapToDto(ServiceOrder o, string customerName) => new(
        o.Id,
        o.PlotId,
        customerName,
        o.ServiceType,
        o.ScheduledDate,
        o.Note,
        o.Price,
        o.Status.ToString().ToLower(),
        o.CreatedAt.ToString("dd/MM/yyyy HH:mm"));
}

public sealed record UpdateServiceOrderStatusRequest(string Status);
