namespace CemeteryIQ.Core.Entities;

/// <summary>
/// Thông tin người quá cố
/// </summary>
public class Deceased
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string BirthDate { get; set; } = string.Empty;
    public string DeathDate { get; set; } = string.Empty;
    public string? Quote { get; set; }

    // FK
    public string PlotId { get; set; } = string.Empty;
    public Plot Plot { get; set; } = null!;
}
