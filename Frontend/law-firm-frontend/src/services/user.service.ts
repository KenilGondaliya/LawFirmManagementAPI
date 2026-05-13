// src/services/user.service.ts
import api from './api';
import { User } from '../types';

export const userService = {
  /**
   * Get user by ID
   */
  getUserById: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get multiple users by IDs
   */
  getUsersByIds: async (userIds: number[]): Promise<User[]> => {
    const response = await api.post('/users/batch', { userIds });
    return response.data;
  },

  /**
   * Get all users in the firm
   */
  getFirmUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
};