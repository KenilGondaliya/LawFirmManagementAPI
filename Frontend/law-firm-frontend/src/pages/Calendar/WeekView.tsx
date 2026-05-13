// src/pages/Calendar/views/WeekView.tsx
import React from 'react';
import { CalendarEvent } from '../../types';

interface WeekViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({ events, currentDate, onEventClick }) => {
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentDate);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      const eventHour = eventDate.getHours();
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear() &&
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-3 border-r border-gray-200 bg-gray-50"></div>
        {weekDates.map((date, index) => (
          <div
            key={index}
            className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
              isToday(date) ? 'bg-primary-50' : 'bg-gray-50'
            }`}
          >
            <div className="text-sm font-medium text-gray-600">
              {date.toLocaleString('default', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-semibold ${
              isToday(date) ? 'text-primary-600' : 'text-gray-900'
            }`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="h-[600px] overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 min-h-[60px] border-b border-gray-100">
            {/* Time Label */}
            <div className="p-2 text-right text-sm text-gray-500 border-r border-gray-200 bg-gray-50">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            
            {/* Day Columns */}
            {weekDates.map((date, colIndex) => {
              const dayEvents = getEventsForTimeSlot(date, hour);
              return (
                <div
                  key={colIndex}
                  className={`relative border-r border-gray-200 last:border-r-0 ${
                    isToday(date) ? 'bg-primary-50/30' : ''
                  }`}
                >
                  <div className="h-full">
                    {dayEvents.map((event) => {
                      const { startHour, duration } = getEventPosition(event);
                      const topOffset = (startHour - hour) * 60;
                      if (topOffset >= 0 && topOffset < 60) {
                        return (
                          <div
                            key={event.id}
                            onClick={() => onEventClick(event)}
                            className="absolute left-1 right-1 p-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
                            style={{
                              top: `${topOffset}px`,
                              height: `${duration * 60 - 1}px`,
                              backgroundColor: event.color ? `${event.color}20` : '#e0e7ff',
                              color: event.color || '#4f46e5',
                              borderLeft: `3px solid ${event.color || '#4f46e5'}`,
                            }}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-[10px] truncate">
                              {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};