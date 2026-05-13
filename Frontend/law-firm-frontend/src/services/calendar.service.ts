// src/services/calendar.service.ts
import api from './api';
import { CalendarEvent } from '../types';

export const calendarService = {
  // ==================== Basic CRUD Operations ====================
  
  /**
   * Get all events with optional date range
   */
  getEvents: async (start?: string, end?: string): Promise<CalendarEvent[]> => {
    const params: any = {};
    if (start) params.start = start;
    if (end) params.end = end;
    const response = await api.get('/calendar/events', { params });
    return response.data;
  },
  
  /**
   * Get event by ID
   */
  getEventById: async (id: number): Promise<CalendarEvent> => {
    const response = await api.get(`/calendar/events/${id}`);
    return response.data;
  },
  
  /**
   * Create new event
   */
  createEvent: async (data: {
    title: string;
    description?: string;
    location?: string;
    eventType: string;
    startDateTime: string;
    endDateTime: string;
    isAllDay?: boolean;
    color?: string;
    matterId?: number;
    contactId?: number;
    attendeeIds?: number[];
    reminderMinutes?: number;
    recurrence?: {
      recurrencePattern: string;
      intervalValue: number;
      daysOfWeek?: string;
      dayOfMonth?: number;
      monthOfYear?: number;
      startDate: string;
      endDate?: string;
      occurrences?: number;
    };
  }): Promise<CalendarEvent> => {
    const response = await api.post('/calendar/events', data);
    return response.data;
  },
  
  /**
   * Update existing event
   */
  updateEvent: async (id: number, data: {
    title?: string;
    description?: string;
    location?: string;
    eventType?: string;
    startDateTime?: string;
    endDateTime?: string;
    isAllDay?: boolean;
    color?: string;
    matterId?: number;
    contactId?: number;
  }): Promise<CalendarEvent> => {
    const response = await api.put(`/calendar/events/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete event (soft delete)
   */
  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(`/calendar/events/${id}`);
  },
  
  // ==================== Date Range Views ====================
  
  /**
   * Get events by date range
   */
  getEventsByDateRange: async (start: string, end: string): Promise<CalendarEvent[]> => {
    const response = await api.get(`/calendar/events/range?start=${start}&end=${end}`);
    return response.data;
  },
  
  /**
   * Get upcoming events
   */
  getUpcomingEvents: async (limit: number = 10): Promise<CalendarEvent[]> => {
    const response = await api.get(`/calendar/events/upcoming?limit=${limit}`);
    return response.data;
  },
  
  // ==================== View Types ====================
  
  /**
   * Get month view events
   */
  getMonthView: async (year: number, month: number): Promise<CalendarEvent[]> => {
    const response = await api.get(`/calendar/view/month?year=${year}&month=${month}`);
    return response.data;
  },
  
  /**
   * Get week view events
   */
  getWeekView: async (date: string): Promise<CalendarEvent[]> => {
    const response = await api.get(`/calendar/view/week?date=${date}`);
    return response.data;
  },
  
  /**
   * Get day view events
   */
  getDayView: async (date: string): Promise<CalendarEvent[]> => {
    const response = await api.get(`/calendar/view/day?date=${date}`);
    return response.data;
  },
  
  /**
   * Get agenda view events
   */
  getAgendaView: async (start: string, end: string): Promise<CalendarEvent[]> => {
    const response = await api.get(`/calendar/view/agenda?start=${start}&end=${end}`);
    return response.data;
  },
  
  // ==================== Attendee Management ====================
  
  /**
   * Add attendee to event
   */
  addAttendee: async (eventId: number, userId: number, attendeeType: string = 'REQUIRED'): Promise<{
    userId: number;
    attendeeType: string;
    responseStatus: string;
  }> => {
    const response = await api.post(`/calendar/events/${eventId}/attendees?userId=${userId}&attendeeType=${attendeeType}`);
    return response.data;
  },
  
  /**
   * Remove attendee from event
   */
  removeAttendee: async (eventId: number, userId: number): Promise<void> => {
    await api.delete(`/calendar/events/${eventId}/attendees/${userId}`);
  },
  
  /**
   * Update attendee response status
   */
  updateAttendanceStatus: async (eventId: number, userId: number, status: string): Promise<{
    userId: number;
    attendeeType: string;
    responseStatus: string;
  }> => {
    const response = await api.put(`/calendar/events/${eventId}/attendees/${userId}/status?status=${status}`);
    return response.data;
  },
  
  /**
   * Get event attendees
   */
  getEventAttendees: async (eventId: number): Promise<Array<{
    userId: number;
    userName: string;
    userEmail: string;
    attendeeType: string;
    responseStatus: string;
  }>> => {
    const response = await api.get(`/calendar/events/${eventId}/attendees`);
    return response.data;
  },
  
  // ==================== Reminder Management ====================
  
  /**
   * Add reminder to event
   */
  addReminder: async (eventId: number, reminderTime: string, reminderType: string = 'BOTH'): Promise<{
    id: number;
    reminderTime: string;
    reminderType: string;
  }> => {
    const response = await api.post(`/calendar/events/${eventId}/reminders?reminderTime=${reminderTime}&reminderType=${reminderType}`);
    return response.data;
  },
  
  /**
   * Remove reminder from event
   */
  removeReminder: async (reminderId: number): Promise<void> => {
    await api.delete(`/calendar/reminders/${reminderId}`);
  },
  
  /**
   * Get event reminders
   */
  getEventReminders: async (eventId: number): Promise<Array<{
    id: number;
    reminderTime: string;
    reminderType: string;
    isSent: boolean;
  }>> => {
    const response = await api.get(`/calendar/events/${eventId}/reminders`);
    return response.data;
  },
  
  // ==================== Recurrence Management ====================
  
  /**
   * Set recurrence pattern for event
   */
  setRecurrence: async (eventId: number, recurrenceData: {
    recurrencePattern: string;
    intervalValue: number;
    daysOfWeek?: string;
    dayOfMonth?: number;
    monthOfYear?: number;
    startDate: string;
    endDate?: string;
    occurrences?: number;
  }): Promise<CalendarEvent> => {
    const response = await api.put(`/calendar/events/${eventId}/recurrence`, recurrenceData);
    return response.data;
  },
  
  /**
   * Remove recurrence from event
   */
  removeRecurrence: async (eventId: number): Promise<CalendarEvent> => {
    const response = await api.delete(`/calendar/events/${eventId}/recurrence`);
    return response.data;
  },
  
  // ==================== Calendar Integration ====================
  
  /**
   * Connect external calendar (Google, Outlook, etc.)
   */
  connectCalendar: async (data: {
    provider: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
    calendarId?: string;
  }): Promise<{
    provider: string;
    isConnected: boolean;
    calendarId?: string;
  }> => {
    const response = await api.post('/calendar/integrations/connect', data);
    return response.data;
  },
  
  /**
   * Disconnect external calendar
   */
  disconnectCalendar: async (provider: string): Promise<void> => {
    await api.delete(`/calendar/integrations/${provider}`);
  },
  
  /**
   * Get integration status
   */
  getIntegrationStatus: async (): Promise<{
    google: { isConnected: boolean; calendarId?: string; lastSyncAt?: string };
    outlook: { isConnected: boolean; calendarId?: string; lastSyncAt?: string };
  }> => {
    const response = await api.get('/calendar/integrations/status');
    return response.data;
  },
  
  /**
   * Sync with external calendar
   */
  syncCalendar: async (provider: string): Promise<{
    synced: number;
    created: number;
    updated: number;
    deleted: number;
  }> => {
    const response = await api.post(`/calendar/integrations/${provider}/sync`);
    return response.data;
  },
  
  // ==================== Event Types ====================
  
  /**
   * Get all event types
   */
  getEventTypes: async (): Promise<Array<{
    id: string;
    name: string;
    color: string;
    icon: string;
  }>> => {
    const response = await api.get('/calendar/event-types');
    return response.data;
  },
  
  // ==================== Export/Import ====================
  
  /**
   * Export calendar events
   */
  exportEvents: async (format: 'ical' | 'json' | 'csv', start?: string, end?: string): Promise<Blob> => {
    const params: any = { format };
    if (start) params.start = start;
    if (end) params.end = end;
    const response = await api.get('/calendar/export', { params, responseType: 'blob' });
    return response.data;
  },
  
  /**
   * Import events from iCal file
   */
  importEvents: async (file: File): Promise<{
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/calendar/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // ==================== Availability ====================
  
  /**
   * Check user availability
   */
  checkAvailability: async (userId: number, start: string, end: string): Promise<{
    available: boolean;
    conflictingEvents: CalendarEvent[];
  }> => {
    const response = await api.get(`/calendar/availability/${userId}?start=${start}&end=${end}`);
    return response.data;
  },
  
  /**
   * Get available time slots
   */
  getAvailableSlots: async (userIds: number[], date: string, durationMinutes: number): Promise<string[]> => {
    const response = await api.post('/calendar/availability/slots', { userIds, date, durationMinutes });
    return response.data;
  },
};