// src/pages/Documents/DocumentDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useDocumentStore } from '../../stores/documentStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';
import { DownloadIcon } from 'lucide-react';

export const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedDocument, 
    summary,
    isLoading, 
    fetchDocumentById, 
    deleteDocument, 
    downloadDocument,
    generateSummary,
    clearSelectedDocument 
  } = useDocumentStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'comments'>('details');

  useEffect(() => {
    if (id) {
      fetchDocumentById(parseInt(id));
    }
    return () => {
      clearSelectedDocument();
    };
  }, [id]);

  const handleDelete = async () => {
    if (id) {
      const success = await deleteDocument(parseInt(id));
      if (success) {
        navigate('/documents');
      }
      setShowDeleteModal(false);
    }
  };

  const handleDownload = async () => {
    if (id) {
      await downloadDocument(parseInt(id));
    }
  };

  const handleGenerateSummary = async () => {
    if (id) {
      setIsGeneratingSummary(true);
      await generateSummary(parseInt(id));
      setIsGeneratingSummary(false);
      setShowSummary(true);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedDocument) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Document not found</p>
        <Button onClick={() => navigate('/documents')} className="mt-4">
          Back to Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedDocument.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{selectedDocument.fileName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={() => navigate(`/documents/${id}/edit`)}>
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {['details', 'versions', 'comments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-1 text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content - Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">File Name</span>
                  <span className="text-gray-900">{selectedDocument.fileName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">File Size</span>
                  <span className="text-gray-900">{formatFileSize(selectedDocument.fileSize)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">File Type</span>
                  <span className="text-gray-900">{selectedDocument.mimeType || 'Unknown'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Version</span>
                  <span className="text-gray-900">v{selectedDocument.version}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Uploaded</span>
                  <span className="text-gray-900">{new Date(selectedDocument.uploadedAt).toLocaleString()}</span>
                </div>
                {selectedDocument.matterTitle && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Related Matter</span>
                    <span className="text-gray-900">{selectedDocument.matterTitle}</span>
                  </div>
                )}
                {selectedDocument.contactName && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Related Contact</span>
                    <span className="text-gray-900">{selectedDocument.contactName}</span>
                  </div>
                )}
                {selectedDocument.documentTypeName && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-500">Document Type</span>
                    <span className="text-gray-900">{selectedDocument.documentTypeName}</span>
                  </div>
                )}
              </div>
            </Card>

            {selectedDocument.description && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDocument.description}</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card className="text-center">
              <div className="flex items-center justify-center mb-4">
                <DocumentIcon className="w-16 h-16 text-gray-400" />
              </div>
              <Button variant="outline" onClick={handleDownload} fullWidth>
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download File
              </Button>
            </Card>

            {/* AI Summary Card */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Summary</h3>
              {summary ? (
                <div>
                  <p className="text-gray-700 text-sm mb-3">{summary.summary}</p>
                  {summary.keyPoints && summary.keyPoints.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Key Points:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {summary.keyPoints.slice(0, 5).map((point, i) => (
                          <li key={i} className="text-sm text-gray-600">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowSummary(true)}>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Full Summary
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">Generate an AI summary of this document</p>
                  <Button onClick={handleGenerateSummary} isLoading={isGeneratingSummary} size="sm">
                    Generate Summary
                  </Button>
                </div>
              )}
            </Card>

            {/* Actions Card */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" fullWidth>
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share Document
                </Button>
                <Button variant="outline" fullWidth>
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Create Template
                </Button>
                <Button variant="outline" fullWidth>
                  <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Content - Versions Tab */}
      {activeTab === 'versions' && (
        <Card>
          <div className="text-center py-12">
            <DocumentDuplicateIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Version history will appear here</p>
            <Button variant="outline" className="mt-4">
              Upload New Version
            </Button>
          </div>
        </Card>
      )}

      {/* Content - Comments Tab */}
      {activeTab === 'comments' && (
        <Card>
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet</p>
            <Button variant="outline" className="mt-4">
              Add Comment
            </Button>
          </div>
        </Card>
      )}

      {/* Summary Modal */}
      <Modal isOpen={showSummary} onClose={() => setShowSummary(false)} title="Document Summary" size="lg">
        <div className="space-y-4">
          {summary && (
            <>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <p className="text-gray-700">{summary.summary}</p>
              </div>
              {summary.keyPoints && summary.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summary.keyPoints.map((point, i) => (
                      <li key={i} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">
                Generated at {new Date(summary.generatedAt).toLocaleString()}
              </p>
            </>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowSummary(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Document">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "<strong>{selectedDocument.title}</strong>"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};