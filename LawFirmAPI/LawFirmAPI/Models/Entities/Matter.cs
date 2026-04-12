// Models/Entities/Matter.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("matters")]
    public class Matter : BaseEntity
    {
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string MatterNumber { get; set; } = string.Empty;
        
        public long MatterTypeId { get; set; }
        
        public long? MatterStageId { get; set; }
        
        public long? PracticeAreaId { get; set; }
        
        public long? CourtId { get; set; }
        
        public long? JudicialDistrictId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [MaxLength(20)]
        public string Status { get; set; } = "OPEN";
        
        [MaxLength(20)]
        public string Priority { get; set; } = "MEDIUM";
        
        public DateTime OpenDate { get; set; }
        
        public DateTime? PendingDate { get; set; }
        
        public DateTime? ClosedDate { get; set; }
        
        public DateTime? StatuteOfLimitationsDate { get; set; }
        
        public decimal? EstimatedValue { get; set; }
        
        [MaxLength(20)]
        public string? BillingMethod { get; set; } = "HOURLY";
        
        public decimal? HourlyRate { get; set; }
        
        public decimal? FixedFee { get; set; }
        
        public decimal? ContingencyPercentage { get; set; }
        
        public long? OriginatingAdvocateId { get; set; }
        
        public long? ResponsibleAdvocateId { get; set; }
        
        [MaxLength(255)]
        public string? ClientReference { get; set; }
        
        public bool IsConfidential { get; set; } = false;
        
        [Column(TypeName = "jsonb")]
        public string? Metadata { get; set; }
        
        public long CreatedBy { get; set; }
        
        public long? UpdatedBy { get; set; }
        
        // Navigation properties - keep them but they will be configured to not create relationships
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(MatterTypeId))]
        public virtual MatterType? MatterType { get; set; }
        
        [ForeignKey(nameof(PracticeAreaId))]
        public virtual PracticeArea? PracticeArea { get; set; }
        
        [ForeignKey(nameof(CourtId))]
        public virtual Court? Court { get; set; }
        
        [ForeignKey(nameof(JudicialDistrictId))]
        public virtual JudicialDistrict? JudicialDistrict { get; set; }
        
        // Keep these properties - they are needed for the service layer
        [ForeignKey(nameof(OriginatingAdvocateId))]
        public virtual User? OriginatingAdvocate { get; set; }
        
        [ForeignKey(nameof(ResponsibleAdvocateId))]
        public virtual User? ResponsibleAdvocate { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
        
        public virtual ICollection<MatterParty> MatterParties { get; set; } = new List<MatterParty>();
        
        public virtual ICollection<MatterNote> MatterNotes { get; set; } = new List<MatterNote>();
        
        public virtual ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
        
        public virtual ICollection<Bill> Bills { get; set; } = new List<Bill>();
    }
}