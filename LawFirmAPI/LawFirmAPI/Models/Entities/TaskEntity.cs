// Models/Entities/Task.cs (using alias to avoid conflict)
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("tasks")]
    public class TaskEntity : BaseEntity
    {
        public long FirmId { get; set; }
        
        public long? MatterId { get; set; }
        
        public long? ContactId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public long StatusId { get; set; }
        
        public long PriorityId { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public TimeSpan? DueTime { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        public long? CompletedBy { get; set; }
        
        public decimal? EstimatedHours { get; set; }
        
        public decimal? ActualHours { get; set; }
        
        public bool IsRecurring { get; set; } = false;
        
        [Column(TypeName = "json")]
        public string? RecurrencePattern { get; set; }
        
        public long? ParentTaskId { get; set; }
        
        public long CreatedBy { get; set; }
        
        public long? UpdatedBy { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
        
        [ForeignKey(nameof(StatusId))]
        public virtual TaskStatus? Status { get; set; }
        
        [ForeignKey(nameof(PriorityId))]
        public virtual TaskPriority? Priority { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
        
        public virtual ICollection<TaskAssignee> Assignees { get; set; } = new List<TaskAssignee>();
        
        public virtual ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
        
        public virtual ICollection<TaskAttachment> Attachments { get; set; } = new List<TaskAttachment>();
        
        public virtual ICollection<TaskReminder> Reminders { get; set; } = new List<TaskReminder>();
    }
}

