// Models/Entities/Folder.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("folders")]
    public class Folder
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        public long? ParentFolderId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [MaxLength(1000)]
        public string? Path { get; set; }
        
        public long CreatedBy { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(ParentFolderId))]
        public virtual Folder? ParentFolder { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
        
        public virtual ICollection<Folder> SubFolders { get; set; } = new List<Folder>();
        
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    }
}

