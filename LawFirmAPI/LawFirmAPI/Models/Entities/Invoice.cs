// Models/Entities/Invoice.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("invoices")]
    public class Invoice
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string InvoiceNumber { get; set; } = string.Empty;
        
        public DateTime InvoiceDate { get; set; }
        
        public DateTime DueDate { get; set; }
        
        public decimal Amount { get; set; }
        
        [MaxLength(20)]
        public string Status { get; set; } = "UNPAID";
        
        [MaxLength(50)]
        public string? PaymentMethod { get; set; }
        
        [MaxLength(255)]
        public string? TransactionId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}

