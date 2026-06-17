// src/pages/Documents/SharedByMe.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentIcon,
  ShareIcon,
  UserIcon,
  EnvelopeIcon,
  ClockIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useDocumentStore } from '../../stores/documentStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Modal } from '../../components/UI/Modal';

export const SharedByMe: React.FC = () => {
  const navigate = useNavigate();
  const [sharedDocuments, setSharedDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingShareId, setRevokingShareId] = useState<number | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedShareId, setSelectedShareId] = useState<number | null>(null);

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/documents/shared-by-me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSharedDocuments(data);
      }
    } catch (error) {
      console.error('Failed to fetch shared documents:', error);
      toast.error('Failed to load shared documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeShare = async () => {
    if (!selectedShareId) return;
    setRevokingShareId(selectedShareId);
    try {
      const response = await fetch(`/api/v1/documents/shares/${selectedShareId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (response.ok) {
        toast.success('Share revoked successfully');
        setSharedDocuments(prev => prev.filter(d => d.id !== selectedShareId));
        setShowRevokeModal(false);
        setSelectedShareId(null);
      }
    } catch (error) {
      console.error('Failed to revoke share:', error);
      toast.error('Failed to revoke share');
    } finally {
      setRevokingShareId(null);
    }
  };

  const getPermissionBadge = (permission: string) => {
    const colors: Record<string, string> = {
      'VIEW': 'bg-blue-100 text-blue-700',
      'EDIT': 'bg-green-100 text-green-700',
      'COMMENT': 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[permission] || 'bg-gray-100 text-gray-700'}`}>
        {permission}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shared by Me</h1>
          <p className="text-gray-500 mt-1">Documents you have shared with others</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/documents')}>
          <DocumentIcon className="w-4 h-4 mr-2" />
          Back to Documents
        </Button>
      </div>

      {sharedDocuments.length > 0 ? (
        <div className="space-y-4">
          {sharedDocuments.map((doc) => (
            <Card key={doc.id} className="p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-primary-50 rounded-lg">
                    <DocumentIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {doc.documentTitle}
                      </h3>
                      {getPermissionBadge(doc.permission)}
                      <span className={`text-xs ${
                        doc.isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {doc.isActive ? 'Active' : 'Expired'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{doc.documentFileName}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>Shared with: {doc.sharedWithEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <EnvelopeIcon className="w-3 h-3" />
                        <span>{doc.sharedWithEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>Shared {formatDistanceToNow(new Date(doc.sharedAt), { addSuffix: true })}</span>
                      </div>
                      {doc.expiresAt && (
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>Expires: {new Date(doc.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {doc.isActive && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedShareId(doc.id);
                      setShowRevokeModal(true);
                    }}
                    className="ml-4"
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Revoke
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No shared documents"
          description="You haven't shared any documents yet"
          buttonText="Go to Documents"
          onButtonClick={() => navigate('/documents')}
          icon={<ShareIcon className="w-12 h-12 text-gray-400" />}
        />
      )}

      {/* Revoke Modal */}
      <Modal isOpen={showRevokeModal} onClose={() => setShowRevokeModal(false)} title="Revoke Share">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to revoke access to this document? The user will no longer be able to access it.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRevokeModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleRevokeShare} 
              isLoading={revokingShareId !== null}
            >
              Revoke Access
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};