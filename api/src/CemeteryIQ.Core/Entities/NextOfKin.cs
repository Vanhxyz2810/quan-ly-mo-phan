namespace CemeteryIQ.Core.Entities;

/// <summary>
/// Thông tin người thân liên hệ
/// </summary>
public class NextOfKin
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // FK
    public string PlotId { get; set; } = string.Empty;
    public Plot Plot { get; set; } = null!;
}
