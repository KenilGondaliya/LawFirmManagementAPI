// src/pages/Billing/CreateBill.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useBillingStore } from '../../stores/billingStore';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import toast from 'react-hot-toast';

interface CreateBillFormData {
  matterId: number;
  contactId: number;
  statusId?: number;
  billDate: string;
  dueDate: string;
  taxAmount?: number;
  discountAmount?: number;
  currency: string;
  notes?: string;
  terms?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    discountPercentage: number;
  }[];
}

export const CreateBill: React.FC = () => {
  const navigate = useNavigate();
  const { createBill, statuses, fetchStatuses } = useBillingStore();
  const { matters, fetchMatters } = useMatterStore();
  const { contacts, fetchContacts } = useContactStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateBillFormData>({
    defaultValues: {
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      items: [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discountPercentage: 0 }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchDiscountAmount = watch('discountAmount');
  const watchTaxAmount = watch('taxAmount');

  const calculateSubtotal = () => {
    return watchItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = watchDiscountAmount || 0;
    const tax = watchTaxAmount || 0;
    return subtotal - discount + tax;
  };

  useEffect(() => {
    fetchStatuses();
    fetchMatters({});
    fetchContacts({});
  }, []);

  const onSubmit = async (data: CreateBillFormData) => {
    setIsSubmitting(true);
    try {
      const bill = await createBill({
        matterId: data.matterId,
        contactId: data.contactId,
        statusId: data.statusId,
        billDate: data.billDate,
        dueDate: data.dueDate,
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        currency: data.currency,
        notes: data.notes,
        terms: data.terms,
        items: data.items.map((item, index) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 0,
          discountPercentage: item.discountPercentage || 0,
          itemOrder: index,
        })),
      });
      if (bill) {
        navigate(`/billing/bills/${bill.id}`);
      }
    } catch (error) {
      console.error('Failed to create bill:', error);
      toast.error('Failed to create bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/billing')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Bill</h1>
          <p className="text-gray-500 mt-1">Create an invoice for your client</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Bill Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Matter *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                {...register('matterId', { required: 'Matter is required' })}
              >
                <option value="">Select Matter</option>
                {matters.map((matter) => (
                  <option key={matter.id} value={matter.id}>
                    {matter.matterNumber} - {matter.title}
                  </option>
                ))}
              </select>
              {errors.matterId && <p className="text-red-500 text-sm mt-1">{errors.matterId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                {...register('contactId', { required: 'Client is required' })}
              >
                <option value="">Select Client</option>
                {contacts.filter(c => c.isClient).map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.fullName}
                  </option>
                ))}
              </select>
              {errors.contactId && <p className="text-red-500 text-sm mt-1">{errors.contactId.message}</p>}
            </div>

            <Input
              label="Bill Date"
              type="date"
              {...register('billDate')}
            />

            <Input
              label="Due Date"
              type="date"
              {...register('dueDate')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                {...register('statusId')}
              >
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Currency"
              placeholder="USD"
              {...register('currency')}
            />
          </div>
        </Card>

        {/* Bill Items */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bill Items</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ description: '', quantity: 1, unitPrice: 0, taxRate: 0, discountPercentage: 0 })}
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-700">Item {index + 1}</h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      label="Description"
                      placeholder="Item description"
                      {...register(`items.${index}.description` as const)}
                    />
                  </div>
                  <Input
                    label="Quantity"
                    type="number"
                    step="1"
                    placeholder="1"
                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                  />
                  <Input
                    label="Unit Price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                  />
                  <Input
                    label="Tax Rate (%)"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...register(`items.${index}.taxRate` as const, { valueAsNumber: true })}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount:</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-24 px-2 py-1 text-right border border-gray-300 rounded"
                    {...register('discountAmount', { valueAsNumber: true })}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-24 px-2 py-1 text-right border border-gray-300 rounded"
                    {...register('taxAmount', { valueAsNumber: true })}
                  />
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-bold text-primary-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Add any notes about this bill..."
                {...register('notes')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Payment terms, late fees, etc..."
                {...register('terms')}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/billing')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Bill
          </Button>
        </div>
      </form>
    </div>
  );
};