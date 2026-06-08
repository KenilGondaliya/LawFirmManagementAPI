// src/pages/Communications/ThreadDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  StarIcon,
  ArchiveBoxIcon,
  UserIcon,
  BriefcaseIcon,
  ClockIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useCommunicationStore } from '../../stores/communicationStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { format } from 'date-fns';
import { ComposeMessageModal } from './EmailIntegration';

export const ThreadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedThread, 
    messages, 
    isLoading, 
    fetchThreadById, 
    fetchMessagesByThread, 
    starMessage, 
    archiveThread,
    clearSelectedThread,
    clearMessages
  } = useCommunicationStore();
  
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchThreadById(parseInt(id));
      fetchMessagesByThread(parseInt(id));
    }
    return () => {
      clearSelectedThread();
      clearMessages();
    };
  }, [id]);

  const handleStar = async (messageId: number) => {
    await starMessage(messageId);
  };

  const handleArchive = async () => {
    if (id) {
      await archiveThread(parseInt(id));
      navigate('/communications');
    }
  };

  const handleReply = (message: any) => {
    setReplyingTo({
      messageId: message.id,
      subject: message.subject,
      fromEmail: message.senderEmail,
      fromName: message.senderName,
    });
    setShowReplyModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedThread) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Conversation not found</p>
        <Button onClick={() => navigate('/communications')} className="mt-4">
          Back to Communications
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
            onClick={() => navigate('/communications')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedThread.subject || '(No Subject)'}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {selectedThread.contactName && (
                <span className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  {selectedThread.contactName}
                </span>
              )}
              {selectedThread.matterTitle && (
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="w-4 h-4" />
                  {selectedThread.matterTitle}
                </span>
              )}
              <span className="flex items-center gap-1">
                <EnvelopeIcon className="w-4 h-4" />
                {selectedThread.threadType}
              </span>
              {selectedThread.lastMessageAt && (
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {format(new Date(selectedThread.lastMessageAt), 'PPP')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleArchive}>
            <ArchiveBoxIcon className="w-4 h-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <Card 
            key={message.id} 
            className={`p-6 ${!message.isRead ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''}`}
          >
            {/* Message Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {message.senderName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{message.senderName || message.senderEmail}</p>
                    <p className="text-sm text-gray-500">&lt;{message.senderEmail}&gt;</p>
                    {!message.isRead && (
                      <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {message.sentAt && format(new Date(message.sentAt), 'PPP p')}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStar(message.id)}
                  className="text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  {message.isStarred ? (
                    <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleReply(message)}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  ReplyIcon
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div className="mt-4">
              <div className="prose max-w-none">
                {message.body?.split('\n').map((line, i) => (
                  <p key={i} className="text-gray-700 mb-2">{line}</p>
                ))}
              </div>
            </div>

            {/* Recipients */}
            {message.recipients && message.recipients.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                {message.recipients.filter(r => r.recipientType === 'TO').length > 0 && (
                  <p><strong>To:</strong> {message.recipients.filter(r => r.recipientType === 'TO').map(r => r.recipientIdentifier).join(', ')}</p>
                )}
                {message.recipients.filter(r => r.recipientType === 'CC').length > 0 && (
                  <p><strong>Cc:</strong> {message.recipients.filter(r => r.recipientType === 'CC').map(r => r.recipientIdentifier).join(', ')}</p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Reply Modal */}
      <ComposeMessageModal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReplyingTo(null);
        }}
        onSuccess={() => {
          if (id) {
            fetchMessagesByThread(parseInt(id));
          }
        }}
        replyTo={replyingTo}
      />
    </div>
  );
};