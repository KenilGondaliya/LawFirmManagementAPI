// Models/Entities/TaskReminder.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("task_reminders")]
    public class TaskReminder
    {
        [Key]
        public long Id { get; set; }
        
        public long TaskId { get; set; }
        
        public long UserId { get; set; }
        
        public DateTime ReminderTime { get; set; }
        
        [MaxLength(20)]
        public string ReminderType { get; set; } = "BOTH";
        
        public bool IsSent { get; set; } = false;
        
        public DateTime? SentAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(TaskId))]
        public virtual TaskEntity? Task { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}