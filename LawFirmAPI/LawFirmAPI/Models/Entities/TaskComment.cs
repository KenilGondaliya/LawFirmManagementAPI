// Models/Entities/TaskComment.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("task_comments")]
    public class TaskComment
    {
        [Key]
        public long Id { get; set; }
        
        public long TaskId { get; set; }
        
        public long UserId { get; set; }
        
        [Required]
        public string Comment { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(TaskId))]
        public virtual TaskEntity? Task { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}