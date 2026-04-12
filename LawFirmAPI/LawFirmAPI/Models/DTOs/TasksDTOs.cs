// Models/DTOs/TasksDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    public class TaskDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public TimeSpan? DueTime { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public bool IsRecurring { get; set; }
        public long? ParentTaskId { get; set; }
        public long StatusId { get; set; }
        public string? StatusName { get; set; }
        public string? StatusColor { get; set; }
        public long PriorityId { get; set; }
        public string? PriorityName { get; set; }
        public string? PriorityColor { get; set; }
        public int PriorityLevel { get; set; }
        public long? MatterId { get; set; }
        public string? MatterTitle { get; set; }
        public long? ContactId { get; set; }
        public string? ContactName { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<TaskAssigneeDto> Assignees { get; set; } = new();
        public List<TaskCommentDto> Comments { get; set; } = new();
        public long CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public long? MatterId { get; set; }
        public long? ContactId { get; set; }
        public long StatusId { get; set; }
        public long PriorityId { get; set; }
        public DateTime? DueDate { get; set; }
        public TimeSpan? DueTime { get; set; }
        public decimal? EstimatedHours { get; set; }
        public bool IsRecurring { get; set; } = false;
        public object? RecurrencePattern { get; set; }
        public long? ParentTaskId { get; set; }
        public List<long>? AssigneeIds { get; set; }
        public long? PrimaryAssigneeId { get; set; }
        public int? ReminderMinutes { get; set; }
    }

    public class UpdateTaskDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public long? PriorityId { get; set; }
        public DateTime? DueDate { get; set; }
        public TimeSpan? DueTime { get; set; }
        public decimal? EstimatedHours { get; set; }
    }

    public class TaskAssigneeDto
    {
        public long UserId { get; set; }
        public string? UserName { get; set; }
        public bool IsPrimary { get; set; }
        public DateTime AssignedAt { get; set; }
    }

    public class TaskCommentDto
    {
        public long Id { get; set; }
        public string Comment { get; set; } = string.Empty;
        public long UserId { get; set; }
        public string? UserName { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TaskAttachmentDto
    {
        public long Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class TaskStatusDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public bool IsDefault { get; set; }
    }

    public class CreateTaskStatusDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public bool IsDefault { get; set; } = false;
    }

    public class TaskPriorityDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public int Level { get; set; }
    }

    public class CreateTaskPriorityDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Color { get; set; }
        public int Level { get; set; }
    }

    public class TaskStatsDto
    {
        public int Total { get; set; }
        public int Completed { get; set; }
        public int InProgress { get; set; }
        public int Overdue { get; set; }
        public int DueToday { get; set; }
        public int DueThisWeek { get; set; }
        public int MyTasks { get; set; }
        public int MyCompletedTasks { get; set; }
        public int MyPendingTasks { get; set; }
    }
}