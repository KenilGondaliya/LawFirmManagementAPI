using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawFirmAPI.Migrations
{
    /// <inheritdoc />
    public partial class SimplifySubscriptionPayments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_subscription_payments_firm_subscriptions_SubscriptionId",
                table: "subscription_payments");

            migrationBuilder.DropIndex(
                name: "IX_subscription_payments_SubscriptionId",
                table: "subscription_payments");

            migrationBuilder.DropColumn(
                name: "SubscriptionId",
                table: "subscription_payments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SubscriptionId",
                table: "subscription_payments",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_subscription_payments_SubscriptionId",
                table: "subscription_payments",
                column: "SubscriptionId");

            migrationBuilder.AddForeignKey(
                name: "FK_subscription_payments_firm_subscriptions_SubscriptionId",
                table: "subscription_payments",
                column: "SubscriptionId",
                principalTable: "firm_subscriptions",
                principalColumn: "Id");
        }
    }
}
