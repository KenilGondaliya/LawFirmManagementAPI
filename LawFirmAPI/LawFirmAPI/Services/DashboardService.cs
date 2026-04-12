// Services/DashboardService.cs
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Services
{
    public interface IDashboardService
    {
        Task<DashboardSummaryDto> GetDashboardSummary(long firmId, long userId);
        Task<DashboardStatsDto> GetDashboardStats(long firmId);
        Task<List<RecentActivityDto>> GetRecentActivities(long firmId, int limit = 10);
        Task<List<NotificationDto>> GetNotifications(long userId, long firmId, bool unreadOnly = false);
        Task<int> MarkNotificationAsRead(long notificationId, long userId);
        Task<UpcomingEventsDto> GetUpcomingEvents(long firmId, int days = 7);
        Task<TasksSummaryDto> GetTasksSummary(long firmId, long userId);
        Task<BillingSummaryDto> GetBillingSummary(long firmId);
        Task UpdateWidgetPreferences(long userId, long firmId, List<WidgetPreferenceDto> widgets);
        Task<List<QuickActionDto>> GetQuickActions(long userId, long firmId);
    }

    public class DashboardService : IDashboardService
    {
        private readonly ApplicationDbContext _context;

        public DashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummary(long firmId, long userId)
        {
            var matters = await _context.Matters
                .Where(m => m.FirmId == firmId && m.DeletedAt == null)
                .ToListAsync();

            var contacts = await _context.Contacts
                .Where(c => c.FirmId == firmId && c.DeletedAt == null)
                .ToListAsync();

            var tasks = await _context.Tasks
                .Include(t => t.Assignees)
                .Where(t => t.FirmId == firmId && t.DeletedAt == null)
                .ToListAsync();

            var myTasks = tasks.Where(t => t.Assignees.Any(a => a.UserId == userId)).ToList();
            var bills = await _context.Bills
                .Where(b => b.FirmId == firmId && b.DeletedAt == null)
                .ToListAsync();

            return new DashboardSummaryDto
            {
                Matters = new MattersSummaryDto
                {
                    Total = matters.Count,
                    Open = matters.Count(m => m.Status == "OPEN"),
                    Pending = matters.Count(m => m.Status == "PENDING"),
                    Closed = matters.Count(m => m.Status == "CLOSED"),
                    HighPriority = matters.Count(m => m.Priority == "HIGH" || m.Priority == "URGENT")
                },
                Contacts = new ContactsSummaryDto
                {
                    Total = contacts.Count,
                    Clients = contacts.Count(c => c.IsClient),
                    Opponents = contacts.Count(c => c.IsOpponent),
                    Important = contacts.Count(c => c.IsImportant)
                },
                Tasks = new TasksSummaryDto
                {
                    Total = tasks.Count,
                    Completed = tasks.Count(t => t.CompletedAt.HasValue),
                    Overdue = tasks.Count(t => t.DueDate.HasValue && t.DueDate < DateTime.UtcNow && !t.CompletedAt.HasValue),
                    DueToday = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value.Date == DateTime.UtcNow.Date && !t.CompletedAt.HasValue),
                    MyTasks = myTasks.Count,
                    MyPendingTasks = myTasks.Count(t => !t.CompletedAt.HasValue)
                },
                Billing = new BillingSummaryDto
                {
                    TotalBilled = bills.Sum(b => b.TotalAmount),
                    TotalPaid = bills.Sum(b => b.PaidAmount),
                    TotalOutstanding = bills.Sum(b => b.BalanceDue),
                    OverdueBills = bills.Count(b => b.DueDate < DateTime.UtcNow && b.BalanceDue > 0)
                }
            };
        }

        public async Task<DashboardStatsDto> GetDashboardStats(long firmId)
        {
            var mattersByStatus = await _context.Matters
                .Where(m => m.FirmId == firmId && m.DeletedAt == null)
                .GroupBy(m => m.Status)
                .Select(g => new StatusCountDto { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var mattersByPriority = await _context.Matters
                .Where(m => m.FirmId == firmId && m.DeletedAt == null)
                .GroupBy(m => m.Priority)
                .Select(g => new PriorityCountDto { Priority = g.Key, Count = g.Count() })
                .ToListAsync();

            var monthlyBills = await _context.Bills
                .Where(b => b.FirmId == firmId && b.BillDate.Year == DateTime.UtcNow.Year && b.DeletedAt == null)
                .GroupBy(b => b.BillDate.Month)
                .Select(g => new MonthlyBillDto { Month = g.Key, Total = g.Sum(b => b.TotalAmount), Paid = g.Sum(b => b.PaidAmount) })
                .OrderBy(g => g.Month)
                .ToListAsync();

            var recentActivities = await GetRecentActivities(firmId, 5);

            return new DashboardStatsDto
            {
                MattersByStatus = mattersByStatus,
                MattersByPriority = mattersByPriority,
                MonthlyBills = monthlyBills,
                RecentActivities = recentActivities
            };
        }

        public async Task<List<RecentActivityDto>> GetRecentActivities(long firmId, int limit = 10)
        {
            var activities = await _context.RecentActivities
                .Include(a => a.User)
                .Where(a => a.FirmId == firmId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
                .Select(a => new RecentActivityDto
                {
                    Id = a.Id,
                    ActivityType = a.ActivityType,
                    EntityType = a.EntityType,
                    EntityId = a.EntityId,
                    EntityName = a.EntityName,
                    Description = a.Description,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System",
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return activities;
        }

        public async Task<List<NotificationDto>> GetNotifications(long userId, long firmId, bool unreadOnly = false)
        {
            var query = _context.Notifications
                .Where(n => n.UserId == userId && n.FirmId == firmId);

            if (unreadOnly)
                query = query.Where(n => !n.IsRead);

            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Title = n.Title,
                    Message = n.Message,
                    NotificationType = n.NotificationType,
                    RelatedEntityType = n.RelatedEntityType,
                    RelatedEntityId = n.RelatedEntityId,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                })
                .ToListAsync();

            return notifications;
        }

        public async Task<int> MarkNotificationAsRead(long notificationId, long userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return 0;

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return 1;
        }

        public async Task<UpcomingEventsDto> GetUpcomingEvents(long firmId, int days = 7)
        {
            var endDate = DateTime.UtcNow.AddDays(days);

            var events = await _context.CalendarEvents
                .Include(e => e.Matter)
                .Include(e => e.Contact)
                .Where(e => e.FirmId == firmId && e.StartDateTime >= DateTime.UtcNow && e.StartDateTime <= endDate && e.DeletedAt == null)
                .OrderBy(e => e.StartDateTime)
                .Select(e => new UpcomingEventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    Location = e.Location,
                    EventType = e.EventType,
                    StartDateTime = e.StartDateTime,
                    EndDateTime = e.EndDateTime,
                    IsAllDay = e.IsAllDay,
                    MatterTitle = e.Matter != null ? e.Matter.Title : null,
                    ContactName = e.Contact != null ? $"{e.Contact.FirstName} {e.Contact.LastName}" : null
                })
                .ToListAsync();

            return new UpcomingEventsDto
            {
                Events = events,
                Total = events.Count
            };
        }

        public async Task<TasksSummaryDto> GetTasksSummary(long firmId, long userId)
        {
            var tasks = await _context.Tasks
                .Include(t => t.Assignees)
                .Where(t => t.FirmId == firmId && t.DeletedAt == null)
                .ToListAsync();

            var myTasks = tasks.Where(t => t.Assignees.Any(a => a.UserId == userId)).ToList();

            return new TasksSummaryDto
            {
                Total = tasks.Count,
                Completed = tasks.Count(t => t.CompletedAt.HasValue),
                Overdue = tasks.Count(t => t.DueDate.HasValue && t.DueDate < DateTime.UtcNow && !t.CompletedAt.HasValue),
                DueToday = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value.Date == DateTime.UtcNow.Date && !t.CompletedAt.HasValue),
                DueThisWeek = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value.Date <= DateTime.UtcNow.AddDays(7).Date && !t.CompletedAt.HasValue),
                MyTasks = myTasks.Count,
                MyPendingTasks = myTasks.Count(t => !t.CompletedAt.HasValue)
            };
        }

        public async Task<BillingSummaryDto> GetBillingSummary(long firmId)
        {
            var bills = await _context.Bills
                .Where(b => b.FirmId == firmId && b.DeletedAt == null)
                .ToListAsync();

            var recentInvoices = await _context.Bills
                .Include(b => b.Contact)
                .Where(b => b.FirmId == firmId && b.DeletedAt == null)
                .OrderByDescending(b => b.CreatedAt)
                .Take(5)
                .Select(b => new RecentBillDto
                {
                    Id = b.Id,
                    BillNumber = b.BillNumber,
                    TotalAmount = b.TotalAmount,
                    Status = b.Status != null ? b.Status.Name : "Draft",
                    ClientName = b.Contact != null ? $"{b.Contact.FirstName} {b.Contact.LastName}" : null,
                    DueDate = b.DueDate
                })
                .ToListAsync();

            return new BillingSummaryDto
            {
                TotalBilled = bills.Sum(b => b.TotalAmount),
                TotalPaid = bills.Sum(b => b.PaidAmount),
                TotalOutstanding = bills.Sum(b => b.BalanceDue),
                OverdueBills = bills.Count(b => b.DueDate < DateTime.UtcNow && b.BalanceDue > 0),
                RecentInvoices = recentInvoices
            };
        }

        public async Task UpdateWidgetPreferences(long userId, long firmId, List<WidgetPreferenceDto> widgets)
        {
            var existingWidgets = await _context.DashboardWidgets
                .Where(w => w.UserId == userId && w.FirmId == firmId)
                .ToListAsync();

            _context.DashboardWidgets.RemoveRange(existingWidgets);

            foreach (var widget in widgets)
            {
                var newWidget = new DashboardWidget
                {
                    UserId = userId,
                    FirmId = firmId,
                    WidgetName = widget.WidgetName,
                    WidgetConfig = widget.WidgetConfig,
                    Position = widget.Position,
                    IsVisible = widget.IsVisible
                };
                _context.DashboardWidgets.Add(newWidget);
            }

            await _context.SaveChangesAsync();
        }

        public async Task<List<QuickActionDto>> GetQuickActions(long userId, long firmId)
        {
            var userRole = await _context.UserFirms
                .Where(uf => uf.UserId == userId && uf.FirmId == firmId)
                .Select(uf => uf.Role)
                .FirstOrDefaultAsync();

            var actions = new List<QuickActionDto>
            {
                new QuickActionDto { Action = "Create Matter", Icon = "folder-plus", Url = "/matters/create", Permission = "matter.create" },
                new QuickActionDto { Action = "Add Contact", Icon = "user-plus", Url = "/contacts/create", Permission = "contact.create" },
                new QuickActionDto { Action = "Create Task", Icon = "check-square", Url = "/tasks/create", Permission = "task.create" },
                new QuickActionDto { Action = "Add Event", Icon = "calendar-plus", Url = "/calendar/create", Permission = "calendar.create" },
                new QuickActionDto { Action = "Upload Document", Icon = "file-upload", Url = "/documents/upload", Permission = "document.upload" },
                new QuickActionDto { Action = "Create Bill", Icon = "receipt", Url = "/billing/create", Permission = "billing.create" }
            };

            // Filter based on user role
            if (userRole == FirmRole.VIEWER)
            {
                actions = actions.Where(a => a.Action == "Create Matter" || a.Action == "Add Contact").ToList();
            }

            return actions;
        }
    }
}