// Models/Entities/SubscriptionPayment.cs - Simplified

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("subscription_payments")]
    public class SubscriptionPayment
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        [MaxLength(100)]
        public string RazorpayOrderId { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? RazorpayPaymentId { get; set; }
        
        [MaxLength(100)]
        public string? RazorpaySignature { get; set; }
        
        public decimal Amount { get; set; }
        
        [MaxLength(10)]
        public string Currency { get; set; } = "INR";
        
        [MaxLength(50)]
        public string Status { get; set; } = "PENDING";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}