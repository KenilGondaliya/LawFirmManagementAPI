// src/services/notification.service.ts
import api from './api';

export const notificationService = {
  // Get notifications
  getNotifications: async (): Promise<any[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },
  
  // Mark notification as read
  markAsRead: async (notificationId: number): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },
  
  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },
};