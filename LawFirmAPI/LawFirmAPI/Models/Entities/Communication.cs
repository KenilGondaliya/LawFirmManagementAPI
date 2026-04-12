// Models/Entities/Communication.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("communications")]
    public class Communication
    {
        [Key]
        public long Id { get; set; }
        
        public Guid Uuid { get; set; } = Guid.NewGuid();
        
        public long ThreadId { get; set; }
        
        [MaxLength(255)]
        public string? MessageId { get; set; }
        
        [MaxLength(255)]
        public string? InReplyTo { get; set; }
        
        [MaxLength(20)]
        public string SenderType { get; set; } = "USER";
        
        public long? SenderId { get; set; }
        
        [MaxLength(255)]
        public string? SenderEmail { get; set; }
        
        [MaxLength(255)]
        public string? SenderName { get; set; }
        
        [MaxLength(20)]
        public string RecipientType { get; set; } = "CONTACT";
        
        [MaxLength(500)]
        public string? Subject { get; set; }
        
        public string? Body { get; set; }
        
        public string? BodyPreview { get; set; }
        
        public bool HasAttachments { get; set; } = false;
        
        public bool IsRead { get; set; } = false;
        
        public bool IsStarred { get; set; } = false;
        
        public bool IsDraft { get; set; } = false;
        
        public bool IsTrash { get; set; } = false;
        
        public DateTime? SentAt { get; set; }
        
        public DateTime? ReceivedAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(ThreadId))]
        public virtual CommunicationThread? Thread { get; set; }
        
        public virtual ICollection<CommunicationRecipient> Recipients { get; set; } = new List<CommunicationRecipient>();
        
        public virtual ICollection<CommunicationAttachment> Attachments { get; set; } = new List<CommunicationAttachment>();
    }
}

