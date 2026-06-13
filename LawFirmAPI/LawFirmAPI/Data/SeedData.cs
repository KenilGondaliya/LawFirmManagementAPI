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

        private static async Task SeedSubscriptionPlans(ApplicationDbContext context)
        {
            if (!context.SubscriptionPlans.Any())
            {
                var plans = new[]
                {
            new SubscriptionPlan
            {
                Name = "Basic",
                Code = "basic",
                Description = "Perfect for small law firms starting out",
                PriceMonthly = 0,
                PriceYearly = 0,
                MaxUsers = 5,
                MaxMatters = 50,
                MaxContacts = 200,
                MaxStorageMb = 1024, // 1GB
                Features = System.Text.Json.JsonSerializer.Serialize(new[]
                {
                    "Up to 5 users",
                    "1GB storage",
                    "Basic support",
                    "Core features",
                    "Email support"
                }),
                IsActive = true
            },
            new SubscriptionPlan
            {
                Name = "Pro",
                Code = "pro",
                Description = "Best for growing law firms",
                PriceMonthly = 49,
                PriceYearly = 499,
                MaxUsers = 50,
                MaxMatters = 500,
                MaxContacts = 2000,
                MaxStorageMb = 10240, // 10GB
                Features = System.Text.Json.JsonSerializer.Serialize(new[]
                {
                    "Up to 50 users",
                    "10GB storage",
                    "Priority support",
                    "Advanced features",
                    "Analytics dashboard",
                    "API access",
                    "Email & Chat support"
                }),
                IsActive = true
            },
            new SubscriptionPlan
            {
                Name = "Enterprise",
                Code = "enterprise",
                Description = "For large law firms with custom needs",
                PriceMonthly = 99,
                PriceYearly = 999,
                MaxUsers = 999,
                MaxMatters = 9999,
                MaxContacts = 99999,
                MaxStorageMb = 102400, // 100GB
                Features = System.Text.Json.JsonSerializer.Serialize(new[]
                {
                    "Unlimited users",
                    "100GB storage",
                    "24/7 phone support",
                    "Custom features",
                    "Dedicated account manager",
                    "SLA guarantee",
                    "On-premise option"
                }),
                IsActive = true
            }
        };

                await context.SubscriptionPlans.AddRangeAsync(plans);
                await context.SaveChangesAsync();
            }
        }

    }
}