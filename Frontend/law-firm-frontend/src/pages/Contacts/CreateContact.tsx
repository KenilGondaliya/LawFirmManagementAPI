// src/pages/Contacts/CreateContact.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  ArrowLeftIcon, 
  PlusIcon, 
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarIcon,
  TagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import toast from 'react-hot-toast';

interface ContactFormData {
  // Basic Info
  prefix?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  nickname?: string;
  
  // Professional
  companyName?: string;
  title?: string;
  department?: string;
  
  // Contact
  email?: string;
  alternativeEmail?: string;
  phone?: string;
  alternativePhone?: string;
  fax?: string;
  website?: string;
  
  // Personal
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  anniversary?: string;
  nationality?: string;
  
  // Legal
  taxId?: string;
  identificationNumber?: string;
  identificationType?: string;
  
  // Flags
  isClient: boolean;
  isOpponent: boolean;
  isWitness: boolean;
  isJudge: boolean;
  isAdvocate: boolean;
  isImportant: boolean;
  
  // Addresses
  addresses: {
    addressType: string;
    addressLine1: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isPrimary: boolean;
  }[];
  
  // Phones
  phones: {
    phoneType: string;
    phoneNumber: string;
    countryCode?: string;
    extension?: string;
    isPrimary: boolean;
    isWhatsapp: boolean;
  }[];
  
  // Emails
  emails: {
    emailType: string;
    email: string;
    isPrimary: boolean;
  }[];
  
  // Notes
  notes?: string;
  
  // Tags
  tagIds?: number[];
}

export const CreateContact: React.FC = () => {
  const navigate = useNavigate();
  const { createContact, tags, fetchTags } = useContactStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  
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
  }, []);
  
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const contactData = {
        ...data,
        tagIds: selectedTags,
      };
      const contact = await createContact(contactData);
      if (contact) {
        navigate(`/contacts/${contact.id}`);
      }
    } catch (error) {
      console.error('Failed to create contact:', error);
      toast.error('Failed to create contact');
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
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/contacts')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Person</h1>
          <p className="text-gray-500 mt-1">Enter contact details to add to your firm</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
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
              {...register('lastName', { required: 'Last name is required' })}
            />
            <Input
              label="Nickname"
              placeholder="Enter nickname"
              {...register('nickname')}
            />
          </div>
        </Card>
        
        {/* Professional Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="Enter company name"
              icon={<BuildingOfficeIcon className="w-4 h-4" />}
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
        
        {/* Contact Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          
          {/* Email Addresses */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Addresses</label>
            {emailFields.map((field, index) => (
              <div key={field.id} className="flex gap-3 mb-3">
                <select
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
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
                    className="w-4 h-4 rounded border-gray-300"
                    {...register(`emails.${index}.isPrimary`)}
                  />
                  <span className="text-sm">Primary</span>
                </label>
                {emailFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAddress(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addEmail({ emailType: 'PERSONAL', email: '', isPrimary: false })}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              Add Email
            </button>
          </div>
          
          {/* Phone Numbers */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Numbers</label>
            {phoneFields.map((field, index) => (
              <div key={field.id} className="flex gap-3 mb-3 flex-wrap">
                <select
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
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
                    className="w-4 h-4 rounded border-gray-300"
                    {...register(`phones.${index}.isPrimary`)}
                  />
                  <span className="text-sm">Primary</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                    {...register(`phones.${index}.isWhatsapp`)}
                  />
                  <span className="text-sm">WhatsApp</span>
                </label>
                {phoneFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhone(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addPhone({ phoneType: 'MOBILE', phoneNumber: '', isPrimary: false, isWhatsapp: false })}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              Add Phone
            </button>
          </div>
          
          {/* Additional Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fax"
              placeholder="Fax number"
              {...register('fax')}
            />
            <Input
              label="Website"
              placeholder="https://..."
              {...register('website')}
            />
          </div>
        </Card>
        
        {/* Addresses */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Addresses</h2>
          {addressFields.map((field, index) => (
            <div key={field.id} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  {...register(`addresses.${index}.addressType`)}
                >
                  <option value="HOME">Home</option>
                  <option value="WORK">Work</option>
                  <option value="BILLING">Billing</option>
                  <option value="OTHER">Other</option>
                </select>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                      {...register(`addresses.${index}.isPrimary`)}
                    />
                    <span className="text-sm">Primary</span>
                  </label>
                  {addressFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAddress(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
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
                  <Input placeholder="State" {...register(`addresses.${index}.state`)} />
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
        
        {/* Personal Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              {...register('dateOfBirth')}
            />
            <select
              className="input-primary"
              {...register('gender')}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select
              className="input-primary"
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
        
        {/* Legal Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tax ID / VAT"
              placeholder="Tax identification number"
              {...register('taxId')}
            />
            <Input
              label="Identification Number"
              placeholder="ID number"
              {...register('identificationNumber')}
            />
            <Input
              label="Identification Type"
              placeholder="Passport, Driver's License, etc."
              {...register('identificationType')}
            />
          </div>
        </Card>
        
        {/* Contact Type Tags */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Classification</h2>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
                {...register('isClient')}
              />
              <span>Client</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
                {...register('isOpponent')}
              />
              <span>Opponent</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
                {...register('isWitness')}
              />
              <span>Witness</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
                {...register('isJudge')}
              />
              <span>Judge</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
                {...register('isAdvocate')}
              />
              <span>Advocate</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-yellow-500"
                {...register('isImportant')}
              />
              <span className="text-yellow-600">Important</span>
            </label>
          </div>
        </Card>
        
        {/* Tags */}
        {tags.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </Card>
        )}
        
        {/* Notes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={4}
            placeholder="Add any additional notes about this contact..."
            {...register('notes')}
          />
        </Card>
        
        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/contacts')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Contact
          </Button>
        </div>
      </form>
    </div>
  );
};