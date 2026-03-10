using CemeteryIQ.Core.Entities;
using CemeteryIQ.Core.Interfaces;
using CemeteryIQ.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CemeteryIQ.Infrastructure.Repositories;

public class PlotRepository : IPlotRepository
{
    private readonly AppDbContext _db;

    public PlotRepository(AppDbContext db) => _db = db;

    public async Task<List<Plot>> GetAllAsync(string? zoneId = null, PlotStatus? status = null)
    {
        var query = _db.Plots
            .Include(p => p.Deceased)
            .Include(p => p.NextOfKin)
            .Include(p => p.Maintenance)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrEmpty(zoneId))
            query = query.Where(p => p.ZoneId == zoneId);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        return await query.OrderBy(p => p.ZoneId).ThenBy(p => p.Row).ThenBy(p => p.Col).ToListAsync();
    }

    public async Task<Plot?> GetByIdAsync(string id)
    {
        return await _db.Plots
            .Include(p => p.Deceased)
            .Include(p => p.NextOfKin)
            .Include(p => p.Maintenance)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Plot> CreateAsync(Plot plot)
    {
        _db.Plots.Add(plot);
        await _db.SaveChangesAsync();
        return plot;
    }

    public async Task<Plot> UpdateAsync(Plot plot)
    {
        _db.Plots.Update(plot);
        await _db.SaveChangesAsync();
        return plot;
    }

    public async Task DeleteAsync(string id)
    {
        var plot = await _db.Plots.FindAsync(id);
        if (plot is not null)
        {
            _db.Plots.Remove(plot);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<List<Plot>> SearchAsync(string query)
    {
        var q = query.ToLower();
        return await _db.Plots
            .Include(p => p.Deceased)
            .Include(p => p.NextOfKin)
            .Include(p => p.Maintenance)
            .AsNoTracking()
            .Where(p =>
                p.Id.ToLower().Contains(q) ||
                (p.Deceased != null && p.Deceased.Name.ToLower().Contains(q)))
            .OrderBy(p => p.Id)
            .Take(50)
            .ToListAsync();
    }
}

public class ZoneRepository : IZoneRepository
{
    private readonly AppDbContext _db;

    public ZoneRepository(AppDbContext db) => _db = db;

    public async Task<List<Zone>> GetAllAsync()
    {
        return await _db.Zones.AsNoTracking().OrderBy(z => z.Id).ToListAsync();
    }

    public async Task<Zone?> GetByIdAsync(string id)
    {
        return await _db.Zones.AsNoTracking().FirstOrDefaultAsync(z => z.Id == id);
    }
}
