// Models/Entities/FirmSetting.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("firm_settings")]
    public class FirmSetting
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        [MaxLength(100)]
        public string Timezone { get; set; } = "UTC";
        
        [MaxLength(20)]
        public string DateFormat { get; set; } = "YYYY-MM-DD";
        
        [MaxLength(20)]
        public string TimeFormat { get; set; } = "24H";
        
        [MaxLength(3)]
        public string Currency { get; set; } = "USD";
        
        public DateTime? FiscalYearStart { get; set; }
        
        [Column(TypeName = "json")]
        public string? BusinessHours { get; set; }
        
        public string? EmailSignature { get; set; }
        
        [MaxLength(20)]
        public string InvoicePrefix { get; set; } = "INV";
        
        [MaxLength(20)]
        public string MatterPrefix { get; set; } = "MAT";
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
    }
}