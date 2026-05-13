// src/pages/Calendar/EventCreate.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCalendarStore } from '../../stores/calendarStore';
import { useContactStore } from '../../stores/contactStore';
import { useMatterStore } from '../../stores/matterStore';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { Card } from '../../components/UI/Card';
import toast from 'react-hot-toast';

interface EventFormData {
  title: string;
  description: string;
  location: string;
  eventType: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  color: string;
  matterId?: number;
  contactId?: number;
  reminderMinutes: number;
}

const eventTypes = [
  { value: 'MEETING', label: 'Meeting', icon: '👥', color: '#3b82f6' },
  { value: 'COURT', label: 'Court Appearance', icon: '⚖️', color: '#ef4444' },
  { value: 'DEADLINE', label: 'Deadline', icon: '⏰', color: '#f59e0b' },
  { value: 'APPOINTMENT', label: 'Appointment', icon: '📅', color: '#10b981' },
  { value: 'CALL', label: 'Phone Call', icon: '📞', color: '#8b5cf6' },
  { value: 'OTHER', label: 'Other', icon: '📌', color: '#6b7280' },
];

const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#6b7280'];

export const EventCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent } = useCalendarStore();
  const { contacts, fetchContacts } = useContactStore();
  const { matters, fetchMatters } = useMatterStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      eventType: 'MEETING',
      isAllDay: false,
      color: '#3b82f6',
      reminderMinutes: 15,
    }
  });

  const isAllDay = watch('isAllDay');

  useEffect(() => {
    fetchContacts({});
    fetchMatters({});
    
    // Set default dates
    const now = new Date();
    const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    
    setValue('startDateTime', startDateTime.toISOString().slice(0, 16));
    setValue('endDateTime', endDateTime.toISOString().slice(0, 16));
  }, []);

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    try {
      const eventData = {
        ...data,
        startDateTime: new Date(data.startDateTime).toISOString(),
        endDateTime: new Date(data.endDateTime).toISOString(),
      };
      const event = await createEvent(eventData);
      if (event) {
        navigate('/calendar');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/calendar')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-500 mt-1">Schedule meetings, court appearances, and deadlines</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h2>
          <div className="space-y-4">
            <Input
              label="Event Title *"
              placeholder="Enter event title"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <div className="grid grid-cols-3 gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setValue('eventType', type.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      watch('eventType') === type.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={isAllDay ? "Start Date *" : "Start Date & Time *"}
                type={isAllDay ? 'date' : 'datetime-local'}
                error={errors.startDateTime?.message}
                {...register('startDateTime', { required: 'Start date/time is required' })}
              />
              <Input
                label={isAllDay ? "End Date *" : "End Date & Time *"}
                type={isAllDay ? 'date' : 'datetime-local'}
                error={errors.endDateTime?.message}
                {...register('endDateTime', { required: 'End date/time is required' })}
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-primary-600"
                {...register('isAllDay')}
              />
              <span className="text-sm text-gray-700">All day event</span>
            </label>

            <Input
              label="Location"
              placeholder="Enter location (e.g., Courtroom, Office, Zoom link)"
              {...register('location')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter event description..."
                {...register('description')}
              />
            </div>
          </div>
        </Card>

        {/* Color Selection */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Color</h2>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`w-8 h-8 rounded-full transition-all ${
                  watch('color') === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </Card>

        {/* Related Entities */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Related Matter</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('matterId')}
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
                {...register('contactId')}
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

        {/* Reminder */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reminder</h2>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('reminderMinutes')}
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
          <Button type="button" variant="outline" onClick={() => navigate('/calendar')}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Event
          </Button>
        </div>
      </form>
    </div>
  );
};