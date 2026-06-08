// src/pages/Billing/BillsList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { useBillingStore } from '../../stores/billingStore';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Sent: 'bg-blue-100 text-blue-800',
  'Partial Paid': 'bg-yellow-100 text-yellow-800',
  Paid: 'bg-green-100 text-green-800',
  Overdue: 'bg-red-100 text-red-800',
};

export const BillsList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    bills, 
    isLoading, 
    fetchBills, 
    fetchDashboard, 
    dashboard,
    statuses,
    fetchStatuses
  } = useBillingStore();
  const { matters, fetchMatters } = useMatterStore();
  const { contacts, fetchContacts } = useContactStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [matterFilter, setMatterFilter] = useState<number | null>(null);
  const [contactFilter, setContactFilter] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, matterFilter, contactFilter]);

  const loadData = async () => {
    await Promise.all([
      fetchBills({ 
        status: statusFilter || undefined, 
        matterId: matterFilter || undefined,
        contactId: contactFilter || undefined
      }),
      fetchDashboard(),
      fetchStatuses(),
      fetchMatters({}),
      fetchContacts({})
    ]);
  };

  const filteredBills = bills.filter(bill => 
    !searchTerm || 
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.matterTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearFilters = () => {
    setStatusFilter('');
    setMatterFilter(null);
    setContactFilter(null);
    setSearchTerm('');
  };

  const hasActiveFilters = statusFilter || matterFilter || contactFilter || searchTerm;

  const getStatusColor = (statusName?: string) => {
    return statusColors[statusName || 'Draft'] || statusColors.Draft;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading && bills.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500 mt-1">Manage invoices, payments, and financial reports</p>
        </div>
        <Button onClick={() => navigate('/billing/create')}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Bill
        </Button>
      </div>

      {/* Stats Cards */}
      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboard.totalBilled)}</p>
            <p className="text-sm text-gray-500">Total Billed</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboard.totalPaid)}</p>
            <p className="text-sm text-gray-500">Total Paid</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboard.totalOutstanding)}</p>
            <p className="text-sm text-gray-500">Outstanding</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{dashboard.overdueBills}</p>
            <p className="text-sm text-gray-500">Overdue Bills</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{dashboard.billsCount?.paid || 0}</p>
            <p className="text-sm text-gray-500">Paid Bills</p>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by bill number, client, or matter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <XMarkIcon className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Matter</label>
                <select
                  value={matterFilter || ''}
                  onChange={(e) => setMatterFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Matters</option>
                  {matters.map((matter) => (
                    <option key={matter.id} value={matter.id}>
                      {matter.matterNumber} - {matter.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <select
                  value={contactFilter || ''}
                  onChange={(e) => setContactFilter(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Clients</option>
                  {contacts.filter(c => c.isClient).map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <EmptyState
          title="No bills yet"
          description="Create your first bill to start tracking invoices and payments"
          buttonText="Create Bill"
          onButtonClick={() => navigate('/billing/create')}
          icon={<DocumentTextIcon className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <div className="space-y-4">
          {filteredBills.map((bill) => (
            <button
              key={bill.id}
              type="button"
              className="w-full p-0"
              onClick={() => navigate(`/billing/bills/${bill.id}`)}
            >
              <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="text-sm font-mono text-gray-500">{bill.billNumber}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(bill.statusName)}`}>
                        {bill.statusName || 'Draft'}
                      </span>
                      {new Date(bill.dueDate) < new Date() && bill.balanceDue > 0 && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <ExclamationTriangleIcon className="w-3 h-3" />
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {bill.clientName || 'Unknown Client'}
                    </h3>
                    
                    {bill.matterTitle && (
                      <p className="text-sm text-gray-500">Matter: {bill.matterTitle}</p>
                    )}
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(bill.totalAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Balance Due</p>
                      <p className={`text-lg font-bold ${bill.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(bill.balanceDue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="text-sm text-gray-700">{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <EyeIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};