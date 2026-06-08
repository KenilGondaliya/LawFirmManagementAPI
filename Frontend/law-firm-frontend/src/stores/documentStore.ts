// src/stores/documentStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  Document, 
  DocumentType, 
  Folder, 
  Template,
  DocumentSummary 
} from '../types/document.types';
import { documentService } from '../services/document.service';
import toast from 'react-hot-toast';

interface DocumentState {
  // State
  documents: Document[];
  selectedDocument: Document | null;
  documentTypes: DocumentType[];
  folders: Folder[];
  templates: Template[];
  summary: DocumentSummary | null;
  isLoading: boolean;
  isUploading: boolean;
  
  // Document Actions
  fetchDocuments: (params?: { matterId?: number; folderId?: number; search?: string }) => Promise<void>;
  fetchDocumentById: (id: number) => Promise<void>;
  uploadDocument: (data: any) => Promise<Document | null>;
  updateDocument: (id: number, data: any) => Promise<Document | null>;
  deleteDocument: (id: number) => Promise<boolean>;
  downloadDocument: (id: number) => Promise<void>;
  
  // Document Type Actions
  fetchDocumentTypes: () => Promise<void>;
  createDocumentType: (data: any) => Promise<DocumentType | null>;
  
  // Folder Actions
  fetchFolders: (parentFolderId?: number) => Promise<void>;
  createFolder: (data: any) => Promise<Folder | null>;
  moveDocument: (documentId: number, folderId?: number) => Promise<boolean>;
  
  // Template Actions
  fetchTemplates: (category?: string) => Promise<void>;
  createTemplate: (data: any) => Promise<Template | null>;
  deleteTemplate: (templateId: number) => Promise<boolean>;
  
  // AI Actions
  generateSummary: (documentId: number) => Promise<DocumentSummary | null>;
  
  // Utility Actions
  clearSelectedDocument: () => void;
  resetState: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  devtools((set, get) => ({
    // Initial State
    documents: [],
    selectedDocument: null,
    documentTypes: [],
    folders: [],
    templates: [],
    summary: null,
    isLoading: false,
    isUploading: false,
    
    // ==================== Document Actions ====================
    
    fetchDocuments: async (params) => {
      set({ isLoading: true });
      try {
        const documents = await documentService.getAllDocuments(params);
        set({ documents, isLoading: false });
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        toast.error('Failed to load documents');
        set({ isLoading: false });
      }
    },
    
    fetchDocumentById: async (id) => {
      set({ isLoading: true });
      try {
        const document = await documentService.getDocumentById(id);
        set({ selectedDocument: document, isLoading: false });
      } catch (error) {
        console.error('Failed to fetch document:', error);
        toast.error('Failed to load document');
        set({ isLoading: false });
      }
    },
    
    uploadDocument: async (data) => {
      set({ isUploading: true });
      try {
        const document = await documentService.uploadDocument(data);
        set((state) => ({ 
          documents: [document, ...state.documents],
          isUploading: false 
        }));
        toast.success('Document uploaded successfully');
        return document;
      } catch (error) {
        console.error('Failed to upload document:', error);
        toast.error('Failed to upload document');
        set({ isUploading: false });
        return null;
      }
    },
    
    updateDocument: async (id, data) => {
      set({ isLoading: true });
      try {
        const document = await documentService.updateDocument(id, data);
        set((state) => ({
          documents: state.documents.map((d) => d.id === id ? document : d),
          selectedDocument: document,
          isLoading: false
        }));
        toast.success('Document updated successfully');
        return document;
      } catch (error) {
        console.error('Failed to update document:', error);
        toast.error('Failed to update document');
        set({ isLoading: false });
        return null;
      }
    },
    
    deleteDocument: async (id) => {
      set({ isLoading: true });
      try {
        await documentService.deleteDocument(id);
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          selectedDocument: state.selectedDocument?.id === id ? null : state.selectedDocument,
          isLoading: false
        }));
        toast.success('Document deleted successfully');
        return true;
      } catch (error) {
        console.error('Failed to delete document:', error);
        toast.error('Failed to delete document');
        set({ isLoading: false });
        return false;
      }
    },
    
    downloadDocument: async (id) => {
      try {
        const blob = await documentService.downloadDocument(id);
        const doc = get().selectedDocument || get().documents.find(d => d.id === id);
        if (doc) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Download started');
        }
      } catch (error) {
        console.error('Failed to download document:', error);
        toast.error('Failed to download document');
      }
    },
    
    // ==================== Document Type Actions ====================
    
    fetchDocumentTypes: async () => {
      try {
        const types = await documentService.getDocumentTypes();
        set({ documentTypes: types });
      } catch (error) {
        console.error('Failed to fetch document types:', error);
      }
    },
    
    createDocumentType: async (data) => {
      try {
        const type = await documentService.createDocumentType(data);
        set((state) => ({ documentTypes: [...state.documentTypes, type] }));
        toast.success('Document type created successfully');
        return type;
      } catch (error) {
        console.error('Failed to create document type:', error);
        toast.error('Failed to create document type');
        return null;
      }
    },
    
    // ==================== Folder Actions ====================
    
    fetchFolders: async (parentFolderId) => {
      try {
        const folders = await documentService.getFolders(parentFolderId);
        set({ folders });
      } catch (error) {
        console.error('Failed to fetch folders:', error);
      }
    },
    
    createFolder: async (data) => {
      try {
        const folder = await documentService.createFolder(data);
        set((state) => ({ folders: [...state.folders, folder] }));
        toast.success('Folder created successfully');
        return folder;
      } catch (error) {
        console.error('Failed to create folder:', error);
        toast.error('Failed to create folder');
        return null;
      }
    },
    
    moveDocument: async (documentId, folderId) => {
      try {
        await documentService.moveDocument(documentId, folderId);
        await get().fetchDocuments();
        toast.success('Document moved successfully');
        return true;
      } catch (error) {
        console.error('Failed to move document:', error);
        toast.error('Failed to move document');
        return false;
      }
    },
    
    // ==================== Template Actions ====================
    
    fetchTemplates: async (category) => {
      try {
        const templates = await documentService.getTemplates(category);
        set({ templates });
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    },
    
    createTemplate: async (data) => {
      set({ isLoading: true });
      try {
        const template = await documentService.createTemplate(data);
        set((state) => ({ 
          templates: [...state.templates, template],
          isLoading: false 
        }));
        toast.success('Template created successfully');
        return template;
      } catch (error) {
        console.error('Failed to create template:', error);
        toast.error('Failed to create template');
        set({ isLoading: false });
        return null;
      }
    },
    
    deleteTemplate: async (templateId) => {
      set({ isLoading: true });
      try {
        await documentService.deleteTemplate(templateId);
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== templateId),
          isLoading: false
        }));
        toast.success('Template deleted successfully');
        return true;
      } catch (error) {
        console.error('Failed to delete template:', error);
        toast.error('Failed to delete template');
        set({ isLoading: false });
        return false;
      }
    },
    
    // ==================== AI Actions ====================
    
    generateSummary: async (documentId) => {
      set({ isLoading: true });
      try {
        const summary = await documentService.generateSummary(documentId);
        set({ summary, isLoading: false });
        toast.success('Summary generated successfully');
        return summary;
      } catch (error) {
        console.error('Failed to generate summary:', error);
        toast.error('Failed to generate summary');
        set({ isLoading: false });
        return null;
      }
    },
    
    // ==================== Utility Actions ====================
    
    clearSelectedDocument: () => {
      set({ selectedDocument: null, summary: null });
    },
    
    resetState: () => {
      set({
        documents: [],
        selectedDocument: null,
        documentTypes: [],
        folders: [],
        templates: [],
        summary: null,
        isLoading: false,
        isUploading: false,
      });
    },
  }))
);