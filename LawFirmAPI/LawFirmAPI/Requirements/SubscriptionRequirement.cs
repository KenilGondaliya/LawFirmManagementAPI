// Requirements/SubscriptionRequirement.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;

namespace LawFirmAPI.Requirements
{
    public class SubscriptionRequirement : IAuthorizationRequirement
    {
        public string RequiredPlan { get; }
        
        public SubscriptionRequirement(string requiredPlan)
        {
            RequiredPlan = requiredPlan;
        }
    }
    
    public class SubscriptionHandler : AuthorizationHandler<SubscriptionRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ApplicationDbContext _context;
        
        public SubscriptionHandler(IHttpContextAccessor httpContextAccessor, ApplicationDbContext context)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }
        
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, SubscriptionRequirement requirement)
        {
            var user = context.User;
            if (!user.Identity?.IsAuthenticated ?? true)
            {
                return;
            }
            
            var firmIdClaim = user.FindFirst("firmId")?.Value;
            if (string.IsNullOrEmpty(firmIdClaim))
            {
                return;
            }
            
            var firmId = long.Parse(firmIdClaim);
            
            // Get firm with subscription
            var firm = await _context.Firms
                .Include(f => f.Subscription)
                    .ThenInclude(s => s.Plan)
                .FirstOrDefaultAsync(f => f.Id == firmId);
            
            if (firm == null)
            {
                return;
            }
            
            // Check subscription status
            var subscription = firm.Subscription;
            if (subscription == null || subscription.Status != "ACTIVE")
            {
                // Check if on trial
                if (firm.SubscriptionStatus == SubscriptionStatus.TRIAL && firm.TrialEndDate > DateTime.UtcNow)
                {
                    context.Succeed(requirement);
                    return;
                }
                return;
            }
            
            // Check plan requirement
            var planCode = subscription.Plan?.Code?.ToLower();
            var requiredPlan = requirement.RequiredPlan.ToLower();
            
            if (requiredPlan == "any")
            {
                context.Succeed(requirement);
                return;
            }
            
            var planLevels = new Dictionary<string, int>
            {
                { "basic", 1 },
                { "pro", 2 },
                { "enterprise", 3 }
            };
            
            var currentLevel = planLevels.GetValueOrDefault(planCode ?? "basic", 0);
            var requiredLevel = planLevels.GetValueOrDefault(requiredPlan, 0);
            
            if (currentLevel >= requiredLevel)
            {
                context.Succeed(requirement);
            }
        }
    }
}