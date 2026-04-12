// Models/Entities/EventAttendee.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LawFirmAPI.Models.Entities
{
    [Table("event_attendees")]
    public class EventAttendee
    {
        [Key]
        public long Id { get; set; }
        
        public long EventId { get; set; }
        
        public long UserId { get; set; }
        
        [MaxLength(20)]
        public string AttendeeType { get; set; } = "REQUIRED";
        
        [MaxLength(20)]
        public string ResponseStatus { get; set; } = "PENDING";
        
        public string? ResponseMessage { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [ForeignKey(nameof(EventId))]
        public virtual CalendarEvent? Event { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public virtual User? User { get; set; }
    }
}

