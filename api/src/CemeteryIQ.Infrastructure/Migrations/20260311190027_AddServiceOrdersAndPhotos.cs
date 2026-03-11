using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CemeteryIQ.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceOrdersAndPhotos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "Deceaseds",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ServiceOrders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlotId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CustomerId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ServiceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ScheduledDate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceOrders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceOrders_AspNetUsers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ServiceOrders_Plots_PlotId",
                        column: x => x.PlotId,
                        principalTable: "Plots",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_CustomerId",
                table: "ServiceOrders",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_PlotId",
                table: "ServiceOrders",
                column: "PlotId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_Status",
                table: "ServiceOrders",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceOrders");

            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "Deceaseds");
        }
    }
}
