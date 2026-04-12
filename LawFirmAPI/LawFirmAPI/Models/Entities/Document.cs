// Models/Entities/Document.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("documents")]
    public class Document : BaseEntity
    {
        public long FirmId { get; set; }
        
        public long? FolderId { get; set; }
        
        public long? DocumentTypeId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        public string FilePath { get; set; } = string.Empty;
        
        public long FileSize { get; set; }
        
        [MaxLength(100)]
        public string? MimeType { get; set; }
        
        [MaxLength(20)]
        public string? Extension { get; set; }
        
        public int Version { get; set; } = 1;
        
        public bool IsTemplate { get; set; } = false;
        
        public bool IsArchived { get; set; } = false;
        
        public long? MatterId { get; set; }
        
        public long? ContactId { get; set; }
        
        public long UploadedBy { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastAccessedAt { get; set; }
        
        [Column(TypeName = "json")]
        public string? Metadata { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(FolderId))]
        public virtual Folder? Folder { get; set; }
        
        [ForeignKey(nameof(DocumentTypeId))]
        public virtual DocumentType? DocumentType { get; set; }
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
        
        [ForeignKey(nameof(UploadedBy))]
        public virtual User? Uploader { get; set; }
        
        public virtual ICollection<DocumentVersion> Versions { get; set; } = new List<DocumentVersion>();
        
        public virtual ICollection<DocumentShare> Shares { get; set; } = new List<DocumentShare>();
        
        public virtual ICollection<DocumentComment> Comments { get; set; } = new List<DocumentComment>();
    }
}

