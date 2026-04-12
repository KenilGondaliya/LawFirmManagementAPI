// Controllers/DashboardController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;
        private readonly IFirmContextService _firmContextService;

        public DashboardController(IDashboardService dashboardService, IFirmContextService firmContextService)
        {
            _dashboardService = dashboardService;
            _firmContextService = firmContextService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDashboardSummary()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var summary = await _dashboardService.GetDashboardSummary(firmId, userId);
            return Ok(summary);
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var stats = await _dashboardService.GetDashboardStats(firmId);
            return Ok(stats);
        }

        [HttpGet("recent-activities")]
        public async Task<IActionResult> GetRecentActivities([FromQuery] int limit = 10)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var activities = await _dashboardService.GetRecentActivities(firmId, limit);
            return Ok(activities);
        }

        [HttpGet("notifications")]
        public async Task<IActionResult> GetNotifications([FromQuery] bool unreadOnly = false)
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var notifications = await _dashboardService.GetNotifications(userId, firmId, unreadOnly);
            var unreadCount = notifications.Count(n => !n.IsRead);
            return Ok(new { Notifications = notifications, UnreadCount = unreadCount });
        }

        [HttpPut("notifications/{id}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(long id)
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var result = await _dashboardService.MarkNotificationAsRead(id, userId);
            if (result == 0)
                return NotFound(new { message = "Notification not found" });
            return Ok(new { message = "Notification marked as read" });
        }

        [HttpPut("notifications/read-all")]
        public async Task<IActionResult> MarkAllNotificationsAsRead()
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var notifications = await _dashboardService.GetNotifications(userId, firmId, true);
            foreach (var notification in notifications)
            {
                await _dashboardService.MarkNotificationAsRead(notification.Id, userId);
            }
            return Ok(new { message = "All notifications marked as read" });
        }

        [HttpGet("upcoming-events")]
        public async Task<IActionResult> GetUpcomingEvents([FromQuery] int days = 7)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var events = await _dashboardService.GetUpcomingEvents(firmId, days);
            return Ok(events);
        }

        [HttpGet("tasks-summary")]
        public async Task<IActionResult> GetTasksSummary()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var summary = await _dashboardService.GetTasksSummary(firmId, userId);
            return Ok(summary);
        }

        [HttpGet("bills-summary")]
        public async Task<IActionResult> GetBillsSummary()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var summary = await _dashboardService.GetBillingSummary(firmId);
            return Ok(summary);
        }

        [HttpPost("widgets/preferences")]
        public async Task<IActionResult> UpdateWidgetPreferences([FromBody] List<WidgetPreferenceDto> widgets)
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            await _dashboardService.UpdateWidgetPreferences(userId, firmId, widgets);
            return Ok(new { message = "Widget preferences updated" });
        }

        [HttpGet("quick-actions")]
        public async Task<IActionResult> GetQuickActions()
        {
            var userId = await _firmContextService.GetCurrentUserId();
            var firmId = await _firmContextService.GetCurrentFirmId();
            var actions = await _dashboardService.GetQuickActions(userId, firmId);
            return Ok(actions);
        }
    }
}