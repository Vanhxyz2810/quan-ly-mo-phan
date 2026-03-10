namespace CemeteryIQ.Core.Entities;

/// <summary>
/// Gói duy tu / chăm sóc mộ phần
/// </summary>
public class MaintenancePlan
{
    public int Id { get; set; }
    public string Package { get; set; } = string.Empty;  // "1 năm", "5 năm", "Trọn đời"
    public decimal Price { get; set; }
    public string ExpiryDate { get; set; } = string.Empty;
    public int DaysLeft { get; set; }
    public FeeStatus Status { get; set; } = FeeStatus.Active;

    // FK
    public string PlotId { get; set; } = string.Empty;
    public Plot Plot { get; set; } = null!;
}

public enum FeeStatus
{
    Active,
    Expiring,
    Expired
}
