// Controllers/CommunicationsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LawFirmAPI.Services;
using LawFirmAPI.Models.DTOs;
using MailKit.Net.Imap;
using MailKit;
using MailKit.Search;


namespace LawFirmAPI.Controllers
{
    [ApiController]
    [Route("api/v1/communications")]
    [Authorize]
    public class CommunicationsController : ControllerBase
    {
        private readonly ICommunicationsService _communicationsService;
        private readonly IFirmContextService _firmContextService;

        private readonly IEmailSyncService _emailSyncService;

        public CommunicationsController(ICommunicationsService communicationsService, IFirmContextService firmContextService, IEmailSyncService emailSyncService)
        {
            _communicationsService = communicationsService;
            _firmContextService = firmContextService;
            _emailSyncService = emailSyncService;
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

        // Controllers/CommunicationsController.cs
        [HttpPost("email/connect")]
        public async Task<IActionResult> ConnectEmail([FromBody] ConnectEmailDto connectDto)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();

            var success = await _emailSyncService.ConnectEmailAsync(
                userId, firmId,
                connectDto.EmailAddress,
                connectDto.Password,
                connectDto.Provider);

            if (!success)
                return BadRequest(new { message = "Failed to connect. Check your email and app password." });

            return Ok(new { message = "Email connected successfully" });
        }

        [HttpPost("email/sync")]
        public async Task<IActionResult> SyncEmails()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();

            var syncedCount = await _emailSyncService.SyncEmailsAsync(userId, firmId);

            return Ok(new
            {
                message = $"Synced {syncedCount} emails",
                synced = syncedCount
            });
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

        // Controllers/CommunicationsController.cs - Fixed debug method
        [HttpGet("debug/gmail-emails")]
        public async Task<IActionResult> DebugGetGmailEmails([FromQuery] int limit = 20)
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();

            // Get the actual EmailIntegration entity
            var integration = await _communicationsService.GetEmailIntegrationEntity(firmId, userId);

            if (integration == null)
                return BadRequest(new { message = "No email connected. Please connect your email first." });

            if (string.IsNullOrEmpty(integration.PasswordEncrypted))
                return BadRequest(new { message = "Email password not found. Please reconnect your email." });

            try
            {
                Console.WriteLine($"Connecting to IMAP for: {integration.EmailAddress}");

                using var client = new ImapClient();
                await client.ConnectAsync(integration.ImapHost ?? "imap.gmail.com", integration.ImapPort ?? 993, true);
                await client.AuthenticateAsync(integration.EmailAddress, integration.PasswordEncrypted);

                var inbox = client.Inbox;
                await inbox.OpenAsync(FolderAccess.ReadOnly);

                // Get ALL emails
                var allUids = await inbox.SearchAsync(SearchQuery.All);

                Console.WriteLine($"Total emails in Gmail: {allUids.Count}");

                var emails = new List<object>();

                // Get last 'limit' emails (newest first)
                int startIndex = Math.Max(0, allUids.Count - limit);
                for (int i = allUids.Count - 1; i >= startIndex; i--)
                {
                    var message = await inbox.GetMessageAsync(allUids[i]);
                    emails.Add(new
                    {
                        Subject = message.Subject ?? "(No Subject)",
                        From = message.From.ToString(),
                        To = message.To.ToString(),
                        Date = message.Date.ToString("yyyy-MM-dd HH:mm:ss"),
                        DateUtc = message.Date.UtcDateTime,
                        HasBody = !string.IsNullOrEmpty(message.TextBody),
                        MessageId = message.MessageId
                    });
                }

                await client.DisconnectAsync(true);

                return Ok(new
                {
                    success = true,
                    totalEmails = allUids.Count,
                    emailsShown = emails.Count,
                    emails = emails,
                    integration = new
                    {
                        email = integration.EmailAddress,
                        lastSyncAt = integration.LastSyncAt,
                        provider = integration.Provider,
                        imapHost = integration.ImapHost,
                        imapPort = integration.ImapPort
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return BadRequest(new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
        [HttpGet("email/status")]
        public async Task<IActionResult> GetEmailStatus()
        {
            var firmId = await _firmContextService.GetCurrentFirmId();
            var userId = await _firmContextService.GetCurrentUserId();
            var status = await _communicationsService.GetEmailIntegrationStatus(firmId, userId);
            return Ok(status);
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