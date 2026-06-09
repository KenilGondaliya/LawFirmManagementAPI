// src/services/auth.service.ts - Complete version

import api from './api';
import { 
  AuthResponse, 
  LoginDto, 
  RegisterDto, 
  CreateFirmDto, 
  UpdateProfileDto, 
  User, 
  ChangePasswordDto, 
  InviteUserDto, 
  InviteResponse,
  SwitchFirmDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto
} from '../types';

export const authService = {
  // Authentication
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (emailOrUsername: string, password: string, firmId?: number): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { emailOrUsername, password, firmId });
    return response.data;
  },
  
  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refreshToken });
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },
  
  switchFirm: async (firmId: number): Promise<AuthResponse> => {
    const response = await api.post('/auth/switch-firm', { firmId });
    return response.data;
  },
  
  // Firm Management
  createFirm: async (data: CreateFirmDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/create-firm', data);
    return response.data;
  },
  
  // Profile Management
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
  
  // Password Recovery
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },
  
  resetPassword: async (token: string, email: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, email, newPassword, confirmNewPassword: newPassword });
  },
  
  // Email Verification
  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },
  
  resendVerification: async (email: string): Promise<void> => {
    await api.post('/auth/resend-verification', { email });
  },
  
  // Team Management
  inviteUser: async (data: InviteUserDto): Promise<InviteResponse> => {
    const response = await api.post('/auth/invite', data);
    return response.data;
  },
  
  acceptInvite: async (email: string, firstName?: string, lastName?: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/accept-invite', { email, firstName, lastName });
    return response.data;
  },
};