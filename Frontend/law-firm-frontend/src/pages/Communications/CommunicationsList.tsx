// src/pages/Communications/CommunicationsList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  UserIcon,
  BriefcaseIcon,
  ClockIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import { useCommunicationStore } from '../../stores/communicationStore';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { ComposeMessageModal } from './EmailIntegration';
import { ConnectEmailModal } from './ConnectEmailModal';

export const CommunicationsList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    threads, 
    isLoading, 
    fetchThreads, 
    archiveThread, 
    emailStatus, 
    fetchEmailStatus,
    syncEmails 
  } = useCommunicationStore();
  const { matters, fetchMatters } = useMatterStore();
  const { contacts, fetchContacts } = useContactStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatter, setFilterMatter] = useState<number | null>(null);
  const [filterContact, setFilterContact] = useState<number | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchThreads({ matterId: filterMatter || undefined, contactId: filterContact || undefined });
    fetchMatters({});
    fetchContacts({});
    fetchEmailStatus();
  }, [filterMatter, filterContact]);

  const filteredThreads = threads.filter(thread => 
    !searchTerm || 
    thread.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.matterTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleArchive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await archiveThread(id);
  };

  const handleSyncEmails = async () => {
    setIsSyncing(true);
    try {
      await syncEmails();
      await fetchThreads();
      toast.success('Emails synced successfully');
    } catch (error) {
      toast.error('Failed to sync emails');
    } finally {
      setIsSyncing(false);
    }
  };

  const clearFilters = () => {
    setFilterMatter(null);
    setFilterContact(null);
    setSearchTerm('');
  };

  const hasActiveFilters = filterMatter !== null || filterContact !== null || searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
          <p className="text-gray-500 mt-1">Manage emails, messages, and conversations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowComposeModal(true)}>
            <PlusIcon className="w-5 h-5 mr-2" />
            Compose
          </Button>
        </div>
      </div>

      {/* Email Integration Status */}
      {emailStatus && (
        <Card className="p-4 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${emailStatus.isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <div>
                <p className="font-medium text-gray-900">
                  {emailStatus.isConnected ? 'Email Connected' : 'Email Not Connected'}
                </p>
                {emailStatus.emailAddress && (
                  <p className="text-sm text-gray-600">{emailStatus.emailAddress}</p>
                )}
                {!emailStatus.isConnected && (
                  <p className="text-xs text-gray-500 mt-1">
                    Connect your email to sync messages and send emails directly from the platform
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!emailStatus.isConnected ? (
                <Button variant="outline" size="sm" onClick={() => setShowConnectModal(true)}>
                  Connect Email
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSyncEmails} 
                    isLoading={isSyncing}
                    disabled={isSyncing}
                  >
                    Sync Now
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowConnectModal(true)}
                  >
                    Settings
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Matter</label>
                <select
                  value={filterMatter || ''}
                  onChange={(e) => setFilterMatter(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Matters</option>
                  {matters.map((matter) => (
                    <option key={matter.id} value={matter.id}>
                      {matter.matterNumber} - {matter.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Contact</label>
                <select
                  value={filterContact || ''}
                  onChange={(e) => setFilterContact(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Contacts</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Threads List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredThreads.length === 0 ? (
        <EmptyState
          title="No conversations"
          description="Start a new conversation or connect your email to sync messages"
          buttonText="Compose Message"
          onButtonClick={() => setShowComposeModal(true)}
          icon={<EnvelopeIcon className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <div className="space-y-2">
          {filteredThreads.map((thread) => (
            <div
              key={thread.id}
              className="p-4 cursor-pointer hover:shadow-md transition-all hover:border-primary-200 group border border-gray-200 rounded-lg bg-white"
              onClick={() => navigate(`/communications/threads/${thread.id}`)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar/Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {thread.contactName ? (
                      <span className="text-gray-600 font-medium">
                        {thread.contactName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {thread.subject || '(No Subject)'}
                      </h3>
                      {thread.messageCount > 1 && (
                        <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                          {thread.messageCount} messages
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {thread.lastMessageAt && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleArchive(thread.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                        title="Archive"
                      >
                        <ArchiveBoxIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                    {thread.contactName && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        {thread.contactName}
                      </span>
                    )}
                    {thread.matterTitle && (
                      <span className="flex items-center gap-1">
                        <BriefcaseIcon className="w-3 h-3" />
                        {thread.matterTitle}
                      </span>
                    )}
                  </div>

                  {thread.lastMessageAt && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-1">
                      Last message: {formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })}
                    </p>
                  )}
                </div>

                {/* Thread Type Icon */}
                <div className="flex-shrink-0">
                  {thread.threadType === 'EMAIL' ? (
                    <EnvelopeIcon className="w-5 h-5 text-gray-300" />
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onSuccess={() => {
          fetchThreads({ matterId: filterMatter || undefined, contactId: filterContact || undefined });
        }}
      />

      {/* Connect Email Modal */}
      <ConnectEmailModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={() => {
          fetchEmailStatus();
          fetchThreads();
        }}
      />
    </div>
  );
};