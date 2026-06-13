using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LawFirmAPI.Migrations
{
    /// <inheritdoc />
    public partial class MakeSubscriptionIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_subscription_payments_firm_subscriptions_SubscriptionId",
                table: "subscription_payments");

            migrationBuilder.AlterColumn<long>(
                name: "SubscriptionId",
                table: "subscription_payments",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_subscription_payments_firm_subscriptions_SubscriptionId",
                table: "subscription_payments",
                column: "SubscriptionId",
                principalTable: "firm_subscriptions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_subscription_payments_firm_subscriptions_SubscriptionId",
                table: "subscription_payments");

            migrationBuilder.AlterColumn<long>(
                name: "SubscriptionId",
                table: "subscription_payments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_subscription_payments_firm_subscriptions_SubscriptionId",
                table: "subscription_payments",
                column: "SubscriptionId",
                principalTable: "firm_subscriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
