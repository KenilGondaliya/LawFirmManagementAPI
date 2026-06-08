// src/services/communication.service.ts
import api from "./api";
import {
  MessageThread,
  Message,
  SendMessageDto,
  ReplyMessageDto,
  EmailIntegration,
  EmailIntegrationStatus,
  EmailTemplate,
  CreateEmailTemplateDto,
} from "../types/communication.types";

export const communicationService = {
  // ==================== Threads ====================

  getThreads: async (params?: {
    matterId?: number;
    contactId?: number;
  }): Promise<MessageThread[]> => {
    const response = await api.get("/communications/threads", { params });
    return response.data;
  },

  getThreadById: async (id: number): Promise<MessageThread> => {
    const response = await api.get(`/communications/threads/${id}`);
    return response.data;
  },

  archiveThread: async (id: number): Promise<void> => {
    await api.put(`/communications/threads/${id}/archive`);
  },

  unarchiveThread: async (id: number): Promise<void> => {
    await api.put(`/communications/threads/${id}/unarchive`);
  },

  // ==================== Messages ====================

  getMessagesByThread: async (threadId: number): Promise<Message[]> => {
    const response = await api.get(
      `/communications/messages?threadId=${threadId}`,
    );
    return response.data;
  },

  getMessagesByMatter: async (matterId: number): Promise<Message[]> => {
    const response = await api.get(
      `/communications/messages?matterId=${matterId}`,
    );
    return response.data;
  },

  getMessagesByContact: async (contactId: number): Promise<Message[]> => {
    const response = await api.get(
      `/communications/messages?contactId=${contactId}`,
    );
    return response.data;
  },

  // src/services/communication.service.ts - Fix sendMessage
  sendMessage: async (data: SendMessageDto): Promise<Message> => {
    try {
      // Send as JSON, not FormData
      const payload = {
        subject: data.subject || "",
        body: data.body,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        messageType: data.messageType || "EMAIL",
        to: data.to,
        cc: data.cc || [],
        bcc: data.bcc || [],
        matterId: data.matterId,
        contactId: data.contactId,
      };

      const response = await api.post("/communications/messages/send", payload);
      return response.data;
    } catch (error: any) {
      console.error("Failed to send message:", error);
      throw error;
    }
  },

  // Fix replyToMessage
  replyToMessage: async (
    messageId: number,
    data: ReplyMessageDto,
  ): Promise<Message> => {
    try {
      const payload = {
        originalMessageId: data.originalMessageId,
        body: data.body,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        subject: data.subject,
        to: data.to || [],
        cc: data.cc || [],
      };

      const response = await api.post(
        `/communications/messages/${messageId}/reply`,
        payload,
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to send reply:", error);
      throw error;
    }
  },

  starMessage: async (messageId: number): Promise<void> => {
    await api.put(`/communications/messages/${messageId}/star`);
  },

  // ==================== Email Integration ====================

  connectEmail: async (data: {
    emailAddress: string;
    provider: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }): Promise<EmailIntegration> => {
    const response = await api.post("/communications/email/connect", data);
    return response.data;
  },

  disconnectEmail: async (): Promise<void> => {
    await api.delete("/communications/email/disconnect");
  },

  getEmailStatus: async (): Promise<EmailIntegrationStatus> => {
    const response = await api.get("/communications/email/status");
    return response.data;
  },

  syncEmails: async (): Promise<void> => {
    await api.post("/communications/email/sync");
  },

  // ==================== Email Templates ====================

  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    const response = await api.get("/communications/templates");
    return response.data;
  },

  createEmailTemplate: async (
    data: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> => {
    const response = await api.post("/communications/templates", data);
    return response.data;
  },

  updateEmailTemplate: async (
    id: number,
    data: Partial<CreateEmailTemplateDto>,
  ): Promise<EmailTemplate> => {
    const response = await api.put(`/communications/templates/${id}`, data);
    return response.data;
  },

  deleteEmailTemplate: async (id: number): Promise<void> => {
    await api.delete(`/communications/templates/${id}`);
  },

  // ==================== Context Based ====================

  getMessagesByMatterContext: async (matterId: number): Promise<Message[]> => {
    const response = await api.get(`/communications/by-matter/${matterId}`);
    return response.data;
  },

  getMessagesByContactContext: async (
    contactId: number,
  ): Promise<Message[]> => {
    const response = await api.get(`/communications/by-contact/${contactId}`);
    return response.data;
  },
};
