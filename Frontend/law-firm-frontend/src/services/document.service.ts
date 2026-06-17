// src/services/document.service.ts - Complete with all APIs

import api from "./api";
import {
  Document,
  DocumentVersion,
  DocumentShare,
  DocumentComment,
  DocumentSummary,
  DocumentType,
  Folder,
  Template,
  UploadDocumentDto,
  CreateFolderDto,
  CreateDocumentTypeDto,
} from "../types/document.types";

export const documentService = {
  // ==================== Document Types ====================

  getDocumentTypes: async (): Promise<DocumentType[]> => {
    const response = await api.get("/documents/types");
    return response.data;
  },

  createDocumentType: async (
    data: CreateDocumentTypeDto,
  ): Promise<DocumentType> => {
    const response = await api.post("/documents/types", data);
    return response.data;
  },

  // ==================== Folders ====================

  getFolders: async (parentFolderId?: number): Promise<Folder[]> => {
    const params: any = {};
    if (parentFolderId) params.parentFolderId = parentFolderId;
    const response = await api.get("/documents/folders", { params });
    return response.data;
  },

  createFolder: async (data: CreateFolderDto): Promise<Folder> => {
    const response = await api.post("/documents/folders", data);
    return response.data;
  },

  // ==================== Document CRUD ====================

  getAllDocuments: async (params?: {
    matterId?: number;
    folderId?: number;
    search?: string;
  }): Promise<Document[]> => {
    const response = await api.get("/documents", { params });
    return response.data;
  },

  getDocumentById: async (id: number): Promise<Document> => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  uploadDocument: async (data: UploadDocumentDto): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", data.file);
    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.matterId) formData.append("matterId", data.matterId.toString());
    if (data.contactId) formData.append("contactId", data.contactId.toString());
    if (data.documentTypeId)
      formData.append("documentTypeId", data.documentTypeId.toString());
    if (data.folderId) formData.append("folderId", data.folderId.toString());
    if (data.isTemplate) formData.append("isTemplate", "true");

    const response = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.document || response.data;
  },

  updateDocument: async (
    id: number,
    data: {
      title?: string;
      description?: string;
      documentTypeId?: number;
      folderId?: number;
    },
  ): Promise<Document> => {
    const response = await api.put(`/documents/${id}`, data);
    return response.data.document || response.data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  downloadDocument: async (id: number): Promise<Blob> => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  moveDocument: async (
    documentId: number,
    folderId?: number,
  ): Promise<void> => {
    const params: any = {};
    if (folderId !== undefined && folderId !== null) {
      params.folderId = folderId;
    }
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `/documents/${documentId}/move?${queryString}`
      : `/documents/${documentId}/move`;
    await api.post(url);
  },

  // ==================== Document Versions ====================

  createVersion: async (
    documentId: number,
    file: File,
    changeSummary?: string,
  ): Promise<DocumentVersion> => {
    const formData = new FormData();
    formData.append("file", file);
    if (changeSummary) formData.append("changeSummary", changeSummary);

    const response = await api.post(
      `/documents/${documentId}/versions`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data.version || response.data;
  },

  getDocumentVersions: async (
    documentId: number,
  ): Promise<DocumentVersion[]> => {
    const response = await api.get(`/documents/${documentId}/versions`);
    return response.data;
  },

  // ==================== Document Sharing ====================

  shareDocument: async (
    documentId: number,
    options: {
      userId?: number;
      email?: string;
      permission?: string;
      expiresInDays?: number;
    },
  ): Promise<DocumentShare> => {
    const params = new URLSearchParams();
    if (options.userId) params.append("userId", options.userId.toString());
    if (options.email) params.append("email", options.email);
    if (options.permission)
      params.append("permission", options.permission || "VIEW");
    if (options.expiresInDays)
      params.append("expiresInDays", options.expiresInDays.toString());

    const response = await api.post(
      `/documents/${documentId}/share?${params.toString()}`,
    );
    return response.data;
  },

  revokeShare: async (shareId: number): Promise<void> => {
    await api.delete(`/documents/shares/${shareId}`);
  },

  // Get documents shared with me
  getSharedWithMe: async (): Promise<any[]> => {
    const response = await api.get("/documents/shared-with-me");
    return response.data;
  },

  // Get documents I have shared
  getSharedByMe: async (): Promise<any[]> => {
    const response = await api.get("/documents/shared-by-me");
    return response.data;
  },

  // Download shared document by token
  downloadSharedDocument: async (shareToken: string): Promise<Blob> => {
    const response = await api.get(`/documents/shared/download/${shareToken}`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Get document share details
  getShareDetails: async (shareToken: string): Promise<any> => {
    const response = await api.get(`/documents/shared/details/${shareToken}`);
    return response.data;
  },

  // ==================== Document Comments ====================

  getDocumentComments: async (
    documentId: number,
  ): Promise<DocumentComment[]> => {
    const response = await api.get(`/documents/${documentId}/comments`);
    return response.data;
  },

  addComment: async (
    documentId: number,
    comment: string,
  ): Promise<DocumentComment> => {
    const response = await api.post(`/documents/${documentId}/comments`, {
      comment,
    });
    return response.data.comment || response.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/documents/comments/${commentId}`);
  },

  // ==================== AI Features ====================

  getDocumentSummary: async (documentId: number): Promise<DocumentSummary> => {
    const response = await api.get(`/documents/${documentId}/summary`);
    return response.data;
  },

  generateSummary: async (documentId: number): Promise<DocumentSummary> => {
    const response = await api.post(`/documents/${documentId}/summarize`);
    return response.data;
  },

  // ==================== Templates ====================

  getTemplates: async (category?: string): Promise<Template[]> => {
    const params: any = {};
    if (category) params.category = category;
    const response = await api.get("/documents/templates", { params });
    return response.data;
  },

  createTemplate: async (data: {
    file: File;
    name: string;
    description?: string;
    documentTypeId?: number;
    previewImage?: string;
    isPublic?: boolean;
  }): Promise<Template> => {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.documentTypeId)
      formData.append("documentTypeId", data.documentTypeId.toString());
    if (data.previewImage) formData.append("previewImage", data.previewImage);
    if (data.isPublic) formData.append("isPublic", "true");

    const response = await api.post("/documents/templates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.template || response.data;
  },

  deleteTemplate: async (templateId: number): Promise<void> => {
    await api.delete(`/documents/templates/${templateId}`);
  },
};
