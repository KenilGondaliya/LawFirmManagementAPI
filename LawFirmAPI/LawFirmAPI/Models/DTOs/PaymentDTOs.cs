// Models/DTOs/PaymentDTOs.cs
using System;

namespace LawFirmAPI.Models.DTOs
{
    public class CreateOrderDto
    {
        public long PlanId { get; set; }
        public string BillingCycle { get; set; } = "MONTHLY"; // MONTHLY or YEARLY
    }
    
    public class OrderResponseDto
    {
        public string OrderId { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string Receipt { get; set; } = string.Empty;
        public string KeyId { get; set; } = string.Empty;
    }
    
    public class VerifyPaymentDto
    {
        public long FirmId { get; set; }
        public long PlanId { get; set; }
        public string BillingCycle { get; set; } = string.Empty;
        public string OrderId { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
    }
    
    public class SubscriptionPlanDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal PriceMonthly { get; set; }
        public decimal PriceYearly { get; set; }
        public string[]? Features { get; set; }
        public int? MaxUsers { get; set; }
        public int? MaxMatters { get; set; }
        public int? MaxContacts { get; set; }
        public long? MaxStorageMb { get; set; }
        public bool IsPopular { get; set; }
    }
    
    public class SubscriptionStatusDto
    {
        public string PlanName { get; set; } = string.Empty;
        public string PlanCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string BillingCycle { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? NextBillingDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool AutoRenew { get; set; }
        public string[] Features { get; set; } = Array.Empty<string>();
    }
}