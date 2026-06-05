// src/components/Tasks/StatusManagementModal.tsx
import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useTaskStore } from '../../stores/taskStore';
import toast from 'react-hot-toast';

interface StatusManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusManagementModal: React.FC<StatusManagementModalProps> = ({ isOpen, onClose }) => {
  const { statuses, fetchStatuses } = useTaskStore();
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newStatus, setNewStatus] = useState({ name: '', color: '#6b7280' });

  useEffect(() => {
    if (isOpen) {
      fetchStatuses();
    }
  }, [isOpen]);

  const handleUpdateStatus = async (id: number) => {
    try {
      const response = await fetch('/api/v1/tasks/statuses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: editName, color: editColor })
      });
      if (response.ok) {
        toast.success('Status updated successfully');
        fetchStatuses();
        setIsEditing(null);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteStatus = async (id: number) => {
    if (confirm('Are you sure you want to delete this status?')) {
      try {
        const response = await fetch(`/api/v1/tasks/statuses/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Status deleted successfully');
          fetchStatuses();
        }
      } catch (error) {
        toast.error('Failed to delete status');
      }
    }
  };

  const handleCreateStatus = async () => {
    if (!newStatus.name.trim()) {
      toast.error('Status name is required');
      return;
    }
    try {
      const response = await fetch('/api/v1/tasks/statuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStatus)
      });
      if (response.ok) {
        toast.success('Status created successfully');
        fetchStatuses();
        setIsCreating(false);
        setNewStatus({ name: '', color: '#6b7280' });
      }
    } catch (error) {
      toast.error('Failed to create status');
    }
  };

  const colors = ['#6b7280', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Task Statuses" size="lg">
      <div className="space-y-4">
        {/* Existing Statuses */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Current Statuses</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {statuses.map((status) => (
              <div key={status.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                {isEditing === status.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1"
                      placeholder="Status name"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      {colors.map((color) => (
                        <option key={color} value={color} style={{ backgroundColor: color, color: 'white' }}>
                          {color}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={() => handleUpdateStatus(status.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color || '#6b7280' }} />
                      <span className="text-gray-900">{status.name}</span>
                      {status.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">Default</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setIsEditing(status.id);
                          setEditName(status.name);
                          setEditColor(status.color || '#6b7280');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {!status.isDefault && (
                        <button
                          onClick={() => handleDeleteStatus(status.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create New Status */}
        {isCreating ? (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Create New Status</h3>
            <div className="flex gap-2">
              <Input
                value={newStatus.name}
                onChange={(e) => setNewStatus({ ...newStatus, name: e.target.value })}
                placeholder="Status name"
                className="flex-1"
              />
              <select
                value={newStatus.color}
                onChange={(e) => setNewStatus({ ...newStatus, color: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                {colors.map((color) => (
                  <option key={color} value={color} style={{ backgroundColor: color, color: 'white' }}>
                    {color}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleCreateStatus}>Create</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2 text-center text-sm text-primary-600 hover:text-primary-700 border border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors"
          >
            <PlusIcon className="w-4 h-4 inline mr-1" />
            Add New Status
          </button>
        )}
      </div>
    </Modal>
  );
};