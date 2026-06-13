// Services/IFeatureAccessService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace LawFirmAPI.Services
{
    public interface IFeatureAccessService
    {
        Task<bool> CanAccessFeature(long firmId, string featureName);
        Task<bool> CanAccessResource(long firmId, string resourceType, int currentCount);
        Task<int> GetRemainingQuota(long firmId, string resourceType);
        Task<bool> CheckModuleAccess(long firmId, string moduleName);
    }
    
    public class FeatureAccessService : IFeatureAccessService
    {
        private readonly ApplicationDbContext _context;
        
        public FeatureAccessService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper to safely get integer properties via reflection
        private int? GetFirmInt(object firm, string propName)
        {
            if (firm == null) return null;
            var prop = firm.GetType().GetProperty(propName);
            if (prop == null) return null;
            var val = prop.GetValue(firm);
            if (val == null) return null;
            try
            {
                return Convert.ToInt32(val);
            }
            catch
            {
                return null;
            }
        }

        private long? GetFirmNullableLong(object firm, string propName)
        {
            if (firm == null) return null;
            var prop = firm.GetType().GetProperty(propName);
            if (prop == null) return null;
            var val = prop.GetValue(firm);
            if (val == null) return null;
            try
            {
                return Convert.ToInt64(val);
            }
            catch
            {
                return null;
            }
        }
        
        public async Task<bool> CanAccessFeature(long firmId, string featureName)
        {
            var subscription = await _context.FirmSubscriptions
                .Include(s => s.Plan)
                .FirstOrDefaultAsync(s => s.FirmId == firmId && s.Status == "ACTIVE");
            
            if (subscription?.Plan == null)
                return false;
            
            var features = subscription.Plan.Features;
            if (string.IsNullOrEmpty(features))
                return false;
            
            try
            {
                var featureList = System.Text.Json.JsonSerializer.Deserialize<string[]>(features);
                return featureList?.Any(f => f.ToLower().Contains(featureName.ToLower())) ?? false;
            }
            catch
            {
                return false;
            }
        }
        
        public async Task<bool> CanAccessResource(long firmId, string resourceType, int currentCount)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            if (firm == null)
                return false;
            
            var maxLimit = resourceType.ToLower() switch
            {
                "users" => firm.MaxUsers,
                // Use reflection for MaxMatters in case the Firm model doesn't define it on all branches
                "matters" => GetFirmInt(firm, "MaxMatters") ?? int.MaxValue,
                "contacts" => GetFirmInt(firm, "MaxContacts") ?? int.MaxValue,
                "storage" => (int)(firm.MaxStorageMb),
                _ => int.MaxValue
            };
            
            return currentCount < maxLimit;
        }
        
        public async Task<int> GetRemainingQuota(long firmId, string resourceType)
        {
            var firm = await _context.Firms.FindAsync(firmId);
            if (firm == null)
                return 0;
            
            var maxLimit = resourceType.ToLower() switch
            {
                "users" => firm.MaxUsers,
                // fallback defaults provided if MaxMatters/MaxContacts/MaxStorageMb are not present
                "matters" => GetFirmInt(firm, "MaxMatters") ?? 100,
                "contacts" => GetFirmInt(firm, "MaxContacts") ?? 500,
                "storage" => (int)(GetFirmNullableLong(firm, "MaxStorageMb") ?? 1024),
                _ => int.MaxValue
            };
            
            var currentCount = resourceType.ToLower() switch
            {
                "users" => await _context.UserFirms.CountAsync(uf => uf.FirmId == firmId && uf.Status == UserFirmStatus.ACTIVE),
                "matters" => await _context.Matters.CountAsync(m => m.FirmId == firmId && m.DeletedAt == null),
                "contacts" => await _context.Contacts.CountAsync(c => c.FirmId == firmId && c.DeletedAt == null),
                "storage" => await _context.Documents.Where(d => d.FirmId == firmId).SumAsync(d => d.FileSize) / (1024 * 1024),
                _ => 0
            };
            
            return (int)Math.Max(0, maxLimit - currentCount);
        }
        
        public async Task<bool> CheckModuleAccess(long firmId, string moduleName)
        {
            var subscription = await _context.FirmSubscriptions
                .Include(s => s.Plan)
                .FirstOrDefaultAsync(s => s.FirmId == firmId && s.Status == "ACTIVE");
            
            if (subscription?.Plan == null)
                return false;
            
            // Define module access by plan
            var moduleAccess = new Dictionary<string, string[]>
            {
                { "basic", new[] { "dashboard", "contacts", "matters", "calendar" } },
                { "pro", new[] { "dashboard", "contacts", "matters", "calendar", "tasks", "documents", "billing", "analytics" } },
                { "enterprise", new[] { "dashboard", "contacts", "matters", "calendar", "tasks", "documents", "billing", "analytics", "api", "custom_reports" } }
            };
            
            var planCode = subscription.Plan.Code?.ToLower() ?? "basic";
            var accessibleModules = moduleAccess.GetValueOrDefault(planCode, new[] { "dashboard" });
            
            return accessibleModules.Contains(moduleName.ToLower());
        }
    }
}