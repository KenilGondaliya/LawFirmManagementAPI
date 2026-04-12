// Controllers/CommunicationsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/communications")]
    [Authorize]
    public class CommunicationsController : ControllerBase
    {
        private readonly ICommunicationsService _communicationsService;
        private readonly IFirmContextService _firmContextService;

        public CommunicationsController(ICommunicationsService communicationsService, IFirmContextService firmContextService)
        {
            _communicationsService = communicationsService;
            _firmContextService = firmContextService;
        }

        // Threads
        [HttpGet("threads")]
        public async Task<IActionResult> GetThreads([FromQuery] long? matterId, [FromQuery] long? contactId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var threads = await _communicationsService.GetThreads(firmId, matterId, contactId);
            return Ok(threads);
        }

        [HttpGet("threads/{id}")]
        public async Task<IActionResult> GetThreadById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var thread = await _communicationsService.GetThreadById(id, firmId);
            if (thread == null)
                return NotFound(new { message = "Thread not found" });
            return Ok(thread);
        }

        [HttpPut("threads/{id}/archive")]
        public async Task<IActionResult> ArchiveThread(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _communicationsService.ArchiveThread(id, firmId);
            if (!result)
                return NotFound(new { message = "Thread not found" });
            return Ok(new { message = "Thread archived successfully" });
        }

        [HttpPut("threads/{id}/unarchive")]
        public async Task<IActionResult> UnarchiveThread(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _communicationsService.UnarchiveThread(id, firmId);
            if (!result)
                return NotFound(new { message = "Thread not found" });
            return Ok(new { message = "Thread unarchived successfully" });
        }

        // Messages
        [HttpGet("messages")]
        public async Task<IActionResult> GetMessages([FromQuery] long? threadId, [FromQuery] long? matterId, [FromQuery] long? contactId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            
            if (threadId.HasValue)
            {
                var messages = await _communicationsService.GetMessagesByThread(threadId.Value, firmId);
                return Ok(messages);
            }
            else if (matterId.HasValue)
            {
                var messages = await _communicationsService.GetMessagesByMatter(matterId.Value, firmId);
                return Ok(messages);
            }
            else if (contactId.HasValue)
            {
                var messages = await _communicationsService.GetMessagesByContact(contactId.Value, firmId);
                return Ok(messages);
            }
            
            return Ok(new List<object>());
        }

        [HttpGet("messages/{id}")]
        public async Task<IActionResult> GetMessageById(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var messages = await _communicationsService.GetMessagesByThread(id, firmId);
            var message = messages.FirstOrDefault();
            if (message == null)
                return NotFound(new { message = "Message not found" });
            return Ok(message);
        }

        [HttpPost("messages/send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto sendDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var message = await _communicationsService.SendMessage(firmId, userId, sendDto);
            return Ok(new { message = "Message sent successfully", messageId = message.Id });
        }

        [HttpPost("messages/{id}/reply")]
        public async Task<IActionResult> ReplyToMessage(long id, [FromBody] ReplyMessageDto replyDto)
        {
            replyDto.OriginalMessageId = id;
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var message = await _communicationsService.ReplyToMessage(id, firmId, userId, replyDto);
            return Ok(new { message = "Reply sent successfully", messageId = message.Id });
        }

        [HttpPut("messages/{id}/star")]
        public async Task<IActionResult> StarMessage(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _communicationsService.StarMessage(id, firmId);
            if (!result)
                return NotFound(new { message = "Message not found" });
            return Ok(new { message = "Message starred status updated" });
        }

        // Email Integration
        [HttpPost("email/connect")]
        public async Task<IActionResult> ConnectEmail([FromBody] ConnectEmailDto connectDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var integration = await _communicationsService.ConnectEmail(firmId, userId, connectDto);
            return Ok(new { message = "Email connected successfully", integration });
        }

        [HttpDelete("email/disconnect")]
        public async Task<IActionResult> DisconnectEmail()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var result = await _communicationsService.DisconnectEmail(firmId, userId);
            if (!result)
                return NotFound(new { message = "Email integration not found" });
            return Ok(new { message = "Email disconnected successfully" });
        }

        [HttpGet("email/status")]
        public async Task<IActionResult> GetEmailStatus()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var status = await _communicationsService.GetEmailIntegrationStatus(firmId, userId);
            return Ok(status);
        }

        [HttpPost("email/sync")]
        public async Task<IActionResult> SyncEmails()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var result = await _communicationsService.SyncEmails(firmId, userId);
            if (!result)
                return BadRequest(new { message = "Failed to sync emails" });
            return Ok(new { message = "Emails synced successfully" });
        }

        // Templates
        [HttpGet("templates")]
        public async Task<IActionResult> GetEmailTemplates()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var templates = await _communicationsService.GetEmailTemplates(firmId);
            return Ok(templates);
        }

        [HttpPost("templates")]
        public async Task<IActionResult> CreateEmailTemplate([FromBody] CreateEmailTemplateDto createDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var template = await _communicationsService.CreateEmailTemplate(firmId, userId, createDto);
            return Ok(new { message = "Template created successfully", template });
        }

        [HttpDelete("templates/{id}")]
        public async Task<IActionResult> DeleteEmailTemplate(long id)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var result = await _communicationsService.DeleteEmailTemplate(id, firmId);
            if (!result)
                return NotFound(new { message = "Template not found" });
            return Ok(new { message = "Template deleted successfully" });
        }

        // By Context
        [HttpGet("by-matter/{matterId}")]
        public async Task<IActionResult> GetMessagesByMatter(long matterId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var messages = await _communicationsService.GetMessagesByMatter(matterId, firmId);
            return Ok(messages);
        }

        [HttpGet("by-contact/{contactId}")]
        public async Task<IActionResult> GetMessagesByContact(long contactId)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var messages = await _communicationsService.GetMessagesByContact(contactId, firmId);
            return Ok(messages);
        }
    }
}