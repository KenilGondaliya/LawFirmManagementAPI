// src/pages/Contacts/ContactDetail.tsx - COMPLETE FIXED VERSION

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  Mail,
  PhoneIcon,
  MapPinIcon,
  Building,
  BriefcaseIcon,
  TagIcon,
  UserPlusIcon,
  FileText,
  CheckCircleIcon,
  MailIcon,
  PhoneCallIcon,
  HomeIcon,
  StarIcon,
  ScaleIcon,
  GavelIcon,
  UsersIcon,
  PlusIcon,
  XIcon,
  CalendarIcon,
  GlobeIcon,
  AwardIcon,
  CreditCardIcon,
  LinkIcon,
  Loader2,
  AlertCircleIcon,
  ClockIcon,
  FolderIcon,
  CalendarDaysIcon,
  DollarSignIcon,
  ExternalLinkIcon,
} from 'lucide-react';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/UI/Modal';
import toast from 'react-hot-toast';
import { contactService } from '../../services/contact.service';
import { matterService } from '../../services/matter.service';
import { taskService } from '../../services/task.service';
import { documentService } from '../../services/document.service';

// Interfaces for related data
interface MatterBrief {
  id: number;
  matterNumber: string;
  title: string;
  status: string;
  partyType: string;
  isPrimary: boolean;
}

interface TaskBrief {
  id: number;
  title: string;
  dueDate: string | null;
  status: string;
  priority: string;
}

interface DocumentBrief {
  id: number;
  title: string;
  fileName: string;
  uploadedAt: string;
}

export const ContactDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedContact, 
    isLoading, 
    tags,
    fetchContactById, 
    deleteContact, 
    clearSelectedContact,
    addTagToContact,
    removeTagFromContact,
    fetchTags,
    deleteEmail,
    deletePhone,
    deleteAddress,
    createTag
  } = useContactStore();
  
  // State for related data
  const [matters, setMatters] = useState<MatterBrief[]>([]);
  const [tasks, setTasks] = useState<TaskBrief[]>([]);
  const [documents, setDocuments] = useState<DocumentBrief[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'matters' | 'tasks' | 'documents'>('details');
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: number; name: string } | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  
  // Create tag modal states
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4F46E5');
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    if (id) {
      const contactId = parseInt(id);
      fetchContactById(contactId);
      fetchTags();
      fetchRelatedData(contactId);
    }
    return () => {
      clearSelectedContact();
    };
  }, [id, fetchContactById, fetchTags, clearSelectedContact]);

  const fetchRelatedData = async (contactId: number) => {
    setIsLoadingRelated(true);
    try {
      // Fetch matters for this contact
      const mattersData = await contactService.getContactMatters(contactId);
      setMatters(mattersData);
      
      // Fetch tasks for this contact
      const tasksData = await contactService.getContactTasks(contactId);
      setTasks(tasksData);
      
      // Fetch documents for this contact
      const documentsData = await contactService.getContactDocuments(contactId);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const handleDelete = async () => {
    if (id) {
      const success = await deleteContact(parseInt(id));
      if (success) {
        navigate('/contacts');
      }
      setShowDeleteModal(false);
    }
  };

  const handleAddTag = async () => {
    if (selectedTagId && selectedContact) {
      setAddingTag(true);
      try {
        await addTagToContact(selectedContact.id, selectedTagId);
        await fetchContactById(selectedContact.id);
        setShowTagModal(false);
        setSelectedTagId(null);
        toast.success('Tag added successfully');
      } catch (error: any) {
        console.error('Failed to add tag:', error);
        toast.error(error?.response?.data?.message || 'Failed to add tag');
      } finally {
        setAddingTag(false);
      }
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (selectedContact) {
      try {
        await removeTagFromContact(selectedContact.id, tagId);
        await fetchContactById(selectedContact.id);
        toast.success('Tag removed successfully');
      } catch (error: any) {
        console.error('Failed to remove tag:', error);
        toast.error(error?.response?.data?.message || 'Failed to remove tag');
      }
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }
    
    setCreatingTag(true);
    try {
      const newTag = await createTag(newTagName, newTagColor);
      if (newTag) {
        setNewTagName('');
        setNewTagColor('#4F46E5');
        setShowCreateTagModal(false);
        await fetchTags();
        toast.success('Tag created successfully');
      }
    } catch (error: any) {
      console.error('Failed to create tag:', error);
      toast.error(error?.response?.data?.message || 'Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleDeleteEmail = async (emailId: number, emailAddress: string) => {
    setItemToDelete({ type: 'email', id: emailId, name: emailAddress });
    setShowDeleteItemModal(true);
  };

  const handleDeletePhone = async (phoneId: number, phoneNumber: string) => {
    setItemToDelete({ type: 'phone', id: phoneId, name: phoneNumber });
    setShowDeleteItemModal(true);
  };

  const handleDeleteAddress = async (addressId: number, addressLine: string) => {
    setItemToDelete({ type: 'address', id: addressId, name: addressLine });
    setShowDeleteItemModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    
    setDeletingItem(true);
    let success = false;
    
    try {
      if (itemToDelete.type === 'email') {
        success = await deleteEmail(itemToDelete.id);
      } else if (itemToDelete.type === 'phone') {
        success = await deletePhone(itemToDelete.id);
      } else if (itemToDelete.type === 'address') {
        success = await deleteAddress(itemToDelete.id);
      }
      
      if (success && selectedContact) {
        await fetchContactById(selectedContact.id);
        toast.success(`${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} deleted successfully`);
      }
    } catch (error) {
      toast.error(`Failed to delete ${itemToDelete.type}`);
    } finally {
      setDeletingItem(false);
      setShowDeleteItemModal(false);
      setItemToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'LOW': return 'bg-blue-100 text-blue-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedContact) {
    return (
      <div className="text-center py-12">
        <AlertCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Contact not found</p>
        <Button onClick={() => navigate('/contacts')} className="mt-4">
          Back to Contacts
        </Button>
      </div>
    );
  }

  const getInitials = () => {
    return `${selectedContact.firstName?.charAt(0) || ''}${selectedContact.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleBadges = () => {
    const roles = [];
    if (selectedContact.isClient) roles.push({ label: 'Client', color: 'bg-blue-100 text-blue-700', icon: BriefcaseIcon });
    if (selectedContact.isOpponent) roles.push({ label: 'Opponent', color: 'bg-red-100 text-red-700', icon: ScaleIcon });
    if (selectedContact.isJudge) roles.push({ label: 'Judge', color: 'bg-green-100 text-green-700', icon: GavelIcon });
    if (selectedContact.isAdvocate) roles.push({ label: 'Advocate', color: 'bg-purple-100 text-purple-700', icon: UsersIcon });
    if (selectedContact.isWitness) roles.push({ label: 'Witness', color: 'bg-yellow-100 text-yellow-700', icon: UsersIcon });
    return roles;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  // Get available tags (tags not already added to contact)
  const availableTags = tags.filter(tag => !selectedContact.tags?.some(t => t.id === tag.id));

  // Render Matters Tab Content
  const renderMattersTab = () => (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BriefcaseIcon className="w-5 h-5 text-primary-500" />
        Matters ({matters.length})
      </h3>
      {isLoadingRelated ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : matters.length > 0 ? (
        <div className="space-y-3">
          {matters.map((matter) => (
            <div
              key={matter.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => navigate(`/matters/${matter.id}`)}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-500">{matter.matterNumber}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(matter.status)}`}>
                      {matter.status}
                    </span>
                    {matter.isPrimary && (
                      <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900">{matter.title}</p>
                  <p className="text-sm text-gray-500 mt-1">Role: {matter.partyType}</p>
                </div>
                <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No matters associated with this contact</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/matters/create')}>
            Create Matter
          </Button>
        </div>
      )}
    </Card>
  );

  // Render Tasks Tab Content
  const renderTasksTab = () => (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircleIcon className="w-5 h-5 text-primary-500" />
        Tasks ({tasks.length})
      </h3>
      {isLoadingRelated ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status || 'Pending'}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.dueDate && (
                    <div className="flex items-center gap-1 mt-1">
                      <ClockIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>
                <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tasks assigned to this contact</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/tasks/create')}>
            Create Task
          </Button>
        </div>
      )}
    </Card>
  );

  // Render Documents Tab Content
  const renderDocumentsTab = () => (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary-500" />
        Documents ({documents.length})
      </h3>
      {isLoadingRelated ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{doc.title}</p>
                  <p className="text-sm text-gray-500">{doc.fileName}</p>
                  <p className="text-xs text-gray-400 mt-1">Uploaded: {formatDate(doc.uploadedAt)}</p>
                </div>
                <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No documents for this contact</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/documents/upload')}>
            Upload Document
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header - same as before */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contacts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                {selectedContact.profileImageUrl ? (
                  <img
                    src={selectedContact.profileImageUrl}
                    alt={selectedContact.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary-700 font-bold text-3xl">
                    {getInitials()}
                  </span>
                )}
              </div>
              {selectedContact.isImportant && (
                <div className="absolute -top-1 -right-1">
                  <StarIcon className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{selectedContact.fullName}</h1>
                <div className="flex gap-2">
                  {getRoleBadges().map((role, idx) => (
                    <span key={idx} className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${role.color}`}>
                      <role.icon className="w-3 h-3" />
                      {role.label}
                    </span>
                  ))}
                </div>
              </div>
              {selectedContact.title && (
                <p className="text-gray-500 mt-1">{selectedContact.title}</p>
              )}
              {selectedContact.companyName && (
                <p className="text-sm text-gray-400 mt-1">{selectedContact.companyName}</p>
              )}
              {selectedContact.nickname && (
                <p className="text-xs text-gray-400 mt-1">Also known as: {selectedContact.nickname}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/contacts/${id}/edit`)}
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8 overflow-x-auto pb-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'details'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('matters')}
            className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'matters'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Matters ({matters.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-1 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === 'documents'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Documents ({documents.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column - same as before */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MailIcon className="w-5 h-5 text-primary-500" />
                Contact Information
              </h3>
              <div className="space-y-3">
                {selectedContact.email && (
                  <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${selectedContact.email}`} className="text-gray-900 hover:text-primary-600">
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${selectedContact.phone}`} className="text-gray-900 hover:text-primary-600">
                        {selectedContact.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Email Addresses */}
            {selectedContact.emails && selectedContact.emails.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MailIcon className="w-5 h-5 text-primary-500" />
                    Email Addresses
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedContact.emails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <MailIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 capitalize">{email.emailType}</p>
                          <a href={`mailto:${email.email}`} className="text-gray-900 text-sm hover:text-primary-600">
                            {email.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {email.isPrimary && (
                          <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">Primary</span>
                        )}
                        <button
                          onClick={() => handleDeleteEmail(email.id, email.email)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Phone Numbers */}
            {selectedContact.phones && selectedContact.phones.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <PhoneCallIcon className="w-5 h-5 text-primary-500" />
                    Phone Numbers
                  </h3>
                </div>
                <div className="space-y-2">
                  {selectedContact.phones.map((phone) => (
                    <div key={phone.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <PhoneCallIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 capitalize">{phone.phoneType}</p>
                          <a href={`tel:${phone.phoneNumber}`} className="text-gray-900 text-sm hover:text-primary-600">
                            {phone.phoneNumber}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {phone.isPrimary && (
                          <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">Primary</span>
                        )}
                        {phone.isWhatsapp && (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">WhatsApp</span>
                        )}
                        <button
                          onClick={() => handleDeletePhone(phone.id, phone.phoneNumber)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Addresses */}
            {selectedContact.addresses && selectedContact.addresses.length > 0 && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-primary-500" />
                    Addresses
                  </h3>
                </div>
                <div className="space-y-3">
                  {selectedContact.addresses.map((address) => (
                    <div key={address.id} className="p-3 bg-gray-50 rounded-lg group relative">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteAddress(address.id, address.addressLine1)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <HomeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 capitalize">{address.addressType}</span>
                        {address.isPrimary && (
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">Primary</span>
                        )}
                      </div>
                      <p className="text-gray-900 text-sm ml-6 pr-8">
                        {address.addressLine1}
                        {address.addressLine2 && <>, {address.addressLine2}</>}
                        <br />
                        {address.city && <>{address.city}, </>}
                        {address.state && <>{address.state} </>}
                        {address.postalCode && <>{address.postalCode}</>}
                        {address.country && <><br />{address.country}</>}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Notes */}
            {selectedContact.notes && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.notes}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar Column - same as before */}
          <div className="space-y-6">
            {/* Tags Section */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-primary-500" />
                  Tags
                  <span className="text-xs text-gray-400 font-normal">
                    ({selectedContact.tags?.length || 0})
                  </span>
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowCreateTagModal(true)}
                    className="p-1 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Create new tag"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTagId(null);
                      setShowTagModal(true);
                    }}
                    className="p-1 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Add existing tag"
                  >
                    <TagIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {selectedContact.tags && selectedContact.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedContact.tags.map((tag: any) => (
                    <div
                      key={tag.id}
                      className="group relative inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                        color: tag.color || '#374151',
                      }}
                    >
                      <span>{tag.name}</span>
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No tags added</p>
              )}
              
              {availableTags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-2">Available tags to add:</p>
                  <div className="flex flex-wrap gap-1">
                    {availableTags.slice(0, 5).map(tag => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 text-xs rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                          color: tag.color || '#374151',
                        }}
                        onClick={() => {
                          setSelectedTagId(tag.id);
                          handleAddTag();
                        }}
                      >
                        + {tag.name}
                      </span>
                    ))}
                    {availableTags.length > 5 && (
                      <span className="px-2 py-0.5 text-xs text-gray-400">
                        +{availableTags.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Personal Information */}
            {(selectedContact.dateOfBirth || selectedContact.gender || selectedContact.maritalStatus || selectedContact.nationality || selectedContact.anniversary) && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary-500" />
                  Personal Information
                </h3>
                <div className="space-y-3">
                  {selectedContact.dateOfBirth && (
                    <div className="flex items-center gap-3">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="text-gray-900">{formatDate(selectedContact.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.gender && (
                    <div className="flex items-center gap-3">
                      <UsersIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="text-gray-900 capitalize">{selectedContact.gender}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.maritalStatus && (
                    <div className="flex items-center gap-3">
                      <AwardIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Marital Status</p>
                        <p className="text-gray-900 capitalize">{selectedContact.maritalStatus}</p>
                      </div>
                    </div>
                  )}
                  {selectedContact.nationality && (
                    <div className="flex items-center gap-3">
                      <GlobeIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Nationality</p>
                        <p className="text-gray-900">{selectedContact.nationality}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Legal Information */}
            {(selectedContact.taxId || selectedContact.identificationNumber) && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-primary-500" />
                  Legal Information
                </h3>
                <div className="space-y-3">
                  {selectedContact.taxId && (
                    <div>
                      <p className="text-sm text-gray-500">Tax ID / VAT</p>
                      <p className="text-gray-900">{selectedContact.taxId}</p>
                    </div>
                  )}
                  {selectedContact.identificationNumber && (
                    <div>
                      <p className="text-sm text-gray-500">Identification Number</p>
                      <p className="text-gray-900">{selectedContact.identificationNumber}</p>
                      {selectedContact.identificationType && (
                        <p className="text-xs text-gray-400">Type: {selectedContact.identificationType}</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Matters Tab */}
      {activeTab === 'matters' && renderMattersTab()}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && renderTasksTab()}

      {/* Documents Tab */}
      {activeTab === 'documents' && renderDocumentsTab()}

      {/* Modals - same as before */}
      <Modal
        isOpen={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setSelectedTagId(null);
        }}
        title="Add Existing Tag"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select a tag to add ({availableTags.length} available)
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {availableTags.length > 0 ? (
                availableTags.map(tag => (
                  <label
                    key={tag.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                      selectedTagId === tag.id ? 'bg-primary-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tagSelect"
                      value={tag.id}
                      checked={selectedTagId === tag.id}
                      onChange={() => setSelectedTagId(tag.id)}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color || '#4F46E5' }}
                    />
                    <span className="flex-1 text-sm text-gray-900">{tag.name}</span>
                  </label>
                ))
              ) : (
                <div className="p-6 text-center">
                  <TagIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No tags available</p>
                  <p className="text-xs text-gray-400 mt-1">Click the + button to create a new tag</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowTagModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddTag} 
              disabled={!selectedTagId || addingTag}
            >
              {addingTag ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Selected Tag'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCreateTagModal}
        onClose={() => {
          setShowCreateTagModal(false);
          setNewTagName('');
          setNewTagColor('#4F46E5');
        }}
        title="Create New Tag"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Enter tag name (e.g., VIP, Corporate, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-sm text-gray-500">Choose a color for the tag</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreateTagModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={creatingTag || !newTagName.trim()}>
              {creatingTag ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Tag'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteItemModal}
        onClose={() => setShowDeleteItemModal(false)}
        title={`Delete ${itemToDelete?.type}`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this {itemToDelete?.type}:{' '}
            <strong className="text-gray-900">{itemToDelete?.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteItemModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDeleteItem}
              disabled={deletingItem}
            >
              {deletingItem ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Contact"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong className="text-gray-900">{selectedContact.fullName}</strong>? 
            This action cannot be undone and will remove all associated data.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Contact
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};