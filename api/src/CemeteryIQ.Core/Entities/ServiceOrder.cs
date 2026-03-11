namespace CemeteryIQ.Core.Entities;

/// <summary>
/// Đơn dịch vụ: chăm sóc, hoa tươi, dâng hương
/// </summary>
public class ServiceOrder
{
    public int Id { get; set; }
    public string PlotId { get; set; } = string.Empty;
    public string CustomerId { get; set; } = string.Empty; // AppUser.Id
    public string ServiceType { get; set; } = string.Empty; // "care" | "flower" | "incense"
    public string ScheduledDate { get; set; } = string.Empty; // "dd/MM/yyyy"
    public string? Note { get; set; }
    public decimal Price { get; set; }
    public ServiceOrderStatus Status { get; set; } = ServiceOrderStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Plot Plot { get; set; } = null!;
    public AppUser Customer { get; set; } = null!;
}

public enum ServiceOrderStatus
{
    Pending,
    Confirmed,
    Completed,
    Cancelled
}
