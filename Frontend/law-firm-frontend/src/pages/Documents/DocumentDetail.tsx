// src/pages/Documents/DocumentDetail.tsx - Complete Fixed Version

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
  PlusIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  FolderIcon,
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
    versions,
    comments,
    isLoading, 
    fetchDocumentById, 
    deleteDocument, 
    downloadDocument,
    generateSummary,
    fetchVersions,
    fetchComments,
    addComment,
    deleteComment,
    shareDocument,
    revokeShare,
    createVersion,
    clearSelectedDocument 
  } = useDocumentStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'versions' | 'comments'>('details');
  const [shareData, setShareData] = useState({
    email: '',
    permission: 'VIEW',
    expiresInDays: 7,
  });
  const [commentText, setCommentText] = useState('');
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [changeSummary, setChangeSummary] = useState('');

  useEffect(() => {
    if (id) {
      const docId = parseInt(id);
      fetchDocumentById(docId);
      fetchVersions(docId);
      fetchComments(docId);
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

  const handleShareDocument = async () => {
    if (id && shareData.email) {
      const result = await shareDocument(parseInt(id), {
        email: shareData.email,
        permission: shareData.permission,
        expiresInDays: shareData.expiresInDays,
      });
      if (result) {
        toast.success(`Document shared with ${shareData.email}`);
        setShowShareModal(false);
        setShareData({ email: '', permission: 'VIEW', expiresInDays: 7 });
      }
    } else {
      toast.error('Please enter an email address');
    }
  };

  const handleAddComment = async () => {
    if (id && commentText.trim()) {
      const result = await addComment(parseInt(id), commentText.trim());
      if (result) {
        toast.success('Comment added successfully');
        setCommentText('');
        setShowCommentModal(false);
        await fetchComments(parseInt(id));
      }
    }
  };

  const handleUploadVersion = async () => {
    if (id && versionFile) {
      setIsUploadingVersion(true);
      try {
        const result = await createVersion(parseInt(id), versionFile, changeSummary);
        if (result) {
          toast.success('New version uploaded successfully');
          setVersionFile(null);
          setChangeSummary('');
          setShowVersionModal(false);
          await fetchDocumentById(parseInt(id));
          await fetchVersions(parseInt(id));
        }
      } catch (error) {
        console.error('Failed to upload version:', error);
        toast.error('Failed to upload new version');
      } finally {
        setIsUploadingVersion(false);
      }
    } else {
      toast.error('Please select a file');
    }
  };

  const handleVersionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVersionFile(e.target.files[0]);
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
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'versions'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Versions ({versions.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Comments ({comments.length})
          </button>
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
                <Button variant="outline" fullWidth onClick={() => setShowShareModal(true)}>
                  <ShareIcon className="w-4 h-4 mr-2" />
                  Share Document
                </Button>
                <Button variant="outline" fullWidth onClick={() => setShowVersionModal(true)}>
                  <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                  Upload New Version
                </Button>
                <Button variant="outline" fullWidth>
                  <FolderIcon className="w-4 h-4 mr-2" />
                  Move to Folder
                </Button>
                <Button variant="outline" fullWidth onClick={() => setShowCommentModal(true)}>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
            <Button variant="outline" size="sm" onClick={() => setShowVersionModal(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Upload New Version
            </Button>
          </div>
          {versions.length > 0 ? (
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <DocumentIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Version {version.version}</p>
                      <p className="text-sm text-gray-500">{version.fileName}</p>
                      {version.changeSummary && (
                        <p className="text-sm text-gray-600">{version.changeSummary}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatFileSize(version.fileSize)} • Uploaded {new Date(version.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No versions available</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowVersionModal(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Upload New Version
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Content - Comments Tab */}
      {activeTab === 'comments' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
            <Button variant="outline" size="sm" onClick={() => setShowCommentModal(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Comment
            </Button>
          </div>
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{comment.userName || 'User'}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 mt-1">{comment.comment}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this comment?')) {
                          deleteComment(comment.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowCommentModal(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Share Modal */}
      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Document" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Share this document with others by email. They will receive a link to access the document.
          </p>
          <Input
            label="Email Address"
            type="email"
            value={shareData.email}
            onChange={(e) => setShareData({ ...shareData, email: e.target.value })}
            placeholder="Enter email address"
            icon={<EnvelopeIcon className="w-4 h-4" />}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
            <select
              value={shareData.permission}
              onChange={(e) => setShareData({ ...shareData, permission: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="VIEW">View Only</option>
              <option value="EDIT">Edit</option>
              <option value="COMMENT">Comment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expires In (Days)</label>
            <select
              value={shareData.expiresInDays}
              onChange={(e) => setShareData({ ...shareData, expiresInDays: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value={1}>1 Day</option>
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={0}>Never Expires</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowShareModal(false)}>Cancel</Button>
            <Button onClick={handleShareDocument} disabled={!shareData.email}>
              Share Document
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Version Modal */}
      <Modal isOpen={showVersionModal} onClose={() => setShowVersionModal(false)} title="Upload New Version" size="md">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Upload a new version of this document. The current version will be preserved in the version history.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File *
            </label>
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                versionFile ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}>
                <div className="flex flex-col items-center justify-center pt-4 pb-5">
                  <DocumentIcon className={`w-6 h-6 mb-1 ${versionFile ? 'text-green-500' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-500">
                    {versionFile ? versionFile.name : 'Click to select a file'}
                  </p>
                  {versionFile && (
                    <p className="text-xs text-gray-400 mt-1">
                      {(versionFile.size / 1024).toFixed(2)} KB
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleVersionFileChange}
                />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Change Summary</label>
            <textarea
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Describe what changed in this version (optional)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => {
              setShowVersionModal(false);
              setVersionFile(null);
              setChangeSummary('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadVersion} 
              isLoading={isUploadingVersion} 
              disabled={!versionFile}
            >
              Upload Version
            </Button>
          </div>
        </div>
      </Modal>

      {/* Comment Modal */}
      <Modal isOpen={showCommentModal} onClose={() => setShowCommentModal(false)} title="Add Comment" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Write your comment here..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowCommentModal(false)}>Cancel</Button>
            <Button onClick={handleAddComment} disabled={!commentText.trim()}>
              Add Comment
            </Button>
          </div>
        </div>
      </Modal>

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