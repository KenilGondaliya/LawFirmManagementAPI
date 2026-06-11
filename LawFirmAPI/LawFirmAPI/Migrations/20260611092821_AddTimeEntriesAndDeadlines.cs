using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LawFirmAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeEntriesAndDeadlines : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "matter_deadlines",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatterId = table.Column<long>(type: "bigint", nullable: false),
                    FirmId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    DeadlineDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    IsMet = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    CreatedBy = table.Column<long>(type: "bigint", nullable: false),
                    Uuid = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_matter_deadlines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_matter_deadlines_firms_FirmId",
                        column: x => x.FirmId,
                        principalTable: "firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_matter_deadlines_matters_MatterId",
                        column: x => x.MatterId,
                        principalTable: "matters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_matter_deadlines_users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "time_entries",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatterId = table.Column<long>(type: "bigint", nullable: false),
                    FirmId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Duration = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Billable = table.Column<bool>(type: "boolean", nullable: false),
                    BillingRate = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    Uuid = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_time_entries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_time_entries_firms_FirmId",
                        column: x => x.FirmId,
                        principalTable: "firms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_time_entries_matters_MatterId",
                        column: x => x.MatterId,
                        principalTable: "matters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_time_entries_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_matter_deadlines_CreatedBy",
                table: "matter_deadlines",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_matter_deadlines_FirmId",
                table: "matter_deadlines",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_matter_deadlines_MatterId",
                table: "matter_deadlines",
                column: "MatterId");

            migrationBuilder.CreateIndex(
                name: "IX_time_entries_FirmId",
                table: "time_entries",
                column: "FirmId");

            migrationBuilder.CreateIndex(
                name: "IX_time_entries_MatterId",
                table: "time_entries",
                column: "MatterId");

            migrationBuilder.CreateIndex(
                name: "IX_time_entries_UserId",
                table: "time_entries",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "matter_deadlines");

            migrationBuilder.DropTable(
                name: "time_entries");
        }
    }
}
