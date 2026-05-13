// src/pages/Calendar/views/DayView.tsx
import React from 'react';
import { CalendarEvent } from '../../types';

interface DayViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export const DayView: React.FC<DayViewProps> = ({ events, currentDate, onEventClick }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      const eventHour = eventDate.getHours();
      return eventDate.getDate() === currentDate.getDate() &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear() &&
             eventHour === hour;
    });
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.startDateTime);
    const end = new Date(event.endDateTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return { startHour, duration };
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.getDate() === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Day Header */}
      <div className="p-4 text-center border-b border-gray-200 bg-gray-50">
        <div className="text-sm font-medium text-gray-600">
          {currentDate.toLocaleString('default', { weekday: 'long' })}
        </div>
        <div className={`text-3xl font-bold ${isToday() ? 'text-primary-600' : 'text-gray-900'}`}>
          {currentDate.getDate()}
        </div>
        <div className="text-sm text-gray-500">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Time Grid */}
      <div className="h-[600px] overflow-y-auto">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          return (
            <div key={hour} className="flex border-b border-gray-100 min-h-[60px]">
              {/* Time Label */}
              <div className="w-20 p-2 text-right text-sm text-gray-500 border-r border-gray-200 bg-gray-50 flex-shrink-0">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              
              {/* Events Container */}
              <div className="flex-1 relative">
                <div className="h-full">
                  {hourEvents.map((event) => {
                    const { startHour, duration } = getEventPosition(event);
                    const topOffset = (startHour - hour) * 60;
                    if (topOffset >= 0 && topOffset < 60) {
                      return (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className="absolute left-1 right-1 p-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{
                            top: `${topOffset}px`,
                            height: `${duration * 60 - 1}px`,
                            backgroundColor: event.color ? `${event.color}20` : '#e0e7ff',
                            color: event.color || '#4f46e5',
                            borderLeft: `4px solid ${event.color || '#4f46e5'}`,
                          }}
                        >
                          <div className="font-medium text-sm truncate">{event.title}</div>
                          <div className="text-xs truncate">
                            {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {event.location && (
                            <div className="text-xs truncate mt-1 opacity-75">📍 {event.location}</div>
                          )}
                          {event.matterTitle && (
                            <div className="text-xs truncate mt-1 opacity-75">📁 {event.matterTitle}</div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};