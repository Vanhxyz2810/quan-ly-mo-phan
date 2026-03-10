using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Core.Entities;
using CemeteryIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db) => _db = db;

    /// <summary>
    /// Thống kê tổng quan
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var plots = _db.Plots.AsNoTracking();
        var maintenance = _db.MaintenancePlans.AsNoTracking();

        var stats = new DashboardStatsDto(
            TotalPlots: await plots.CountAsync(),
            OccupiedPlots: await plots.CountAsync(p => p.Status == PlotStatus.Occupied),
            AvailablePlots: await plots.CountAsync(p => p.Status == PlotStatus.Available),
            ReservedPlots: await plots.CountAsync(p => p.Status == PlotStatus.Reserved),
            ExpiringMaintenance: await maintenance.CountAsync(m => m.Status == FeeStatus.Expiring),
            ExpiredMaintenance: await maintenance.CountAsync(m => m.Status == FeeStatus.Expired)
        );

        return Ok(stats);
    }
}
