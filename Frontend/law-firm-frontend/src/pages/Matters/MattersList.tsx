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
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useMatterStore } from '../../stores/matterStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import { EmptyState } from '../../components/Common/EmptyState';
import { MatterFilters } from './MatterFilters';

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
    searchQuery,
    statusFilter,
    priorityFilter,
    setCurrentPage,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    clearFilters,
    bulkDeleteMatters,
    bulkUpdateStatus,
  } = useMatterStore();
  
  const [selectedMatters, setSelectedMatters] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchQuery) {
        setSearchQuery(debouncedSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearch, searchQuery, setSearchQuery]);

  useEffect(() => {
    fetchMatters({ page: currentPage });
    fetchStats();
  }, [currentPage, searchQuery, statusFilter, priorityFilter]);

  const handleSelectAll = () => {
    if (selectedMatters.length === matters.length) {
      setSelectedMatters([]);
    } else {
      setSelectedMatters(matters.map(m => m.id));
    }
  };

  const handleSelectMatter = (id: number) => {
    setSelectedMatters(prev => 
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    setShowBulkActions(selectedMatters.length > 0);
  }, [selectedMatters]);

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedMatters.length} matter(s)?`)) {
      await bulkDeleteMatters(selectedMatters);
      setSelectedMatters([]);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    await bulkUpdateStatus({ matterIds: selectedMatters, status });
    setSelectedMatters([]);
    setShowStatusDropdown(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <CheckCircleIcon className="w-3 h-3" />;
      case 'PENDING': return <ClockIcon className="w-3 h-3" />;
      case 'CLOSED': return <ArchiveBoxIcon className="w-3 h-3" />;
      default: return null;
    }
  };

  const hasActiveFilters = searchQuery || statusFilter || priorityFilter;

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
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <MatterFilters />
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <XMarkIcon className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedMatters.length === matters.length && matters.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-primary-600"
            />
            <span className="text-sm text-gray-700">
              {selectedMatters.length} matter{selectedMatters.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <ClockIcon className="w-4 h-4 mr-1" />
                Change Status
              </Button>
              {showStatusDropdown && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  {['OPEN', 'PENDING', 'CLOSED', 'ARCHIVED'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleBulkStatusUpdate(status)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

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
                className={`p-4 transition-all ${selectedMatters.includes(matter.id) ? 'border-primary-500 bg-primary-50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedMatters.includes(matter.id)}
                    onChange={() => handleSelectMatter(matter.id)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Matter Content */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/matters/${matter.id}`)}
                  >
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
                          <UserGroupIcon className="w-3 h-3" />
                          {matter.responsibleAdvocateName}
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
                  <div className="flex items-center gap-3">
                    {matter.priority === 'URGENT' && (
                      <div className="flex items-center gap-1 text-red-600 text-sm bg-red-50 px-2 py-1 rounded">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span className="text-xs hidden sm:inline">Urgent</span>
                      </div>
                    )}
                    {matter.status === 'OPEN' && (
                      <div className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-2 py-1 rounded">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="text-xs hidden sm:inline">Active</span>
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