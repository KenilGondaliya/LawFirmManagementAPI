using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;

using TaskEntity = LawFirmAPI.Models.Entities.TaskEntity;
using TaskStatusEntity = LawFirmAPI.Models.Entities.TaskStatus;

namespace LawFirmAPI.Services
{
    public interface ITasksService
    {
        Task<List<TaskDto>> GetAllTasks(long firmId, long? matterId, string? status, string? priority, long? assigneeId);
        System.Threading.Tasks.Task<TaskDto?> GetTaskById(long id, long firmId);
        System.Threading.Tasks.Task<TaskDto> CreateTask(long firmId, long userId, CreateTaskDto createDto);
        System.Threading.Tasks.Task<TaskDto> UpdateTask(long id, long firmId, UpdateTaskDto updateDto);
        System.Threading.Tasks.Task<bool> DeleteTask(long id, long firmId);
        System.Threading.Tasks.Task<TaskDto> UpdateTaskStatus(long id, long firmId, long statusId);
        System.Threading.Tasks.Task<List<TaskDto>> GetTasksAssignedToUser(long firmId, long userId);
        System.Threading.Tasks.Task<List<TaskDto>> GetTasksCreatedByUser(long firmId, long userId);
        System.Threading.Tasks.Task<List<TaskDto>> GetOverdueTasks(long firmId);
        System.Threading.Tasks.Task<List<TaskDto>> GetTasksDueToday(long firmId);
        System.Threading.Tasks.Task<List<TaskDto>> GetTasksDueThisWeek(long firmId);
        System.Threading.Tasks.Task<List<TaskDto>> GetCompletedTasks(long firmId, DateTime? from, DateTime? to);
        System.Threading.Tasks.Task<TaskAssigneeDto> AddAssignee(long taskId, long firmId, long userId, long assignedBy, bool isPrimary);
        System.Threading.Tasks.Task<bool> RemoveAssignee(long taskId, long firmId, long userId);
        System.Threading.Tasks.Task<TaskCommentDto> AddComment(long taskId, long firmId, long userId, string comment);
        System.Threading.Tasks.Task<bool> DeleteComment(long commentId, long firmId);
        System.Threading.Tasks.Task<TaskAttachmentDto> AddAttachment(long taskId, long firmId, long userId, IFormFile file);
        System.Threading.Tasks.Task<bool> DeleteAttachment(long attachmentId, long firmId);
        System.Threading.Tasks.Task<List<TaskStatusDto>> GetTaskStatuses(long firmId);
        System.Threading.Tasks.Task<TaskStatusDto> CreateTaskStatus(long firmId, CreateTaskStatusDto createDto);
        System.Threading.Tasks.Task<List<TaskPriorityDto>> GetTaskPriorities(long firmId);
        System.Threading.Tasks.Task<TaskPriorityDto> CreateTaskPriority(long firmId, CreateTaskPriorityDto createDto);
        System.Threading.Tasks.Task<TaskStatsDto> GetTaskStats(long firmId, long userId);
    }

    public class TasksService : ITasksService
    {
        private readonly ApplicationDbContext _context;
        private readonly IFileService _fileService;

        public TasksService(ApplicationDbContext context, IFileService fileService)
        {
            _context = context;
            _fileService = fileService;
        }

        public async Task<List<TaskDto>> GetAllTasks(long firmId, long? matterId, string? status, string? priority, long? assigneeId)
        {
            var query = _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Matter)
                .Include(t => t.Contact)
                .Include(t => t.Assignees)
                .ThenInclude(a => a.User)
                .Where(t => t.FirmId == firmId && t.DeletedAt == null);

            if (matterId.HasValue)
                query = query.Where(t => t.MatterId == matterId.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(t => t.Status != null && t.Status.Name == status);

            if (!string.IsNullOrEmpty(priority))
                query = query.Where(t => t.Priority != null && t.Priority.Name == priority);

            if (assigneeId.HasValue)
                query = query.Where(t => t.Assignees.Any(a => a.UserId == assigneeId.Value));

            var tasks = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return tasks;
        }

        public async System.Threading.Tasks.Task<TaskDto?> GetTaskById(long id, long firmId)
        {
            var task = await _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Matter)
                .Include(t => t.Contact)
                .Include(t => t.Assignees)
                .ThenInclude(a => a.User)
                .Include(t => t.Comments)
                .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(t => t.Id == id && t.FirmId == firmId && t.DeletedAt == null);

            return task != null ? MapToDto(task) : null;
        }

        public async System.Threading.Tasks.Task<TaskDto> CreateTask(long firmId, long userId, CreateTaskDto createDto)
        {
            var task = new TaskEntity
            {
                FirmId = firmId,
                Title = createDto.Title,
                Description = createDto.Description,
                MatterId = createDto.MatterId,
                ContactId = createDto.ContactId,
                StatusId = createDto.StatusId,
                PriorityId = createDto.PriorityId,
                DueDate = createDto.DueDate,
                DueTime = createDto.DueTime,
                EstimatedHours = createDto.EstimatedHours,
                IsRecurring = createDto.IsRecurring,
                RecurrencePattern = createDto.RecurrencePattern != null ? System.Text.Json.JsonSerializer.Serialize(createDto.RecurrencePattern) : null,
                ParentTaskId = createDto.ParentTaskId,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            if (createDto.AssigneeIds != null)
            {
                foreach (var assigneeId in createDto.AssigneeIds)
                {
                    var assignee = new TaskAssignee
                    {
                        TaskId = task.Id,
                        UserId = assigneeId,
                        AssignedBy = userId,
                        IsPrimary = assigneeId == createDto.PrimaryAssigneeId,
                        AssignedAt = DateTime.UtcNow
                    };
                    _context.TaskAssignees.Add(assignee);
                }
                await _context.SaveChangesAsync();
            }

            AddRecentActivity(firmId, userId, "CREATE", "Task", task.Id, task.Title, $"Created task: {task.Title}");

            return MapToDto(task);
        }

        public async System.Threading.Tasks.Task<TaskDto> UpdateTask(long id, long firmId, UpdateTaskDto updateDto)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.FirmId == firmId && t.DeletedAt == null);

            if (task == null)
                throw new KeyNotFoundException("Task not found");

            if (updateDto.Title != null)
                task.Title = updateDto.Title;
            if (updateDto.Description != null)
                task.Description = updateDto.Description;
            if (updateDto.PriorityId.HasValue)
                task.PriorityId = updateDto.PriorityId.Value;
            if (updateDto.DueDate.HasValue)
                task.DueDate = updateDto.DueDate;
            if (updateDto.DueTime.HasValue)
                task.DueTime = updateDto.DueTime;
            if (updateDto.EstimatedHours.HasValue)
                task.EstimatedHours = updateDto.EstimatedHours;

            task.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(task);
        }

        public async System.Threading.Tasks.Task<bool> DeleteTask(long id, long firmId)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.FirmId == firmId && t.DeletedAt == null);

            if (task == null)
                return false;

            task.DeletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async System.Threading.Tasks.Task<TaskDto> UpdateTaskStatus(long id, long firmId, long statusId)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == id && t.FirmId == firmId && t.DeletedAt == null);

            if (task == null)
                throw new KeyNotFoundException("Task not found");

            task.StatusId = statusId;
            
            var status = await _context.TaskStatuses.FindAsync(statusId);
            if (status != null && status.Name == "Completed")
            {
                task.CompletedAt = DateTime.UtcNow;
                task.CompletedBy = 1;
            }

            task.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return MapToDto(task);
        }

        public async Task<List<TaskDto>> GetTasksAssignedToUser(long firmId, long userId)
        {
            var tasks = await _context.TaskAssignees
                .Include(ta => ta.Task)
                    .ThenInclude(t => t!.Status)
                .Include(ta => ta.Task)
                    .ThenInclude(t => t!.Priority)
                .Include(ta => ta.Task)
                    .ThenInclude(t => t!.Matter)
                .Where(ta => ta.UserId == userId && ta.Task != null && ta.Task.FirmId == firmId && ((TaskEntity)ta.Task).DeletedAt == null)
                .Select(ta => MapToDto(ta.Task!))
                .ToListAsync();

            return tasks;
        }

        public async System.Threading.Tasks.Task<List<TaskDto>> GetTasksCreatedByUser(long firmId, long userId)
        {
            var tasks = await _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Matter)
                .Where(t => t.FirmId == firmId && t.CreatedBy == userId && t.DeletedAt == null)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return tasks;
        }

        public async System.Threading.Tasks.Task<List<TaskDto>> GetOverdueTasks(long firmId)
        {
            var tasks = await _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Matter)
                .Where(t => t.FirmId == firmId && 
                           t.DueDate.HasValue && 
                           t.DueDate < DateTime.UtcNow && 
                           !t.CompletedAt.HasValue &&
                           t.DeletedAt == null)
                .OrderBy(t => t.DueDate)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return tasks;
        }

        public async System.Threading.Tasks.Task<List<TaskDto>> GetTasksDueToday(long firmId)
        {
            var today = DateTime.UtcNow.Date;

            var tasks = await _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Matter)
                .Where(t => t.FirmId == firmId && 
                           t.DueDate.HasValue && 
                           t.DueDate.Value.Date == today &&
                           !t.CompletedAt.HasValue &&
                           t.DeletedAt == null)
                .OrderBy(t => t.DueDate)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return tasks;
        }

        public async System.Threading.Tasks.Task<List<TaskDto>> GetTasksDueThisWeek(long firmId)
        {
            var today = DateTime.UtcNow.Date;
            var endOfWeek = today.AddDays(7 - (int)today.DayOfWeek + (int)DayOfWeek.Monday);

            var tasks = await _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Matter)
                .Where(t => t.FirmId == firmId && 
                           t.DueDate.HasValue && 
                           t.DueDate.Value.Date >= today &&
                           t.DueDate.Value.Date <= endOfWeek &&
                           !t.CompletedAt.HasValue &&
                           t.DeletedAt == null)
                .OrderBy(t => t.DueDate)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return tasks;
        }

        public async System.Threading.Tasks.Task<List<TaskDto>> GetCompletedTasks(long firmId, DateTime? from, DateTime? to)
        {
            var query = _context.Tasks
                .Include(t => t.Status)
                .Include(t => t.Priority)
                .Include(t => t.Matter)
                .Where(t => t.FirmId == firmId && t.CompletedAt.HasValue && t.DeletedAt == null);

            if (from.HasValue)
                query = query.Where(t => t.CompletedAt >= from.Value);
            if (to.HasValue)
                query = query.Where(t => t.CompletedAt <= to.Value);

            var tasks = await query
                .OrderByDescending(t => t.CompletedAt)
                .Select(t => MapToDto(t))
                .ToListAsync();

            return tasks;
        }

        public async System.Threading.Tasks.Task<TaskAssigneeDto> AddAssignee(long taskId, long firmId, long userId, long assignedBy, bool isPrimary)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId && t.FirmId == firmId);

            if (task == null)
                throw new KeyNotFoundException("Task not found");

            var existing = await _context.TaskAssignees
                .FirstOrDefaultAsync(ta => ta.TaskId == taskId && ta.UserId == userId);

            if (existing != null)
                throw new InvalidOperationException("User is already assigned to this task");

            var assignee = new TaskAssignee
            {
                TaskId = taskId,
                UserId = userId,
                AssignedBy = assignedBy,
                IsPrimary = isPrimary,
                AssignedAt = DateTime.UtcNow
            };

            _context.TaskAssignees.Add(assignee);
            await _context.SaveChangesAsync();

            return new TaskAssigneeDto
            {
                UserId = userId,
                IsPrimary = isPrimary,
                AssignedAt = assignee.AssignedAt
            };
        }

        public async System.Threading.Tasks.Task<bool> RemoveAssignee(long taskId, long firmId, long userId)
        {
            var assignee = await _context.TaskAssignees
                .FirstOrDefaultAsync(ta => ta.TaskId == taskId && ta.UserId == userId);

            if (assignee == null)
                return false;

            _context.TaskAssignees.Remove(assignee);
            await _context.SaveChangesAsync();

            return true;
        }

        public async System.Threading.Tasks.Task<TaskCommentDto> AddComment(long taskId, long firmId, long userId, string comment)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId && t.FirmId == firmId);

            if (task == null)
                throw new KeyNotFoundException("Task not found");

            var taskComment = new TaskComment
            {
                TaskId = taskId,
                UserId = userId,
                Comment = comment,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TaskComments.Add(taskComment);
            await _context.SaveChangesAsync();

            return new TaskCommentDto
            {
                Id = taskComment.Id,
                Comment = taskComment.Comment,
                UserId = userId,
                CreatedAt = taskComment.CreatedAt
            };
        }

        public async System.Threading.Tasks.Task<bool> DeleteComment(long commentId, long firmId)
        {
            var comment = await _context.TaskComments
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
                return false;

            _context.TaskComments.Remove(comment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async System.Threading.Tasks.Task<TaskAttachmentDto> AddAttachment(long taskId, long firmId, long userId, IFormFile file)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId && t.FirmId == firmId);

            if (task == null)
                throw new KeyNotFoundException("Task not found");

            var filePath = await _fileService.SaveFile(file, "task-attachments");

            var attachment = new TaskAttachment
            {
                TaskId = taskId,
                FileName = file.FileName,
                FilePath = filePath,
                FileSize = file.Length,
                MimeType = file.ContentType,
                UploadedBy = userId,
                UploadedAt = DateTime.UtcNow
            };

            _context.TaskAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            return new TaskAttachmentDto
            {
                Id = attachment.Id,
                FileName = attachment.FileName,
                FileSize = attachment.FileSize,
                UploadedAt = attachment.UploadedAt
            };
        }

        public async System.Threading.Tasks.Task<bool> DeleteAttachment(long attachmentId, long firmId)
        {
            var attachment = await _context.TaskAttachments
                .FirstOrDefaultAsync(a => a.Id == attachmentId);

            if (attachment == null)
                return false;

            _fileService.DeleteFile(attachment.FilePath);
            _context.TaskAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async System.Threading.Tasks.Task<List<TaskStatusDto>> GetTaskStatuses(long firmId)
        {
            var statuses = await _context.TaskStatuses
                .Where(ts => ts.FirmId == firmId)
                .Select(ts => new TaskStatusDto
                {
                    Id = ts.Id,
                    Name = ts.Name,
                    Color = ts.Color,
                    IsDefault = ts.IsDefault
                })
                .ToListAsync();

            return statuses;
        }

        public async System.Threading.Tasks.Task<TaskStatusDto> CreateTaskStatus(long firmId, CreateTaskStatusDto createDto)
        {
            var status = new TaskStatusEntity
            {
                FirmId = firmId,
                Name = createDto.Name,
                Color = createDto.Color,
                IsDefault = createDto.IsDefault,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaskStatuses.Add(status);
            await _context.SaveChangesAsync();

            return new TaskStatusDto
            {
                Id = status.Id,
                Name = status.Name,
                Color = status.Color,
                IsDefault = status.IsDefault
            };
        }

        public async System.Threading.Tasks.Task<List<TaskPriorityDto>> GetTaskPriorities(long firmId)
        {
            var priorities = await _context.TaskPriorities
                .Where(tp => tp.FirmId == firmId)
                .OrderBy(tp => tp.Level)
                .Select(tp => new TaskPriorityDto
                {
                    Id = tp.Id,
                    Name = tp.Name,
                    Color = tp.Color,
                    Level = tp.Level
                })
                .ToListAsync();

            return priorities;
        }

        public async System.Threading.Tasks.Task<TaskPriorityDto> CreateTaskPriority(long firmId, CreateTaskPriorityDto createDto)
        {
            var priority = new TaskPriority
            {
                FirmId = firmId,
                Name = createDto.Name,
                Color = createDto.Color,
                Level = createDto.Level,
                CreatedAt = DateTime.UtcNow
            };

            _context.TaskPriorities.Add(priority);
            await _context.SaveChangesAsync();

            return new TaskPriorityDto
            {
                Id = priority.Id,
                Name = priority.Name,
                Color = priority.Color,
                Level = priority.Level
            };
        }

        public async System.Threading.Tasks.Task<TaskStatsDto> GetTaskStats(long firmId, long userId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.FirmId == firmId && t.DeletedAt == null)
                .ToListAsync();

            var myTasks = await _context.TaskAssignees
                .Include(ta => ta.Task)
                .Where(ta => ta.UserId == userId && ta.Task != null && ta.Task.FirmId == firmId && ta.Task.DeletedAt == null)
                .Select(ta => ta.Task)
                .ToListAsync();

            var stats = new TaskStatsDto
            {
                Total = tasks.Count,
                Completed = tasks.Count(t => t.CompletedAt.HasValue),
                InProgress = tasks.Count(t => !t.CompletedAt.HasValue && t.StatusId != 1),
                Overdue = tasks.Count(t => t.DueDate.HasValue && t.DueDate < DateTime.UtcNow && !t.CompletedAt.HasValue),
                DueToday = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value.Date == DateTime.UtcNow.Date && !t.CompletedAt.HasValue),
                DueThisWeek = tasks.Count(t => t.DueDate.HasValue && t.DueDate.Value.Date <= DateTime.UtcNow.AddDays(7).Date && !t.CompletedAt.HasValue),
                MyTasks = myTasks.Count,
                MyCompletedTasks = myTasks.Count(t => t != null && t.CompletedAt.HasValue),
                MyPendingTasks = myTasks.Count(t => t != null && !t.CompletedAt.HasValue)
            };

            return stats;
        }

        private TaskDto MapToDto(TaskEntity t)
        {
            return new TaskDto
            {
                Id = t.Id,
                Uuid = t.Uuid,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                DueTime = t.DueTime,
                EstimatedHours = t.EstimatedHours,
                ActualHours = t.ActualHours,
                IsRecurring = t.IsRecurring,
                ParentTaskId = t.ParentTaskId,
                StatusId = t.StatusId,
                StatusName = t.Status?.Name,
                StatusColor = t.Status?.Color,
                PriorityId = t.PriorityId,
                PriorityName = t.Priority?.Name,
                PriorityColor = t.Priority?.Color,
                PriorityLevel = t.Priority?.Level ?? 0,
                MatterId = t.MatterId,
                MatterTitle = t.Matter?.Title,
                ContactId = t.ContactId,
                ContactName = t.Contact != null ? $"{t.Contact.FirstName} {t.Contact.LastName}" : null,
                CompletedAt = t.CompletedAt,
                Assignees = t.Assignees.Select(a => new TaskAssigneeDto
                {
                    UserId = a.UserId,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : null,
                    IsPrimary = a.IsPrimary,
                    AssignedAt = a.AssignedAt
                }).ToList(),
                Comments = t.Comments.Select(c => new TaskCommentDto
                {
                    Id = c.Id,
                    Comment = c.Comment,
                    UserId = c.UserId,
                    UserName = c.User != null ? $"{c.User.FirstName} {c.User.LastName}" : null,
                    CreatedAt = c.CreatedAt
                }).ToList(),
                CreatedBy = t.CreatedBy,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            };
        }

        private void AddRecentActivity(long firmId, long userId, string activityType, string entityType, long entityId, string entityName, string description)
        {
            var activity = new RecentActivity
            {
                FirmId = firmId,
                UserId = userId,
                ActivityType = activityType,
                EntityType = entityType,
                EntityId = entityId,
                EntityName = entityName,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };
            _context.RecentActivities.Add(activity);
            _context.SaveChanges();
        }
    }
}