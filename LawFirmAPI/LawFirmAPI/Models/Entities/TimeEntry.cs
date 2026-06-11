// Models/Entities/TimeEntry.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("time_entries")]
    public class TimeEntry : BaseEntity
    {
        public long MatterId { get; set; }
        
        public long FirmId { get; set; }
        
        public long UserId { get; set; }
        
        public DateTime Date { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal Duration { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public bool Billable { get; set; } = true;
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal BillingRate { get; set; }
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}