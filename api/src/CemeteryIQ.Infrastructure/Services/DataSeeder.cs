using CemeteryIQ.Core.Entities;
using CemeteryIQ.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CemeteryIQ.Infrastructure.Services;

/// <summary>
/// Seed dữ liệu mẫu — tương đương mockData.ts ở frontend
/// </summary>
public static class DataSeeder
{
    private static readonly string[] Surnames = { "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý" };
    private static readonly string[] MiddleNames = { "Văn", "Thị", "Đức", "Minh", "Thanh", "Hồng", "Quốc", "Ngọc" };
    private static readonly string[] FirstNames = { "An", "Bình", "Cường", "Dũng", "Hà", "Hải", "Hương", "Lan", "Long", "Mai", "Nam", "Phúc", "Quân", "Sơn", "Tâm", "Thảo", "Tùng", "Uyên", "Vinh", "Yến" };
    private static readonly string[] Relationships = { "Con trai", "Con gái", "Vợ", "Chồng", "Cháu", "Em" };
    private static readonly string[] Packages = { "1 năm", "5 năm", "Trọn đời" };
    private static readonly decimal[] Prices = { 2_000_000m, 8_000_000m, 30_000_000m };

    private static double SeededRandom(int seed)
    {
        var x = Math.Sin(seed * 9301 + 49297) * 49297;
        return x - Math.Floor(x);
    }

    private static T Pick<T>(T[] arr, int seed) => arr[(int)Math.Floor(SeededRandom(seed) * arr.Length)];

    private static string GenName(int seed) => $"{Pick(Surnames, seed)} {Pick(MiddleNames, seed + 1)} {Pick(FirstNames, seed + 2)}";

    private static string GenDate(int yearMin, int yearMax, int seed)
    {
        var y = yearMin + (int)Math.Floor(SeededRandom(seed) * (yearMax - yearMin));
        var m = 1 + (int)Math.Floor(SeededRandom(seed + 1) * 12);
        var d = 1 + (int)Math.Floor(SeededRandom(seed + 2) * 28);
        return $"{d:D2}/{m:D2}/{y}";
    }

    private static string GenPhone(int seed)
    {
        var p = "08";
        for (var i = 0; i < 8; i++) p += (int)Math.Floor(SeededRandom(seed + i) * 10);
        return p;
    }

    private record ZoneDef(string Id, int Rows, int Cols);

    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Plots.AnyAsync()) return; // Already seeded

        var zoneDefs = new ZoneDef[]
        {
            new("A", 5, 6),
            new("B", 5, 6),
            new("C", 6, 8),
            new("D", 5, 8)
        };

        var idx = 0;
        foreach (var zone in zoneDefs)
        {
            for (var r = 0; r < zone.Rows; r++)
            {
                for (var c = 0; c < zone.Cols; c++)
                {
                    idx++;
                    var rand = SeededRandom(idx);
                    PlotStatus status;
                    if (rand < 0.55) status = PlotStatus.Occupied;
                    else if (rand < 0.8) status = PlotStatus.Available;
                    else status = PlotStatus.Reserved;

                    var plotId = $"{zone.Id}-{(r * zone.Cols + c + 1):D2}";
                    var plot = new Plot
                    {
                        Id = plotId,
                        ZoneId = zone.Id,
                        Row = r,
                        Col = c,
                        Status = status,
                        Width = 110,
                        Height = 70
                    };
                    db.Plots.Add(plot);

                    if (status == PlotStatus.Occupied)
                    {
                        var daysLeft = (int)Math.Floor(SeededRandom(idx + 100) * 400) - 30;
                        FeeStatus feeStatus;
                        if (daysLeft <= 0) feeStatus = FeeStatus.Expired;
                        else if (daysLeft <= 30) feeStatus = FeeStatus.Expiring;
                        else feeStatus = FeeStatus.Active;

                        db.Deceaseds.Add(new Deceased
                        {
                            Name = GenName(idx),
                            BirthDate = GenDate(1930, 1970, idx + 10),
                            DeathDate = GenDate(2010, 2025, idx + 20),
                            PlotId = plotId
                        });

                        db.NextOfKins.Add(new NextOfKin
                        {
                            Name = GenName(idx + 50),
                            Relationship = Pick(Relationships, idx + 60),
                            Phone = GenPhone(idx + 70),
                            Email = $"{Pick(FirstNames, idx + 80).ToLower()}@gmail.com",
                            PlotId = plotId
                        });

                        var priceIdx = (int)Math.Floor(SeededRandom(idx + 91) * 3);
                        db.MaintenancePlans.Add(new MaintenancePlan
                        {
                            Package = Pick(Packages, idx + 90),
                            Price = Prices[priceIdx],
                            ExpiryDate = GenDate(2025, 2028, idx + 95),
                            DaysLeft = daysLeft,
                            Status = feeStatus,
                            PlotId = plotId
                        });
                    }
                }
            }
        }

        await db.SaveChangesAsync();
    }

    /// <summary>
    /// Seed tài khoản admin mặc định: admin@cemeteryiq.vn / admin123
    /// </summary>
    public static async Task SeedAdminAsync(UserManager<AppUser> userManager)
    {
        const string adminEmail = "admin@cemeteryiq.vn";
        if (await userManager.FindByEmailAsync(adminEmail) is not null) return;

        var admin = new AppUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FullName = "Admin",
            Role = UserRole.Admin,
            EmailConfirmed = true,
        };

        await userManager.CreateAsync(admin, "admin123");
    }
}
