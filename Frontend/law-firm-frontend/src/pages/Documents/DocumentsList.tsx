// src/pages/Documents/DocumentsList.tsx
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
  ArchiveBoxIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useDocumentStore } from '../../stores/documentStore';
import { useMatterStore } from '../../stores/matterStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { CreateFolderModal } from './CreateFolderModal';
import { UploadDocumentModal } from './UploadDocumentModal';

const getFileIcon = (mimeType?: string) => {
  if (!mimeType) return <DocumentIcon className="w-8 h-8 text-gray-400" />;
  if (mimeType.startsWith('image/')) return <PhotoIcon className="w-8 h-8 text-blue-400" />;
  if (mimeType.startsWith('video/')) return <FilmIcon className="w-8 h-8 text-purple-400" />;
  if (mimeType.startsWith('audio/')) return <MusicalNoteIcon className="w-8 h-8 text-green-400" />;
  if (mimeType === 'application/pdf') return <DocumentIcon className="w-8 h-8 text-red-400" />;
  return <DocumentIcon className="w-8 h-8 text-gray-400" />;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DocumentsList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    documents, 
    folders, 
    isLoading, 
    fetchDocuments, 
    fetchFolders,
    deleteDocument 
  } = useDocumentStore();
  const { matters, fetchMatters } = useMatterStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatter, setFilterMatter] = useState<number | null>(null);
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [searchTerm, filterMatter, currentFolder]);

  const loadData = async () => {
    await Promise.all([
      fetchDocuments({ 
        search: searchTerm || undefined, 
        matterId: filterMatter || undefined,
        folderId: currentFolder || undefined
      }),
      fetchFolders(currentFolder || undefined),
      fetchMatters({})
    ]);
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
    }
  };

  const handleFolderClick = (folderId: number) => {
    setCurrentFolder(folderId);
  };

  const handleBreadcrumb = (index: number) => {
    // Navigate up in folder tree
    const path = getFolderPath();
    setCurrentFolder(index === 0 ? null : path[index - 1]?.id);
  };

  const getFolderPath = () => {
    const path: Folder[] = [];
    let current = folders.find(f => f.id === currentFolder);
    while (current) {
      path.unshift(current);
      current = folders.find(f => f.id === current!.parentFolderId);
    }
    return path;
  };

  const folderPath = getFolderPath();

  const clearFilters = () => {
    setSearchTerm('');
    setFilterMatter(null);
  };

  const hasActiveFilters = searchTerm || filterMatter;

  if (isLoading && documents.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Manage your files, templates, and documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateFolderModal(true)}>
            <FolderIcon className="w-5 h-5 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      {folderPath.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => handleBreadcrumb(0)}
            className="text-gray-500 hover:text-gray-700"
          >
            All Documents
          </button>
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => handleBreadcrumb(index + 1)}
                className={`${index === folderPath.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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

      {/* Folders */}
      {folders.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-3">Folders</h2>
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
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/documents/${doc.id}`)}
              className="cursor-pointer"
            >
              <Card
                className="p-4 hover:shadow-md transition-all group"
              >
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
      ) : null}

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

// Minimal Folder type for local usage
interface Folder {
  id: number;
  name: string;
  parentFolderId?: number | null;
}