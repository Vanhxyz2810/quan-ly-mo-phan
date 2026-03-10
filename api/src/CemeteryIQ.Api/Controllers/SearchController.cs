using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly IPlotRepository _plotRepo;

    public SearchController(IPlotRepository plotRepo) => _plotRepo = plotRepo;

    /// <summary>
    /// Tìm kiếm ô mộ theo ID hoặc tên người quá cố
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<SearchResultDto>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return BadRequest(new { error = "Từ khóa tìm kiếm phải có ít nhất 2 ký tự" });

        var plots = await _plotRepo.SearchAsync(q);
        var results = plots.Select(p => new SearchResultDto(
            p.Id,
            p.ZoneId,
            p.Row,
            p.Col,
            p.Deceased?.Name,
            p.Status.ToString().ToLower()
        )).ToList();

        return Ok(results);
    }
}
