// src/pages/Calendar/CalendarView.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ListBulletIcon,
  Squares2X2Icon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useCalendarStore } from '../../stores/calendarStore';
import { Button } from '../../components/UI/Button';
import { LoadingSpinner } from '../../components/Common/LoadingSpinner';

import { Modal } from '../../components/UI/Modal';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';

export const CalendarView: React.FC = () => {
  const navigate = useNavigate();
  const {
    events,
    isLoading,
    viewType,
    currentDate,
    fetchEvents,
    setViewType,
    setCurrentDate,
    goToToday,
    goToPrevious,
    goToNext,
    clearSelectedEvent,
  } = useCalendarStore();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    eventTypes: [] as string[],
    matterId: null as number | null,
    contactId: null as number | null,
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate, viewType, filters]);

  const loadEvents = async () => {
    let start: Date, end: Date;
    const date = new Date(currentDate);

    switch (viewType) {
      case 'month':
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      case 'week':
        const dayOfWeek = date.getDay();
        start = new Date(date);
        start.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      case 'day':
        start = new Date(date);
        start.setHours(0, 0, 0, 0);
        end = new Date(date);
        end.setHours(23, 59, 59, 999);
        break;
      case 'agenda':
        start = new Date(date);
        start.setDate(1);
        end = new Date(date);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      default:
        start = new Date();
        end = new Date();
    }

    await fetchEvents(start.toISOString(), end.toISOString());
  };

  const getHeaderTitle = () => {
    const date = new Date(currentDate);
    switch (viewType) {
      case 'month':
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      case 'week':
        const start = new Date(currentDate);
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        if (start.getMonth() === end.getMonth()) {
          return `${start.toLocaleString('default', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
        } else {
          return `${start.toLocaleString('default', { month: 'short' })} ${start.getDate()} - ${end.toLocaleString('default', { month: 'short' })} ${end.getDate()}, ${start.getFullYear()}`;
        }
      case 'day':
        return currentDate.toLocaleDateString('default', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'agenda':
        return `Agenda - ${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
      default:
        return '';
    }
  };

  const renderView = () => {
    switch (viewType) {
      case 'month':
        return <MonthView events={events} currentDate={currentDate} onEventClick={(event) => {
          clearSelectedEvent();
          navigate(`/calendar/events/${event.id}`);
        }} />;
      case 'week':
        return <WeekView events={events} currentDate={currentDate} onEventClick={(event) => {
          clearSelectedEvent();
          navigate(`/calendar/events/${event.id}`);
        }} />;
      case 'day':
        return <DayView events={events} currentDate={currentDate} onEventClick={(event) => {
          clearSelectedEvent();
          navigate(`/calendar/events/${event.id}`);
        }} />;
      case 'agenda':
        return <AgendaView events={events} currentDate={currentDate} onEventClick={(event) => {
          clearSelectedEvent();
          navigate(`/calendar/events/${event.id}`);
        }} />;
      default:
        return null;
    }
  };

  const clearFilters = () => {
    setFilters({
      eventTypes: [],
      matterId: null,
      contactId: null,
    });
  };

  const hasActiveFilters = filters.eventTypes.length > 0 || filters.matterId !== null || filters.contactId !== null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">Manage your schedule, meetings, and court appearances</p>
        </div>
        <Button onClick={() => navigate('/calendar/events/create')}>
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center border border-gray-200 rounded-lg">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 ml-2">
            {getHeaderTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day', 'agenda'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setViewType(view)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
                  viewType === view
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view === 'month' && <Squares2X2Icon className="w-4 h-4" />}
                {view === 'week' && <CalendarDaysIcon className="w-4 h-4" />}
                {view === 'day' && <CalendarDaysIcon className="w-4 h-4" />}
                {view === 'agenda' && <ListBulletIcon className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Filter Button */}
          <Button variant="outline" onClick={() => setShowFilterModal(true)}>
            <FunnelIcon className="w-4 h-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 bg-primary-500 rounded-full"></span>
            )}
          </Button>

          {/* Refresh Button */}
          <Button variant="outline" onClick={loadEvents}>
            <ArrowPathIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Views */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex-1">
          {renderView()}
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Events"
        size="md"
      >
        <div className="space-y-4">
          {/* Event Types Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Types
            </label>
            <div className="flex flex-wrap gap-2">
              {['MEETING', 'COURT', 'DEADLINE', 'APPOINTMENT', 'CALL', 'OTHER'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    if (filters.eventTypes.includes(type)) {
                      setFilters({
                        ...filters,
                        eventTypes: filters.eventTypes.filter(t => t !== type),
                      });
                    } else {
                      setFilters({
                        ...filters,
                        eventTypes: [...filters.eventTypes, type],
                      });
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.eventTypes.includes(type)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <XMarkIcon className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setShowFilterModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowFilterModal(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};