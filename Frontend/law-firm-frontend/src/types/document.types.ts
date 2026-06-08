// src/types/document.types.ts
export interface Document {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType?: string;
  extension?: string;
  version: number;
  isTemplate: boolean;
  isArchived: boolean;
  matterId?: number;
  matterTitle?: string;
  contactId?: number;
  contactName?: string;
  documentTypeId?: number;
  documentTypeName?: string;
  folderId?: number;
  uploadedBy: number;
  uploadedAt: string;
  lastAccessedAt?: string;
}

export interface DocumentVersion {
  id: number;
  version: number;
  fileName: string;
  fileSize: number;
  changeSummary?: string;
  uploadedAt: string;
}

export interface DocumentShare {
  id: number;
  shareToken: string;
  permission: string;
  expiresAt?: string;
}

export interface DocumentComment {
  id: number;
  comment: string;
  userId: number;
  userName?: string;
  createdAt: string;
}

export interface DocumentSummary {
  summary: string;
  keyPoints?: string[];
  generatedAt: string;
}

export interface DocumentType {
  id: number;
  name: string;
  category?: string;
  description?: string;
  icon?: string;
  isTemplate: boolean;
}

export interface Folder {
  id: number;
  name: string;
  description?: string;
  parentFolderId?: number;
  path?: string;
  createdAt: string;
  subFolders?: Folder[];
  documents?: Document[];
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  documentTypeId?: number;
  documentTypeName?: string;
  previewImage?: string;
  usageCount: number;
  createdAt: string;
}

export interface UploadDocumentDto {
  file: File;
  title?: string;
  description?: string;
  matterId?: number;
  contactId?: number;
  documentTypeId?: number;
  folderId?: number;
  isTemplate?: boolean;
}

export interface CreateFolderDto {
  name: string;
  description?: string;
  parentFolderId?: number;
}

export interface CreateDocumentTypeDto {
  name: string;
  category?: string;
  description?: string;
  icon?: string;
  isTemplate?: boolean;
}