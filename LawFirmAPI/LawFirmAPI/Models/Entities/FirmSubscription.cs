// Models/Entities/FirmSubscription.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("firm_subscriptions")]
    public class FirmSubscription
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        public long PlanId { get; set; }
        
        [MaxLength(20)]
        public string BillingCycle { get; set; } = "MONTHLY";
        
        public DateTime StartDate { get; set; }
        
        public DateTime NextBillingDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        [MaxLength(20)]
        public string Status { get; set; } = "TRIAL";
        
        public bool AutoRenew { get; set; } = true;
        
        [MaxLength(255)]
        public string? PaymentMethodId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(PlanId))]
        public virtual SubscriptionPlan? Plan { get; set; }
    }
}