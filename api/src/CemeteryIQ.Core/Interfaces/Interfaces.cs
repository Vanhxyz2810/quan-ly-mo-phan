using CemeteryIQ.Core.Entities;

namespace CemeteryIQ.Core.Interfaces;

public interface IPlotRepository
{
    Task<List<Plot>> GetAllAsync(string? zoneId = null, PlotStatus? status = null);
    Task<Plot?> GetByIdAsync(string id);
    Task<Plot> CreateAsync(Plot plot);
    Task<Plot> UpdateAsync(Plot plot);
    Task DeleteAsync(string id);
    Task<List<Plot>> SearchAsync(string query);
}

public interface IZoneRepository
{
    Task<List<Zone>> GetAllAsync();
    Task<Zone?> GetByIdAsync(string id);
}

public interface ITokenService
{
    string GenerateToken(AppUser user);
}

public interface IEmailService
{
    Task SendMaintenanceReminderAsync(string toEmail, string toName, string plotId, string deceasedName, int daysLeft);
}
