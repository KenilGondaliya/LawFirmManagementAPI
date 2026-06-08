// src/types/communication.types.ts
export interface MessageThread {
  id: number;
  uuid: string;
  subject?: string;
  threadType: string;
  matterId?: number;
  matterTitle?: string;
  contactId?: number;
  contactName?: string;
  lastMessageAt?: string;
  createdAt: string;
  messageCount: number;
}

export interface Message {
  id: number;
  uuid: string;
  messageId?: string;
  inReplyTo?: string;
  senderType: string;
  senderId?: number;
  senderEmail?: string;
  senderName?: string;
  subject?: string;
  body?: string;
  bodyPreview?: string;
  hasAttachments: boolean;
  isRead: boolean;
  isStarred: boolean;
  isDraft: boolean;
  sentAt?: string;
  receivedAt?: string;
  createdAt: string;
  recipients: MessageRecipient[];
}

export interface MessageRecipient {
  recipientType: string;
  recipientIdentifier: string;
  recipientName?: string;
  isRead: boolean;
}

export interface SendMessageDto {
  subject?: string;
  body: string;
  fromEmail: string;
  fromName: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  matterId?: number;
  contactId?: number;
  messageType?: string;
  attachments?: File[];
}

export interface ReplyMessageDto {
  originalMessageId: number;
  body: string;
  fromEmail: string;
  fromName: string;
  subject?: string;
  to?: string[];
  cc?: string[];
  attachments?: File[];
}

export interface EmailIntegration {
  emailAddress: string;
  provider: string;
  isConnected: boolean;
}

export interface EmailIntegrationStatus {
  isConnected: boolean;
  emailAddress?: string;
  provider?: string;
  lastSyncAt?: string;
  syncEnabled: boolean;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  category?: string;
  isShared: boolean;
  createdAt: string;
}

export interface CreateEmailTemplateDto {
  name: string;
  subject: string;
  body: string;
  category?: string;
  isShared?: boolean;
}