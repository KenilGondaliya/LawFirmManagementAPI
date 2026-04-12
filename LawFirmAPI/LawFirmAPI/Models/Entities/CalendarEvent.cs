// Models/Entities/CalendarEvent.cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("calendar_events")]
    public class CalendarEvent : BaseEntity
    {
        public long FirmId { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public string? Location { get; set; }
        
        [MaxLength(50)]
        public string EventType { get; set; } = "MEETING";
        
        public DateTime StartDateTime { get; set; }
        
        public DateTime EndDateTime { get; set; }
        
        public bool IsAllDay { get; set; } = false;
        
        [MaxLength(7)]
        public string? Color { get; set; }
        
        public long? MatterId { get; set; }
        
        public long? ContactId { get; set; }
        
        public long CreatedBy { get; set; }
        
        [ForeignKey(nameof(FirmId))]
        public virtual Firm? Firm { get; set; }
        
        [ForeignKey(nameof(MatterId))]
        public virtual Matter? Matter { get; set; }
        
        [ForeignKey(nameof(ContactId))]
        public virtual Contact? Contact { get; set; }
        
        [ForeignKey(nameof(CreatedBy))]
        public virtual User? Creator { get; set; }
        
        public virtual ICollection<EventAttendee> Attendees { get; set; } = new List<EventAttendee>();
    }
}

