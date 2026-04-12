// Models/Entities/Payment.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("payments")]
    public class Payment
    {
        [Key]
        public long Id { get; set; }
        
        public Guid Uuid { get; set; } = Guid.NewGuid();
        
        public long FirmId { get; set; }
        
        public long? BillId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string PaymentNumber { get; set; } = string.Empty;
        
        public DateTime PaymentDate { get; set; }
        
        public decimal Amount { get; set; }
        
        [MaxLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;
        
        [MaxLength(255)]
        public string? ReferenceNumber { get; set; }
        
        public string? Notes { get; set; }
        
        public long? ReceivedBy { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(BillId))]
        public virtual Bill? Bill { get; set; }
        
        [ForeignKey(nameof(ReceivedBy))]
        public virtual User? Receiver { get; set; }
    }
}

