// src/pages/Calendar/views/AgendaView.tsx
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon, MapPinIcon, BriefcaseIcon, UserIcon } from '@heroicons/react/24/outline';
import { CalendarEvent } from '../../types';

interface AgendaViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

// Extended attendee type with user name
interface ExtendedEventAttendee {
  userId: number;
  userName?: string;
  attendeeType: string;
  responseStatus: string;
}

export const AgendaView: React.FC<AgendaViewProps> = ({ events, currentDate, onEventClick }) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [eventsWithUserNames, setEventsWithUserNames] = useState<CalendarEvent[]>(events);

  // Fetch user names for attendees when events change
  useEffect(() => {
    enrichEventsWithUserNames();
  }, [events]);

  const enrichEventsWithUserNames = async () => {
    try {
      // Get all unique user IDs from all events
      const allUserIds = new Set<number>();
      events.forEach(event => {
        event.attendees?.forEach(attendee => {
          allUserIds.add(attendee.userId);
        });
      });

      if (allUserIds.size === 0) {
        setEventsWithUserNames(events);
        return;
      }

      // Fetch user details
      const userMap = await getUsersByIds(Array.from(allUserIds));
      
      // Enrich events with user names
      const enrichedEvents = events.map(event => ({
        ...event,
        attendees: event.attendees?.map(attendee => ({
          ...attendee,
          userName: userMap[attendee.userId]?.name || `User ${attendee.userId}`,
        })) || [],
      }));
      
      setEventsWithUserNames(enrichedEvents);
    } catch (error) {
      console.error('Failed to fetch user names:', error);
      setEventsWithUserNames(events);
    }
  };

  // Helper function to get users by IDs
  const getUsersByIds = async (userIds: number[]): Promise<Record<number, { name: string; email: string }>> => {
    const userMap: Record<number, { name: string; email: string }> = {};
    
    // Try to get from localStorage or sessionStorage
    for (const userId of userIds) {
      const storedUser = localStorage.getItem(`user_${userId}`);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        userMap[userId] = { name: `${user.firstName} ${user.lastName}`, email: user.email };
      } else {
        userMap[userId] = { name: `User ${userId}`, email: '' };
      }
    }
    
    return userMap;
  };

  const groupEventsByDay = () => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    eventsWithUserNames.forEach(event => {
      const eventDate = new Date(event.startDateTime);
      if (eventDate >= startOfMonth && eventDate <= endOfMonth) {
        const dateKey = eventDate.toDateString();
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(event);
      }
    });
    
    // Sort events within each day by start time
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => 
        new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      );
    });
    
    return grouped;
  };

  const groupedEvents = groupEventsByDay();
  const sortedDays = Object.keys(groupedEvents).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'MEETING': return '👥';
      case 'COURT': return '⚖️';
      case 'DEADLINE': return '⏰';
      case 'APPOINTMENT': return '📅';
      default: return '📌';
    }
  };

  const getUserInitials = (userName: string) => {
    return userName.charAt(0).toUpperCase();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-200">
        {sortedDays.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📅</div>
            <p className="text-gray-500">No events scheduled for this month</p>
          </div>
        ) : (
          sortedDays.map((day) => {
            const dayEvents = groupedEvents[day];
            const isExpanded = expandedDays.has(day);
            const date = new Date(day);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div key={day} className="bg-white">
                {/* Day Header */}
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    )}
                    <div className="text-left">
                      <div className={`text-lg font-semibold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                        {date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Day Events */}
                {isExpanded && (
                  <div className="px-6 pb-4 space-y-3">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        style={{
                          borderLeftColor: event.color || '#4f46e5',
                          borderLeftWidth: '4px',
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{getEventTypeIcon(event.eventType)}</span>
                              <h3 className="font-semibold text-gray-900">{event.title}</h3>
                              {event.isAllDay && (
                                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  All Day
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">🕒</span>
                                <span>
                                  {event.isAllDay ? (
                                    'All day'
                                  ) : (
                                    `${new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                     ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                  )}
                                </span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                              
                              {event.matterTitle && (
                                <div className="flex items-center gap-2">
                                  <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                                  <span>{event.matterTitle}</span>
                                </div>
                              )}
                              
                              {event.contactName && (
                                <div className="flex items-center gap-2">
                                  <UserIcon className="w-4 h-4 text-gray-400" />
                                  <span>{event.contactName}</span>
                                </div>
                              )}
                            </div>
                            
                            {event.description && (
                              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{event.description}</p>
                            )}
                          </div>
                          
                          {/* Attendees Avatars */}
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1">
                              {event.attendees.slice(0, 3).map((attendee: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600"
                                  title={attendee.userName || `User ${attendee.userId}`}
                                >
                                  {getUserInitials(attendee.userName || `U${attendee.userId}`)}
                                </div>
                              ))}
                              {event.attendees.length > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                                  +{event.attendees.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};