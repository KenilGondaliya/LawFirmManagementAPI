// src/components/Tasks/PriorityManagementModal.tsx
import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Modal } from '../../components/UI/Modal';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { useTaskStore } from '../../stores/taskStore';
import toast from 'react-hot-toast';

interface PriorityManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PriorityManagementModal: React.FC<PriorityManagementModalProps> = ({ isOpen, onClose }) => {
  const { priorities, fetchPriorities } = useTaskStore();
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editLevel, setEditLevel] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [newPriority, setNewPriority] = useState({ name: '', color: '#f59e0b', level: 1 });

  useEffect(() => {
    if (isOpen) {
      fetchPriorities();
    }
  }, [isOpen]);

  const movePriority = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = priorities.findIndex(p => p.id === id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= priorities.length) return;
    
    const currentLevel = priorities[currentIndex].level;
    const targetLevel = priorities[targetIndex].level;
    
    try {
      await fetch(`/api/v1/tasks/priorities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: targetLevel })
      });
      await fetch(`/api/v1/tasks/priorities/${priorities[targetIndex].id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: currentLevel })
      });
      fetchPriorities();
    } catch (error) {
      toast.error('Failed to reorder priorities');
    }
  };

  const handleUpdatePriority = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/tasks/priorities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, color: editColor, level: editLevel })
      });
      if (response.ok) {
        toast.success('Priority updated successfully');
        fetchPriorities();
        setIsEditing(null);
      }
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  const handleDeletePriority = async (id: number) => {
    if (confirm('Are you sure you want to delete this priority?')) {
      try {
        const response = await fetch(`/api/v1/tasks/priorities/${id}`, { method: 'DELETE' });
        if (response.ok) {
          toast.success('Priority deleted successfully');
          fetchPriorities();
        }
      } catch (error) {
        toast.error('Failed to delete priority');
      }
    }
  };

  const handleCreatePriority = async () => {
    if (!newPriority.name.trim()) {
      toast.error('Priority name is required');
      return;
    }
    try {
      const response = await fetch('/api/v1/tasks/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPriority)
      });
      if (response.ok) {
        toast.success('Priority created successfully');
        fetchPriorities();
        setIsCreating(false);
        setNewPriority({ name: '', color: '#f59e0b', level: priorities.length + 1 });
      }
    } catch (error) {
      toast.error('Failed to create priority');
    }
  };

  const colors = ['#3b82f6', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#10b981', '#ec4899'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Task Priorities" size="lg">
      <div className="space-y-4">
        {/* Existing Priorities */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Current Priorities</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {priorities.map((priority, index) => (
              <div key={priority.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                {isEditing === priority.id ? (
                  <div className="flex-1 flex gap-2 flex-wrap">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-[120px]"
                      placeholder="Priority name"
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
                    <Input
                      type="number"
                      value={editLevel}
                      onChange={(e) => setEditLevel(parseInt(e.target.value))}
                      className="w-20"
                      min={1}
                    />
                    <Button size="sm" onClick={() => handleUpdatePriority(priority.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(null)}>Cancel</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: priority.color || '#f59e0b' }} />
                      <span className="font-medium text-gray-900">{priority.name}</span>
                      <span className="text-xs text-gray-400">Level {priority.level}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setIsEditing(priority.id);
                          setEditName(priority.name);
                          setEditColor(priority.color || '#f59e0b');
                          setEditLevel(priority.level);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => movePriority(priority.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronUpIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => movePriority(priority.id, 'down')}
                        disabled={index === priorities.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePriority(priority.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create New Priority */}
        {isCreating ? (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Create New Priority</h3>
            <div className="flex gap-2 flex-wrap">
              <Input
                value={newPriority.name}
                onChange={(e) => setNewPriority({ ...newPriority, name: e.target.value })}
                placeholder="Priority name"
                className="flex-1 min-w-[120px]"
              />
              <select
                value={newPriority.color}
                onChange={(e) => setNewPriority({ ...newPriority, color: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                {colors.map((color) => (
                  <option key={color} value={color} style={{ backgroundColor: color, color: 'white' }}>
                    {color}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                value={newPriority.level}
                onChange={(e) => setNewPriority({ ...newPriority, level: parseInt(e.target.value) })}
                className="w-20"
                min={1}
              />
              <Button size="sm" onClick={handleCreatePriority}>Create</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2 text-center text-sm text-primary-600 hover:text-primary-700 border border-dashed border-gray-300 rounded-lg hover:border-primary-300 transition-colors"
          >
            <PlusIcon className="w-4 h-4 inline mr-1" />
            Add New Priority
          </button>
        )}
      </div>
    </Modal>
  );
};