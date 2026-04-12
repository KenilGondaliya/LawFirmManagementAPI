// Models/Entities/BillItem.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("bill_items")]
    public class BillItem
    {
        [Key]
        public long Id { get; set; }
        
        public long BillId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public decimal Quantity { get; set; } = 1;
        
        public decimal UnitPrice { get; set; }
        
        public decimal TaxRate { get; set; } = 0;
        
        public decimal DiscountPercentage { get; set; } = 0;
        
        public int ItemOrder { get; set; } = 0;
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public decimal Amount => Quantity * UnitPrice;
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public decimal TotalAmount => Amount * (1 - DiscountPercentage / 100) * (1 + TaxRate / 100);
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(BillId))]
        public virtual Bill? Bill { get; set; }
    }
}

