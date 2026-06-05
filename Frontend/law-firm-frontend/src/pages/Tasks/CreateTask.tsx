// src/pages/Tasks/CreateTask.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTaskStore } from '../../stores/taskStore';
import { useMatterStore } from '../../stores/matterStore';
import { useContactStore } from '../../stores/contactStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import toast from 'react-hot-toast';

interface CreateTaskFormData {
  title: string;
  description: string;
  matterId?: number;
  contactId?: number;
  statusId: number;
  priorityId: number;
  dueDate?: string;
  dueTime?: string;
  estimatedHours?: number;
  assigneeIds: number[];
  reminderMinutes: number;
}

export const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    createTask, 
    statuses, 
    fetchStatuses, 
    priorities, 
    fetchPriorities 
  } = useTaskStore();
  const { matters, fetchMatters } = useMatterStore();
  const { contacts, fetchContacts } = useContactStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number>(user?.id || 0);
  
  // Form state
  const [formData, setFormData] = useState<CreateTaskFormData>({
    title: '',
    description: '',
    statusId: 0,
    priorityId: 0,
    assigneeIds: user?.id ? [user.id] : [],
    reminderMinutes: 60,
  });

  // Load all required data
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      try {
        await Promise.all([
          fetchStatuses(),
          fetchPriorities(),
          fetchMatters({}),
          fetchContacts({})
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load form data');
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Set default status and priority after data is loaded
  useEffect(() => {
    if (statuses.length > 0 && formData.statusId === 0) {
      const defaultStatus = statuses.find(s => s.isDefault);
      if (defaultStatus) {
        setFormData(prev => ({ ...prev, statusId: defaultStatus.id }));
        console.log("Default status:", defaultStatus.id, defaultStatus.name);
      } else if (statuses[0]) {
        setFormData(prev => ({ ...prev, statusId: statuses[0].id }));
      }
    }
    
    if (priorities.length > 0 && formData.priorityId === 0) {
      const defaultPriority = priorities.find(p => p.name?.toUpperCase() === 'MEDIUM');
      if (defaultPriority) {
        setFormData(prev => ({ ...prev, priorityId: defaultPriority.id }));
        console.log("Default priority:", defaultPriority.id, defaultPriority.name);
      } else if (priorities[0]) {
        setFormData(prev => ({ ...prev, priorityId: priorities[0].id }));
      }
    }
  }, [statuses, priorities]);

  const updateField = (field: keyof CreateTaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== FORM SUBMISSION ===");
    console.log("Form data:", formData);
    
    if (!formData.title?.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.statusId || formData.statusId === 0) {
      toast.error('Please select a status');
      return;
    }
    if (!formData.priorityId || formData.priorityId === 0) {
      toast.error('Please select a priority');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Build the request payload matching your backend DTO
      const taskData: any = {
        title: formData.title.trim(),
        statusId: Number(formData.statusId),
        priorityId: Number(formData.priorityId),
        reminderMinutes: Number(formData.reminderMinutes || 60),
      };
      
      // Add optional fields only if they have values
      if (formData.description?.trim()) {
        taskData.description = formData.description.trim();
      }
      if (formData.matterId && formData.matterId > 0) {
        taskData.matterId = Number(formData.matterId);
      }
      if (formData.contactId && formData.contactId > 0) {
        taskData.contactId = Number(formData.contactId);
      }
      if (formData.dueDate) {
        taskData.dueDate = formData.dueDate;
      }
      if (formData.dueTime) {
        taskData.dueTime = `${formData.dueTime}:00`;
      }
      if (formData.estimatedHours && formData.estimatedHours > 0) {
        taskData.estimatedHours = Number(formData.estimatedHours);
      }
      if (formData.assigneeIds && formData.assigneeIds.length > 0) {
        const validAssigneeIds = formData.assigneeIds.filter(id => id > 0);
        if (validAssigneeIds.length > 0) {
          taskData.assigneeIds = validAssigneeIds;
          taskData.primaryAssigneeId = validAssigneeIds[0];
        }
      }
      
      console.log('Sending task data:', JSON.stringify(taskData, null, 2));
      
      const task = await createTask(taskData);
      if (task && task.id) {
        toast.success('Task created successfully');
        navigate(`/tasks/${task.id}`);
      }
    } catch (error: any) {
      console.error('Failed to create task:', error);
      let errorMessage = 'Failed to create task';
      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join(', ');
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAssignee = () => {
    if (selectedAssigneeId && selectedAssigneeId > 0 && !formData.assigneeIds.includes(selectedAssigneeId)) {
      updateField('assigneeIds', [...formData.assigneeIds, selectedAssigneeId]);
    }
  };

  const handleRemoveAssignee = (assigneeId: number) => {
    updateField('assigneeIds', formData.assigneeIds.filter(id => id !== assigneeId));
  };

  // Show loading state
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading form data...</p>
        </div>
      </div>
    );
  }

  // Show error if no statuses
  if (statuses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">No task statuses found. Please contact administrator.</p>
        <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
          <p className="text-gray-500 mt-1">Add a task to track your work</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the task..."
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Classification - Status & Priority */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.statusId}
                onChange={(e) => updateField('statusId', parseInt(e.target.value))}
              >
                <option value={0}>-- Select Status --</option>
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.priorityId}
                onChange={(e) => updateField('priorityId', parseInt(e.target.value))}
              >
                <option value={0}>-- Select Priority --</option>
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Due Date */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Due Date</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.dueDate || ''}
                onChange={(e) => updateField('dueDate', e.target.value || undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Time</label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.dueTime || ''}
                onChange={(e) => updateField('dueTime', e.target.value || undefined)}
              />
            </div>
          </div>
        </Card>

        {/* Time Tracking */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h2>
          <input
            type="number"
            step="0.5"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Estimated hours"
            value={formData.estimatedHours || ''}
            onChange={(e) => updateField('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </Card>

        {/* Related Items */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Matter</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.matterId || ''}
                onChange={(e) => updateField('matterId', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">None</option>
                {matters.map((matter) => (
                  <option key={matter.id} value={matter.id}>
                    {matter.matterNumber} - {matter.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Contact</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={formData.contactId || ''}
                onChange={(e) => updateField('contactId', e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">None</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Assignees */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignees</h2>
          <div className="flex gap-2 mb-3">
            <select
              value={selectedAssigneeId}
              onChange={(e) => setSelectedAssigneeId(parseInt(e.target.value))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>Select user to assign...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.fullName}
                </option>
              ))}
            </select>
            <Button type="button" onClick={handleAddAssignee} disabled={!selectedAssigneeId}>
              Add
            </Button>
          </div>
          
          {formData.assigneeIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.assigneeIds.map((assigneeId) => {
                const assignee = contacts.find(c => c.id === assigneeId);
                return (
                  <div key={assigneeId} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-sm">{assignee?.fullName || `User ${assigneeId}`}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAssignee(assigneeId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Reminder */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reminder</h2>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={formData.reminderMinutes}
            onChange={(e) => updateField('reminderMinutes', parseInt(e.target.value))}
          >
            <option value="0">No reminder</option>
            <option value="5">5 minutes before</option>
            <option value="10">10 minutes before</option>
            <option value="15">15 minutes before</option>
            <option value="30">30 minutes before</option>
            <option value="60">1 hour before</option>
            <option value="120">2 hours before</option>
            <option value="1440">1 day before</option>
          </select>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/tasks')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Task
          </Button>
        </div>
      </form>
    </div>
  );
};