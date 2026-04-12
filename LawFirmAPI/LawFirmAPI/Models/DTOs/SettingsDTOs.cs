// Models/DTOs/SettingsDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    // Profile Settings
    public class UpdateProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
    }

    // Team Management
    public class UserResponseDto
    {
        public long Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime? LastLoginAt { get; set; }
        public string? FirmRole { get; set; }
        public string? Status { get; set; }
        public DateTime? JoinedAt { get; set; }
        public DateTime? InvitedAt { get; set; }
    }

    public class RoleDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Permissions { get; set; } = new();
    }

    public class InviteUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = "STAFF";
    }

    public class InviteResponseDto
    {
        public long UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }

    // Firm Settings
    public class FirmSettingsDto
    {
        public long FirmId { get; set; }
        public string FirmName { get; set; } = string.Empty;
        public string? LegalName { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? TaxNumber { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string Timezone { get; set; } = "UTC";
        public string DateFormat { get; set; } = "YYYY-MM-DD";
        public string TimeFormat { get; set; } = "24H";
        public string Currency { get; set; } = "USD";
        public DateTime? FiscalYearStart { get; set; }
        public string InvoicePrefix { get; set; } = "INV";
        public string MatterPrefix { get; set; } = "MAT";
        public string? EmailSignature { get; set; }
    }

    public class UpdateFirmSettingsDto
    {
        public string? FirmName { get; set; }
        public string? LegalName { get; set; }
        public string? RegistrationNumber { get; set; }
        public string? TaxNumber { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Website { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Timezone { get; set; }
        public string? DateFormat { get; set; }
        public string? TimeFormat { get; set; }
        public string? Currency { get; set; }
        public DateTime? FiscalYearStart { get; set; }
        public string? InvoicePrefix { get; set; }
        public string? MatterPrefix { get; set; }
        public string? EmailSignature { get; set; }
    }

    public class BrandingDto
    {
        public string? LogoUrl { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
    }

    public class UpdateBrandingDto
    {
        public IFormFile? LogoFile { get; set; }
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
    }

    // Plan & Billing
    public class SubscriptionDto
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
        public int? MaxUsers { get; set; }
        public int? MaxMatters { get; set; }
        public int? MaxContacts { get; set; }
        public long? MaxStorageMb { get; set; }
        public List<string> Features { get; set; } = new();
        public bool IsPopular { get; set; }
    }

    public class PaymentMethodDto
    {
        public long Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Last4 { get; set; } = string.Empty;
        public int ExpiryMonth { get; set; }
        public int ExpiryYear { get; set; }
        public bool IsDefault { get; set; }
    }

    public class AddPaymentMethodDto
    {
        public string Type { get; set; } = string.Empty;
        public string Last4 { get; set; } = string.Empty;
        public int ExpiryMonth { get; set; }
        public int ExpiryYear { get; set; }
        public bool IsDefault { get; set; }
        public string PaymentToken { get; set; } = string.Empty;
    }

    // User Preferences
    public class UserPreferencesDto
    {
        public string Theme { get; set; } = "light";
        public string Language { get; set; } = "en";
        public bool NotificationsEnabled { get; set; } = true;
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
        public string CalendarView { get; set; } = "month";
        public DashboardLayoutDto? DashboardLayout { get; set; }
    }

    public class UpdateUserPreferencesDto
    {
        public string? Theme { get; set; }
        public string? Language { get; set; }
        public bool? NotificationsEnabled { get; set; }
        public bool? EmailNotifications { get; set; }
        public bool? PushNotifications { get; set; }
        public string? CalendarView { get; set; }
        public DashboardLayoutDto? DashboardLayout { get; set; }
    }

    public class DashboardLayoutDto
    {
        public List<DashboardWidgetDto> Widgets { get; set; } = new();
    }

    public class DashboardWidgetDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int X { get; set; }
        public int Y { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public bool Visible { get; set; } = true;
    }

    // Audit Logs
    public class AuditLogDto
    {
        public long Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? EntityType { get; set; }
        public long? EntityId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? UserName { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}