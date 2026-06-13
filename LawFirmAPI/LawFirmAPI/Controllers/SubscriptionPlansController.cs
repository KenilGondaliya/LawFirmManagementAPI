// Controllers/SubscriptionPlansController.cs - Safe deserialization

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/subscription-plans")]
    [AllowAnonymous]
    public class SubscriptionPlansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SubscriptionPlansController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPlans()
        {
            var plans = await _context.SubscriptionPlans
                .Where(p => p.IsActive)
                .ToListAsync();

            var planDtos = plans.Select(p => new SubscriptionPlanDto
            {
                Id = p.Id,
                Name = p.Name,
                Code = p.Code,
                Description = p.Description,
                PriceMonthly = p.PriceMonthly,
                PriceYearly = p.PriceYearly,
                MaxUsers = p.MaxUsers,
                MaxMatters = p.MaxMatters,
                MaxContacts = p.MaxContacts,
                MaxStorageMb = p.MaxStorageMb,
                IsPopular = p.Code == "pro",
                Features = ParseFeatures(p.Features, p.Code)
            }).ToList();

            return Ok(planDtos);
        }
        
        private string[] ParseFeatures(string? featuresJson, string planCode)
        {
            if (string.IsNullOrEmpty(featuresJson))
                return GetDefaultFeatures(planCode);
            
            try
            {
                var features = JsonSerializer.Deserialize<string[]>(featuresJson);
                if (features != null && features.Length > 0)
                    return features;
            }
            catch
            {
                try
                {
                    if (!featuresJson.TrimStart().StartsWith("["))
                    {
                        return new[] { featuresJson };
                    }
                }
                catch { }
            }
            
            return GetDefaultFeatures(planCode);
        }
        
        private string[] GetDefaultFeatures(string planCode)
        {
            return planCode?.ToLower() switch
            {
                "basic" => new[] { "Up to 5 users", "1GB storage", "Basic support", "Core features", "Email support" },
                "pro" => new[] { "Up to 50 users", "10GB storage", "Priority support", "Advanced features", "Analytics dashboard", "API access", "Email & Chat support" },
                "enterprise" => new[] { "Unlimited users", "100GB storage", "24/7 phone support", "Custom features", "Dedicated account manager", "SLA guarantee", "On-premise option" },
                _ => new[] { "Basic features", "Email support" }
            };
        }
    }
}