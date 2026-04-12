// Models/Entities/EventRecurrence.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("event_recurrence")]
    public class EventRecurrence
    {
        [Key]
        public long Id { get; set; }
        
        public long EventId { get; set; }
        
        [MaxLength(20)]
        public string RecurrencePattern { get; set; } = "WEEKLY";
        
        public int IntervalValue { get; set; } = 1;
        
        [MaxLength(20)]
        public string? DaysOfWeek { get; set; }
        
        public int? DayOfMonth { get; set; }
        
        public int? MonthOfYear { get; set; }
        
        public DateTime StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        public int? Occurrences { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(EventId))]
        public virtual CalendarEvent? Event { get; set; }
    }
}

