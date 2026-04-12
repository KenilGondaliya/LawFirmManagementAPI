// Models/Entities/CommunicationAttachment.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("communication_attachments")]
    public class CommunicationAttachment
    {
        [Key]
        public long Id { get; set; }
        
        public long CommunicationId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        public string FilePath { get; set; } = string.Empty;
        
        public long FileSize { get; set; }
        
        [MaxLength(100)]
        public string? MimeType { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(CommunicationId))]
        public virtual Communication? Communication { get; set; }
    }
}

