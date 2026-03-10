namespace CemeteryIQ.Core.DTOs;

// ── Zone ──
public sealed record ZoneDto(
    string Id,
    string Name,
    string Label,
    int Rows,
    int Cols,
    string Color);

// ── Plot ──
public sealed record PlotDto(
    string Id,
    string Zone,
    int Row,
    int Col,
    string Status,
    int Width,
    int Height,
    PlotDataDto? Data);

public sealed record PlotDataDto(
    DeceasedDto? Deceased,
    NextOfKinDto? NextOfKin,
    MaintenanceDto? Maintenance);

public sealed record DeceasedDto(
    string Name,
    string BirthDate,
    string DeathDate,
    string? Quote);

public sealed record NextOfKinDto(
    string Name,
    string Relationship,
    string Phone,
    string Email);

public sealed record MaintenanceDto(
    string Package,
    decimal Price,
    string ExpiryDate,
    int DaysLeft,
    string Status);

// ── Requests ──
public sealed record CreatePlotRequest(
    string Zone,
    int Row,
    int Col,
    string Status);

public sealed record UpdatePlotRequest(
    string? Status,
    DeceasedDto? Deceased,
    NextOfKinDto? NextOfKin,
    MaintenanceDto? Maintenance);

public sealed record MovePlotRequest(
    int ToRow,
    int ToCol);

public sealed record ReserveRequest(
    DeceasedDto Deceased,
    NextOfKinDto NextOfKin,
    string Package);

// ── Auth ──
public sealed record LoginRequest(
    string Email,
    string Password);

public sealed record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    string? Phone,
    string? Role);

public sealed record AuthResponse(
    string Token,
    string Email,
    string FullName,
    string Role);

// ── Dashboard ──
public sealed record DashboardStatsDto(
    int TotalPlots,
    int OccupiedPlots,
    int AvailablePlots,
    int ReservedPlots,
    int ExpiringMaintenance,
    int ExpiredMaintenance);

// ── Search ──
public sealed record SearchResultDto(
    string PlotId,
    string Zone,
    int Row,
    int Col,
    string? DeceasedName,
    string Status);
