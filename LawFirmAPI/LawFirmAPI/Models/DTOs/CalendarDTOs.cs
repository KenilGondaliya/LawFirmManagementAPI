// Models/DTOs/CalendarDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    public class CalendarEventDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string EventType { get; set; } = "MEETING";
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public bool IsAllDay { get; set; }
        public string? Color { get; set; }
        public long? MatterId { get; set; }
        public string? MatterTitle { get; set; }
        public long? ContactId { get; set; }
        public string? ContactName { get; set; }
        public long CreatedBy { get; set; }
        public List<EventAttendeeDto> Attendees { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateCalendarEventDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string EventType { get; set; } = "MEETING";
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public bool IsAllDay { get; set; } = false;
        public string? Color { get; set; }
        public long? MatterId { get; set; }
        public long? ContactId { get; set; }
        public List<long>? AttendeeIds { get; set; }
        public int? ReminderMinutes { get; set; }
        public EventRecurrenceDto? Recurrence { get; set; }
    }

    public class EventAttendeeDto
    {
        public long UserId { get; set; }
        public string AttendeeType { get; set; } = "REQUIRED";
        public string ResponseStatus { get; set; } = "PENDING";
    }

    public class EventReminderDto
    {
        public long Id { get; set; }
        public DateTime ReminderTime { get; set; }
        public string ReminderType { get; set; } = "BOTH";
    }

    public class EventRecurrenceDto
    {
        public string RecurrencePattern { get; set; } = "WEEKLY";
        public int IntervalValue { get; set; } = 1;
        public string? DaysOfWeek { get; set; }
        public int? DayOfMonth { get; set; }
        public int? MonthOfYear { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? Occurrences { get; set; }
    }

    public class CalendarSyncDto
    {
        public string Provider { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public string? CalendarId { get; set; }
    }
}