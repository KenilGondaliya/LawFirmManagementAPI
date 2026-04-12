// Controllers/TasksController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/tasks")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ITasksService _tasksService;
        private readonly IFirmContextService _firmContextService;

        public TasksController(ITasksService tasksService, IFirmContextService firmContextService)
        {
            _tasksService = tasksService;
            _firmContextService = firmContextService;
        }

        // Basic Task Operations
        [HttpGet]
        public async Task<IActionResult> GetAllTasks(
            [FromQuery] long? matterId,
            [FromQuery] string? status,
            [FromQuery] string? priority,
            [FromQuery] long? assigneeId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tasks = await _tasksService.GetAllTasks(firmId, matterId, status, priority, assigneeId);
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaskById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var task = await _tasksService.GetTaskById(id, firmId);
            if (task == null)
                return NotFound(new { message = "Task not found" });
            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var task = await _tasksService.CreateTask(firmId, userId, createDto);
            return Ok(new { message = "Task created successfully", taskId = task.Id, task });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(long id, [FromBody] UpdateTaskDto updateDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var task = await _tasksService.UpdateTask(id, firmId, updateDto);
            return Ok(new { message = "Task updated successfully", task });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _tasksService.DeleteTask(id, firmId);
            if (!result)
                return NotFound(new { message = "Task not found" });
            return Ok(new { message = "Task deleted successfully" });
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateTaskStatus(long id, [FromQuery] long statusId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var task = await _tasksService.UpdateTaskStatus(id, firmId, statusId);
            return Ok(new { message = "Task status updated", task });
        }

        // Task Filtering
        [HttpGet("assigned-to-me")]
        public async Task<IActionResult> GetTasksAssignedToMe()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var tasks = await _tasksService.GetTasksAssignedToUser(firmId, userId);
            return Ok(tasks);
        }

        [HttpGet("created-by-me")]
        public async Task<IActionResult> GetTasksCreatedByMe()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var tasks = await _tasksService.GetTasksCreatedByUser(firmId, userId);
            return Ok(tasks);
        }

        [HttpGet("overdue")]
        public async Task<IActionResult> GetOverdueTasks()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tasks = await _tasksService.GetOverdueTasks(firmId);
            return Ok(tasks);
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTasksDueToday()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tasks = await _tasksService.GetTasksDueToday(firmId);
            return Ok(tasks);
        }

        [HttpGet("this-week")]
        public async Task<IActionResult> GetTasksDueThisWeek()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tasks = await _tasksService.GetTasksDueThisWeek(firmId);
            return Ok(tasks);
        }

        [HttpGet("completed")]
        public async Task<IActionResult> GetCompletedTasks([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tasks = await _tasksService.GetCompletedTasks(firmId, from, to);
            return Ok(tasks);
        }

        // Task Assignees
        [HttpPost("{id}/assignees/{userId}")]
        public async Task<IActionResult> AddAssignee(long id, long userId, [FromQuery] bool isPrimary = false)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var currentUserId = await _firmContextService.GetCurrentUserId();
            var assignee = await _tasksService.AddAssignee(id, firmId, userId, currentUserId, isPrimary);
            return Ok(new { message = "Assignee added successfully", assignee });
        }

        [HttpDelete("{id}/assignees/{userId}")]
        public async Task<IActionResult> RemoveAssignee(long id, long userId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _tasksService.RemoveAssignee(id, firmId, userId);
            if (!result)
                return NotFound(new { message = "Assignee not found" });
            return Ok(new { message = "Assignee removed successfully" });
        }

        // Task Comments
        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetTaskComments(long id)
        {
            var task = await _tasksService.GetTaskById(id, await _firmContextService.GetCurrentFirmId());
            if (task == null)
                return NotFound(new { message = "Task not found" });
            return Ok(task.Comments);
        }

        [HttpPost("{id}/comments")]
        public async Task<IActionResult> AddComment(long id, [FromBody] string comment)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var taskComment = await _tasksService.AddComment(id, firmId, userId, comment);
            return Ok(new { message = "Comment added successfully", comment = taskComment });
        }

        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(long commentId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _tasksService.DeleteComment(commentId, firmId);
            if (!result)
                return NotFound(new { message = "Comment not found" });
            return Ok(new { message = "Comment deleted successfully" });
        }

        // Task Attachments
        [HttpPost("{id}/attachments")]
        public async Task<IActionResult> AddAttachment(long id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded" });

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var attachment = await _tasksService.AddAttachment(id, firmId, userId, file);
            return Ok(new { message = "Attachment added successfully", attachment });
        }

        [HttpDelete("attachments/{attachmentId}")]
        public async Task<IActionResult> DeleteAttachment(long attachmentId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _tasksService.DeleteAttachment(attachmentId, firmId);
            if (!result)
                return NotFound(new { message = "Attachment not found" });
            return Ok(new { message = "Attachment deleted successfully" });
        }

        // Task Relations
        [HttpGet("by-matter/{matterId}")]
        public async Task<IActionResult> GetTasksByMatter(long matterId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tasks = await _tasksService.GetAllTasks(firmId, matterId, null, null, null);
            return Ok(tasks);
        }

        [HttpGet("by-contact/{contactId}")]
        public async Task<IActionResult> GetTasksByContact(long contactId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var tasks = await _tasksService.GetAllTasks(firmId, null, null, null, null);
            tasks = tasks.Where(t => t.ContactId == contactId).ToList();
            return Ok(tasks);
        }

        // Task Statuses and Priorities
        [HttpGet("statuses")]
        public async Task<IActionResult> GetTaskStatuses()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var statuses = await _tasksService.GetTaskStatuses(firmId);
            return Ok(statuses);
        }

        [HttpPost("statuses")]
        public async Task<IActionResult> CreateTaskStatus([FromBody] CreateTaskStatusDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var status = await _tasksService.CreateTaskStatus(firmId, createDto);
            return Ok(new { message = "Task status created successfully", status });
        }

        [HttpGet("priorities")]
        public async Task<IActionResult> GetTaskPriorities()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var priorities = await _tasksService.GetTaskPriorities(firmId);
            return Ok(priorities);
        }

        [HttpPost("priorities")]
        public async Task<IActionResult> CreateTaskPriority([FromBody] CreateTaskPriorityDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var priority = await _tasksService.CreateTaskPriority(firmId, createDto);
            return Ok(new { message = "Task priority created successfully", priority });
        }

        // Statistics
        [HttpGet("stats")]
        public async Task<IActionResult> GetTaskStats()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var stats = await _tasksService.GetTaskStats(firmId, userId);
            return Ok(stats);
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var stats = await _tasksService.GetTaskStats(firmId, userId);
            return Ok(stats);
        }
    }
}