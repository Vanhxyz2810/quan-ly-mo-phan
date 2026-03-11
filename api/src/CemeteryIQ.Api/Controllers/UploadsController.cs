using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Infrastructure.Data;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly Cloudinary _cloudinary;

    public UploadsController(AppDbContext db, IConfiguration config)
    {
        _db = db;

        var cloudName = config["Cloudinary:CloudName"] ?? throw new InvalidOperationException("Cloudinary:CloudName missing");
        var apiKey    = config["Cloudinary:ApiKey"]    ?? throw new InvalidOperationException("Cloudinary:ApiKey missing");
        var apiSecret = config["Cloudinary:ApiSecret"] ?? throw new InvalidOperationException("Cloudinary:ApiSecret missing");

        _cloudinary = new Cloudinary(new Account(cloudName, apiKey, apiSecret));
    }

    /// <summary>
    /// Upload ảnh người mất lên Cloudinary
    /// </summary>
    [HttpPost("plots/{plotId}/photo")]
    [Authorize]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<ActionResult<UploadPhotoResponse>> UploadPhoto(string plotId, IFormFile file)
    {
        if (file.Length == 0)
            return BadRequest(new { error = "File rỗng" });

        var ext = Path.GetExtension(file.FileName).ToLower();
        if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp"))
            return BadRequest(new { error = "Chỉ chấp nhận JPG, PNG, WebP" });

        var plot = await _db.Plots.FindAsync(plotId);
        if (plot is null)
            return NotFound(new { error = "Không tìm thấy ô mộ" });

        // Upload to Cloudinary
        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = $"cemeteryiq/plots/{plotId}",
            PublicId = $"{plotId}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            Overwrite = true,
            Transformation = new Transformation().Width(800).Height(800).Crop("limit"),
        };

        var result = await _cloudinary.UploadAsync(uploadParams);
        if (result.Error is not null)
            return StatusCode(500, new { error = $"Upload thất bại: {result.Error.Message}" });

        var url = result.SecureUrl.ToString();

        // Update Deceased.PhotoUrl
        var deceased = await _db.Deceaseds.FindAsync(plotId);
        if (deceased is null)
        {
            // Find by PlotId
            deceased = _db.Deceaseds.FirstOrDefault(d => d.PlotId == plotId);
        }

        if (deceased is not null)
        {
            deceased.PhotoUrl = url;
            await _db.SaveChangesAsync();
        }

        return Ok(new UploadPhotoResponse(url));
    }
}
