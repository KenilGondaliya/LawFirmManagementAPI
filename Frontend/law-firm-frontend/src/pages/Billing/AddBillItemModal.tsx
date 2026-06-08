// src/pages/Billing/modals/AddBillItemModal.tsx
import React, { useState } from 'react';
import { useBillingStore } from '../../stores/billingStore';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';

interface AddBillItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  billId: number;
  onSuccess: () => void;
}

export const AddBillItemModal: React.FC<AddBillItemModalProps> = ({ 
  isOpen, 
  onClose, 
  billId, 
  onSuccess 
}) => {
  const { addBillItem } = useBillingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    discountPercentage: 0,
  });

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (formData.unitPrice <= 0) {
      toast.error('Unit price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await addBillItem(billId, formData);
      onSuccess();
      onClose();
      setFormData({
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0,
        discountPercentage: 0,
      });
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const amount = formData.quantity * formData.unitPrice;
  const totalAfterDiscount = amount * (1 - formData.discountPercentage / 100);
  const total = totalAfterDiscount * (1 + formData.taxRate / 100);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Bill Item" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Item description..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity *"
            type="number"
            step="1"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Unit Price *"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Discount (%)"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Tax Rate (%)"
            type="number"
            step="0.1"
            min="0"
            value={formData.taxRate}
            onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="p-3 bg-gray-50 rounded-lg space-y-1">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          {formData.discountPercentage > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({formData.discountPercentage}%):</span>
              <span>-${(amount * formData.discountPercentage / 100).toFixed(2)}</span>
            </div>
          )}
          {formData.taxRate > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax ({formData.taxRate}%):</span>
              <span>${(totalAfterDiscount * formData.taxRate / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Add Item
          </Button>
        </div>
      </div>
    </Modal>
  );
};