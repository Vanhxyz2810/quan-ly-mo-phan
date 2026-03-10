namespace CemeteryIQ.Core.Entities;

/// <summary>
/// Khu mộ trong nghĩa trang (A, B, C, D, ...)
/// </summary>
public class Zone
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Rows { get; set; }
    public int Cols { get; set; }
    public string Color { get; set; } = "#1B4332";

    // Navigation
    public ICollection<Plot> Plots { get; set; } = new List<Plot>();
}
