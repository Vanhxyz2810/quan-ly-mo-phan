using Microsoft.AspNetCore.Identity;

namespace CemeteryIQ.Core.Entities;

/// <summary>
/// Người dùng hệ thống — extends IdentityUser
/// </summary>
public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
}

public enum UserRole
{
    Admin,
    Staff,
    Customer
}
