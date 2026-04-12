// Models/Entities/Bill.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("bills")]
    public class Bill : BaseEntity
    {
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string BillNumber { get; set; } = string.Empty;
        
        public long MatterId { get; set; }
        
        public long ContactId { get; set; }
        
        public long StatusId { get; set; }
        
        public DateTime BillDate { get; set; }
        
        public DateTime DueDate { get; set; }
        
        public decimal Subtotal { get; set; } = 0;
        
        public decimal TaxAmount { get; set; } = 0;
        
        public decimal DiscountAmount { get; set; } = 0;
        
        public decimal TotalAmount { get; set; } = 0;
        
        public decimal PaidAmount { get; set; } = 0;
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public decimal BalanceDue => TotalAmount - PaidAmount;
        
        [MaxLength(3)]
        public string Currency { get; set; } = "USD";
        
        public string? Notes { get; set; }
        
        public string? Terms { get; set; }
        
        public bool IsRecurring { get; set; } = false;
        
        [Column(TypeName = "json")]
        public string? RecurrencePattern { get; set; }
        
        public DateTime? SentAt { get; set; }
        
        public DateTime? PaidAt { get; set; }
        
        public long CreatedBy { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
        
        [ForeignKey(nameof(StatusId))]
        public virtual BillStatus? Status { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
        
        public virtual ICollection<BillItem> Items { get; set; } = new List<BillItem>();
        
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}

