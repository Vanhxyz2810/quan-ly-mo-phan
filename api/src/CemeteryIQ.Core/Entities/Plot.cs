namespace CemeteryIQ.Core.Entities;

/// <summary>
/// Ô mộ — đơn vị quản lý chính trên bản đồ GIS
/// </summary>
public class Plot
{
    public string Id { get; set; } = string.Empty;   // "A-01", "B-12"
    public string ZoneId { get; set; } = string.Empty;
    public int Row { get; set; }
    public int Col { get; set; }
    public PlotStatus Status { get; set; } = PlotStatus.Available;
    public int Width { get; set; } = 110;
    public int Height { get; set; } = 70;

    // Navigation
    public Zone Zone { get; set; } = null!;
    public Deceased? Deceased { get; set; }
    public NextOfKin? NextOfKin { get; set; }
    public MaintenancePlan? Maintenance { get; set; }
    public ICollection<ServiceOrder> ServiceOrders { get; set; } = new List<ServiceOrder>();
}

public enum PlotStatus
{
    Available,
    Occupied,
    Reserved
}
