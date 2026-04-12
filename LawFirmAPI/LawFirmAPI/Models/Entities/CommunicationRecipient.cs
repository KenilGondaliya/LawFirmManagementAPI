// Models/Entities/CommunicationRecipient.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("communication_recipients")]
    public class CommunicationRecipient
    {
        [Key]
        public long Id { get; set; }
        
        public long CommunicationId { get; set; }
        
        [MaxLength(10)]
        public string RecipientType { get; set; } = "TO";
        
        [Required]
        [MaxLength(255)]
        public string RecipientIdentifier { get; set; } = string.Empty;
        
        [MaxLength(255)]
        public string? RecipientName { get; set; }
        
        public bool IsRead { get; set; } = false;
        
        public DateTime? ReadAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(CommunicationId))]
        public virtual Communication? Communication { get; set; }
    }
}

