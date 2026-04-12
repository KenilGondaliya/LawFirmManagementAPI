// Models/Entities/DocumentType.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("document_types")]
    public class DocumentType
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? Category { get; set; }
        
        public string? Description { get; set; }
        
        [MaxLength(50)]
        public string? Icon { get; set; }
        
        public bool IsTemplate { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
        
        public virtual ICollection<DocumentTemplate> Templates { get; set; } = new List<DocumentTemplate>();
    }
}

