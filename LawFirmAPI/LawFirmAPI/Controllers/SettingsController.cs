// Controllers/SettingsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;
using UpdateFirmSettingsDto = LawFirmAPI.Models.DTOs.UpdateFirmSettingsDto;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/settings")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsService _settingsService;
        private readonly IFirmContextService _firmContextService;

        public SettingsController(ISettingsService settingsService, IFirmContextService firmContextService)
        {
            _settingsService = settingsService;
            _firmContextService = firmContextService;
        }

        // Profile Settings
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var profile = await _settingsService.GetProfile(userId, firmId);
            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var profile = await _settingsService.UpdateProfile(userId, firmId, updateDto);
            return Ok(new { message = "Profile updated successfully", profile });
        }

        [HttpPost("profile/avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var avatarUrl = await _settingsService.UploadAvatar(userId, firmId, file);
            return Ok(new { message = "Avatar uploaded successfully", avatarUrl });
        }

        [HttpDelete("profile/avatar")]
        public async Task<IActionResult> RemoveAvatar()
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _settingsService.RemoveAvatar(userId, firmId);
            if (!result)
                return NotFound(new { message = "Avatar not found" });
            return Ok(new { message = "Avatar removed successfully" });
        }

        // Team Management
        [HttpGet("teams")]
        public async Task<IActionResult> GetTeamMembers()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var members = await _settingsService.GetTeamMembers(firmId);
            return Ok(members);
        }

        [HttpGet("teams/roles")]
        public async Task<IActionResult> GetRoles()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var roles = await _settingsService.GetRoles(firmId);
            return Ok(roles);
        }

        [HttpPut("teams/members/{userId}/role")]
        public async Task<IActionResult> UpdateMemberRole(long userId, [FromQuery] string role)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var member = await _settingsService.UpdateMemberRole(firmId, userId, role);
            return Ok(new { message = "Role updated successfully", member });
        }

        [HttpDelete("teams/members/{userId}")]
        public async Task<IActionResult> RemoveTeamMember(long userId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _settingsService.RemoveTeamMember(firmId, userId);
            if (!result)
                return NotFound(new { message = "Team member not found" });
            return Ok(new { message = "Team member removed successfully" });
        }

        [HttpPost("teams/invite")]
        public async Task<IActionResult> InviteMember([FromBody] InviteUserDto inviteDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var invitedBy = await _firmContextService.GetCurrentUserId();
            var result = await _settingsService.InviteMember(firmId, invitedBy, inviteDto);
            return Ok(new { message = "Invitation sent successfully", result });
        }

        [HttpDelete("teams/invitations/{userFirmId}")]
        public async Task<IActionResult> CancelInvitation(long userFirmId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _settingsService.CancelInvitation(firmId, userFirmId);
            if (!result)
                return NotFound(new { message = "Invitation not found" });
            return Ok(new { message = "Invitation cancelled successfully" });
        }

        // Firm Settings
        [HttpGet("firm")]
        public async Task<IActionResult> GetFirmSettings()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var settings = await _settingsService.GetFirmSettings(firmId);
            return Ok(settings);
        }

        [HttpPut("firm")]
        public async Task<IActionResult> UpdateFirmSettings([FromBody] UpdateFirmSettingsDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var settings = await _settingsService.UpdateFirmSettings(firmId, updateDto);
            return Ok(new { message = "Firm settings updated successfully", settings });
        }

        [HttpGet("firm/branding")]
        public async Task<IActionResult> GetBranding()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var branding = await _settingsService.GetBranding(firmId);
            return Ok(branding);
        }

        [HttpPut("firm/branding")]
        public async Task<IActionResult> UpdateBranding([FromForm] UpdateBrandingDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var branding = await _settingsService.UpdateBranding(firmId, updateDto);
            return Ok(new { message = "Branding updated successfully", branding });
        }

        // Plan & Billing
        [HttpGet("plan")]
        public async Task<IActionResult> GetCurrentPlan()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var plan = await _settingsService.GetCurrentPlan(firmId);
            return Ok(plan);
        }

        [HttpGet("plans")]
        public async Task<IActionResult> GetAvailablePlans()
        {
            var plans = await _settingsService.GetAvailablePlans();
            return Ok(plans);
        }

        [HttpPost("plan/change")]
        public async Task<IActionResult> ChangePlan([FromQuery] string planCode, [FromQuery] string billingCycle = "monthly")
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var plan = await _settingsService.ChangePlan(firmId, planCode, billingCycle);
            return Ok(new { message = "Plan changed successfully", plan });
        }

        [HttpPost("plan/cancel")]
        public async Task<IActionResult> CancelSubscription()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var plan = await _settingsService.CancelSubscription(firmId);
            return Ok(new { message = "Subscription cancelled successfully", plan });
        }

        [HttpGet("billing/methods")]
        public async Task<IActionResult> GetPaymentMethods()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var methods = await _settingsService.GetPaymentMethods(firmId);
            return Ok(methods);
        }

        [HttpPost("billing/methods")]
        public async Task<IActionResult> AddPaymentMethod([FromBody] AddPaymentMethodDto addDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var method = await _settingsService.AddPaymentMethod(firmId, addDto);
            return Ok(new { message = "Payment method added successfully", method });
        }

        [HttpDelete("billing/methods/{id}")]
        public async Task<IActionResult> RemovePaymentMethod(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _settingsService.RemovePaymentMethod(firmId, id);
            if (!result)
                return NotFound(new { message = "Payment method not found" });
            return Ok(new { message = "Payment method removed successfully" });
        }

        // User Preferences
        [HttpGet("preferences")]
        public async Task<IActionResult> GetUserPreferences()
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var preferences = await _settingsService.GetUserPreferences(userId, firmId);
            return Ok(preferences);
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdateUserPreferences([FromBody] UpdateUserPreferencesDto updateDto)
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var preferences = await _settingsService.UpdateUserPreferences(userId, firmId, updateDto);
            return Ok(new { message = "Preferences updated successfully", preferences });
        }

        // Audit Logs
        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string? action = null,
            [FromQuery] string? entityType = null)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var logs = await _settingsService.GetAuditLogs(firmId, page, pageSize, action, entityType);
            return Ok(logs);
        }
    }
}