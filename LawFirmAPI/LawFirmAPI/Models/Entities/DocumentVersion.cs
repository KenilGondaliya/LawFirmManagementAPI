// Models/Entities/DocumentVersion.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("document_versions")]
    public class DocumentVersion
    {
        [Key]
        public long Id { get; set; }
        
        public long DocumentId { get; set; }
        
        public int Version { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        public string FilePath { get; set; } = string.Empty;
        
        public long FileSize { get; set; }
        
        public string? ChangeSummary { get; set; }
        
        public long UploadedBy { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(DocumentId))]
        public virtual Document? Document { get; set; }
        
        [ForeignKey(nameof(UploadedBy))]
        public virtual User? Uploader { get; set; }
    }
}

