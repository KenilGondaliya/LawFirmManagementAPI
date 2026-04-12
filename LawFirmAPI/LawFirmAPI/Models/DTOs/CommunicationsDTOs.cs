// Models/DTOs/CommunicationsDTOs.cs
using System;
using System.Collections.Generic;

namespace LawFirmAPI.Models.DTOs
{
    public class MessageThreadDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string? Subject { get; set; }
        public string ThreadType { get; set; } = "EMAIL";
        public long? MatterId { get; set; }
        public string? MatterTitle { get; set; }
        public long? ContactId { get; set; }
        public string? ContactName { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MessageCount { get; set; }
    }

    public class MessageDto
    {
        public long Id { get; set; }
        public Guid Uuid { get; set; }
        public string? MessageId { get; set; }
        public string? InReplyTo { get; set; }
        public string SenderType { get; set; } = "USER";
        public long? SenderId { get; set; }
        public string? SenderEmail { get; set; }
        public string? SenderName { get; set; }
        public string? Subject { get; set; }
        public string? Body { get; set; }
        public string? BodyPreview { get; set; }
        public bool HasAttachments { get; set; }
        public bool IsRead { get; set; }
        public bool IsStarred { get; set; }
        public bool IsDraft { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? ReceivedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<MessageRecipientDto> Recipients { get; set; } = new();
    }

    public class MessageRecipientDto
    {
        public string RecipientType { get; set; } = "TO";
        public string RecipientIdentifier { get; set; } = string.Empty;
        public string? RecipientName { get; set; }
        public bool IsRead { get; set; }
    }

    public class SendMessageDto
    {
        public string? Subject { get; set; }
        public string Body { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public List<string> To { get; set; } = new();
        public List<string>? Cc { get; set; }
        public List<string>? Bcc { get; set; }
        public long? MatterId { get; set; }
        public long? ContactId { get; set; }
        public string MessageType { get; set; } = "EMAIL";
        public List<IFormFile>? Attachments { get; set; }
    }

    public class ReplyMessageDto
    {
        public long OriginalMessageId { get; set; }
        public string Body { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public string? Subject { get; set; }
        public List<IFormFile>? Attachments { get; set; }
    }

    public class EmailIntegrationDto
    {
        public string EmailAddress { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public bool IsConnected { get; set; }
    }

    public class ConnectEmailDto
    {
        public string EmailAddress { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    public class EmailIntegrationStatusDto
    {
        public bool IsConnected { get; set; }
        public string? EmailAddress { get; set; }
        public string? Provider { get; set; }
        public DateTime? LastSyncAt { get; set; }
        public bool SyncEnabled { get; set; }
    }

    public class EmailTemplateDto
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Category { get; set; }
        public bool IsShared { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateEmailTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Category { get; set; }
        public bool IsShared { get; set; } = false;
    }
}