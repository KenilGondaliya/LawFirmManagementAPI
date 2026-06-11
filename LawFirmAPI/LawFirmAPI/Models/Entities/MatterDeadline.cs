// Models/Entities/MatterDeadline.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("matter_deadlines")]
    public class MatterDeadline : BaseEntity
    {
        public long MatterId { get; set; }
        
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        
        public DateTime DeadlineDate { get; set; }
        
        public bool IsMet { get; set; } = false;
        
        public string? Notes { get; set; }
        
        public long CreatedBy { get; set; }
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
    }
}