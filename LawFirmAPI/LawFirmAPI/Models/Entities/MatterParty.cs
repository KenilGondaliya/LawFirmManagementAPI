// Models/Entities/MatterParty.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("matter_parties")]
    public class MatterParty
    {
        [Key]
        public long Id { get; set; }
        
        public long MatterId { get; set; }
        
        public long ContactId { get; set; }
        
        [MaxLength(50)]
        public string PartyType { get; set; } = string.Empty;
        
        public string? RoleDescription { get; set; }
        
        public bool IsPrimary { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
    }
}

