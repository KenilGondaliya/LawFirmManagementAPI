// src/pages/Contacts/CreateContact.tsx - Fix missing imports and add relative/spouse

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  Building,
  BriefcaseIcon,
  CalendarIcon,
  TagIcon,
  UsersIcon,
  XIcon,
  CheckIcon,
  Loader2,
  HeartIcon,
  UserPlusIcon
} from 'lucide-react';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { Modal } from '../../components/UI/Modal';
import toast from 'react-hot-toast';

interface AddressFormData {
  addressType?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
}

interface PhoneFormData {
  phoneType?: string;
  phoneNumber?: string;
  isPrimary?: boolean;
  isWhatsapp?: boolean;
}

interface EmailFormData {
  emailType?: string;
  email?: string;
  isPrimary?: boolean;
}

interface ContactFormData {
  prefix?: string;
  suffix?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  nickname?: string;
  companyName?: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  alternativeEmail?: string;
  alternativePhone?: string;
  fax?: string;
  website?: string;
  addresses?: AddressFormData[];
  phones?: PhoneFormData[];
  emails?: EmailFormData[];
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  anniversary?: string;
  nationality?: string;
  taxId?: string;
  identificationNumber?: string;
  identificationType?: string;
  notes?: string;
  isClient?: boolean;
  isOpponent?: boolean;
  isWitness?: boolean;
  isJudge?: boolean;
  isAdvocate?: boolean;
  isImportant?: boolean;
}

export const CreateContact: React.FC = () => {
  const navigate = useNavigate();
  const { createContact, tags, fetchTags, contactTypes, fetchContactTypes, createTag, contacts } = useContactStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Spouse and relatives states
  const [showSpouseModal, setShowSpouseModal] = useState(false);
  const [showRelativeModal, setShowRelativeModal] = useState(false);
  const [selectedSpouseId, setSelectedSpouseId] = useState<number | null>(null);
  const [relativeData, setRelativeData] = useState({ relatedContactId: 0, relationshipType: '', notes: '' });
  const [relatives, setRelatives] = useState<any[]>([]);
  
  // Create tag modal
  const [showCreateTagModal, setShowCreateTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#4F46E5');
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ContactFormData>({
    defaultValues: {
      isClient: false,
      isOpponent: false,
      isWitness: false,
      isJudge: false,
      isAdvocate: false,
      isImportant: false,
      addresses: [{ addressType: 'HOME', addressLine1: '', isPrimary: true }],
      phones: [{ phoneType: 'MOBILE', phoneNumber: '', isPrimary: true, isWhatsapp: false }],
      emails: [{ emailType: 'PERSONAL', email: '', isPrimary: true }],
    }
  });
  
  const { fields: addressFields, append: addAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'addresses'
  });
  
  const { fields: phoneFields, append: addPhone, remove: removePhone } = useFieldArray({
    control,
    name: 'phones'
  });
  
  const { fields: emailFields, append: addEmail, remove: removeEmail } = useFieldArray({
    control,
    name: 'emails'
  });
  
  useEffect(() => {
    fetchTags();
    fetchContactTypes();
  }, [fetchTags, fetchContactTypes]);
  
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }
    const tag = await createTag(newTagName, newTagColor);
    if (tag) {
      setNewTagName('');
      setShowCreateTagModal(false);
    }
  };
  
  const onSubmit = async (data: ContactFormData) => {
    if (!data.firstName || !data.lastName) {
      toast.error('First name and last name are required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const contactData = {
        ...data,
        tagIds: selectedTags,
        spouseContactId: selectedSpouseId || undefined,
        relatives: relatives.length > 0 ? relatives : undefined,
      };
      const contact = await createContact(contactData);
      if (contact) {
        setShowSuccess(true);
        toast.success('Contact created successfully!');
        setTimeout(() => {
          navigate(`/contacts/${contact.id}`);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Failed to create contact:', error);
      toast.error(error.response?.data?.message || 'Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleTag = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const addRelative = () => {
    if (relativeData.relatedContactId && relativeData.relationshipType) {
      const selectedContact = contacts.find(c => c.id === relativeData.relatedContactId);
      setRelatives([...relatives, {
        relatedContactId: relativeData.relatedContactId,
        relationshipType: relativeData.relationshipType,
        notes: relativeData.notes,
        relatedContactName: selectedContact?.fullName || `Contact #${relativeData.relatedContactId}`
      }]);
      setRelativeData({ relatedContactId: 0, relationshipType: '', notes: '' });
      setShowRelativeModal(false);
    } else {
      toast.error('Please select a contact and relationship type');
    }
  };
  
  const removeRelative = (index: number) => {
    setRelatives(relatives.filter((_, i) => i !== index));
  };
  
  const sections = [
    { id: 'basic', label: 'Basic Info', icon: UserIcon },
    { id: 'professional', label: 'Professional', icon: BriefcaseIcon },
    { id: 'contact', label: 'Contact', icon: UserIcon },
    { id: 'addresses', label: 'Addresses', icon: MapPinIcon },
    { id: 'personal', label: 'Personal', icon: CalendarIcon },
    { id: 'legal', label: 'Legal', icon: Building },
    { id: 'relationships', label: 'Relationships', icon: HeartIcon },
    { id: 'classification', label: 'Classification', icon: TagIcon },
    { id: 'notes', label: 'Notes', icon: UsersIcon },
  ];
  
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Created!</h2>
          <p className="text-gray-500">Redirecting to contact details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-6 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Form */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contacts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Contact</h1>
            <p className="text-gray-500 mt-1">Enter contact details to add to your firm</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div id="section-basic">
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
                    {...register('prefix')}
                  />
                  <Input
                    label="Suffix"
                    placeholder="Jr./Sr./III"
                    {...register('suffix')}
                  />
                </div>
                <Input
                  label="First Name *"
                  placeholder="Enter first name"
                  error={errors.firstName?.message}
                  required
                  {...register('firstName', { required: 'First name is required' })}
                />
                <Input
                  label="Middle Name"
                  placeholder="Enter middle name"
                  {...register('middleName')}
                />
                <Input
                  label="Last Name *"
                  placeholder="Enter last name"
                  error={errors.lastName?.message}
                  required
                  {...register('lastName', { required: 'Last name is required' })}
                />
                <Input
                  label="Nickname"
                  placeholder="Enter nickname"
                  {...register('nickname')}
                />
              </div>
            </Card>
          </div>
          
          {/* Professional Information */}
          <div id="section-professional">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5 text-primary-500" />
                Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  placeholder="Enter company name"
                  icon={<Building className="w-4 h-4" />}
                  {...register('companyName')}
                />
                <Input
                  label="Title"
                  placeholder="Job title"
                  icon={<BriefcaseIcon className="w-4 h-4" />}
                  {...register('title')}
                />
                <Input
                  label="Department"
                  placeholder="Department"
                  {...register('department')}
                />
              </div>
            </Card>
          </div>
          
          {/* Contact Information */}
          <div id="section-contact">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {/* <EnvelopeIcon className="w-5 h-5 text-primary-500" /> */}
                Contact Information
              </h2>
              
              {/* Primary Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Input
                  label="Primary Email"
                  type="email"
                  placeholder="primary@example.com"
                  {...register('email')}
                />
                <Input
                  label="Primary Phone"
                  placeholder="+1 234 567 8900"
                  {...register('phone')}
                />
                <Input
                  label="Alternative Email"
                  type="email"
                  placeholder="alternative@example.com"
                  {...register('alternativeEmail')}
                />
                <Input
                  label="Alternative Phone"
                  placeholder="+1 234 567 8900"
                  {...register('alternativePhone')}
                />
              </div>
              
              {/* Additional Emails */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Email Addresses</label>
                {emailFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 mb-3 items-start">
                    <select
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      {...register(`emails.${index}.emailType`)}
                    >
                      <option value="PERSONAL">Personal</option>
                      <option value="WORK">Work</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <Input
                      placeholder="Email address"
                      className="flex-1"
                      {...register(`emails.${index}.email`)}
                    />
                    <label className="flex items-center gap-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        {...register(`emails.${index}.isPrimary`)}
                      />
                      <span className="text-sm">Primary</span>
                    </label>
                    {emailFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmail(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addEmail({ emailType: 'PERSONAL', email: '', isPrimary: false })}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mt-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Email
                </button>
              </div>
              
              {/* Additional Phones */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Phone Numbers</label>
                {phoneFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 mb-3 flex-wrap items-start">
                    <select
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      {...register(`phones.${index}.phoneType`)}
                    >
                      <option value="MOBILE">Mobile</option>
                      <option value="WORK">Work</option>
                      <option value="HOME">Home</option>
                      <option value="FAX">Fax</option>
                    </select>
                    <Input
                      placeholder="Phone number"
                      className="flex-1 min-w-[200px]"
                      {...register(`phones.${index}.phoneNumber`)}
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        {...register(`phones.${index}.isPrimary`)}
                      />
                      <span className="text-sm">Primary</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        {...register(`phones.${index}.isWhatsapp`)}
                      />
                      <span className="text-sm">WhatsApp</span>
                    </label>
                    {phoneFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePhone(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addPhone({ phoneType: 'MOBILE', phoneNumber: '', isPrimary: false, isWhatsapp: false })}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 mt-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Phone
                </button>
              </div>
              
              {/* Additional Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Fax"
                  placeholder="Fax number"
                  {...register('fax')}
                />
                <Input
                  label="Website"
                  placeholder="https://example.com"
                  {...register('website')}
                />
              </div>
            </Card>
          </div>
          
          {/* Addresses */}
          <div id="section-addresses">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-primary-500" />
                Addresses
              </h2>
              {addressFields.map((field, index) => (
                <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-lg relative group">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {addressFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-3 pr-8">
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      {...register(`addresses.${index}.addressType`)}
                    >
                      <option value="HOME">Home</option>
                      <option value="WORK">Work</option>
                      <option value="BILLING">Billing</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        {...register(`addresses.${index}.isPrimary`)}
                      />
                      <span className="text-sm">Primary Address</span>
                    </label>
                  </div>
                  <div className="space-y-3">
                    <Input
                      placeholder="Address Line 1"
                      {...register(`addresses.${index}.addressLine1`)}
                    />
                    <Input
                      placeholder="Address Line 2 (Optional)"
                      {...register(`addresses.${index}.addressLine2`)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="City" {...register(`addresses.${index}.city`)} />
                      <Input placeholder="State/Province" {...register(`addresses.${index}.state`)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="Postal Code" {...register(`addresses.${index}.postalCode`)} />
                      <Input placeholder="Country" {...register(`addresses.${index}.country`)} />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addAddress({ addressType: 'HOME', addressLine1: '', isPrimary: false })}
                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Address
              </button>
            </Card>
          </div>
          
          {/* Personal Information */}
          <div id="section-personal">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary-500" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  {...register('dateOfBirth')}
                />
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('gender')}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('maritalStatus')}
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
                  {...register('anniversary')}
                />
                <Input
                  label="Nationality"
                  placeholder="Nationality"
                  {...register('nationality')}
                />
              </div>
            </Card>
          </div>
          
          {/* Legal Information */}
          <div id="section-legal">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-primary-500" />
                Legal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tax ID / VAT"
                  placeholder="Tax identification number"
                  {...register('taxId')}
                />
                <Input
                  label="Identification Number"
                  placeholder="ID number (Passport, Driver's License, etc.)"
                  {...register('identificationNumber')}
                />
                <Input
                  label="Identification Type"
                  placeholder="e.g., Passport, Driver's License, National ID"
                  {...register('identificationType')}
                />
              </div>
            </Card>
          </div>
          
          {/* Relationships Section */}
          <div id="section-relationships">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-primary-500" />
                Relationships
              </h2>
              
              {/* Spouse */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Spouse</label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={selectedSpouseId || ''}
                    onChange={(e) => setSelectedSpouseId(parseInt(e.target.value) || null)}
                  >
                    <option value="">Select spouse</option>
                    {contacts.filter(c => c.id !== 0).map(contact => (
                      <option key={contact.id} value={contact.id}>{contact.fullName}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/contacts/create')}
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </div>
              </div>
              
              {/* Relatives */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Relatives</label>
                  <button
                    type="button"
                    onClick={() => setShowRelativeModal(true)}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Relative
                  </button>
                </div>
                {relatives.length > 0 ? (
                  <div className="space-y-2">
                    {relatives.map((relative, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{relative.relatedContactName}</p>
                          <p className="text-xs text-gray-500 capitalize">{relative.relationshipType}</p>
                          {relative.notes && <p className="text-xs text-gray-400">{relative.notes}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRelative(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-2">No relatives added</p>
                )}
              </div>
            </Card>
          </div>
          
          {/* Contact Classification */}
          <div id="section-classification">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-primary-500" />
                Contact Classification
              </h2>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    {...register('isClient')}
                  />
                  <span className="text-sm">Client</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    {...register('isOpponent')}
                  />
                  <span className="text-sm text-red-600">Opponent</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    {...register('isWitness')}
                  />
                  <span className="text-sm text-purple-600">Witness</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    {...register('isJudge')}
                  />
                  <span className="text-sm text-green-600">Judge</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    {...register('isAdvocate')}
                  />
                  <span className="text-sm text-indigo-600">Advocate</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    {...register('isImportant')}
                  />
                  <span className="text-sm text-yellow-600">⭐ Important</span>
                </label>
              </div>
            </Card>
          </div>
          
          {/* Tags Section with Create Tag Button */}
          <div id="section-tags">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-primary-500" />
                  Tags
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateTagModal(true)}
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                >
                  <PlusIcon className="w-4 h-4" />
                  Create New Tag
                </button>
              </div>
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag.id)
                          ? 'text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{
                        backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                      }}
                    >
                      {selectedTags.includes(tag.id) && <CheckIcon className="w-3 h-3 inline mr-1" />}
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No tags available. Create your first tag!</p>
              )}
            </Card>
          </div>
          
          {/* Notes */}
          <div id="section-notes">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5 text-primary-500" />
                Notes
              </h2>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                rows={5}
                placeholder="Add any additional notes about this contact..."
                {...register('notes')}
              />
            </Card>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-gray-50 py-4 -mb-6 px-6 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/contacts')}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Contact'
              )}
            </Button>
          </div>
        </form>
      </div>
      
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
      
      {/* Add Relative Modal */}
      <Modal
        isOpen={showRelativeModal}
        onClose={() => setShowRelativeModal(false)}
        title="Add Relative"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Contact</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={relativeData.relatedContactId}
              onChange={(e) => setRelativeData({ ...relativeData, relatedContactId: parseInt(e.target.value) })}
            >
              <option value={0}>Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>{contact.fullName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Relationship Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={relativeData.relationshipType}
              onChange={(e) => setRelativeData({ ...relativeData, relationshipType: e.target.value })}
            >
              <option value="">Select relationship</option>
              <option value="PARENT">Parent</option>
              <option value="CHILD">Child</option>
              <option value="SIBLING">Sibling</option>
              <option value="COUSIN">Cousin</option>
              <option value="AUNT">Aunt</option>
              <option value="UNCLE">Uncle</option>
              <option value="GRANDPARENT">Grandparent</option>
              <option value="GRANDCHILD">Grandchild</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <Input
            label="Notes (Optional)"
            placeholder="Additional notes about this relationship"
            value={relativeData.notes}
            onChange={(e) => setRelativeData({ ...relativeData, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRelativeModal(false)}>
              Cancel
            </Button>
            <Button onClick={addRelative}>
              Add Relative
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};