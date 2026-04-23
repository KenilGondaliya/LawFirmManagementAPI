import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import useContactStore from '../../stores/contactStore';
import useUIStore from '../../stores/uiStore';
import LoadingSpinner from '../common/LoadingSpinner';

const ContactForm = ({ contact, onSuccess }) => {
  const { createContact, updateContact, isLoading } = useContactStore();
  const { closeModal } = useUIStore();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: contact || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyName: '',
      isClient: false,
    }
  });

  const onSubmit = async (data) => {
    console.log('Form submitted:', data);
    let result;
    if (contact) {
      result = await updateContact(contact.id, data);
    } else {
      result = await createContact(data);
    }
    if (result) {
      onSuccess();
      closeModal();
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        <button
          onClick={closeModal}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              {...register('firstName', { required: 'First name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="First name"
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
              placeholder="Last name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            {...register('email', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            {...register('companyName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Company name"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isClient')}
            className="mr-2"
          />
          <label className="text-sm text-gray-700">This is a client</label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner /> : (contact ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;