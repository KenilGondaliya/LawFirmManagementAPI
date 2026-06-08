// Services/EmailSyncService.cs
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Search;
using MimeKit;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;

namespace LawFirmAPI.Services
{
    public interface IEmailSyncService
    {
        Task<int> SyncEmailsAsync(long userId, long firmId);
        Task<bool> ConnectEmailAsync(long userId, long firmId, string email, string password, string provider);
        Task<bool> SendEmailAsync(string fromEmail, string fromName, string toEmail, string subject, string body);
    }

    public class EmailSyncService : IEmailSyncService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailSyncService> _logger;

        public EmailSyncService(
            ApplicationDbContext context,
            IConfiguration configuration,
            ILogger<EmailSyncService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<int> SyncEmailsAsync(long userId, long firmId)
        {
            var integration = await _context.EmailIntegrations
                .FirstOrDefaultAsync(e => e.UserId == userId && e.FirmId == firmId);

            if (integration == null)
            {
                _logger.LogWarning("No email integration found for user {UserId}", userId);
                return 0;
            }

            int syncedCount = 0;

            try
            {
                using var client = new ImapClient();

                // Configure IMAP based on provider
                string imapHost = integration.ImapHost ?? "imap.gmail.com";
                int imapPort = integration.ImapPort ?? 993;

                _logger.LogInformation("Connecting to IMAP server: {Host}:{Port}", imapHost, imapPort);

                await client.ConnectAsync(imapHost, imapPort, true);
                await client.AuthenticateAsync(integration.EmailAddress, integration.PasswordEncrypted);

                var inbox = client.Inbox;
                await inbox.OpenAsync(MailKit.FolderAccess.ReadOnly);

                // Get emails from last 30 days
                var since = DateTime.UtcNow.AddDays(-30);
                var query = SearchQuery.DeliveredAfter(since);
                var uids = await inbox.SearchAsync(query);

                _logger.LogInformation("Found {Count} emails since {Date}", uids.Count, since);

                foreach (var uid in uids)
                {
                    var message = await inbox.GetMessageAsync(uid);

                    // Check if email already exists by MessageId
                    var exists = await _context.Communications
                        .AnyAsync(c => c.MessageId == message.MessageId);

                    if (!exists)
                    {
                        await SaveEmailToDatabase(message, firmId, userId, integration.EmailAddress);
                        syncedCount++;
                    }
                }

                await client.DisconnectAsync(true);

                // Update last sync time
                integration.LastSyncAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Successfully synced {Count} new emails", syncedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync emails");
            }

            return syncedCount;
        }

        private async Task SaveEmailToDatabase(MimeMessage message, long firmId, long userId, string userEmail)
        {
            // Determine the other party (sender or recipient)
            string otherPartyEmail = message.From.Mailboxes.FirstOrDefault()?.Address ?? "";
            string otherPartyName = message.From.Mailboxes.FirstOrDefault()?.Name ?? "";

            // Check if message is from user or to user
            bool isFromUser = message.From.Mailboxes.Any(m => m.Address == userEmail);
            bool isToUser = message.To.Mailboxes.Any(m => m.Address == userEmail);

            string subject = message.Subject ?? "(No Subject)";

            // Find or create thread
            var thread = await _context.CommunicationThreads
                .FirstOrDefaultAsync(t => t.FirmId == firmId &&
                    t.Subject == subject &&
                    t.Status == "ACTIVE");

            if (thread == null)
            {
                thread = new CommunicationThread
                {
                    FirmId = firmId,
                    Subject = subject,
                    ThreadType = "EMAIL",
                    Status = "ACTIVE",
                    CreatedBy = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    LastMessageAt = message.Date.DateTime
                };
                _context.CommunicationThreads.Add(thread);
                await _context.SaveChangesAsync();
            }
            else
            {
                thread.LastMessageAt = message.Date.DateTime;
                thread.UpdatedAt = DateTime.UtcNow;
            }

            // Create communication record
            var communication = new Communication
            {
                ThreadId = thread.Id,
                MessageId = message.MessageId,
                SenderType = isFromUser ? "USER" : "EXTERNAL",
                SenderEmail = otherPartyEmail,
                SenderName = otherPartyName,
                RecipientType = isToUser ? "USER" : "CONTACT",
                Subject = subject,
                Body = message.TextBody ?? message.HtmlBody,
                BodyPreview = (message.TextBody ?? message.HtmlBody)?.Length > 200
                    ? (message.TextBody ?? message.HtmlBody).Substring(0, 200)
                    : message.TextBody ?? message.HtmlBody,
                HasAttachments = message.Attachments.Any(),
                IsRead = false,
                SentAt = message.Date.DateTime,
                ReceivedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Communications.Add(communication);

            // Add recipients
            foreach (var to in message.To.Mailboxes)
            {
                _context.CommunicationRecipients.Add(new CommunicationRecipient
                {
                    CommunicationId = communication.Id,
                    RecipientType = "TO",
                    RecipientIdentifier = to.Address,
                    RecipientName = to.Name
                });
            }

            foreach (var cc in message.Cc.Mailboxes)
            {
                _context.CommunicationRecipients.Add(new CommunicationRecipient
                {
                    CommunicationId = communication.Id,
                    RecipientType = "CC",
                    RecipientIdentifier = cc.Address,
                    RecipientName = cc.Name
                });
            }

            await _context.SaveChangesAsync();
        }

        public async Task<EmailIntegration?> GetEmailIntegrationAsync(long firmId)
        {
            return await _context.EmailIntegrations
                .FirstOrDefaultAsync(e => e.FirmId == firmId);
        }

        public async Task<bool> ConnectEmailAsync(long userId, long firmId, string email, string password, string provider)
        {
            // Test connection first
            try
            {
                using var client = new ImapClient();
                await client.ConnectAsync("imap.gmail.com", 993, true);
                await client.AuthenticateAsync(email, password);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to IMAP");
                return false;
            }

            // Save integration
            var existing = await _context.EmailIntegrations
                .FirstOrDefaultAsync(e => e.UserId == userId && e.FirmId == firmId);

            if (existing != null)
            {
                existing.EmailAddress = email;
                existing.PasswordEncrypted = password;
                existing.Provider = provider;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                existing = new EmailIntegration
                {
                    UserId = userId,
                    FirmId = firmId,
                    EmailAddress = email,
                    PasswordEncrypted = password,
                    Provider = provider,
                    ImapHost = "imap.gmail.com",
                    ImapPort = 993,
                    SyncEnabled = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.EmailIntegrations.Add(existing);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SendEmailAsync(string fromEmail, string fromName, string toEmail, string subject, string body)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = subject;
                message.Body = new TextPart("html") { Text = body };

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _configuration["EmailSettings:SmtpServer"],
                    int.Parse(_configuration["EmailSettings:SmtpPort"]),
                    true);

                await client.AuthenticateAsync(
                    _configuration["EmailSettings:Username"],
                    _configuration["EmailSettings:Password"]);

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email");
                return false;
            }
        }
    }
}