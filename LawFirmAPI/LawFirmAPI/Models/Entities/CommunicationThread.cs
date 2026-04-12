// Models/Entities/CommunicationThread.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("communication_threads")]
    public class CommunicationThread : BaseEntity
    {
        public long FirmId { get; set; }
        
        public long? MatterId { get; set; }
        
        public long? ContactId { get; set; }
        
        [MaxLength(500)]
        public string? Subject { get; set; }
        
        [MaxLength(20)]
        public string ThreadType { get; set; } = "EMAIL";
        
        [MaxLength(20)]
        public string Status { get; set; } = "ACTIVE";
        
        public DateTime? LastMessageAt { get; set; }
        
        public long CreatedBy { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
        
        public virtual ICollection<Communication> Messages { get; set; } = new List<Communication>();
    }
}

