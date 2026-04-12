// Models/Entities/TaskPriority.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("task_priorities")]
    public class TaskPriority
    {
        [Key]
        public long Id { get; set; }
        
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(7)]
        public string? Color { get; set; }
        
        public int Level { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        public virtual ICollection<TaskEntity> Tasks { get; set; } = new List<TaskEntity>();
    }
}