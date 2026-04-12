// Services/FirmContextService.cs
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;

namespace LawFirmAPI.Services
{
    public interface IFirmContextService
    {
        Task<long> GetCurrentFirmId();
        Task<Firm> GetCurrentFirm();
        Task<User> GetCurrentUser();
        Task<long> GetCurrentUserId();
        Task<string> GetCurrentUserRole();
        Task<bool> IsFirmOwner();
        Task<bool> IsFirmAdmin();
        Task<bool> HasPermission(string resource, string action);
        Task<FirmSetting> GetFirmSettings();
    }
    
    public class FirmContextService : IFirmContextService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ApplicationDbContext _context;
        
        public FirmContextService(IHttpContextAccessor httpContextAccessor, ApplicationDbContext context)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }
        
        public async Task<long> GetCurrentFirmId()
        {
            var firmIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("firmId")?.Value;
            if (string.IsNullOrEmpty(firmIdClaim))
                throw new UnauthorizedAccessException("No firm context found");
                
            return long.Parse(firmIdClaim);
        }
        
        public async Task<Firm> GetCurrentFirm()
        {
            var firmId = await GetCurrentFirmId();
            var firm = await _context.Firms
                .Include(f => f.Setting)
                .Include(f => f.Subscription)
                .FirstOrDefaultAsync(f => f.Id == firmId && f.IsActive);
                
            if (firm == null)
                throw new UnauthorizedAccessException("Firm not found or inactive");
                
            return firm;
        }
        
        public async Task<long> GetCurrentUserId()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User not authenticated");
                
            return long.Parse(userIdClaim);
        }
        
        public async Task<User> GetCurrentUser()
        {
            var userId = await GetCurrentUserId();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);
                
            if (user == null)
                throw new UnauthorizedAccessException("User not found or inactive");
                
            return user;
        }
        
        public async Task<string> GetCurrentUserRole()
        {
            var userId = await GetCurrentUserId();
            var firmId = await GetCurrentFirmId();
            
            var userFirm = await _context.UserFirms
                .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.FirmId == firmId && uf.Status == UserFirmStatus.ACTIVE);
                
            return userFirm?.Role.ToString() ?? "VIEWER";
        }
        
        public async Task<bool> IsFirmOwner()
        {
            var role = await GetCurrentUserRole();
            return role == "OWNER";
        }
        
        public async Task<bool> IsFirmAdmin()
        {
            var role = await GetCurrentUserRole();
            return role == "OWNER" || role == "ADMIN";
        }
        
        public async Task<bool> HasPermission(string resource, string action)
        {
            // Implement permission checking logic
            var role = await GetCurrentUserRole();
            
            // Owners and Admins have all permissions
            if (role == "OWNER" || role == "ADMIN")
                return true;
                
            // Managers have most permissions except settings
            if (role == "MANAGER")
            {
                if (resource == "settings")
                    return false;
                return true;
            }
            
            // Staff have limited permissions
            if (role == "STAFF")
            {
                var restrictedResources = new[] { "settings", "billing", "user" };
                if (Array.Exists(restrictedResources, r => r == resource))
                    return false;
                return true;
            }
            
            // Viewers can only view
            if (role == "VIEWER")
            {
                return action == "view";
            }
            
            return false;
        }
        
        public async Task<FirmSetting> GetFirmSettings()
        {
            var firm = await GetCurrentFirm();
            if (firm.Setting == null)
            {
                firm.Setting = new FirmSetting { FirmId = firm.Id };
                _context.FirmSettings.Add(firm.Setting);
                await _context.SaveChangesAsync();
            }
            return firm.Setting;
        }
    }
}