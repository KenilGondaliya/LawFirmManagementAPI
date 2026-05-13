// src/services/dashboard.service.ts
import api from './api';
import { 
  DashboardSummary, 
  UpcomingEventsDto, 
  RecentActivity, 
  Notification,
  QuickAction 
} from '../types';

export const dashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getRecentActivities: async (limit: number = 10): Promise<RecentActivity[]> => {
    const response = await api.get(`/dashboard/recent-activities?limit=${limit}`);
    return response.data;
  },
  
  getNotifications: async (unreadOnly: boolean = false): Promise<Notification[]> => {
    const response = await api.get(`/dashboard/notifications?unreadOnly=${unreadOnly}`);
    return response.data;
  },
  
  markNotificationAsRead: async (notificationId: number): Promise<void> => {
    await api.put(`/dashboard/notifications/${notificationId}/read`);
  },
  
  markAllNotificationsAsRead: async (): Promise<void> => {
    await api.put('/dashboard/notifications/read-all');
  },
  
  getUpcomingEvents: async (days: number = 7): Promise<UpcomingEventsDto> => {
    const response = await api.get(`/dashboard/upcoming-events?days=${days}`);
    return response.data;
  },
  
  getTasksSummary: async () => {
    const response = await api.get('/dashboard/tasks-summary');
    return response.data;
  },
  
  getBillsSummary: async () => {
    const response = await api.get('/dashboard/bills-summary');
    return response.data;
  },
  
  updateWidgetPreferences: async (widgets: any[]): Promise<void> => {
    await api.post('/dashboard/widgets/preferences', widgets);
  },
  
  getQuickActions: async (): Promise<QuickAction[]> => {
    const response = await api.get('/dashboard/quick-actions');
    return response.data;
  },
};