// Models/Entities/TaskAssignee.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("task_assignees")]
    public class TaskAssignee
    {
        [Key]
        public long Id { get; set; }
        
        public long TaskId { get; set; }
        
        public long UserId { get; set; }
        
        public long AssignedBy { get; set; }
        
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsPrimary { get; set; } = false;
        
        [ForeignKey(nameof(TaskId))]
        public virtual TaskEntity? Task { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
        
        // Comment out or remove the Assigner navigation property for now
        // [ForeignKey(nameof(AssignedBy))]
        // public virtual User? Assigner { get; set; }
    }
}