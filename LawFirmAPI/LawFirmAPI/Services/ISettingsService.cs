// Services/ISettingsService.cs - Complete Interface

using System.Threading.Tasks;
using System.Collections.Generic;
using LawFirmAPI.Models.DTOs;
using Microsoft.AspNetCore.Http;

namespace LawFirmAPI.Services
{
    public interface ISettingsService
    {
        // ==================== Profile Settings ====================
        Task<UserProfileDto> GetProfile(long userId, long firmId);
        Task<UserProfileDto> UpdateProfile(long userId, long firmId, UpdateProfileDto updateDto);
        Task<string> UploadAvatar(long userId, long firmId, IFormFile file);
        Task<bool> RemoveAvatar(long userId, long firmId);

        // ==================== Team Management ====================
        Task<List<TeamMemberDto>> GetTeamMembers(long firmId);
        Task<List<RoleDto>> GetRoles(long firmId);
        Task<TeamMemberDto> UpdateMemberRole(long firmId, long userId, string role);
        Task<bool> RemoveTeamMember(long firmId, long userId);
        Task<InviteResponseDto> InviteMember(long firmId, long invitedBy, InviteUserDto inviteDto);
        Task<bool> CancelInvitation(long firmId, long userFirmId);
        Task<int> GetTeamMemberCount(long firmId);

        // ==================== Firm Settings ====================
        Task<FirmSettingsDto> GetFirmSettings(long firmId);
        Task<FirmSettingsDto> UpdateFirmSettings(long firmId, UpdateFirmSettingsDto updateDto);
        Task<BrandingDto> GetBranding(long firmId);
        Task<BrandingDto> UpdateBranding(long firmId, UpdateBrandingDto updateDto);

        // ==================== Plan & Billing ====================
        Task<CurrentPlanDto> GetCurrentPlan(long firmId);
        Task<List<PlanDto>> GetAvailablePlans();
        Task<CurrentPlanDto> ChangePlan(long firmId, string planCode, string billingCycle);
        Task<CurrentPlanDto> CancelSubscription(long firmId);
        Task<List<PaymentMethodDto>> GetPaymentMethods(long firmId);
        Task<PaymentMethodDto> AddPaymentMethod(long firmId, AddPaymentMethodDto addDto);
        Task<bool> RemovePaymentMethod(long firmId, long paymentMethodId);

        // ==================== User Preferences ====================
        Task<UserPreferencesDto> GetUserPreferences(long userId, long firmId);
        Task<UserPreferencesDto> UpdateUserPreferences(long userId, long firmId, UpdateUserPreferencesDto updateDto);

        // ==================== Audit Logs ====================
        Task<AuditLogsResponseDto> GetAuditLogs(long firmId, int page, int pageSize, string? action, string? entityType);

        // ==================== Usage Statistics ====================
        Task<int> GetMatterCount(long firmId);
        Task<int> GetContactCount(long firmId);
        Task<long> GetStorageUsed(long firmId);
        Task<UsageStatisticsDto> GetUsageStatistics(long firmId);
    }
}