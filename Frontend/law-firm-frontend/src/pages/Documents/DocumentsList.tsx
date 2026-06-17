// src/pages/Documents/DocumentsList.tsx - Complete Rewritten Version

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  TrashIcon,
  EyeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  FolderPlusIcon,
  HomeIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { useDocumentStore } from '../../stores/documentStore';
import { useMatterStore } from '../../stores/matterStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { CreateFolderModal } from './CreateFolderModal';
import { UploadDocumentModal } from './UploadDocumentModal';

// ==================== Types ====================
interface Folder {
  id: number;
  name: string;
  description?: string;
  parentFolderId?: number | null;
  path?: string;
  createdAt: string;
}

// ==================== Helper Functions ====================
const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <DocumentIcon className="w-8 h-8 text-gray-400" />;
  if (mimeType.startsWith('image/')) return <PhotoIcon className="w-8 h-8 text-blue-400" />;
  if (mimeType.startsWith('video/')) return <FilmIcon className="w-8 h-8 text-purple-400" />;
  if (mimeType.startsWith('audio/')) return <MusicalNoteIcon className="w-8 h-8 text-green-400" />;
  if (mimeType === 'application/pdf') return <DocumentIcon className="w-8 h-8 text-red-400" />;
  if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') 
    return <DocumentIcon className="w-8 h-8 text-blue-500" />;
  if (mimeType === 'application/vnd.ms-excel' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') 
    return <DocumentIcon className="w-8 h-8 text-green-500" />;
  return <DocumentIcon className="w-8 h-8 text-gray-400" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ==================== Main Component ====================
export const DocumentsList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    documents, 
    folders, 
    templates,
    isLoading, 
    fetchDocuments, 
    fetchFolders,
    fetchTemplates,
    deleteDocument,
    deleteTemplate,
  } = useDocumentStore();
  const { matters, fetchMatters } = useMatterStore();
  
  // ==================== State ====================
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatter, setFilterMatter] = useState<number | null>(null);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [folderHistory, setFolderHistory] = useState<number[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'documents' | 'templates'>('documents');

  // ==================== Effects ====================
  useEffect(() => {
    loadData();
  }, [searchTerm, filterMatter, currentFolder, viewMode]);

  // ==================== Data Loading ====================
  const loadData = async () => {
    try {
      await Promise.all([
        fetchDocuments({ 
          search: searchTerm || undefined, 
          matterId: filterMatter || undefined,
          folderId: currentFolder || undefined
        }),
        fetchFolders(currentFolder || undefined),
        fetchMatters({})
      ]);
      
      if (viewMode === 'templates') {
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load documents');
    }
  };

  // ==================== Handlers ====================
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
      await loadData();
    }
  };

  const handleDeleteTemplate = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
      await loadData();
    }
  };

  const handleFolderClick = (folderId: number) => {
    if (currentFolder !== null) {
      setFolderHistory(prev => [...prev, currentFolder]);
    }
    setCurrentFolder(folderId);
  };

  const handleBack = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory];
      const previousFolder = newHistory.pop();
      setFolderHistory(newHistory);
      setCurrentFolder(previousFolder || null);
    } else {
      setCurrentFolder(null);
    }
  };

  const handleNavigateToRoot = () => {
    setFolderHistory([]);
    setCurrentFolder(null);
  };

  const handleBreadcrumbClick = (index: number) => {
    const path = getFolderPath();
    if (index === 0) {
      setFolderHistory([]);
      setCurrentFolder(null);
    } else {
      const targetFolder = path[index - 1];
      const newHistory = path.slice(0, index - 1).map(f => f.id);
      setFolderHistory(newHistory);
      setCurrentFolder(targetFolder?.id || null);
    }
  };

  const getFolderPath = (): Folder[] => {
    const path: Folder[] = [];
    let current = folders.find(f => f.id === currentFolder);
    const visited = new Set<number>();
    
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      path.unshift(current);
      const parentFolderId = current.parentFolderId;
      current = folders.find(f => f.id === parentFolderId);
    }
    return path;
  };

  const folderPath = getFolderPath();

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMatter(null);
  };

  const hasActiveFilters = searchTerm || filterMatter;

  // ==================== Loading State ====================
  if (isLoading && documents.length === 0 && folders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // ==================== Render ====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Manage your files, templates, and documents</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/documents/shared')}
            className="flex items-center gap-2"
          >
            <ShareIcon className="w-4 h-4" />
            Shared with Me
          </Button>
          <Button variant="outline" onClick={() => setShowCreateFolderModal(true)}>
            <FolderPlusIcon className="w-5 h-5 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setViewMode('documents')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'documents'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Documents ({documents.length})
        </button>
        <button
          onClick={() => setViewMode('templates')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'templates'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Templates ({templates.length})
        </button>
      </div>

      {/* Navigation Bar - Back Button & Breadcrumb */}
      {viewMode === 'documents' && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-x-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={!currentFolder && folderHistory.length === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              currentFolder || folderHistory.length > 0
                ? 'text-gray-700 hover:bg-gray-200'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>

          <div className="w-px h-6 bg-gray-300 flex-shrink-0" />

          {/* Home Button */}
          <button
            onClick={handleNavigateToRoot}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
              !currentFolder && folderHistory.length === 0
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <HomeIcon className="w-4 h-4" />
            Root
          </button>

          <div className="w-px h-6 bg-gray-300 flex-shrink-0" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm overflow-x-auto flex-1 min-w-0">
            <button
              onClick={() => handleBreadcrumbClick(0)}
              className={`whitespace-nowrap ${
                folderPath.length === 0 
                  ? 'text-primary-600 font-medium' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Documents
            </button>
            {folderPath.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => handleBreadcrumbClick(index + 1)}
                  className={`whitespace-nowrap ${
                    index === folderPath.length - 1 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Current Folder Info */}
          {currentFolder && (
            <div className="flex-shrink-0 text-xs text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">
              ID: {currentFolder}
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              Filters
              {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <XMarkIcon className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Matter</label>
              <select
                value={filterMatter || ''}
                onChange={(e) => setFilterMatter(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">All Matters</option>
                {matters.map((matter) => (
                  <option key={matter.id} value={matter.id}>
                    {matter.matterNumber} - {matter.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Templates View */}
      {viewMode === 'templates' && (
        <div>
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="p-4 hover:shadow-lg transition-all group">
                  <div className="text-center">
                    <div className="relative">
                      <DocumentDuplicateIcon className="w-12 h-12 text-primary-400 mx-auto mb-2" />
                      <button
                        onClick={(e) => handleDeleteTemplate(template.id, e)}
                        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.documentTypeName || 'Template'}</p>
                    {template.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Used {template.usageCount} times</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No templates"
              description="Create your first template from a document"
              buttonText="Upload as Template"
              onButtonClick={() => setShowUploadModal(true)}
              icon={<DocumentDuplicateIcon className="w-12 h-12 text-gray-400" />}
            />
          )}
        </div>
      )}

      {/* Documents View */}
      {viewMode === 'documents' && (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-500">Folders</h2>
                <span className="text-xs text-gray-400">{folders.length} folder{folders.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="cursor-pointer"
                    onClick={() => handleFolderClick(folder.id)}
                  >
                    <Card className="p-3 hover:shadow-md transition-all group text-center">
                      <FolderIcon className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 truncate">{folder.name}</p>
                      <p className="text-xs text-gray-400">Folder</p>
                      {folder.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{folder.description}</p>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents List */}
          {documents.length === 0 && folders.length === 0 ? (
            <EmptyState
              title="No documents"
              description="Upload your first document or create a folder to get started"
              buttonText="Upload Document"
              onButtonClick={() => setShowUploadModal(true)}
              icon={<DocumentIcon className="w-12 h-12 text-gray-400" />}
            />
          ) : documents.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-500">Documents</h2>
                <span className="text-xs text-gray-400">{documents.length} document{documents.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="cursor-pointer"
                  >
                    <Card className="p-4 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          {getFileIcon(doc.mimeType)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {doc.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              {doc.isTemplate && (
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                                  Template
                                </span>
                              )}
                              {doc.version > 1 && (
                                <span className="text-xs text-gray-400">v{doc.version}</span>
                              )}
                              <button
                                onClick={(e) => handleDelete(doc.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-all"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-1">{doc.fileName}</p>
                          
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                            <span>{formatFileSize(doc.fileSize)}</span>
                            <span>Uploaded {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</span>
                            {doc.matterTitle && <span>Matter: {doc.matterTitle}</span>}
                            {doc.documentTypeName && <span>Type: {doc.documentTypeName}</span>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Modals */}
      <UploadDocumentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={loadData}
        currentFolderId={currentFolder}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onSuccess={loadData}
        parentFolderId={currentFolder}
      />
    </div>
  );
};