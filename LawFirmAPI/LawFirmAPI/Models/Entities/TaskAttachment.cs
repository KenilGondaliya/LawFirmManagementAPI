// Models/Entities/TaskAttachment.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("task_attachments")]
    public class TaskAttachment
    {
        [Key]
        public long Id { get; set; }
        
        public long TaskId { get; set; }
        
        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        public string FilePath { get; set; } = string.Empty;
        
        public long FileSize { get; set; }
        
        [MaxLength(100)]
        public string? MimeType { get; set; }
        
        public long UploadedBy { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(TaskId))]
        public virtual TaskEntity? Task { get; set; }
        
        [ForeignKey(nameof(UploadedBy))]
        public virtual User? Uploader { get; set; }
    }
}