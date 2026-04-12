// Models/Entities/DocumentTemplate.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("document_templates")]
    public class DocumentTemplate
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        public long? DocumentTypeId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        public string FilePath { get; set; } = string.Empty;
        
        public string? PreviewImage { get; set; }
        
        public bool IsPublic { get; set; } = false;
        
        public int UsageCount { get; set; } = 0;
        
        public long CreatedBy { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(DocumentTypeId))]
        public virtual DocumentType? DocumentType { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
    }
}

