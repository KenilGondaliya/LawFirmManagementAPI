// Controllers/CalendarController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/calendar")]
    [Authorize]
    public class CalendarController : ControllerBase
    {
        private readonly ICalendarService _calendarService;
        private readonly IFirmContextService _firmContextService;

        public CalendarController(ICalendarService calendarService, IFirmContextService firmContextService)
        {
            _calendarService = calendarService;
            _firmContextService = firmContextService;
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetEvents([FromQuery] DateTime? start, [FromQuery] DateTime? end)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var events = await _calendarService.GetEvents(firmId, start, end);
            return Ok(events);
        }

        [HttpGet("events/{id}")]
        public async Task<IActionResult> GetEventById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var eventItem = await _calendarService.GetEventById(id, firmId);
            if (eventItem == null)
                return NotFound(new { message = "Event not found" });
            return Ok(eventItem);
        }

        [HttpPost("events")]
        public async Task<IActionResult> CreateEvent([FromBody] CreateCalendarEventDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var eventItem = await _calendarService.CreateEvent(firmId, userId, createDto);
            return Ok(new { message = "Event created successfully", eventId = eventItem.Id, eventData = eventItem });
        }

        [HttpPut("events/{id}")]
        public async Task<IActionResult> UpdateEvent(long id, [FromBody] CreateCalendarEventDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var eventItem = await _calendarService.UpdateEvent(id, firmId, updateDto);
            return Ok(new { message = "Event updated successfully", eventData = eventItem });
        }

        [HttpDelete("events/{id}")]
        public async Task<IActionResult> DeleteEvent(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _calendarService.DeleteEvent(id, firmId);
            if (!result)
                return NotFound(new { message = "Event not found" });
            return Ok(new { message = "Event deleted successfully" });
        }

        [HttpGet("events/range")]
        public async Task<IActionResult> GetEventsByDateRange([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var events = await _calendarService.GetEventsByDateRange(firmId, start, end);
            return Ok(events);
        }

        [HttpGet("events/upcoming")]
        public async Task<IActionResult> GetUpcomingEvents([FromQuery] int limit = 10)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var events = await _calendarService.GetUpcomingEvents(firmId, limit);
            return Ok(events);
        }

        [HttpPost("events/{id}/attendees")]
        public async Task<IActionResult> AddAttendee(long id, [FromQuery] long userId, [FromQuery] string attendeeType = "REQUIRED")
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var attendee = await _calendarService.AddAttendee(id, firmId, userId, attendeeType);
            return Ok(new { message = "Attendee added successfully", attendee });
        }

        [HttpDelete("events/{id}/attendees/{userId}")]
        public async Task<IActionResult> RemoveAttendee(long id, long userId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _calendarService.RemoveAttendee(id, firmId, userId);
            if (!result)
                return NotFound(new { message = "Attendee not found" });
            return Ok(new { message = "Attendee removed successfully" });
        }

        [HttpPut("events/{id}/attendees/{userId}/status")]
        public async Task<IActionResult> UpdateAttendanceStatus(long id, long userId, [FromQuery] string status)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var attendee = await _calendarService.UpdateAttendanceStatus(id, firmId, userId, status);
            return Ok(new { message = "Attendance status updated", attendee });
        }

        [HttpPost("events/{id}/reminders")]
        public async Task<IActionResult> AddReminder(long id, [FromQuery] DateTime reminderTime, [FromQuery] string reminderType = "BOTH")
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var reminder = await _calendarService.AddReminder(id, firmId, reminderTime, reminderType);
            return Ok(new { message = "Reminder added successfully", reminder });
        }

        [HttpDelete("reminders/{reminderId}")]
        public async Task<IActionResult> RemoveReminder(long reminderId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _calendarService.RemoveReminder(reminderId, firmId);
            if (!result)
                return NotFound(new { message = "Reminder not found" });
            return Ok(new { message = "Reminder removed successfully" });
        }

        [HttpPut("events/{id}/recurrence")]
        public async Task<IActionResult> SetRecurrence(long id, [FromBody] EventRecurrenceDto recurrenceDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var eventItem = await _calendarService.SetRecurrence(id, firmId, recurrenceDto);
            return Ok(new { message = "Recurrence set successfully", eventData = eventItem });
        }

        [HttpGet("view/month")]
        public async Task<IActionResult> GetMonthView([FromQuery] int year, [FromQuery] int month)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var events = await _calendarService.GetMonthView(firmId, year, month);
            return Ok(events);
        }

        [HttpGet("view/week")]
        public async Task<IActionResult> GetWeekView([FromQuery] DateTime date)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var events = await _calendarService.GetWeekView(firmId, date);
            return Ok(events);
        }

        [HttpGet("view/day")]
        public async Task<IActionResult> GetDayView([FromQuery] DateTime date)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var events = await _calendarService.GetDayView(firmId, date);
            return Ok(events);
        }

        [HttpGet("view/agenda")]
        public async Task<IActionResult> GetAgendaView([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var events = await _calendarService.GetAgendaView(firmId, start, end);
            return Ok(events);
        }
    }
}