// src/pages/Billing/modals/AddPaymentModal.tsx
import React, { useState } from 'react';
import { useBillingStore } from '../../stores/billingStore';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  billId: number;
  balanceDue: number;
  onSuccess: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  billId, 
  balanceDue,
  onSuccess 
}) => {
  const { addPayment } = useBillingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: balanceDue,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    referenceNumber: '',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (formData.amount > balanceDue) {
      toast.error(`Amount cannot exceed balance due of $${balanceDue.toFixed(2)}`);
      return;
    }
    if (!formData.paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPayment(billId, {
        amount: formData.amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber,
        notes: formData.notes,
      });
      onSuccess();
      onClose();
      setFormData({
        amount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: '',
        referenceNumber: '',
        notes: '',
      });
    } catch (error) {
      console.error('Failed to add payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="md">
      <div className="space-y-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-gray-600">Balance Due:</span>
            <span className="font-bold text-red-600">${balanceDue.toFixed(2)}</span>
          </div>
        </div>

        <Input
          label="Amount *"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
        />

        <Input
          label="Payment Date *"
          type="date"
          value={formData.paymentDate}
          onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Method</option>
            <option value="Cash">Cash</option>
            <option value="Check">Check</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Online Payment">Online Payment</option>
          </select>
        </div>

        <Input
          label="Reference Number"
          placeholder="Check number, transaction ID, etc."
          value={formData.referenceNumber}
          onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Additional notes about this payment..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Record Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
};