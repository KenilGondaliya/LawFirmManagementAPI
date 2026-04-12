// Models/DTOs/DashboardDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    public class DashboardSummaryDto
    {
        public MattersSummaryDto Matters { get; set; } = new();
        public ContactsSummaryDto Contacts { get; set; } = new();
        public TasksSummaryDto Tasks { get; set; } = new();
        public BillingSummaryDto Billing { get; set; } = new();
    }

    public class MattersSummaryDto
    {
        public int Total { get; set; }
        public int Open { get; set; }
        public int Pending { get; set; }
        public int Closed { get; set; }
        public int HighPriority { get; set; }
    }

    public class ContactsSummaryDto
    {
        public int Total { get; set; }
        public int Clients { get; set; }
        public int Opponents { get; set; }
        public int Important { get; set; }
    }

    public class TasksSummaryDto
    {
        public int Total { get; set; }
        public int Completed { get; set; }
        public int Overdue { get; set; }
        public int DueToday { get; set; }
        public int DueThisWeek { get; set; }
        public int MyTasks { get; set; }
        public int MyPendingTasks { get; set; }
    }

    public class BillingSummaryDto
    {
        public decimal TotalBilled { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal TotalOutstanding { get; set; }
        public int OverdueBills { get; set; }
        public List<RecentBillDto> RecentInvoices { get; set; } = new();
    }

    public class RecentBillDto
    {
        public long Id { get; set; }
        public string BillNumber { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ClientName { get; set; }
        public DateTime DueDate { get; set; }
    }

    public class DashboardStatsDto
    {
        public List<StatusCountDto> MattersByStatus { get; set; } = new();
        public List<PriorityCountDto> MattersByPriority { get; set; } = new();
        public List<MonthlyBillDto> MonthlyBills { get; set; } = new();
        public List<RecentActivityDto> RecentActivities { get; set; } = new();
    }

    public class StatusCountDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class PriorityCountDto
    {
        public string Priority { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class MonthlyBillDto
    {
        public int Month { get; set; }
        public decimal Total { get; set; }
        public decimal Paid { get; set; }
        public decimal Outstanding => Total - Paid;
    }

    public class RecentActivityDto
    {
        public long Id { get; set; }
        public string ActivityType { get; set; } = string.Empty;
        public string? EntityType { get; set; }
        public long? EntityId { get; set; }
        public string? EntityName { get; set; }
        public string? Description { get; set; }
        public string? UserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class NotificationDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Message { get; set; }
        public string? NotificationType { get; set; }
        public string? RelatedEntityType { get; set; }
        public long? RelatedEntityId { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpcomingEventsDto
    {
        public List<UpcomingEventDto> Events { get; set; } = new();
        public int Total { get; set; }
    }

    public class UpcomingEventDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public string EventType { get; set; } = string.Empty;
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public bool IsAllDay { get; set; }
        public string? MatterTitle { get; set; }
        public string? ContactName { get; set; }
    }

    public class WidgetPreferenceDto
    {
        public string WidgetName { get; set; } = string.Empty;
        public string? WidgetConfig { get; set; }
        public int Position { get; set; }
        public bool IsVisible { get; set; }
    }

    public class QuickActionDto
    {
        public string Action { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Permission { get; set; } = string.Empty;
    }
}