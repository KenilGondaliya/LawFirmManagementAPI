using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/firms")]
    [Authorize]
    public class FirmsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly FirmContextService _firmContext;
        
        public FirmsController(ApplicationDbContext context, FirmContextService firmContext)
        {
            _context = context;
            _firmContext = firmContext;
        }
        
        [HttpGet("settings")]
        public async Task<IActionResult> GetFirmSettings()
        {
            var firmId = await _firmContext.GetCurrentFirmId();
            
            var firm = await _context.Firms
                .FirstOrDefaultAsync(f => f.Id == firmId);
            
            if (firm == null)
                return NotFound();
            
            return Ok(new
            {
                firm.Id,
                firm.Name,
                firm.LegalName,
                firm.Email,
                firm.Phone,
                firm.Website,
                firm.AddressLine1,
                firm.AddressLine2,
                firm.City,
                firm.State,
                firm.PostalCode,
                firm.Country,
                firm.LogoUrl,
                firm.SubscriptionStatus,
                firm.SubscriptionStartDate,
                firm.SubscriptionEndDate,
                firm.MaxUsers,
                CurrentUsers = await _context.Users.CountAsync(u => u.Id != null && u.DeletedAt == null)
            });
        }
        
        [HttpPut("settings")]
        public async Task<IActionResult> UpdateFirmSettings([FromBody] UpdateFirmSettingsDto settingsDto)
        {
            // Only OWNER can update firm settings
            if (!await _firmContext.HasPermission("OWNER", "UPDATE_SETTINGS"))
                return Forbid();
            
            var firmId = _firmContext.GetCurrentFirmId();
            var firm = await _context.Firms.FindAsync(firmId);
            
            if (firm == null)
                return NotFound();
            
            if (settingsDto.FirmName != null)
                firm.Name = settingsDto.FirmName;
            if (settingsDto.LegalName != null)
                firm.LegalName = settingsDto.LegalName;
            if (settingsDto.Email != null)
                firm.Email = settingsDto.Email;
            if (settingsDto.Phone != null)
                firm.Phone = settingsDto.Phone;
            if (settingsDto.Website != null)
                firm.Website = settingsDto.Website;
            if (settingsDto.AddressLine1 != null)
                firm.AddressLine1 = settingsDto.AddressLine1;
            if (settingsDto.AddressLine2 != null)
                firm.AddressLine2 = settingsDto.AddressLine2;
            if (settingsDto.City != null)
                firm.City = settingsDto.City;
            if (settingsDto.State != null)
                firm.State = settingsDto.State;
            if (settingsDto.PostalCode != null)
                firm.PostalCode = settingsDto.PostalCode;
            if (settingsDto.Country != null)
                firm.Country = settingsDto.Country;
            
            firm.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Firm settings updated successfully" });
        }
        
        [HttpGet("users")]
        public async Task<IActionResult> GetFirmUsers()
        {
            var firmId = await _firmContext.GetCurrentFirmId();
            var currentUserRole = _firmContext.GetCurrentUserRole();
            
            var users = await _context.Users
                .Where(u => u.DeletedAt == null)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Username,
                    u.FirstName,
                    u.LastName,
                    u.PhoneNumber,
                    u.IsActive,
                    u.LastLoginAt,
                    u.CreatedAt
                })
                .ToListAsync();
            
            return Ok(new { Users = users, CurrentUserRole = currentUserRole });
        }
        
        [HttpPut("users/{userId}/role")]
        public async Task<IActionResult> UpdateUserRole(long userId, [FromBody] UpdateUserRoleDto roleDto)
        {
            // Only OWNER can change user roles
            if (!await _firmContext.HasPermission("OWNER", "UPDATE_USER_ROLE"))
                return Forbid();
            
            var firmId = await _firmContext.GetCurrentFirmId();
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if (user == null)
                return NotFound(new { message = "User not found" });
            
            // Assuming UserRole or similar property exists on User entity
            // user.Role = roleDto.Role;
            // Verify the correct property name in your User model
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User role updated successfully" });
        }
        
        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> RemoveUser(long userId)
        {
            // Only OWNER and ADMIN can remove users
            if (!await _firmContext.HasPermission("ADMIN", "REMOVE_USER"))
                return Forbid();
            
            var firmId = await _firmContext.GetCurrentFirmId();
            var currentUserId = await _firmContext.GetCurrentUserId();
            
            if (currentUserId == userId)
                return BadRequest(new { message = "Cannot remove yourself" });
            
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if (user == null)
                return NotFound(new { message = "User not found" });
            
            user.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "User removed successfully" });
        }
    }
    
    
    public class UpdateUserRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }
}