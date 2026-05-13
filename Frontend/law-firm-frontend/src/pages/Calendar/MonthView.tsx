// src/pages/Calendar/views/MonthView.tsx
import React from 'react';
import { CalendarEvent } from '../../types';

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ events, currentDate, onEventClick }) => {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate.getFullYear() === targetDate.getFullYear() &&
             eventDate.getMonth() === targetDate.getMonth() &&
             eventDate.getDate() === targetDate.getDate();
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarDays = () => {
    const calendarDays = [];
    const totalDays = 42; // 6 rows of 7 days

    for (let i = 0; i < totalDays; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isValid = dayNumber > 0 && dayNumber <= daysInMonth;
      const dayEvents = isValid ? getEventsForDay(dayNumber) : [];
      
      calendarDays.push(
        <div
          key={i}
          className={`min-h-[100px] border border-gray-200 p-2 ${
            isValid ? 'bg-white' : 'bg-gray-50'
          }`}
        >
          {isValid && (
            <>
              <span className={`text-sm font-medium ${
                new Date().getDate() === dayNumber &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear()
                  ? 'bg-primary-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center'
                  : 'text-gray-700'
              }`}>
                {dayNumber}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="text-xs p-1 rounded cursor-pointer truncate hover:opacity-80 transition-opacity"
                    style={{ 
                      backgroundColor: event.color ? `${event.color}20` : '#e0e7ff',
                      color: event.color || '#4f46e5',
                      borderLeft: `3px solid ${event.color || '#4f46e5'}`
                    }}
                  >
                    {event.isAllDay ? '📅 ' : '⏰ '}{event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return calendarDays;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {days.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {renderCalendarDays()}
      </div>
    </div>
  );
};