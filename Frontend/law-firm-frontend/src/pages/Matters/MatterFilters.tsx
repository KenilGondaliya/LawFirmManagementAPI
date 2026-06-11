// src/components/Matters/MatterFilters.tsx
import React, { useState, useEffect } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMatterStore } from '../../stores/matterStore';
import { matterService } from '../../services/matter.service';
import { Button } from '../../components/UI/Button';
import { Modal } from '../../components/UI/Modal';

interface FilterState {
  status: string[];
  priority: string[];
  practiceAreaId: number[];
  responsibleAdvocateId: number | null;
  openDateFrom: string;
  openDateTo: string;
  estimatedValueMin: number | null;
  estimatedValueMax: number | null;
}

const statusOptions = ['OPEN', 'PENDING', 'CLOSED', 'ARCHIVED'];
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const MatterFilters: React.FC = () => {
  const { 
    statusFilter, 
    priorityFilter, 
    setStatusFilter, 
    setPriorityFilter,
    advancedSearch,
    fetchMatters
  } = useMatterStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [practiceAreas, setPracticeAreas] = useState<Array<{ id: number; name: string }>>([]);
  const [advocates, setAdvocates] = useState<Array<{ id: number; name: string }>>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    status: statusFilter ? [statusFilter] : [],
    priority: priorityFilter ? [priorityFilter] : [],
    practiceAreaId: [],
    responsibleAdvocateId: null,
    openDateFrom: '',
    openDateTo: '',
    estimatedValueMin: null,
    estimatedValueMax: null,
  });

  useEffect(() => {
    // Load practice areas and advocates for filters
    const loadFilterData = async () => {
      try {
        const areas = await matterService.getPracticeAreas();
        setPracticeAreas(areas);
        // Would need an endpoint to get advocates
        // const users = await userService.getUsersByRole('ADVOCATE');
        // setAdvocates(users);
      } catch (error) {
        console.error('Failed to load filter data:', error);
      }
    };
    loadFilterData();
  }, []);

  const handleStatusToggle = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handlePriorityToggle = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const handlePracticeAreaToggle = (id: number) => {
    setFilters(prev => ({
      ...prev,
      practiceAreaId: prev.practiceAreaId.includes(id)
        ? prev.practiceAreaId.filter(pid => pid !== id)
        : [...prev.practiceAreaId, id]
    }));
  };

  const handleApplyFilters = async () => {
    // Apply simple filters to the store
    if (filters.status.length === 1) {
      setStatusFilter(filters.status[0]);
    } else {
      setStatusFilter('');
    }
    
    if (filters.priority.length === 1) {
      setPriorityFilter(filters.priority[0]);
    } else {
      setPriorityFilter('');
    }
    
    // For advanced filters, use advanced search
    if (filters.practiceAreaId.length > 0 || 
        filters.responsibleAdvocateId || 
        filters.openDateFrom || 
        filters.openDateTo ||
        filters.estimatedValueMin ||
        filters.estimatedValueMax) {
      
      await advancedSearch({
        status: filters.status.length > 0 ? filters.status : undefined,
        priority: filters.priority.length > 0 ? filters.priority : undefined,
        practiceAreaId: filters.practiceAreaId.length > 0 ? filters.practiceAreaId : undefined,
        responsibleAdvocateId: filters.responsibleAdvocateId || undefined,
        openDateFrom: filters.openDateFrom || undefined,
        openDateTo: filters.openDateTo || undefined,
        estimatedValueMin: filters.estimatedValueMin || undefined,
        estimatedValueMax: filters.estimatedValueMax || undefined,
      });
    } else {
      await fetchMatters({ page: 1 });
    }
    
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    setFilters({
      status: [],
      priority: [],
      practiceAreaId: [],
      responsibleAdvocateId: null,
      openDateFrom: '',
      openDateTo: '',
      estimatedValueMin: null,
      estimatedValueMax: null,
    });
    setStatusFilter('');
    setPriorityFilter('');
    fetchMatters({ page: 1 });
    setIsOpen(false);
  };

  const hasActiveFilters = filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.practiceAreaId.length > 0 ||
    filters.responsibleAdvocateId ||
    filters.openDateFrom ||
    filters.openDateTo ||
    filters.estimatedValueMin ||
    filters.estimatedValueMax;

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <FunnelIcon className="w-4 h-4 mr-2" />
        Filters
        {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-primary-500 rounded-full"></span>}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Filter Matters" size="lg">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusToggle(status)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.status.includes(status)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => handlePriorityToggle(priority)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.priority.includes(priority)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Practice Area Filter */}
          {practiceAreas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Practice Area</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {practiceAreas.map((area) => (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => handlePracticeAreaToggle(area.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      filters.practiceAreaId.includes(area.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {area.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Open Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Open Date From</label>
              <input
                type="date"
                value={filters.openDateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, openDateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Open Date To</label>
              <input
                type="date"
                value={filters.openDateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, openDateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Estimated Value Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Value ($)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.estimatedValueMin || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, estimatedValueMin: e.target.value ? parseFloat(e.target.value) : null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Value ($)</label>
              <input
                type="number"
                placeholder="Unlimited"
                value={filters.estimatedValueMax || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, estimatedValueMax: e.target.value ? parseFloat(e.target.value) : null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={handleResetFilters}>
            Reset All
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};