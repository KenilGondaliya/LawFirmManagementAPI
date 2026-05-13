// src/pages/Matters/MattersList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useMatterStore } from '../../stores/matterStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';

const statusColors: Record<string, string> = {
  OPEN: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  ARCHIVED: 'bg-blue-100 text-blue-800',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusOptions = ['OPEN', 'PENDING', 'CLOSED', 'ARCHIVED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const MattersList: React.FC = () => {
  const navigate = useNavigate();
  const { 
    matters, 
    isLoading, 
    fetchMatters, 
    fetchStats, 
    stats,
    totalPages,
    currentPage,
    setCurrentPage 
  } = useMatterStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchMatters({ 
      search: debouncedSearch || undefined, 
      status: statusFilter || undefined, 
      priority: priorityFilter || undefined,
      page: currentPage 
    });
    fetchStats();
  }, [debouncedSearch, statusFilter, priorityFilter, currentPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || statusFilter || priorityFilter;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <CheckCircleIcon className="w-3 h-3" />;
      case 'PENDING': return <ClockIcon className="w-3 h-3" />;
      case 'CLOSED': return <ArchiveBoxIcon className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Matters</h1>
          <p className="text-gray-500 mt-1">Manage your legal matters, cases, and transactions</p>
        </div>
        <Button onClick={() => navigate('/matters/create')} className="whitespace-nowrap">
          <PlusIcon className="w-5 h-5 mr-2" />
          New Matter
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <div 
            className="p-3 md:p-4 text-center cursor-pointer hover:shadow-md transition-all hover:border-primary-200"
            onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
          >
            <Card className="h-full">
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs md:text-sm text-gray-500">Total</p>
            </Card>
          </div>
          <div 
            className="p-3 md:p-4 text-center cursor-pointer hover:shadow-md transition-all hover:border-green-200"
            onClick={() => { setStatusFilter('OPEN'); setCurrentPage(1); }}
          >
            <Card className="h-full">
              <p className="text-xl md:text-2xl font-bold text-green-600">{stats.open}</p>
              <p className="text-xs md:text-sm text-gray-500">Open</p>
            </Card>
          </div>
          <div 
            className="p-3 md:p-4 text-center cursor-pointer hover:shadow-md transition-all hover:border-yellow-200"
            onClick={() => { setStatusFilter('PENDING'); setCurrentPage(1); }}
          >
            <Card className="h-full">
              <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs md:text-sm text-gray-500">Pending</p>
            </Card>
          </div>
          <div 
            className="p-3 md:p-4 text-center cursor-pointer hover:shadow-md transition-all hover:border-gray-300"
            onClick={() => { setStatusFilter('CLOSED'); setCurrentPage(1); }}
          >
            <Card className="h-full">
              <p className="text-xl md:text-2xl font-bold text-gray-600">{stats.closed}</p>
              <p className="text-xs md:text-sm text-gray-500">Closed</p>
            </Card>
          </div>
          <div 
            className="p-3 md:p-4 text-center cursor-pointer hover:shadow-md transition-all hover:border-orange-200"
            onClick={() => { setPriorityFilter('HIGH'); setCurrentPage(1); }}
          >
            <Card className="h-full">
              <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.highPriority}</p>
              <p className="text-xs md:text-sm text-gray-500">High Priority</p>
            </Card>
          </div>
          <div 
            className="p-3 md:p-4 text-center cursor-pointer hover:shadow-md transition-all hover:border-red-200"
            onClick={() => { setPriorityFilter('URGENT'); setCurrentPage(1); }}
          >
            <Card className="h-full">
              <p className="text-xl md:text-2xl font-bold text-red-600">{stats.urgentPriority}</p>
              <p className="text-xs md:text-sm text-gray-500">Urgent</p>
            </Card>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title, matter number, or client..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setStatusFilter(''); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      statusFilter === ''
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1 ${
                        statusFilter === status
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getStatusIcon(status)}
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setPriorityFilter(''); setCurrentPage(1); }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      priorityFilter === ''
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority}
                      onClick={() => { setPriorityFilter(priority); setCurrentPage(1); }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        priorityFilter === priority
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Matters List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : matters.length === 0 ? (
        <EmptyState
          title="No matters yet"
          description="Create your first matter to start tracking cases and legal work"
          buttonText="Create Matter"
          onButtonClick={() => navigate('/matters/create')}
          icon={<FolderIcon className="w-12 h-12 text-gray-400" />}
        />
      ) : (
        <>
          <div className="space-y-4">
            {matters.map((matter) => (
              <Card
                key={matter.id}
                className="p-4"
              >
                <div 
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all hover:border-primary-200 group"
                  onClick={() => navigate(`/matters/${matter.id}`)}
                >
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {matter.matterNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${statusColors[matter.status]}`}>
                        {getStatusIcon(matter.status)}
                        {matter.status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${priorityColors[matter.priority]}`}>
                        {matter.priority}
                      </span>
                      {matter.matterTypeName && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {matter.matterTypeName}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {matter.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-gray-500">
                      {matter.responsibleAdvocateName && (
                        <span className="flex items-center gap-1">
                          👤 {matter.responsibleAdvocateName}
                        </span>
                      )}
                      {matter.practiceAreaName && (
                        <span className="flex items-center gap-1">
                          📁 {matter.practiceAreaName}
                        </span>
                      )}
                      {matter.estimatedValue && (
                        <span className="flex items-center gap-1">
                          💰 ${matter.estimatedValue.toLocaleString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        📅 {new Date(matter.openDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex items-center gap-3 lg:border-l lg:border-gray-200 lg:pl-4">
                    {matter.priority === 'URGENT' && (
                      <div className="flex items-center gap-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span className="text-xs">Urgent</span>
                      </div>
                    )}
                    {matter.status === 'OPEN' && (
                      <div className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-2 py-1 rounded">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="text-xs">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};