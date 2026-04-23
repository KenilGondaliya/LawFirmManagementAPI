import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2, User, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import useContactStore from '../../stores/contactStore';
import LoadingSpinner from '../common/LoadingSpinner';

const ContactForm = ({ contact, onSuccess }) => {
  const { createContact, updateContact, isLoading } = useContactStore();
  const [activeTab, setActiveTab] = useState('basic');
  
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: contact || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      title: '',
      isClient: false,
      isOpponent: false,
      isWitness: false,
      isJudge: false,
      isAdvocate: false,
      isImportant: false,
      notes: '',
      addresses: [],
      phones: [],
      emails: [],
    }
  });

  const { fields: addressFields, append: appendAddress, remove: removeAddress } = useFieldArray({
    control,
    name: 'addresses'
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control,
    name: 'phones'
  });

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control,
    name: 'emails'
  });

  const onSubmit = async (data) => {
    let result;
    if (contact) {
      result = await updateContact(contact.id, data);
    } else {
      result = await createContact(data);
    }
    if (result) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {contact ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button onClick={onSuccess} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex space-x-4">
            {['basic', 'contact', 'relationships', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Basic Information */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    {...register('firstName', { required: 'First name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    {...register('companyName')}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Company/Organization"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title/Position
                </label>
                <input
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Attorney, Partner, CEO"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    {...register('maritalStatus')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select</option>
                    <option value="SINGLE">Single</option>
                    <option value="MARRIED">Married</option>
                    <option value="DIVORCED">Divorced</option>
                    <option value="WIDOWED">Widowed</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Contact Information */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              {/* Email Addresses */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Email Addresses</label>
                  <button
                    type="button"
                    onClick={() => appendEmail({ emailType: 'WORK', email: '', isPrimary: false })}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Email
                  </button>
                </div>
                {emailFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 mb-3">
                    <select
                      {...register(`emails.${index}.emailType`)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="WORK">Work</option>
                      <option value="PERSONAL">Personal</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        {...register(`emails.${index}.email`)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Email address"
                      />
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`emails.${index}.isPrimary`)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Primary</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Phone Numbers */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Phone Numbers</label>
                  <button
                    type="button"
                    onClick={() => appendPhone({ phoneType: 'MOBILE', phoneNumber: '', isPrimary: false, isWhatsapp: false })}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Phone
                  </button>
                </div>
                {phoneFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 mb-3">
                    <select
                      {...register(`phones.${index}.phoneType`)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="MOBILE">Mobile</option>
                      <option value="WORK">Work</option>
                      <option value="HOME">Home</option>
                      <option value="FAX">Fax</option>
                    </select>
                    <div className="flex-1 relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        {...register(`phones.${index}.phoneNumber`)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Phone number"
                      />
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`phones.${index}.isPrimary`)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Primary</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register(`phones.${index}.isWhatsapp`)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">WhatsApp</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Addresses */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Addresses</label>
                  <button
                    type="button"
                    onClick={() => appendAddress({ addressType: 'WORK', addressLine1: '', city: '', state: '', postalCode: '', country: '', isPrimary: false })}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Address
                  </button>
                </div>
                {addressFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-3">
                      <select
                        {...register(`addresses.${index}.addressType`)}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="WORK">Work</option>
                        <option value="HOME">Home</option>
                        <option value="BILLING">Billing</option>
                        <option value="SHIPPING">Shipping</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeAddress(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="relative mb-3">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                      <textarea
                        {...register(`addresses.${index}.addressLine1`)}
                        rows="2"
                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Street address"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        {...register(`addresses.${index}.city`)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="City"
                      />
                      <input
                        {...register(`addresses.${index}.state`)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="State"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        {...register(`addresses.${index}.postalCode`)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Postal Code"
                      />
                      <input
                        {...register(`addresses.${index}.country`)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Country"
                      />
                    </div>
                    <label className="flex items-center space-x-2 mt-3">
                      <input
                        type="checkbox"
                        {...register(`addresses.${index}.isPrimary`)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-600">Primary Address</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Relationships */}
          {activeTab === 'relationships' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Contact Classification</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register('isClient')} className="rounded" />
                    <span className="text-sm text-gray-700">Is Client</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register('isOpponent')} className="rounded" />
                    <span className="text-sm text-gray-700">Is Opponent</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register('isWitness')} className="rounded" />
                    <span className="text-sm text-gray-700">Is Witness</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register('isJudge')} className="rounded" />
                    <span className="text-sm text-gray-700">Is Judge</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register('isAdvocate')} className="rounded" />
                    <span className="text-sm text-gray-700">Is Advocate</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register('isImportant')} className="rounded" />
                    <span className="text-sm text-gray-700">Important Contact</span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Department</h3>
                <input
                  {...register('department')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Department"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Add any additional notes about this contact..."
                ></textarea>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onSuccess}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner /> : (contact ? 'Update Contact' : 'Create Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;