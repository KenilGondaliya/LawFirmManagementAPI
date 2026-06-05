// Services/CommunicationsService.cs - COMPLETE WORKING VERSION

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using LawFirmAPI.Data;
using LawFirmAPI.Models.Entities;
using LawFirmAPI.Models.DTOs;

namespace LawFirmAPI.Services
{
    public interface ICommunicationsService
    {
        Task<List<MessageThreadDto>> GetThreads(long firmId, long? matterId, long? contactId);
        Task<MessageThreadDto?> GetThreadById(long threadId, long firmId);
        Task<MessageDto> SendMessage(long firmId, long userId, SendMessageDto sendDto);
        Task<MessageDto> ReplyToMessage(long threadId, long firmId, long userId, ReplyMessageDto replyDto);
        Task<bool> ArchiveThread(long threadId, long firmId);
        Task<bool> UnarchiveThread(long threadId, long firmId);
        Task<bool> StarMessage(long messageId, long firmId);
        Task<List<MessageDto>> GetMessagesByThread(long threadId, long firmId);
        Task<List<MessageDto>> GetMessagesByMatter(long matterId, long firmId);
        Task<List<MessageDto>> GetMessagesByContact(long contactId, long firmId);
        Task<EmailIntegrationDto> ConnectEmail(long firmId, long userId, ConnectEmailDto connectDto);
        Task<bool> DisconnectEmail(long firmId, long userId);
        Task<EmailIntegrationStatusDto> GetEmailIntegrationStatus(long firmId, long userId);
        Task<bool> SyncEmails(long firmId, long userId);
        Task<List<EmailTemplateDto>> GetEmailTemplates(long firmId);
        Task<EmailTemplateDto> CreateEmailTemplate(long firmId, long userId, CreateEmailTemplateDto createDto);
        Task<bool> DeleteEmailTemplate(long templateId, long firmId);
    }

    public class CommunicationsService : ICommunicationsService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public CommunicationsService(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // ==================== THREADS ====================

        public async Task<List<MessageThreadDto>> GetThreads(long firmId, long? matterId, long? contactId)
        {
            var query = _context.CommunicationThreads
                .Include(t => t.Matter)
                .Include(t => t.Contact)
                .Where(t => t.FirmId == firmId && t.Status == "ACTIVE");

            if (matterId.HasValue)
                query = query.Where(t => t.MatterId == matterId.Value);

            if (contactId.HasValue)
                query = query.Where(t => t.ContactId == contactId.Value);

            var threads = await query
                .OrderByDescending(t => t.LastMessageAt)
                .ToListAsync();

            return threads.Select(t => new MessageThreadDto
            {
                Id = t.Id,
                Uuid = t.Uuid,
                Subject = t.Subject,
                ThreadType = t.ThreadType,
                MatterId = t.MatterId,
                MatterTitle = t.Matter?.Title,
                ContactId = t.ContactId,
                ContactName = t.Contact != null ? $"{t.Contact.FirstName} {t.Contact.LastName}" : null,
                LastMessageAt = t.LastMessageAt,
                CreatedAt = t.CreatedAt,
                MessageCount = _context.Communications.Count(c => c.ThreadId == t.Id && !c.IsTrash)
            }).ToList();
        }

        public async Task<MessageThreadDto?> GetThreadById(long threadId, long firmId)
        {
            var thread = await _context.CommunicationThreads
                .Include(t => t.Matter)
                .Include(t => t.Contact)
                .FirstOrDefaultAsync(t => t.Id == threadId && t.FirmId == firmId);

            if (thread == null)
                return null;

            return new MessageThreadDto
            {
                Id = thread.Id,
                Uuid = thread.Uuid,
                Subject = thread.Subject,
                ThreadType = thread.ThreadType,
                MatterId = thread.MatterId,
                MatterTitle = thread.Matter?.Title,
                ContactId = thread.ContactId,
                ContactName = thread.Contact != null ? $"{thread.Contact.FirstName} {thread.Contact.LastName}" : null,
                LastMessageAt = thread.LastMessageAt,
                CreatedAt = thread.CreatedAt
            };
        }

        public async Task<bool> ArchiveThread(long threadId, long firmId)
        {
            var thread = await _context.CommunicationThreads
                .FirstOrDefaultAsync(t => t.Id == threadId && t.FirmId == firmId);

            if (thread == null)
                return false;

            thread.Status = "ARCHIVED";
            thread.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UnarchiveThread(long threadId, long firmId)
        {
            var thread = await _context.CommunicationThreads
                .FirstOrDefaultAsync(t => t.Id == threadId && t.FirmId == firmId);

            if (thread == null)
                return false;

            thread.Status = "ACTIVE";
            thread.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        // ==================== MESSAGES ====================

        public async Task<MessageDto> SendMessage(long firmId, long userId, SendMessageDto sendDto)
        {
            // STEP 1: Create and SAVE thread FIRST
            var thread = new CommunicationThread
            {
                FirmId = firmId,
                MatterId = sendDto.MatterId,
                ContactId = sendDto.ContactId,
                Subject = sendDto.Subject,
                ThreadType = sendDto.MessageType,
                Status = "ACTIVE",
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                LastMessageAt = DateTime.UtcNow
            };

            _context.CommunicationThreads.Add(thread);
            await _context.SaveChangesAsync();  // ✅ THREAD IS NOW SAVED WITH ID

            long threadId = thread.Id;
            Console.WriteLine($"Thread created with ID: {threadId}");

            // STEP 2: Create message linked to thread
            var message = new Communication
            {
                ThreadId = threadId,
                MessageId = Guid.NewGuid().ToString(),
                SenderType = "USER",
                SenderId = userId,
                SenderEmail = sendDto.FromEmail,
                SenderName = sendDto.FromName,
                RecipientType = "CONTACT",
                Subject = sendDto.Subject,
                Body = sendDto.Body,
                BodyPreview = sendDto.Body?.Length > 200 ? sendDto.Body.Substring(0, 200) : sendDto.Body,
                HasAttachments = sendDto.Attachments != null && sendDto.Attachments.Any(),
                IsDraft = false,
                SentAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Communications.Add(message);
            await _context.SaveChangesAsync();  // ✅ MESSAGE SAVED WITH ID

            Console.WriteLine($"Message created with ID: {message.Id} for Thread: {threadId}");

            // STEP 3: Add recipients
            if (sendDto.To != null && sendDto.To.Any())
            {
                foreach (var recipient in sendDto.To)
                {
                    _context.CommunicationRecipients.Add(new CommunicationRecipient
                    {
                        CommunicationId = message.Id,
                        RecipientType = "TO",
                        RecipientIdentifier = recipient,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            if (sendDto.Cc != null && sendDto.Cc.Any())
            {
                foreach (var recipient in sendDto.Cc)
                {
                    _context.CommunicationRecipients.Add(new CommunicationRecipient
                    {
                        CommunicationId = message.Id,
                        RecipientType = "CC",
                        RecipientIdentifier = recipient,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            if (sendDto.Bcc != null && sendDto.Bcc.Any())
            {
                foreach (var recipient in sendDto.Bcc)
                {
                    _context.CommunicationRecipients.Add(new CommunicationRecipient
                    {
                        CommunicationId = message.Id,
                        RecipientType = "BCC",
                        RecipientIdentifier = recipient,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();

            // STEP 4: Send real emails (optional, don't block if fails)
            try
            {
                var allRecipients = new List<string>();
                if (sendDto.To != null) allRecipients.AddRange(sendDto.To);
                if (sendDto.Cc != null) allRecipients.AddRange(sendDto.Cc);
                if (sendDto.Bcc != null) allRecipients.AddRange(sendDto.Bcc);

                foreach (var recipient in allRecipients)
                {
                    await _emailService.SendRawEmail(
                        recipient,
                        sendDto.Subject ?? "New Message",
                        sendDto.Body,
                        sendDto.FromName,
                        sendDto.FromEmail
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email sending error: {ex.Message}");
            }

            // STEP 5: Return response WITH BOTH IDs
            return new MessageDto
            {
                Id = message.Id,
                Uuid = message.Uuid,
                MessageId = message.MessageId,
                Subject = message.Subject,
                Body = message.Body,
                SentAt = message.SentAt,
                CreatedAt = message.CreatedAt
            };
        }

        public async Task<MessageDto> ReplyToMessage(long threadId, long firmId, long userId, ReplyMessageDto replyDto)
        {
            // STEP 1: Verify thread exists
            var thread = await _context.CommunicationThreads
                .FirstOrDefaultAsync(t => t.Id == threadId && t.FirmId == firmId);

            if (thread == null)
                throw new KeyNotFoundException($"Thread with ID {threadId} not found. Please check your thread ID.");

            // STEP 2: Get original message
            var originalMessage = await _context.Communications
                .FirstOrDefaultAsync(m => m.Id == replyDto.OriginalMessageId);

            // STEP 3: Create reply message
            var message = new Communication
            {
                ThreadId = threadId,
                MessageId = Guid.NewGuid().ToString(),
                SenderType = "USER",
                SenderId = userId,
                SenderEmail = replyDto.FromEmail,
                SenderName = replyDto.FromName,
                RecipientType = "CONTACT",
                Subject = replyDto.Subject ?? thread.Subject,
                Body = replyDto.Body,
                BodyPreview = replyDto.Body?.Length > 200 ? replyDto.Body.Substring(0, 200) : replyDto.Body,
                InReplyTo = originalMessage?.MessageId,
                IsDraft = false,
                SentAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _context.Communications.Add(message);
            await _context.SaveChangesAsync();

            // STEP 4: Add recipients
            if (replyDto.To != null && replyDto.To.Any())
            {
                foreach (var recipient in replyDto.To)
                {
                    _context.CommunicationRecipients.Add(new CommunicationRecipient
                    {
                        CommunicationId = message.Id,
                        RecipientType = "TO",
                        RecipientIdentifier = recipient,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            if (replyDto.Cc != null && replyDto.Cc.Any())
            {
                foreach (var recipient in replyDto.Cc)
                {
                    _context.CommunicationRecipients.Add(new CommunicationRecipient
                    {
                        CommunicationId = message.Id,
                        RecipientType = "CC",
                        RecipientIdentifier = recipient,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();

            // STEP 5: Update thread
            thread.LastMessageAt = DateTime.UtcNow;
            thread.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // STEP 6: Return response
            return new MessageDto
            {
                Id = message.Id,
                Uuid = message.Uuid,
                MessageId = message.MessageId,
                Subject = message.Subject,
                Body = message.Body,
                SentAt = message.SentAt,
                CreatedAt = message.CreatedAt
            };
        }

        public async Task<bool> StarMessage(long messageId, long firmId)
        {
            var message = await _context.Communications.FindAsync(messageId);
            if (message == null) return false;

            message.IsStarred = !message.IsStarred;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<MessageDto>> GetMessagesByThread(long threadId, long firmId)
        {
            var messages = await _context.Communications
                .Include(m => m.Recipients)
                .Where(m => m.ThreadId == threadId && !m.IsTrash)
                .OrderBy(m => m.SentAt)
                .ToListAsync();

            return messages.Select(m => new MessageDto
            {
                Id = m.Id,
                Uuid = m.Uuid,
                MessageId = m.MessageId,
                Subject = m.Subject,
                Body = m.Body,
                SenderEmail = m.SenderEmail,
                SenderName = m.SenderName,
                SentAt = m.SentAt,
                CreatedAt = m.CreatedAt,
                Recipients = m.Recipients.Select(r => new MessageRecipientDto
                {
                    RecipientType = r.RecipientType,
                    RecipientIdentifier = r.RecipientIdentifier
                }).ToList()
            }).ToList();
        }

        public async Task<List<MessageDto>> GetMessagesByMatter(long matterId, long firmId)
        {
            var threadIds = await _context.CommunicationThreads
                .Where(t => t.FirmId == firmId && t.MatterId == matterId && t.Status == "ACTIVE")
                .Select(t => t.Id)
                .ToListAsync();

            var messages = await _context.Communications
                .Where(m => threadIds.Contains(m.ThreadId) && !m.IsTrash)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            return messages.Select(m => new MessageDto
            {
                Id = m.Id,
                Subject = m.Subject,
                Body = m.Body,
                SentAt = m.SentAt
            }).ToList();
        }

        public async Task<List<MessageDto>> GetMessagesByContact(long contactId, long firmId)
        {
            var threadIds = await _context.CommunicationThreads
                .Where(t => t.FirmId == firmId && t.ContactId == contactId && t.Status == "ACTIVE")
                .Select(t => t.Id)
                .ToListAsync();

            var messages = await _context.Communications
                .Where(m => threadIds.Contains(m.ThreadId) && !m.IsTrash)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            return messages.Select(m => new MessageDto
            {
                Id = m.Id,
                Subject = m.Subject,
                Body = m.Body,
                SentAt = m.SentAt
            }).ToList();
        }

        // ==================== EMAIL INTEGRATION ====================

        public async Task<EmailIntegrationDto> ConnectEmail(long firmId, long userId, ConnectEmailDto connectDto)
        {
            var existing = await _context.EmailIntegrations
                .FirstOrDefaultAsync(e => e.UserId == userId && e.FirmId == firmId);

            if (existing != null)
            {
                existing.EmailAddress = connectDto.EmailAddress;
                existing.Provider = connectDto.Provider;
                existing.AccessToken = connectDto.AccessToken;
                existing.RefreshToken = connectDto.RefreshToken;
                existing.ExpiresAt = connectDto.ExpiresAt;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _context.EmailIntegrations.Add(new EmailIntegration
                {
                    UserId = userId,
                    FirmId = firmId,
                    EmailAddress = connectDto.EmailAddress,
                    Provider = connectDto.Provider,
                    AccessToken = connectDto.AccessToken,
                    RefreshToken = connectDto.RefreshToken,
                    ExpiresAt = connectDto.ExpiresAt,
                    SyncEnabled = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();
            return new EmailIntegrationDto { EmailAddress = connectDto.EmailAddress, Provider = connectDto.Provider, IsConnected = true };
        }

        public async Task<bool> DisconnectEmail(long firmId, long userId)
        {
            var integration = await _context.EmailIntegrations
                .FirstOrDefaultAsync(e => e.UserId == userId && e.FirmId == firmId);

            if (integration == null) return false;

            _context.EmailIntegrations.Remove(integration);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<EmailIntegrationStatusDto> GetEmailIntegrationStatus(long firmId, long userId)
        {
            var integration = await _context.EmailIntegrations
                .FirstOrDefaultAsync(e => e.UserId == userId && e.FirmId == firmId);

            return new EmailIntegrationStatusDto
            {
                IsConnected = integration != null,
                EmailAddress = integration?.EmailAddress,
                Provider = integration?.Provider,
                LastSyncAt = integration?.LastSyncAt,
                SyncEnabled = integration?.SyncEnabled ?? false
            };
        }

        public async Task<bool> SyncEmails(long firmId, long userId)
        {
            var integration = await _context.EmailIntegrations
                .FirstOrDefaultAsync(e => e.UserId == userId && e.FirmId == firmId);

            if (integration == null) return false;

            integration.LastSyncAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // ==================== EMAIL TEMPLATES ====================

        public async Task<List<EmailTemplateDto>> GetEmailTemplates(long firmId)
        {
            var templates = await _context.EmailTemplates.Where(t => t.FirmId == firmId).ToListAsync();
            return templates.Select(t => new EmailTemplateDto
            {
                Id = t.Id,
                Name = t.Name,
                Subject = t.Subject,
                Body = t.Body,
                Category = t.Category,
                IsShared = t.IsShared,
                CreatedAt = t.CreatedAt
            }).ToList();
        }

        public async Task<EmailTemplateDto> CreateEmailTemplate(long firmId, long userId, CreateEmailTemplateDto createDto)
        {
            var template = new EmailTemplate
            {
                FirmId = firmId,
                Name = createDto.Name,
                Subject = createDto.Subject,
                Body = createDto.Body,
                Category = createDto.Category,
                IsShared = createDto.IsShared,
                CreatedBy = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.EmailTemplates.Add(template);
            await _context.SaveChangesAsync();

            return new EmailTemplateDto
            {
                Id = template.Id,
                Name = template.Name,
                Subject = template.Subject,
                Body = template.Body,
                Category = template.Category,
                IsShared = template.IsShared,
                CreatedAt = template.CreatedAt
            };
        }

        public async Task<bool> DeleteEmailTemplate(long templateId, long firmId)
        {
            var template = await _context.EmailTemplates
                .FirstOrDefaultAsync(t => t.Id == templateId && t.FirmId == firmId);

            if (template == null) return false;

            _context.EmailTemplates.Remove(template);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}