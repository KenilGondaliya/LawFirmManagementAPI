// Models/Entities/DocumentComment.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("document_comments")]
    public class DocumentComment
    {
        [Key]
        public long Id { get; set; }
        
        public long DocumentId { get; set; }
        
        public long UserId { get; set; }
        
        [Required]
        public string Comment { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(DocumentId))]
        public virtual Document? Document { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}

