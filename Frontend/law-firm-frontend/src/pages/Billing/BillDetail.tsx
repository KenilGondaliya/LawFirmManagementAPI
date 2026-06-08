// src/pages/Billing/BillDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  PaperAirplaneIcon,
  PlusIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useBillingStore } from '../../stores/billingStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { AddPaymentModal } from './AddPaymentModal';
import { AddBillItemModal } from './AddBillItemModal';

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Sent: 'bg-blue-100 text-blue-800',
  'Partial Paid': 'bg-yellow-100 text-yellow-800',
  Paid: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
};

export const BillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    selectedBill, 
    isLoading, 
    fetchBillById, 
    deleteBill, 
    updateBillStatus,
    downloadBillPdf,
    sendBill,
    removeBillItem,
    addPayment,
    deletePayment,
    clearSelectedBill 
  } = useBillingStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBillById(parseInt(id));
    }
    return () => {
      clearSelectedBill();
    };
  }, [id]);

  const handleDelete = async () => {
    if (id) {
      const success = await deleteBill(parseInt(id));
      if (success) {
        navigate('/billing');
      }
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (statusId: number) => {
    if (id) {
      await updateBillStatus(parseInt(id), statusId);
    }
  };

  const handleDownload = async () => {
    if (id) {
      setIsDownloading(true);
      await downloadBillPdf(parseInt(id));
      setIsDownloading(false);
    }
  };

  const handleSend = async () => {
    if (id) {
      setIsSending(true);
      const success = await sendBill(parseInt(id));
      if (success) {
        toast.success('Bill sent successfully');
      }
      setIsSending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedBill?.currency || 'USD',
    }).format(amount);
  };

  const getStatusColor = (statusName?: string) => {
    return statusColors[statusName || 'Draft'] || statusColors.Draft;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedBill) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bill not found</p>
        <Button onClick={() => navigate('/billing')} className="mt-4">
          Back to Billing
        </Button>
      </div>
    );
  }

  const isOverdue = new Date(selectedBill.dueDate) < new Date() && selectedBill.balanceDue > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/billing')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">{selectedBill.billNumber}</h1>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedBill.statusName)}`}>
                {selectedBill.statusName || 'Draft'}
              </span>
              {isOverdue && (
                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  Overdue
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-1">
              Created {format(new Date(selectedBill.createdAt), 'PPP')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} isLoading={isDownloading}>
            <PrinterIcon className="w-4 h-4 mr-2" />
            PDF
          </Button>
          {selectedBill.statusName !== 'Paid' && (
            <Button variant="outline" onClick={handleSend} isLoading={isSending}>
              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
              Send
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/billing/bills/${id}/edit`)}>
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Items */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Bill Items</h2>
              {selectedBill.statusName !== 'Paid' && (
                <Button size="sm" onClick={() => setShowAddItemModal(true)}>
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">Description</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Qty</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Unit Price</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Discount</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Tax</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">Total</th>
                    {selectedBill.statusName !== 'Paid' && <th className="text-right py-3 px-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-2 text-gray-900">{item.description}</td>
                      <td className="text-right py-3 px-2 text-gray-600">{item.quantity}</td>
                      <td className="text-right py-3 px-2 text-gray-600">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-3 px-2 text-gray-600">{item.discountPercentage}%</td>
                      <td className="text-right py-3 px-2 text-gray-600">{item.taxRate}%</td>
                      <td className="text-right py-3 px-2 font-medium text-gray-900">{formatCurrency(item.totalAmount)}</td>
                      {selectedBill.statusName !== 'Paid' && (
                        <td className="text-right py-3 px-2">
                          <button
                            onClick={() => removeBillItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan={5} className="py-3 px-2 text-right font-medium">Subtotal:</td>
                    <td className="text-right py-3 px-2 font-medium">{formatCurrency(selectedBill.subtotal)}</td>
                  </tr>
                  {selectedBill.discountAmount > 0 && (
                    <tr>
                      <td colSpan={5} className="py-2 px-2 text-right text-gray-600">Discount:</td>
                      <td className="text-right py-2 px-2 text-gray-600">-{formatCurrency(selectedBill.discountAmount)}</td>
                    </tr>
                  )}
                  {selectedBill.taxAmount > 0 && (
                    <tr>
                      <td colSpan={5} className="py-2 px-2 text-right text-gray-600">Tax:</td>
                      <td className="text-right py-2 px-2 text-gray-600">{formatCurrency(selectedBill.taxAmount)}</td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-200">
                    <td colSpan={5} className="py-3 px-2 text-right font-bold">Total:</td>
                    <td className="text-right py-3 px-2 font-bold text-primary-600">{formatCurrency(selectedBill.totalAmount)}</td>
                  </tr>
                  {selectedBill.paidAmount > 0 && (
                    <tr>
                      <td colSpan={5} className="py-2 px-2 text-right text-green-600">Paid:</td>
                      <td className="text-right py-2 px-2 text-green-600">-{formatCurrency(selectedBill.paidAmount)}</td>
                    </tr>
                  )}
                  <tr className="border-t border-gray-200">
                    <td colSpan={5} className="py-3 px-2 text-right font-bold">Balance Due:</td>
                    <td className={`text-right py-3 px-2 font-bold ${selectedBill.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedBill.balanceDue)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Payments */}
          {selectedBill.payments.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
              <div className="space-y-3">
                {selectedBill.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500">
                          {payment.paymentMethod} • {format(new Date(payment.paymentDate), 'PPP')}
                          {payment.referenceNumber && ` • Ref: ${payment.referenceNumber}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePayment(payment.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bill Details */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Bill Number</span>
                <span className="font-mono text-gray-900">{selectedBill.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bill Date</span>
                <span className="text-gray-900">{format(new Date(selectedBill.billDate), 'PPP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Date</span>
                <span className={`${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {format(new Date(selectedBill.dueDate), 'PPP')}
                  {isOverdue && ' (Overdue)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <select
                  value={selectedBill.statusId}
                  onChange={(e) => handleStatusChange(parseInt(e.target.value))}
                  className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value={1}>Draft</option>
                  <option value={2}>Sent</option>
                  <option value={3}>Partial Paid</option>
                  <option value={4}>Paid</option>
                  <option value={5}>Overdue</option>
                </select>
              </div>
              {selectedBill.isRecurring && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Recurring</span>
                  <span className="text-gray-900">Yes</span>
                </div>
              )}
            </div>
          </Card>

          {/* Client Information */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900">{selectedBill.clientName || 'Unknown Client'}</span>
              </div>
              {selectedBill.matterTitle && (
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{selectedBill.matterTitle}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          {selectedBill.balanceDue > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <Button onClick={() => setShowPaymentModal(true)} fullWidth>
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </Card>
          )}

          {/* Notes & Terms */}
          {selectedBill.notes && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedBill.notes}</p>
            </Card>
          )}

          {selectedBill.terms && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms & Conditions</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedBill.terms}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Bill">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete bill <strong>{selectedBill.billNumber}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Bill
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        billId={selectedBill.id}
        balanceDue={selectedBill.balanceDue}
        onSuccess={() => fetchBillById(selectedBill.id)}
      />

      {/* Add Bill Item Modal */}
      <AddBillItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        billId={selectedBill.id}
        onSuccess={() => fetchBillById(selectedBill.id)}
      />
    </div>
  );
};