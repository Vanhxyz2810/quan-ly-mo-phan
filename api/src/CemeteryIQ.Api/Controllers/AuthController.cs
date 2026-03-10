using CemeteryIQ.Core.DTOs;
using CemeteryIQ.Core.Entities;
using CemeteryIQ.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CemeteryIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ITokenService _tokenService;

    public AuthController(UserManager<AppUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Đăng nhập
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            return Unauthorized(new { error = "Email hoặc mật khẩu không đúng" });

        var isValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isValid)
            return Unauthorized(new { error = "Email hoặc mật khẩu không đúng" });

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, user.Email!, user.FullName, user.Role.ToString()));
    }

    /// <summary>
    /// Đăng ký tài khoản
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            return BadRequest(new { error = "Email đã tồn tại" });

        var role = Enum.TryParse<UserRole>(request.Role, true, out var parsed) ? parsed : UserRole.Customer;

        var user = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.Phone,
            Role = role
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(new { error = string.Join("; ", result.Errors.Select(e => e.Description)) });

        var token = _tokenService.GenerateToken(user);
        return CreatedAtAction(nameof(Login), new AuthResponse(token, user.Email!, user.FullName, user.Role.ToString()));
    }
}
