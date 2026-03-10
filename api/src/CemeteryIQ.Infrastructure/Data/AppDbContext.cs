using CemeteryIQ.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CemeteryIQ.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<Plot> Plots => Set<Plot>();
    public DbSet<Deceased> Deceaseds => Set<Deceased>();
    public DbSet<NextOfKin> NextOfKins => Set<NextOfKin>();
    public DbSet<MaintenancePlan> MaintenancePlans => Set<MaintenancePlan>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Zone
        builder.Entity<Zone>(e =>
        {
            e.HasKey(z => z.Id);
            e.Property(z => z.Id).HasMaxLength(10);
            e.Property(z => z.Name).HasMaxLength(50);
            e.Property(z => z.Label).HasMaxLength(50);
            e.Property(z => z.Color).HasMaxLength(20);
        });

        // Plot
        builder.Entity<Plot>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasMaxLength(20);
            e.Property(p => p.ZoneId).HasMaxLength(10);

            e.Property(p => p.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            e.HasOne(p => p.Zone)
                .WithMany(z => z.Plots)
                .HasForeignKey(p => p.ZoneId);

            e.HasIndex(p => new { p.ZoneId, p.Row, p.Col }).IsUnique();
        });

        // Deceased — 1:1 with Plot
        builder.Entity<Deceased>(e =>
        {
            e.HasKey(d => d.Id);
            e.Property(d => d.PlotId).HasMaxLength(20);
            e.Property(d => d.Name).HasMaxLength(100);

            e.HasOne(d => d.Plot)
                .WithOne(p => p.Deceased)
                .HasForeignKey<Deceased>(d => d.PlotId);

            e.HasIndex(d => d.PlotId).IsUnique();
            e.HasIndex(d => d.Name); // for search
        });

        // NextOfKin — 1:1 with Plot
        builder.Entity<NextOfKin>(e =>
        {
            e.HasKey(n => n.Id);
            e.Property(n => n.PlotId).HasMaxLength(20);
            e.Property(n => n.Name).HasMaxLength(100);
            e.Property(n => n.Phone).HasMaxLength(20);
            e.Property(n => n.Email).HasMaxLength(100);

            e.HasOne(n => n.Plot)
                .WithOne(p => p.NextOfKin)
                .HasForeignKey<NextOfKin>(n => n.PlotId);

            e.HasIndex(n => n.PlotId).IsUnique();
        });

        // MaintenancePlan — 1:1 with Plot
        builder.Entity<MaintenancePlan>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.PlotId).HasMaxLength(20);
            e.Property(m => m.Package).HasMaxLength(50);
            e.Property(m => m.Price).HasColumnType("decimal(18,2)");

            e.Property(m => m.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            e.HasOne(m => m.Plot)
                .WithOne(p => p.Maintenance)
                .HasForeignKey<MaintenancePlan>(m => m.PlotId);

            e.HasIndex(m => m.PlotId).IsUnique();
            e.HasIndex(m => m.Status); // for heatmap/dashboard
        });

        // Seed zones
        builder.Entity<Zone>().HasData(
            new Zone { Id = "A", Name = "A", Label = "KHU A", Rows = 5, Cols = 6, Color = "#1B4332" },
            new Zone { Id = "B", Name = "B", Label = "KHU B", Rows = 5, Cols = 6, Color = "#14532D" },
            new Zone { Id = "C", Name = "C", Label = "KHU C", Rows = 6, Cols = 8, Color = "#1A3C34" },
            new Zone { Id = "D", Name = "D", Label = "KHU D", Rows = 5, Cols = 8, Color = "#1B4332" }
        );
    }
}
