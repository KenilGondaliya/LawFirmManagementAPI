// Services/CalendarService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Services
{
    public interface ICalendarService
    {
        Task<List<CalendarEventDto>> GetEvents(long firmId, DateTime? start, DateTime? end);
        Task<CalendarEventDto?> GetEventById(long id, long firmId);
        Task<CalendarEventDto> CreateEvent(long firmId, long userId, CreateCalendarEventDto createDto);
        Task<CalendarEventDto> UpdateEvent(long id, long firmId, CreateCalendarEventDto updateDto);
        Task<bool> DeleteEvent(long id, long firmId);
        Task<List<CalendarEventDto>> GetEventsByDateRange(long firmId, DateTime start, DateTime end);
        Task<List<CalendarEventDto>> GetUpcomingEvents(long firmId, int limit = 10);
        Task<EventAttendeeDto> AddAttendee(long eventId, long firmId, long userId, string attendeeType);
        Task<bool> RemoveAttendee(long eventId, long firmId, long userId);
        Task<EventAttendeeDto> UpdateAttendanceStatus(long eventId, long firmId, long userId, string status);
        Task<EventReminderDto> AddReminder(long eventId, long firmId, DateTime reminderTime, string reminderType);
        Task<bool> RemoveReminder(long reminderId, long firmId);
        Task<CalendarEventDto> SetRecurrence(long eventId, long firmId, EventRecurrenceDto recurrenceDto);
        Task<List<CalendarEventDto>> GetMonthView(long firmId, int year, int month);
        Task<List<CalendarEventDto>> GetWeekView(long firmId, DateTime date);
        Task<List<CalendarEventDto>> GetDayView(long firmId, DateTime date);
        Task<List<CalendarEventDto>> GetAgendaView(long firmId, DateTime start, DateTime end);
    }

    public class CalendarService : ICalendarService
    {
        private readonly ApplicationDbContext _context;

        public CalendarService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<CalendarEventDto>> GetEvents(long firmId, DateTime? start, DateTime? end)
        {
            var query = _context.CalendarEvents
                .Include(e => e.Matter)
                .Include(e => e.Contact)
                .Include(e => e.Attendees)
                .Where(e => e.FirmId == firmId && e.DeletedAt == null);

            if (start.HasValue)
                query = query.Where(e => e.StartDateTime >= start.Value);
            if (end.HasValue)
                query = query.Where(e => e.EndDateTime <= end.Value);

            var events = await query
                .OrderBy(e => e.StartDateTime)
                .Select(e => MapToDto(e))
                .ToListAsync();

            return events;
        }

        public async Task<CalendarEventDto?> GetEventById(long id, long firmId)
        {
            var eventItem = await _context.CalendarEvents
                .Include(e => e.Matter)
                .Include(e => e.Contact)
                .Include(e => e.Attendees)
                .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(e => e.Id == id && e.FirmId == firmId && e.DeletedAt == null);

            return eventItem != null ? MapToDto(eventItem) : null;
        }

        public async Task<CalendarEventDto> CreateEvent(long firmId, long userId, CreateCalendarEventDto createDto)
        {
            var eventItem = new CalendarEvent
            {
                FirmId = firmId,
                Title = createDto.Title,
                Description = createDto.Description,
                Location = createDto.Location,
                EventType = createDto.EventType,
                StartDateTime = createDto.StartDateTime,
                EndDateTime = createDto.EndDateTime,
                IsAllDay = createDto.IsAllDay,
                Color = createDto.Color,
                MatterId = createDto.MatterId,
                ContactId = createDto.ContactId,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.CalendarEvents.Add(eventItem);
            await _context.SaveChangesAsync();

            // Add attendees
            if (createDto.AttendeeIds != null)
            {
                foreach (var attendeeId in createDto.AttendeeIds)
                {
                    var attendee = new EventAttendee
                    {
                        EventId = eventItem.Id,
                        UserId = attendeeId,
                        AttendeeType = "REQUIRED",
                        ResponseStatus = "PENDING",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.EventAttendees.Add(attendee);
                }
                await _context.SaveChangesAsync();
            }

            // Add reminders
            if (createDto.ReminderMinutes.HasValue)
            {
                var reminder = new EventReminder
                {
                    EventId = eventItem.Id,
                    ReminderTime = eventItem.StartDateTime.AddMinutes(-createDto.ReminderMinutes.Value),
                    ReminderType = "BOTH",
                    IsSent = false
                };
                _context.EventReminders.Add(reminder);
                await _context.SaveChangesAsync();
            }

            // Add recurrence
            if (createDto.Recurrence != null)
            {
                await SetRecurrence(eventItem.Id, firmId, createDto.Recurrence);
            }

            return MapToDto(eventItem);
        }

        public async Task<CalendarEventDto> UpdateEvent(long id, long firmId, CreateCalendarEventDto updateDto)
        {
            var eventItem = await _context.CalendarEvents
                .FirstOrDefaultAsync(e => e.Id == id && e.FirmId == firmId && e.DeletedAt == null);

            if (eventItem == null)
                throw new KeyNotFoundException("Event not found");

            eventItem.Title = updateDto.Title;
            eventItem.Description = updateDto.Description;
            eventItem.Location = updateDto.Location;
            eventItem.EventType = updateDto.EventType;
            eventItem.StartDateTime = updateDto.StartDateTime;
            eventItem.EndDateTime = updateDto.EndDateTime;
            eventItem.IsAllDay = updateDto.IsAllDay;
            eventItem.Color = updateDto.Color;
            eventItem.MatterId = updateDto.MatterId;
            eventItem.ContactId = updateDto.ContactId;
            eventItem.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToDto(eventItem);
        }

        public async Task<bool> DeleteEvent(long id, long firmId)
        {
            var eventItem = await _context.CalendarEvents
                .FirstOrDefaultAsync(e => e.Id == id && e.FirmId == firmId && e.DeletedAt == null);

            if (eventItem == null)
                return false;

            eventItem.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<CalendarEventDto>> GetEventsByDateRange(long firmId, DateTime start, DateTime end)
        {
            var events = await _context.CalendarEvents
                .Where(e => e.FirmId == firmId && e.StartDateTime >= start && e.EndDateTime <= end && e.DeletedAt == null)
                .OrderBy(e => e.StartDateTime)
                .Select(e => MapToDto(e))
                .ToListAsync();

            return events;
        }

        public async Task<List<CalendarEventDto>> GetUpcomingEvents(long firmId, int limit = 10)
        {
            var events = await _context.CalendarEvents
                .Where(e => e.FirmId == firmId && e.StartDateTime >= DateTime.UtcNow && e.DeletedAt == null)
                .OrderBy(e => e.StartDateTime)
                .Take(limit)
                .Select(e => MapToDto(e))
                .ToListAsync();

            return events;
        }

        public async Task<EventAttendeeDto> AddAttendee(long eventId, long firmId, long userId, string attendeeType)
        {
            var eventItem = await _context.CalendarEvents
                .FirstOrDefaultAsync(e => e.Id == eventId && e.FirmId == firmId);

            if (eventItem == null)
                throw new KeyNotFoundException("Event not found");

            var existingAttendee = await _context.EventAttendees
                .FirstOrDefaultAsync(a => a.EventId == eventId && a.UserId == userId);

            if (existingAttendee != null)
                throw new InvalidOperationException("User is already an attendee");

            var attendee = new EventAttendee
            {
                EventId = eventId,
                UserId = userId,
                AttendeeType = attendeeType,
                ResponseStatus = "PENDING",
                CreatedAt = DateTime.UtcNow
            };

            _context.EventAttendees.Add(attendee);
            await _context.SaveChangesAsync();

            return new EventAttendeeDto
            {
                UserId = userId,
                AttendeeType = attendeeType,
                ResponseStatus = "PENDING"
            };
        }

        public async Task<bool> RemoveAttendee(long eventId, long firmId, long userId)
        {
            var attendee = await _context.EventAttendees
                .FirstOrDefaultAsync(a => a.EventId == eventId && a.UserId == userId);

            if (attendee == null)
                return false;

            _context.EventAttendees.Remove(attendee);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<EventAttendeeDto> UpdateAttendanceStatus(long eventId, long firmId, long userId, string status)
        {
            var attendee = await _context.EventAttendees
                .FirstOrDefaultAsync(a => a.EventId == eventId && a.UserId == userId);

            if (attendee == null)
                throw new KeyNotFoundException("Attendee not found");

            attendee.ResponseStatus = status;
            await _context.SaveChangesAsync();

            return new EventAttendeeDto
            {
                UserId = userId,
                AttendeeType = attendee.AttendeeType,
                ResponseStatus = status
            };
        }

        public async Task<EventReminderDto> AddReminder(long eventId, long firmId, DateTime reminderTime, string reminderType)
        {
            var eventItem = await _context.CalendarEvents
                .FirstOrDefaultAsync(e => e.Id == eventId && e.FirmId == firmId);

            if (eventItem == null)
                throw new KeyNotFoundException("Event not found");

            var reminder = new EventReminder
            {
                EventId = eventId,
                ReminderTime = reminderTime,
                ReminderType = reminderType,
                IsSent = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.EventReminders.Add(reminder);
            await _context.SaveChangesAsync();

            return new EventReminderDto
            {
                Id = reminder.Id,
                ReminderTime = reminderTime,
                ReminderType = reminderType
            };
        }

        public async Task<bool> RemoveReminder(long reminderId, long firmId)
        {
            var reminder = await _context.EventReminders
                .FirstOrDefaultAsync(r => r.Id == reminderId);

            if (reminder == null)
                return false;

            _context.EventReminders.Remove(reminder);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<CalendarEventDto> SetRecurrence(long eventId, long firmId, EventRecurrenceDto recurrenceDto)
        {
            var eventItem = await _context.CalendarEvents
                .FirstOrDefaultAsync(e => e.Id == eventId && e.FirmId == firmId);

            if (eventItem == null)
                throw new KeyNotFoundException("Event not found");

            var existingRecurrence = await _context.EventRecurrences
                .FirstOrDefaultAsync(r => r.EventId == eventId);

            if (existingRecurrence != null)
                _context.EventRecurrences.Remove(existingRecurrence);

            var recurrence = new EventRecurrence
            {
                EventId = eventId,
                RecurrencePattern = recurrenceDto.RecurrencePattern,
                IntervalValue = recurrenceDto.IntervalValue,
                DaysOfWeek = recurrenceDto.DaysOfWeek,
                DayOfMonth = recurrenceDto.DayOfMonth,
                MonthOfYear = recurrenceDto.MonthOfYear,
                StartDate = recurrenceDto.StartDate,
                EndDate = recurrenceDto.EndDate,
                Occurrences = recurrenceDto.Occurrences,
                CreatedAt = DateTime.UtcNow
            };

            _context.EventRecurrences.Add(recurrence);
            await _context.SaveChangesAsync();

            return MapToDto(eventItem);
        }

        public async Task<List<CalendarEventDto>> GetMonthView(long firmId, int year, int month)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1).AddDays(-1);

            return await GetEventsByDateRange(firmId, startDate, endDate);
        }

        public async Task<List<CalendarEventDto>> GetWeekView(long firmId, DateTime date)
        {
            var startOfWeek = date.AddDays(-(int)date.DayOfWeek + 1); // Monday
            var endOfWeek = startOfWeek.AddDays(6);

            return await GetEventsByDateRange(firmId, startOfWeek, endOfWeek);
        }

        public async Task<List<CalendarEventDto>> GetDayView(long firmId, DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = startOfDay.AddDays(1);

            return await GetEventsByDateRange(firmId, startOfDay, endOfDay);
        }

        public async Task<List<CalendarEventDto>> GetAgendaView(long firmId, DateTime start, DateTime end)
        {
            return await GetEventsByDateRange(firmId, start, end);
        }

        private CalendarEventDto MapToDto(CalendarEvent e)
        {
            return new CalendarEventDto
            {
                Id = e.Id,
                Uuid = e.Uuid,
                Title = e.Title,
                Description = e.Description,
                Location = e.Location,
                EventType = e.EventType,
                StartDateTime = e.StartDateTime,
                EndDateTime = e.EndDateTime,
                IsAllDay = e.IsAllDay,
                Color = e.Color,
                MatterId = e.MatterId,
                MatterTitle = e.Matter?.Title,
                ContactId = e.ContactId,
                ContactName = e.Contact != null ? $"{e.Contact.FirstName} {e.Contact.LastName}" : null,
                CreatedBy = e.CreatedBy,
                Attendees = e.Attendees.Select(a => new EventAttendeeDto
                {
                    UserId = a.UserId,
                    AttendeeType = a.AttendeeType,
                    ResponseStatus = a.ResponseStatus
                }).ToList(),
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            };
        }
    }
}