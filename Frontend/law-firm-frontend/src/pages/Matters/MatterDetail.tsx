// src/pages/Matters/MatterDetail.tsx - With Complete Navigation

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArchiveBoxIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  EyeIcon,
  TagIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ARCHIVED: 'bg-blue-100 text-blue-800',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const partyTypeOptions = [
  { value: 'CLIENT', label: 'Client', icon: '👤' },
  { value: 'OPPONENT', label: 'Opponent', icon: '⚔️' },
  { value: 'WITNESS', label: 'Witness', icon: '👁️' },
  { value: 'ADVOCATE', label: 'Advocate', icon: '⚖️' },
  { value: 'JUDGE', label: 'Judge', icon: '👨‍⚖️' },
  { value: 'EXPERT', label: 'Expert', icon: '🔬' },
  { value: 'OTHER', label: 'Other', icon: '📌' },
];

export const MatterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedMatter, 
    isLoading, 
    fetchMatterById, 
    deleteMatter, 
    updateMatterStatus, 
    clearSelectedMatter, 
    addMatterParty, 
    removeMatterParty, 
    addMatterNote, 
    deleteMatterNote,
    fetchMatterDocuments,
    fetchMatterTasks,
    fetchMatterEvents,
    fetchMatterBills,
    fetchMatterTimeline,
    documents,
    tasks,
    events,
    bills,
    timeline
  } = useMatterStore();
  const { contacts, fetchContacts } = useContactStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddPartyModal, setShowAddPartyModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'parties' | 'notes' | 'documents' | 'tasks' | 'events' | 'bills' | 'timeline'>('details');
  const [newParty, setNewParty] = useState({ contactId: 0, partyType: 'CLIENT', roleDescription: '', isPrimary: false });
  const [newNote, setNewNote] = useState({ note: '', isPrivate: false });
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    if (id) {
      const matterId = parseInt(id);
      fetchMatterById(matterId);
      fetchContacts({});
      refreshRelatedData(matterId);
    }
    return () => {
      clearSelectedMatter();
    };
  }, [id]);

  const refreshRelatedData = async (matterId: number) => {
    await Promise.all([
      fetchMatterDocuments(matterId),
      fetchMatterTasks(matterId),
      fetchMatterEvents(matterId),
      fetchMatterBills(matterId),
      fetchMatterTimeline(matterId),
    ]);
  };

  const handleDelete = async () => {
    if (id) {
      const success = await deleteMatter(parseInt(id));
      if (success) {
        navigate('/matters');
      }
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (id) {
      setStatusChanging(true);
      await updateMatterStatus(parseInt(id), status);
      setStatusChanging(false);
    }
  };

  const handleAddParty = async () => {
    if (id && newParty.contactId) {
      await addMatterParty(parseInt(id), newParty);
      setShowAddPartyModal(false);
      setNewParty({ contactId: 0, partyType: 'CLIENT', roleDescription: '', isPrimary: false });
      await refreshRelatedData(parseInt(id));
    }
  };

  const handleRemoveParty = async (partyId: number) => {
    if (id) {
      await removeMatterParty(parseInt(id), partyId);
      await refreshRelatedData(parseInt(id));
    }
  };

  const handleAddNote = async () => {
    if (id && newNote.note.trim()) {
      await addMatterNote(parseInt(id), newNote);
      setShowAddNoteModal(false);
      setNewNote({ note: '', isPrivate: false });
      await refreshRelatedData(parseInt(id));
    }
  };

  const handleRemoveNote = async (noteId: number) => {
    await deleteMatterNote(noteId);
    if (id) {
      await refreshRelatedData(parseInt(id));
    }
  };

  // Navigation handlers
  const handleViewContact = (contactId: number) => {
    navigate(`/contacts/${contactId}`);
  };

  const handleViewDocument = (documentId: number) => {
    navigate(`/documents/${documentId}`);
  };

  const handleViewTask = (taskId: number) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleViewEvent = (eventId: number) => {
    navigate(`/calendar/events/${eventId}`);
  };

  const handleViewBill = (billId: number) => {
    navigate(`/billing/bills/${billId}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedMatter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Matter not found</p>
        <Button onClick={() => navigate('/matters')} className="mt-4">
          Back to Matters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/matters')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{selectedMatter.title}</h1>
              <span className={`px-2 py-1 text-xs rounded-full ${statusColors[selectedMatter.status]}`}>
                {selectedMatter.status}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[selectedMatter.priority]}`}>
                {selectedMatter.priority}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 font-mono">{selectedMatter.matterNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedMatter.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={statusChanging}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="CLOSED">Closed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Button variant="outline" onClick={() => navigate(`/matters/${id}/edit`)}>
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
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-4 md:gap-6 min-w-max">
          {[
            { key: 'details', label: 'Details', icon: DocumentTextIcon },
            { key: 'parties', label: 'Parties', icon: UsersIcon },
            { key: 'notes', label: 'Notes', icon: ChatBubbleLeftRightIcon },
            { key: 'documents', label: 'Documents', icon: DocumentTextIcon },
            { key: 'tasks', label: 'Tasks', icon: CheckCircleIcon },
            { key: 'events', label: 'Events', icon: CalendarIcon },
            { key: 'bills', label: 'Bills', icon: CurrencyDollarIcon },
            { key: 'timeline', label: 'Timeline', icon: ClockIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 px-1 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-primary-500" />
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedMatter.description || 'No description provided.'}
              </p>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-5 h-5 text-primary-500" />
                Financial Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedMatter.estimatedValue && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Estimated Value</p>
                    <p className="text-xl font-semibold text-gray-900">
                      ${selectedMatter.estimatedValue.toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedMatter.billingMethod && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Billing Method</p>
                    <p className="text-gray-900 font-medium capitalize">{selectedMatter.billingMethod}</p>
                  </div>
                )}
                {selectedMatter.hourlyRate && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Hourly Rate</p>
                    <p className="text-gray-900 font-medium">${selectedMatter.hourlyRate}/hour</p>
                  </div>
                )}
                {selectedMatter.fixedFee && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Fixed Fee</p>
                    <p className="text-gray-900 font-medium">${selectedMatter.fixedFee.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary-500" />
                Important Dates
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Open Date</p>
                    <p className="text-gray-900 font-medium">{formatDate(selectedMatter.openDate)}</p>
                  </div>
                </div>
                {selectedMatter.pendingDate && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Date</p>
                      <p className="text-gray-900 font-medium">{formatDate(selectedMatter.pendingDate)}</p>
                    </div>
                  </div>
                )}
                {selectedMatter.closedDate && (
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <CheckCircleIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Closed Date</p>
                      <p className="text-gray-900 font-medium">{formatDate(selectedMatter.closedDate)}</p>
                    </div>
                  </div>
                )}
                {selectedMatter.statuteOfLimitationsDate && (
                  <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-red-600 font-medium">Statute of Limitations</p>
                      <p className="text-red-700 font-bold">{formatDate(selectedMatter.statuteOfLimitationsDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5 text-primary-500" />
                Matter Information
              </h3>
              <div className="space-y-3">
                {selectedMatter.matterTypeName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Matter Type</span>
                    <span className="text-sm font-medium text-gray-900">{selectedMatter.matterTypeName}</span>
                  </div>
                )}
                {selectedMatter.practiceAreaName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Practice Area</span>
                    <span className="text-sm font-medium text-gray-900">{selectedMatter.practiceAreaName}</span>
                  </div>
                )}
                {selectedMatter.responsibleAdvocateName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Responsible Advocate</span>
                    <span className="text-sm font-medium text-gray-900">{selectedMatter.responsibleAdvocateName}</span>
                  </div>
                )}
                {selectedMatter.originatingAdvocateName && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Originating Advocate</span>
                    <span className="text-sm font-medium text-gray-900">{selectedMatter.originatingAdvocateName}</span>
                  </div>
                )}
                {selectedMatter.clientReference && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Client Reference</span>
                    <span className="text-sm font-mono text-gray-900">{selectedMatter.clientReference}</span>
                  </div>
                )}
              </div>
            </Card>

            {selectedMatter.courtName && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-primary-500" />
                  Court Information
                </h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{selectedMatter.courtName}</p>
                  {selectedMatter.judicialDistrictName && (
                    <p className="text-sm text-gray-500">District: {selectedMatter.judicialDistrictName}</p>
                  )}
                </div>
              </Card>
            )}

            {selectedMatter.isConfidential && (
              <Card className="border-red-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Confidential Matter</h3>
                </div>
                <p className="text-sm text-red-700 mt-2">
                  This matter is marked as confidential. Access is restricted to authorized personnel only.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Content - Parties Tab */}
      {activeTab === 'parties' && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary-500" />
              Parties ({selectedMatter.parties?.length || 0})
            </h3>
            <Button size="sm" onClick={() => setShowAddPartyModal(true)}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Party
            </Button>
          </div>
          
          {selectedMatter.parties && selectedMatter.parties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMatter.parties.map((party) => (
                <div 
                  key={party.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleViewContact(party.contactId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-lg">
                      {partyTypeOptions.find(p => p.value === party.partyType)?.icon || '👤'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{party.contactName}</p>
                        {party.isPrimary && (
                          <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {partyTypeOptions.find(p => p.value === party.partyType)?.label || party.partyType}
                        {party.roleDescription && ` • ${party.roleDescription}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveParty(party.id);
                    }}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No parties added to this matter</p>
              <p className="text-sm text-gray-400">Add clients, opponents, witnesses, and other parties</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddPartyModal(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                Add First Party
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Content - Notes Tab */}
      {activeTab === 'notes' && (
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-500" />
              Notes & Comments
            </h3>
            <Button size="sm" onClick={() => setShowAddNoteModal(true)}>
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Note
            </Button>
          </div>
          
          {selectedMatter.notes && selectedMatter.notes.length > 0 ? (
            <div className="space-y-4">
              {selectedMatter.notes.map((note) => (
                <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{note.userName || 'System'}</span>
                      <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</span>
                      {note.isPrivate && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                          Private
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveNote(note.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No notes yet</p>
              <p className="text-sm text-gray-400">Add notes to track important information</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddNoteModal(true)}>
                <PlusIcon className="w-4 h-4 mr-1" />
                Add First Note
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Content - Documents Tab with Navigation */}
      {activeTab === 'documents' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-primary-500" />
            Documents ({documents.length})
          </h3>
          {documents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{doc.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{doc.fileName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{doc.uploadedByName || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(doc.uploadedAt)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{(doc.fileSize / 1024).toFixed(2)} KB</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDocument(doc.id)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded for this matter</p>
            </div>
          )}
        </Card>
      )}

      {/* Content - Tasks Tab with Navigation */}
      {activeTab === 'tasks' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-primary-500" />
            Tasks ({tasks.length})
          </h3>
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleViewTask(task.id)}
                >
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-sm text-gray-500">Due: {formatDate(task.dueDate)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {task.statusName && (
                      <span className={`px-2 py-1 text-xs rounded-full bg-green-100 text-green-800`}>
                        {task.statusName}
                      </span>
                    )}
                    {task.priorityName && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priorityName === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        task.priorityName === 'URGENT' ? 'bg-red-100 text-red-800' :
                        task.priorityName === 'LOW' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.priorityName}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks created for this matter</p>
            </div>
          )}
        </Card>
      )}

      {/* Content - Events Tab with Navigation */}
      {activeTab === 'events' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            Events ({events.length})
          </h3>
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleViewEvent(event.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(event.startDateTime)} - {formatDateTime(event.endDateTime)}
                      </p>
                      {event.location && <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>}
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700">
                      {event.eventType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No events scheduled for this matter</p>
            </div>
          )}
        </Card>
      )}

      {/* Content - Bills Tab with Navigation */}
      {activeTab === 'bills' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-primary-500" />
            Bills ({bills.length})
          </h3>
          {bills.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance Due</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{bill.billNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${bill.totalAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${bill.balanceDue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(bill.dueDate)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          bill.statusName === 'Paid' ? 'bg-green-100 text-green-800' :
                          bill.statusName === 'Overdue' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bill.statusName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewBill(bill.id)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No bills generated for this matter</p>
            </div>
          )}
        </Card>
      )}

      {/* Content - Timeline Tab */}
      {activeTab === 'timeline' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary-500" />
            Activity Timeline ({timeline.length})
          </h3>
          {timeline.length > 0 ? (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {/* Open Matter Activity */}
                <div className="relative pl-10">
                  <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Matter Opened</p>
                    <p className="text-sm text-gray-500">{formatDate(selectedMatter.openDate)}</p>
                  </div>
                </div>

                {/* Timeline Activities */}
                {timeline.map((activity) => (
                  <div key={activity.id} className="relative pl-10">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.activityType}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.userName ? `by ${activity.userName} • ` : ''}{formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activity recorded yet</p>
            </div>
          )}
        </Card>
      )}

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Matter">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <p className="text-red-700">
              This action will permanently delete the matter and all associated data.
            </p>
          </div>
          <p className="text-gray-600">
            Are you sure you want to delete "<strong className="text-gray-900">{selectedMatter.title}</strong>"?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Matter
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Party Modal */}
      <Modal isOpen={showAddPartyModal} onClose={() => setShowAddPartyModal(false)} title="Add Party to Matter" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Contact</label>
            <select
              value={newParty.contactId}
              onChange={(e) => setNewParty({ ...newParty, contactId: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>Select a contact...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.fullName} {contact.companyName ? `(${contact.companyName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Party Type</label>
            <select
              value={newParty.partyType}
              onChange={(e) => setNewParty({ ...newParty, partyType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {partyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Role Description (Optional)"
            placeholder="e.g., Legal Counsel, Expert Witness, etc."
            value={newParty.roleDescription}
            onChange={(e) => setNewParty({ ...newParty, roleDescription: e.target.value })}
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newParty.isPrimary}
              onChange={(e) => setNewParty({ ...newParty, isPrimary: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm text-gray-700">Mark as primary party</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddPartyModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddParty} disabled={!newParty.contactId}>
              Add Party
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Note Modal */}
      <Modal isOpen={showAddNoteModal} onClose={() => setShowAddNoteModal(false)} title="Add Note" size="md">
        <div className="space-y-4">
          <textarea
            value={newNote.note}
            onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter your note here..."
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newNote.isPrivate}
              onChange={(e) => setNewNote({ ...newNote, isPrivate: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm text-gray-700">Private note (only visible to you)</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddNoteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={!newNote.note.trim()}>
              Add Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};