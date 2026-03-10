using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ZonesController : ControllerBase
{
    private readonly IZoneRepository _zoneRepo;

    public ZonesController(IZoneRepository zoneRepo) => _zoneRepo = zoneRepo;

    /// <summary>
    /// Lấy danh sách tất cả khu mộ
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ZoneDto>>> GetAll()
    {
        var zones = await _zoneRepo.GetAllAsync();
        var dtos = zones.Select(z => new ZoneDto(z.Id, z.Name, z.Label, z.Rows, z.Cols, z.Color)).ToList();
        return Ok(dtos);
    }

    /// <summary>
    /// Lấy thông tin 1 khu mộ
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ZoneDto>> GetById(string id)
    {
        var zone = await _zoneRepo.GetByIdAsync(id);
        if (zone is null) return NotFound(new { error = $"Không tìm thấy khu {id}" });
        return Ok(new ZoneDto(zone.Id, zone.Name, zone.Label, zone.Rows, zone.Cols, zone.Color));
    }
}
