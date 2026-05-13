// src/services/auth.service.ts
import api from './api';
import { AuthResponse, LoginDto, RegisterDto, CreateFirmDto, UpdateProfileDto, User, ChangePasswordDto, InviteUserDto, InviteResponse } from '../types';

export const authService = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (emailOrUsername: string, password: string, firmId?: number): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { emailOrUsername, password, firmId });
    return response.data;
  },
  
  createFirm: async (data: CreateFirmDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/create-firm', data);
    return response.data;
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
  
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },
  
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateProfile: async (data: UpdateProfileDto): Promise<void> => {
    await api.put('/auth/profile', data);
  },
  
  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await api.post('/auth/change-password', data);
  },
  
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },
  
  resetPassword: async (token: string, email: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, email, newPassword, confirmNewPassword: newPassword });
  },
  
  inviteUser: async (data: InviteUserDto): Promise<InviteResponse> => {
    const response = await api.post('/auth/invite', data);
    return response.data;
  },
};