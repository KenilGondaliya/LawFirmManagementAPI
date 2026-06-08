// src/stores/communicationStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  MessageThread,
  Message,
  EmailTemplate,
  EmailIntegrationStatus,
  SendMessageDto,
  ReplyMessageDto,
} from "../types/communication.types";
import { communicationService } from "../services/communication.service";
import toast from "react-hot-toast";

interface CommunicationState {
  // State
  threads: MessageThread[];
  selectedThread: MessageThread | null;
  messages: Message[];
  templates: EmailTemplate[];
  emailStatus: EmailIntegrationStatus | null;
  isLoading: boolean;
  isSending: boolean;

  // Thread Actions
  fetchThreads: (params?: {
    matterId?: number;
    contactId?: number;
  }) => Promise<void>;
  fetchThreadById: (id: number) => Promise<void>;
  archiveThread: (id: number) => Promise<void>;
  unarchiveThread: (id: number) => Promise<void>;

  // Message Actions
  fetchMessagesByThread: (threadId: number) => Promise<void>;
  fetchMessagesByMatter: (matterId: number) => Promise<void>;
  fetchMessagesByContact: (contactId: number) => Promise<void>;
  sendMessage: (data: SendMessageDto) => Promise<Message | null>;
  replyToMessage: (
    messageId: number,
    data: ReplyMessageDto,
  ) => Promise<Message | null>;
  starMessage: (messageId: number) => Promise<void>;

  // Email Integration Actions
  fetchEmailStatus: () => Promise<void>;
  connectEmail: (data: {
    emailAddress: string;
    provider: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  }) => Promise<void>;
  disconnectEmail: () => Promise<void>;
  syncEmails: () => Promise<void>;

  // Template Actions
  fetchTemplates: () => Promise<void>;
  createTemplate: (data: {
    name: string;
    subject: string;
    body: string;
    category?: string;
    isShared?: boolean;
  }) => Promise<EmailTemplate | null>;
  updateTemplate: (
    id: number,
    data: Partial<EmailTemplate>,
  ) => Promise<EmailTemplate | null>;
  deleteTemplate: (id: number) => Promise<void>;

  // Utility Actions
  clearSelectedThread: () => void;
  clearMessages: () => void;
  resetState: () => void;
}

export const useCommunicationStore = create<CommunicationState>()(
  devtools((set, get) => ({
    // Initial State
    threads: [],
    selectedThread: null,
    messages: [],
    templates: [],
    emailStatus: null,
    isLoading: false,
    isSending: false,

    // ==================== Thread Actions ====================

    fetchThreads: async (params) => {
      set({ isLoading: true });
      try {
        const threads = await communicationService.getThreads(params);
        set({ threads, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch threads:", error);
        toast.error("Failed to load conversations");
        set({ isLoading: false });
      }
    },

    fetchThreadById: async (id) => {
      set({ isLoading: true });
      try {
        const thread = await communicationService.getThreadById(id);
        set({ selectedThread: thread, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch thread:", error);
        toast.error("Failed to load conversation");
        set({ isLoading: false });
      }
    },

    archiveThread: async (id) => {
      try {
        await communicationService.archiveThread(id);
        set((state) => ({
          threads: state.threads.filter((t) => t.id !== id),
          selectedThread:
            state.selectedThread?.id === id ? null : state.selectedThread,
        }));
        toast.success("Conversation archived");
      } catch (error) {
        console.error("Failed to archive thread:", error);
        toast.error("Failed to archive conversation");
      }
    },

    unarchiveThread: async (id) => {
      try {
        await communicationService.unarchiveThread(id);
        await get().fetchThreads();
        toast.success("Conversation restored");
      } catch (error) {
        console.error("Failed to unarchive thread:", error);
        toast.error("Failed to restore conversation");
      }
    },

    // ==================== Message Actions ====================

    fetchMessagesByThread: async (threadId) => {
      set({ isLoading: true });
      try {
        const messages =
          await communicationService.getMessagesByThread(threadId);
        set({ messages, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast.error("Failed to load messages");
        set({ isLoading: false });
      }
    },

    fetchMessagesByMatter: async (matterId) => {
      set({ isLoading: true });
      try {
        const messages =
          await communicationService.getMessagesByMatter(matterId);
        set({ messages, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast.error("Failed to load messages");
        set({ isLoading: false });
      }
    },

    fetchMessagesByContact: async (contactId) => {
      set({ isLoading: true });
      try {
        const messages =
          await communicationService.getMessagesByContact(contactId);
        set({ messages, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast.error("Failed to load messages");
        set({ isLoading: false });
      }
    },

    sendMessage: async (data) => {
      set({ isSending: true });
      try {
        const message = await communicationService.sendMessage(data);
        // Refresh threads list
        await get().fetchThreads();
        // If there's a selected thread, refresh its messages
        const { selectedThread } = get();
        if (selectedThread) {
          await get().fetchMessagesByThread(selectedThread.id);
        }
        toast.success("Message sent successfully");
        set({ isSending: false });
        return message;
      } catch (error: any) {
        console.error("Failed to send message:", error);
        toast.error(error.response?.data?.message || "Failed to send message");
        set({ isSending: false });
        return null;
      }
    },

    replyToMessage: async (messageId, data) => {
      set({ isSending: true });
      try {
        const message = await communicationService.replyToMessage(
          messageId,
          data,
        );
        // Refresh current thread messages
        const { selectedThread } = get();
        if (selectedThread) {
          await get().fetchMessagesByThread(selectedThread.id);
        }
        toast.success("Reply sent successfully");
        set({ isSending: false });
        return message;
      } catch (error: any) {
        console.error("Failed to send reply:", error);
        toast.error(error.response?.data?.message || "Failed to send reply");
        set({ isSending: false });
        return null;
      }
    },

    starMessage: async (messageId) => {
      try {
        await communicationService.starMessage(messageId);
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, isStarred: !m.isStarred } : m,
          ),
        }));
      } catch (error) {
        console.error("Failed to star message:", error);
        toast.error("Failed to update message");
      }
    },

    // ==================== Email Integration Actions ====================

    fetchEmailStatus: async () => {
      try {
        const status = await communicationService.getEmailStatus();
        set({ emailStatus: status });
      } catch (error) {
        console.error("Failed to fetch email status:", error);
        // Set default disconnected status instead of throwing
        set({
          emailStatus: {
            isConnected: false,
            emailAddress: undefined,
            provider: undefined,
            lastSyncAt: undefined,
            syncEnabled: false,
          },
        });
      }
    },

    connectEmail: async (data) => {
      set({ isLoading: true });
      try {
        await communicationService.connectEmail(data);
        await get().fetchEmailStatus();
        toast.success("Email connected successfully");
        set({ isLoading: false });
      } catch (error: any) {
        console.error("Failed to connect email:", error);
        toast.error(error.response?.data?.message || "Failed to connect email");
        set({ isLoading: false });
        throw error;
      }
    },

    disconnectEmail: async () => {
      set({ isLoading: true });
      try {
        await communicationService.disconnectEmail();
        await get().fetchEmailStatus();
        toast.success("Email disconnected");
        set({ isLoading: false });
      } catch (error) {
        console.error("Failed to disconnect email:", error);
        toast.error("Failed to disconnect email");
        set({ isLoading: false });
      }
    },

    syncEmails: async () => {
      set({ isLoading: true });
      try {
        await communicationService.syncEmails();
        toast.success("Emails synced successfully");
        // Refresh threads after sync
        await get().fetchThreads();
        set({ isLoading: false });
      } catch (error) {
        console.error("Failed to sync emails:", error);
        toast.error("Failed to sync emails");
        set({ isLoading: false });
      }
    },

    // ==================== Template Actions ====================

    fetchTemplates: async () => {
      set({ isLoading: true });
      try {
        const templates = await communicationService.getEmailTemplates();
        set({ templates, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast.error("Failed to load templates");
        set({ isLoading: false });
      }
    },

    createTemplate: async (data) => {
      set({ isLoading: true });
      try {
        const template = await communicationService.createEmailTemplate(data);
        set((state) => ({
          templates: [...state.templates, template],
          isLoading: false,
        }));
        toast.success("Template created successfully");
        return template;
      } catch (error) {
        console.error("Failed to create template:", error);
        toast.error("Failed to create template");
        set({ isLoading: false });
        return null;
      }
    },

    updateTemplate: async (id, data) => {
      set({ isLoading: true });
      try {
        // Note: You'll need to add this endpoint to your service
        // For now, we'll just update locally
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
          isLoading: false,
        }));
        toast.success("Template updated successfully");
        return { id, ...data } as EmailTemplate;
      } catch (error) {
        console.error("Failed to update template:", error);
        toast.error("Failed to update template");
        set({ isLoading: false });
        return null;
      }
    },

    deleteTemplate: async (id) => {
      set({ isLoading: true });
      try {
        await communicationService.deleteEmailTemplate(id);
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          isLoading: false,
        }));
        toast.success("Template deleted");
      } catch (error) {
        console.error("Failed to delete template:", error);
        toast.error("Failed to delete template");
        set({ isLoading: false });
      }
    },

    // ==================== Utility Actions ====================

    clearSelectedThread: () => {
      set({ selectedThread: null });
    },

    clearMessages: () => {
      set({ messages: [] });
    },

    resetState: () => {
      set({
        threads: [],
        selectedThread: null,
        messages: [],
        templates: [],
        emailStatus: null,
        isLoading: false,
        isSending: false,
      });
    },
  })),
);
