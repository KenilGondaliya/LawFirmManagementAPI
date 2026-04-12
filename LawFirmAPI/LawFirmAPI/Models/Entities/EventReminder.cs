// Models/Entities/EventReminder.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("event_reminders")]
    public class EventReminder
    {
        [Key]
        public long Id { get; set; }
        
        public long EventId { get; set; }
        
        public DateTime ReminderTime { get; set; }
        
        [MaxLength(20)]
        public string ReminderType { get; set; } = "BOTH";
        
        public bool IsSent { get; set; } = false;
        
        public DateTime? SentAt { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(EventId))]
        public virtual CalendarEvent? Event { get; set; }
    }
}

