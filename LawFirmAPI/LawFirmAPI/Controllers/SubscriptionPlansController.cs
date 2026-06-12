// Controllers/SubscriptionPlansController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
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
                .Select(p => new SubscriptionPlanDto
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
                    Features = !string.IsNullOrEmpty(p.Features) 
                        ? System.Text.Json.JsonSerializer.Deserialize<string[]>(p.Features, (System.Text.Json.JsonSerializerOptions)null) 
                        : new string[] { }
                })
                .ToListAsync();

            return Ok(plans);
        }
    }
}