// Models/Entities/DocumentShare.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("document_shares")]
    public class DocumentShare
    {
        [Key]
        public long Id { get; set; }
        
        public long DocumentId { get; set; }
        
        public long? SharedWithUserId { get; set; }
        
        [MaxLength(255)]
        public string? SharedWithEmail { get; set; }
        
        [MaxLength(20)]
        public string Permission { get; set; } = "VIEW";
        
        [MaxLength(255)]
        public string? ShareToken { get; set; }
        
        public DateTime? ExpiresAt { get; set; }
        
        public long SharedBy { get; set; }
        
        public DateTime SharedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(DocumentId))]
        public virtual Document? Document { get; set; }
        
        [ForeignKey(nameof(SharedWithUserId))]
        public virtual User? SharedWithUser { get; set; }
        
        [ForeignKey(nameof(SharedBy))]
        public virtual User? Sharer { get; set; }
    }
}

