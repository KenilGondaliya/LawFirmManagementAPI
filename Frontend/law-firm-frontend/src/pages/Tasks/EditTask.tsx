// src/pages/Tasks/EditTask.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTaskStore } from '../../stores/taskStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';
import toast from 'react-hot-toast';

interface EditTaskFormData {
  title: string;
  description: string;
  priorityId: number;
  dueDate?: string;
  dueTime?: string;
  estimatedHours?: number;
}

export const EditTask: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedTask, isLoading, fetchTaskById, updateTask, clearSelectedTask, priorities, fetchPriorities } = useTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditTaskFormData>();

  useEffect(() => {
    if (id) {
      fetchTaskById(parseInt(id));
      fetchPriorities();
    }
    return () => {
      clearSelectedTask();
    };
  }, [id]);

  useEffect(() => {
    if (selectedTask) {
      setValue('title', selectedTask.title);
      setValue('description', selectedTask.description || '');
      setValue('priorityId', selectedTask.priorityId);
      setValue('dueDate', selectedTask.dueDate?.split('T')[0] || '');
      setValue('dueTime', selectedTask.dueTime?.substring(0, 5) || '');
      setValue('estimatedHours', selectedTask.estimatedHours);
    }
  }, [selectedTask, setValue]);

  const onSubmit = async (data: EditTaskFormData) => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      const task = await updateTask(parseInt(id), data);
      if (task) {
        navigate(`/tasks/${id}`);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Task not found</p>
        <Button onClick={() => navigate('/tasks')} className="mt-4">
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/tasks/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
          <p className="text-gray-500 mt-1">Update task details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h2>
          <div className="space-y-4">
            <Input
              label="Title *"
              placeholder="Enter task title"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Describe the task..."
                {...register('description')}
              />
            </div>
          </div>
        </Card>

        {/* Priority */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority</h2>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('priorityId')}
          >
            {priorities.map((priority) => (
              <option key={priority.id} value={priority.id}>
                {priority.name}
              </option>
            ))}
          </select>
        </Card>

        {/* Due Date */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Due Date</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              {...register('dueDate')}
            />
            <Input
              label="Due Time"
              type="time"
              {...register('dueTime')}
            />
          </div>
        </Card>

        {/* Time Tracking */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h2>
          <Input
            label="Estimated Hours"
            type="number"
            step="0.5"
            placeholder="0"
            {...register('estimatedHours')}
          />
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/tasks/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};