// src/pages/Contacts/EditContact.tsx - Complete Fixed Version

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  Loader2, 
  UserIcon, 
  BriefcaseIcon, 
  PhoneIcon,
  Building,
  CalendarIcon,
  TagIcon,
  HeartIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
  CheckIcon
} from 'lucide-react';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

interface EditFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  title: string;
  department: string;
  notes: string;
  
  // Flags
  isClient: boolean;
  isOpponent: boolean;
  isImportant: boolean;
  
  // Additional fields
  prefix?: string;
  middleName?: string;
  suffix?: string;
  nickname?: string;
  alternativeEmail?: string;
  alternativePhone?: string;
  fax?: string;
  website?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  anniversary?: string;
  nationality?: string;
  taxId?: string;
  identificationNumber?: string;
  identificationType?: string;
  isWitness?: boolean;
  isJudge?: boolean;
  isAdvocate?: boolean;
}

export const EditContact: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedContact, 
    isLoading, 
    fetchContactById, 
    updateContact,
    tags,
    fetchTags,
    addTagToContact,
    removeTagFromContact
  } = useContactStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4F46E5');
  const [formData, setFormData] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    title: '',
    department: '',
    notes: '',
    isClient: false,
    isOpponent: false,
    isImportant: false,
    prefix: '',
    middleName: '',
    suffix: '',
    nickname: '',
    alternativeEmail: '',
    alternativePhone: '',
    fax: '',
    website: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    anniversary: '',
    nationality: '',
    taxId: '',
    identificationNumber: '',
    identificationType: '',
    isWitness: false,
    isJudge: false,
    isAdvocate: false,
  });

  // Load contact data when component mounts or id changes
  useEffect(() => {
    if (id) {
      fetchContactById(parseInt(id));
      fetchTags();
    }
  }, [id, fetchContactById, fetchTags]);

  // Update form data when selectedContact is loaded
  useEffect(() => {
    if (selectedContact) {
      setFormData({
        firstName: selectedContact.firstName || '',
        lastName: selectedContact.lastName || '',
        email: selectedContact.email || '',
        phone: selectedContact.phone || '',
        companyName: selectedContact.companyName || '',
        title: selectedContact.title || '',
        department: selectedContact.department || '',
        notes: selectedContact.notes || '',
        isClient: selectedContact.isClient || false,
        isOpponent: selectedContact.isOpponent || false,
        isImportant: selectedContact.isImportant || false,
        prefix: selectedContact.prefix || '',
        middleName: selectedContact.middleName || '',
        suffix: selectedContact.suffix || '',
        nickname: selectedContact.nickname || '',
        alternativeEmail: selectedContact.alternativeEmail || '',
        alternativePhone: selectedContact.alternativePhone || '',
        fax: selectedContact.fax || '',
        website: selectedContact.website || '',
        dateOfBirth: selectedContact.dateOfBirth ? selectedContact.dateOfBirth.split('T')[0] : '',
        gender: selectedContact.gender || '',
        maritalStatus: selectedContact.maritalStatus || '',
        anniversary: selectedContact.anniversary ? selectedContact.anniversary.split('T')[0] : '',
        nationality: selectedContact.nationality || '',
        taxId: selectedContact.taxId || '',
        identificationNumber: selectedContact.identificationNumber || '',
        identificationType: selectedContact.identificationType || '',
        isWitness: selectedContact.isWitness || false,
        isJudge: selectedContact.isJudge || false,
        isAdvocate: selectedContact.isAdvocate || false,
      });
      
      // Set selected tags from contact
      if (selectedContact.tags) {
        setSelectedTags(selectedContact.tags.map(tag => tag.id));
      }
    }
  }, [selectedContact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        companyName: formData.companyName,
        title: formData.title,
        department: formData.department,
        isClient: formData.isClient,
        isOpponent: formData.isOpponent,
        isImportant: formData.isImportant,
        notes: formData.notes,
        dateOfBirth: formData.dateOfBirth,
        maritalStatus: formData.maritalStatus,
      };
      await updateContact(parseInt(id!), updateData);
      navigate(`/contacts/${id}`);
    } catch (error) {
      console.error('Failed to update contact:', error);
      toast.error('Failed to update contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = async () => {
    if (selectedTags.length > 0 && selectedContact) {
      // Add each selected tag that's not already attached
      for (const tagId of selectedTags) {
        if (!selectedContact.tags?.some(t => t.id === tagId)) {
          await addTagToContact(selectedContact.id, tagId);
        }
      }
      setShowTagModal(false);
      // Refresh contact to show new tags
      await fetchContactById(selectedContact.id);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (selectedContact) {
      await removeTagFromContact(selectedContact.id, tagId);
      setSelectedTags(prev => prev.filter(id => id !== tagId));
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }
    // Import createTag from store - you'll need to add this to your store
    // For now, we'll show a toast
    toast.success('Tag creation will be available soon');
    setShowCreateTagModal(false);
    setNewTagName('');
  };

  const toggleTagSelection = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
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
        <p className="text-gray-500">Contact not found</p>
        <Button onClick={() => navigate('/contacts')} className="mt-4">
          Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/contacts/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Contact</h1>
          <p className="text-gray-500 mt-1">Update contact information for {selectedContact.fullName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-primary-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <Input
                label="Prefix"
                placeholder="Mr./Mrs./Dr."
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
              />
              <Input
                label="Suffix"
                placeholder="Jr./Sr./III"
                value={formData.suffix}
                onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
              />
            </div>
            <Input
              label="First Name *"
              placeholder="Enter first name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Middle Name"
              placeholder="Enter middle name"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
            />
            <Input
              label="Last Name *"
              placeholder="Enter last name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
            <Input
              label="Nickname"
              placeholder="Enter nickname"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            />
          </div>
        </Card>

        {/* Professional Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BriefcaseIcon className="w-5 h-5 text-primary-500" />
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              icon={<Building className="w-4 h-4" />}
            />
            <Input
              label="Title"
              placeholder="Job title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              icon={<BriefcaseIcon className="w-4 h-4" />}
            />
            <Input
              label="Department"
              placeholder="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
        </Card>

        {/* Contact Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {/* <EnvelopeIcon className="w-5 h-5 text-primary-500" /> */}
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Primary Email"
              type="email"
              placeholder="primary@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Primary Phone"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Alternative Email"
              type="email"
              placeholder="alternative@example.com"
              value={formData.alternativeEmail}
              onChange={(e) => setFormData({ ...formData, alternativeEmail: e.target.value })}
            />
            <Input
              label="Alternative Phone"
              placeholder="+1 234 567 8900"
              value={formData.alternativePhone}
              onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
            />
            <Input
              label="Fax"
              placeholder="Fax number"
              value={formData.fax}
              onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
            />
            <Input
              label="Website"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>
        </Card>

        {/* Personal Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-500" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
            >
              <option value="">Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
            <Input
              label="Anniversary"
              type="date"
              value={formData.anniversary}
              onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
            />
            <Input
              label="Nationality"
              placeholder="Nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            />
          </div>
        </Card>

        {/* Legal Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-primary-500" />
            Legal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tax ID / VAT"
              placeholder="Tax identification number"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
            />
            <Input
              label="Identification Number"
              placeholder="ID number"
              value={formData.identificationNumber}
              onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
            />
            <Input
              label="Identification Type"
              placeholder="Passport, Driver's License, etc."
              value={formData.identificationType}
              onChange={(e) => setFormData({ ...formData, identificationType: e.target.value })}
            />
          </div>
        </Card>

        {/* Classification */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-primary-500" />
              Classification
            </h2>
            <button
              type="button"
              onClick={() => setShowTagModal(true)}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              Manage Tags
            </button>
          </div>
          
          {/* Current Tags */}
          {selectedContact.tags && selectedContact.tags.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Tags</label>
              <div className="flex flex-wrap gap-2">
                {selectedContact.tags.map((tag) => (
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
                      type="button"
                      onClick={() => handleRemoveTag(tag.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Classification Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isClient}
                onChange={(e) => setFormData({ ...formData, isClient: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
              />
              <span className="text-sm">Client</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOpponent}
                onChange={(e) => setFormData({ ...formData, isOpponent: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-red-600"
              />
              <span className="text-sm text-red-600">Opponent</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isWitness}
                onChange={(e) => setFormData({ ...formData, isWitness: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-purple-600"
              />
              <span className="text-sm text-purple-600">Witness</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isJudge}
                onChange={(e) => setFormData({ ...formData, isJudge: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-green-600"
              />
              <span className="text-sm text-green-600">Judge</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAdvocate}
                onChange={(e) => setFormData({ ...formData, isAdvocate: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600"
              />
              <span className="text-sm text-indigo-600">Advocate</span>
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isImportant}
                onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-yellow-600"
              />
              <span className="text-sm text-yellow-600">⭐ Important</span>
            </label>
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add notes about this contact..."
          />
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/contacts/${id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>

      {/* Manage Tags Modal */}
      <Modal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        title="Manage Tags"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Available Tags</h3>
            <button
              type="button"
              onClick={() => {
                setShowTagModal(false);
                setShowCreateTagModal(true);
              }}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              Create New Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagSelection(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag.id) || selectedContact.tags?.some(t => t.id === tag.id)
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: (selectedTags.includes(tag.id) || selectedContact.tags?.some(t => t.id === tag.id)) 
                      ? tag.color 
                      : undefined,
                  }}
                >
                  {(selectedTags.includes(tag.id) || selectedContact.tags?.some(t => t.id === tag.id)) && (
                    <CheckIcon className="w-3 h-3 inline mr-1" />
                  )}
                  {tag.name}
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No tags available. Create your first tag!</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowTagModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag}>
              Apply Tags
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Tag Modal */}
      <Modal
        isOpen={showCreateTagModal}
        onClose={() => setShowCreateTagModal(false)}
        title="Create New Tag"
      >
        <div className="space-y-4">
          <Input
            label="Tag Name"
            placeholder="Enter tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag Color</label>
            <input
              type="color"
              value={newTagColor}
              onChange={(e) => setNewTagColor(e.target.value)}
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreateTagModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTag}>
              Create Tag
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};