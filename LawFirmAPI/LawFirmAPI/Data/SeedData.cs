// Data/SeedData.cs
using LawFirmAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LawFirmAPI.Data
{
    public static class SeedData
    {
        public static async Task InitializeAsync(ApplicationDbContext context)
        {
            // Seed Subscription Plans if none exist
            if (!await context.SubscriptionPlans.AnyAsync())
            {
                var plans = new List<SubscriptionPlan>
                {
                    new SubscriptionPlan
                    {
                        Name = "Basic",
                        Code = "basic",
                        Description = "For small law firms starting out",
                        PriceMonthly = 29.99m,
                        PriceYearly = 299.99m,
                        MaxUsers = 5,
                        MaxMatters = 100,
                        MaxContacts = 500,
                        MaxStorageMb = 1024,
                        IsActive = true,
                        Features = "{\"features\": [\"Up to 5 users\", \"Basic reporting\", \"Email support\"]}"
                    },
                    new SubscriptionPlan
                    {
                        Name = "Professional",
                        Code = "pro",
                        Description = "For growing law firms",
                        PriceMonthly = 79.99m,
                        PriceYearly = 799.99m,
                        MaxUsers = 20,
                        MaxMatters = 500,
                        MaxContacts = 2000,
                        MaxStorageMb = 5120,
                        IsActive = true,
                        Features = "{\"features\": [\"Up to 20 users\", \"Advanced reporting\", \"Priority support\", \"API access\"]}"
                    },
                    new SubscriptionPlan
                    {
                        Name = "Enterprise",
                        Code = "enterprise",
                        Description = "For large law firms",
                        PriceMonthly = 199.99m,
                        PriceYearly = 1999.99m,
                        MaxUsers = 999,
                        MaxMatters = 9999,
                        MaxContacts = 9999,
                        MaxStorageMb = 20480,
                        IsActive = true,
                        Features = "{\"features\": [\"Unlimited users\", \"Custom reporting\", \"24/7 phone support\", \"API access\", \"Custom integrations\"]}"
                    }
                };

                await context.SubscriptionPlans.AddRangeAsync(plans);
                await context.SaveChangesAsync();
            }
        }
    }
}