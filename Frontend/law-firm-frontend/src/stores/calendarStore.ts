// src/stores/calendarStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CalendarEvent, User } from '../types';
import { calendarService } from '../services/calendar.service';
import { userService } from '../services/user.service';
import toast from 'react-hot-toast';
import set from 'react-hook-form/dist/utils/set';

interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  users: Map<number, User>;
  isLoading: boolean;
  viewType: 'month' | 'week' | 'day' | 'agenda';
  currentDate: Date;
  
  // Actions
  fetchEvents: (start?: string, end?: string) => Promise<void>;
  fetchEventById: (id: number) => Promise<void>;
  createEvent: (data: any) => Promise<CalendarEvent | null>;
  updateEvent: (id: number, data: any) => Promise<CalendarEvent | null>;
  deleteEvent: (id: number) => Promise<boolean>;
  setViewType: (view: 'month' | 'week' | 'day' | 'agenda') => void;
  setCurrentDate: (date: Date) => void;
  goToToday: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  clearSelectedEvent: () => void;
  getUserName: (userId: number) => Promise<string>;
  getUserById: (userId: number) => User | undefined;
}

export const useCalendarStore = create<CalendarState>()(
  devtools(
    (set, get) => ({
      events: [],
      selectedEvent: null,
      users: new Map(),
      isLoading: false,
      viewType: 'month',
      currentDate: new Date(),
      
      fetchEvents: async (start, end) => {
        set({ isLoading: true });
        try {
          const events = await calendarService.getEvents(start, end);
          
          // Fetch user names for attendees
          const allUserIds = new Set<number>();
          events.forEach(event => {
            event.attendees?.forEach(attendee => {
              allUserIds.add(attendee.userId);
            });
          });
          
          // Fetch missing users
          const { users } = get();
          const missingUserIds = Array.from(allUserIds).filter(id => !users.has(id));
          
          if (missingUserIds.length > 0) {
            try {
              const fetchedUsers = await userService.getUsersByIds(missingUserIds);
              const newUsers = new Map(users);
              fetchedUsers.forEach(user => {
                newUsers.set(user.id, user);
                // Cache in localStorage
                localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
              });
              set({ users: newUsers });
            } catch (error) {
              console.error('Failed to fetch users:', error);
            }
          }
          
          set({ events, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch events:', error);
          toast.error('Failed to load calendar events');
          set({ isLoading: false });
        }
      },
      
      fetchEventById: async (id) => {
        set({ isLoading: true });
        try {
          const event = await calendarService.getEventById(id);
          
          // Fetch user names for attendees if needed
          if (event.attendees && event.attendees.length > 0) {
            const { users } = get();
            const missingUserIds = event.attendees
              .map(a => a.userId)
              .filter(id => !users.has(id));
            
            if (missingUserIds.length > 0) {
              try {
                const fetchedUsers = await userService.getUsersByIds(missingUserIds);
                const newUsers = new Map(users);
                fetchedUsers.forEach(user => {
                  newUsers.set(user.id, user);
                  localStorage.setItem(`user_${user.id}`, JSON.stringify(user));
                });
                set({ users: newUsers });
              } catch (error) {
                console.error('Failed to fetch users:', error);
              }
            }
          }
          
          set({ selectedEvent: event, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch event:', error);
          toast.error('Failed to load event details');
          set({ isLoading: false });
        }
      },
      
      getUserName: async (userId: number) => {
        const { users, getUserById } = get();
        const cachedUser = getUserById(userId);
        
        if (cachedUser) {
          return cachedUser.fullName || `${cachedUser.firstName} ${cachedUser.lastName}` || `User ${userId}`;
        }
        
        try {
          const user = await userService.getUserById(userId);
          const newUsers = new Map(users);
          newUsers.set(userId, user);
          set({ users: newUsers });
          localStorage.setItem(`user_${userId}`, JSON.stringify(user));
          return user.fullName || `${user.firstName} ${user.lastName}` || `User ${userId}`;
        } catch (error) {
          console.error('Failed to fetch user:', error);
          return `User ${userId}`;
        }
      },
      
      getUserById: (userId: number) => {
        const { users } = get();
        return users.get(userId);
      },
      
      createEvent: async (data) => {
        set({ isLoading: true });
        try {
          const event = await calendarService.createEvent(data);
          set((state) => ({ 
            events: [...state.events, event],
            isLoading: false 
          }));
          toast.success('Event created successfully');
          return event;
        } catch (error) {
          console.error('Failed to create event:', error);
          toast.error('Failed to create event');
          set({ isLoading: false });
          return null;
        }
      },
      
      updateEvent: async (id, data) => {
        set({ isLoading: true });
        try {
          const event = await calendarService.updateEvent(id, data);
          set((state) => ({
            events: state.events.map((e) => e.id === id ? event : e),
            selectedEvent: event,
            isLoading: false
          }));
          toast.success('Event updated successfully');
          return event;
        } catch (error) {
          console.error('Failed to update event:', error);
          toast.error('Failed to update event');
          set({ isLoading: false });
          return null;
        }
      },
      
      deleteEvent: async (id) => {
        set({ isLoading: true });
        try {
          await calendarService.deleteEvent(id);
          set((state) => ({
            events: state.events.filter((e) => e.id !== id),
            selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
            isLoading: false
          }));
          toast.success('Event deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete event:', error);
          toast.error('Failed to delete event');
          set({ isLoading: false });
          return false;
        }
      },
      
      setViewType: (view) => {
        set({ viewType: view });
      },
      
      setCurrentDate: (date) => {
        set({ currentDate: date });
      },
      
      goToToday: () => {
        set({ currentDate: new Date() });
      },
      
      goToPrevious: () => {
        const { currentDate, viewType } = get();
        const newDate = new Date(currentDate);
        switch (viewType) {
          case 'month':
            newDate.setMonth(newDate.getMonth() - 1);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() - 7);
            break;
          case 'day':
            newDate.setDate(newDate.getDate() - 1);
            break;
          case 'agenda':
            newDate.setMonth(newDate.getMonth() - 1);
            break;
        }
        set({ currentDate: newDate });
      },
      
      goToNext: () => {
        const { currentDate, viewType } = get();
        const newDate = new Date(currentDate);
        switch (viewType) {
          case 'month':
            newDate.setMonth(newDate.getMonth() + 1);
            break;
          case 'week':
            newDate.setDate(newDate.getDate() + 7);
            break;
          case 'day':
            newDate.setDate(newDate.getDate() + 1);
            break;
          case 'agenda':
            newDate.setMonth(newDate.getMonth() + 1);
            break;
        }
        set({ currentDate: newDate });
      },
      clearSelectedEvent: () => {
        set({ selectedEvent: null });
      },
    })
  )
);