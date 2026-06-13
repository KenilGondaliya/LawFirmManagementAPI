// Models/DTOs/SettingsDTOs.cs - Complete with all DTOs

using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    // ==================== Profile DTOs ====================
    
    public class UpdateProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
    }
    
    // ==================== Team Management DTOs ====================
    
    public class InviteUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = "STAFF";
    }
    
    public class TeamMemberDto
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? JoinedAt { get; set; }
        public DateTime? InvitedAt { get; set; }
        public string? ProfileImageUrl { get; set; }
    }
    
    public class RoleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new();
    }
    
    public class InviteResponseDto
    {
        public long UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
    
    // ==================== Firm Settings DTOs ====================
    
    public class FirmSettingsDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LegalName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? TaxNumber { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? LogoUrl { get; set; }
        public string Timezone { get; set; } = "UTC";
        public string DateFormat { get; set; } = "MM/DD/YYYY";
        public string Currency { get; set; } = "USD";
    }
    
    public class UpdateFirmSettingsDto
    {
        public string? Name { get; set; }
        public string? LegalName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? TaxNumber { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? Timezone { get; set; }
        public string? DateFormat { get; set; }
        public string? Currency { get; set; }
    }
    
    public class BrandingDto
    {
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
    }
    
    public class UpdateBrandingDto
    {
        public IFormFile? Logo { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
    }
    
    // ==================== Plan & Billing DTOs ====================
    
    public class CurrentPlanDto
    {
        public string PlanName { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? NextBillingDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool AutoRenew { get; set; }
        public List<string> Features { get; set; } = new();
    }
    
    public class PlanDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal PriceMonthly { get; set; }
        public decimal PriceYearly { get; set; }
        public int MaxUsers { get; set; }
        public long MaxStorageMb { get; set; }
        public List<string> Features { get; set; } = new();
        public bool IsPopular { get; set; }
    }
    
    public class PaymentMethodDto
    {
        public long Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string LastFour { get; set; } = string.Empty;
        public string ExpiryMonth { get; set; } = string.Empty;
        public string ExpiryYear { get; set; } = string.Empty;
        public string CardholderName { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
    
    public class AddPaymentMethodDto
    {
        public string Type { get; set; } = "card";
        public string LastFour { get; set; } = string.Empty;
        public string ExpiryMonth { get; set; } = string.Empty;
        public string ExpiryYear { get; set; } = string.Empty;
        public string CardholderName { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
    
    // ==================== User Preferences DTOs ====================
    
    public class UserPreferencesDto
    {
        public string Theme { get; set; } = "light";
        public string Language { get; set; } = "en";
        public bool NotificationsEnabled { get; set; } = true;
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
        public string CalendarView { get; set; } = "month";
        public object? DashboardLayout { get; set; }
    }
    
    public class UpdateUserPreferencesDto
    {
        public string? Theme { get; set; }
        public string? Language { get; set; }
        public bool? NotificationsEnabled { get; set; }
        public bool? EmailNotifications { get; set; }
        public bool? PushNotifications { get; set; }
        public string? CalendarView { get; set; }
        public object? DashboardLayout { get; set; }
    }
    
    // ==================== Audit Logs DTOs ====================
    
    public class AuditLogsResponseDto
    {
        public List<AuditLogDto> Logs { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
    
    public class AuditLogDto
    {
        public long Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? EntityType { get; set; }
        public long? EntityId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    // ==================== Usage Statistics DTOs ====================
    
    public class UsageStatisticsDto
    {
        public UserUsageDto Users { get; set; } = new();
        public MatterUsageDto Matters { get; set; } = new();
        public ContactUsageDto Contacts { get; set; } = new();
        public StorageUsageDto Storage { get; set; } = new();
    }
    
    public class UserUsageDto
    {
        public int Current { get; set; }
        public int Limit { get; set; }
        public int Remaining { get; set; }
        public double Percentage { get; set; }
    }
    
    public class MatterUsageDto
    {
        public int Current { get; set; }
        public int Limit { get; set; }
        public int Remaining { get; set; }
        public double Percentage { get; set; }
    }
    
    public class ContactUsageDto
    {
        public int Current { get; set; }
        public int Limit { get; set; }
        public int Remaining { get; set; }
        public double Percentage { get; set; }
    }
    
    public class StorageUsageDto
    {
        public long CurrentMb { get; set; }
        public long LimitMb { get; set; }
        public long RemainingMb { get; set; }
        public double Percentage { get; set; }
        public string CurrentFormatted => $"{CurrentMb / 1024.0:F2} GB";
        public string LimitFormatted => $"{LimitMb / 1024.0:F2} GB";
    }
}