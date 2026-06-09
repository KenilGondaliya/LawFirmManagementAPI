// src/stores/authStore.ts - Add missing methods

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Firm, AuthResponse, RegisterDto, CreateFirmDto, UpdateProfileDto, ChangePasswordDto, InviteUserDto, InviteResponse } from '../types';
import { authService } from '../services/auth.service';
import api from '../services/api';

interface AuthState {
  user: User | null;
  firms: Firm[];
  currentFirm: Firm | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresFirmCreation: boolean;
  requiresFirmSelection: boolean;
  authError: string | null;
  
  // Auth actions
  login: (emailOrUsername: string, password: string, firmId?: number) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // Firm actions
  createFirm: (data: CreateFirmDto) => Promise<void>;
  switchFirm: (firmId: number) => Promise<void>;
  setCurrentFirm: (firm: Firm) => void;
  
  // Profile actions
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  changePassword: (data: ChangePasswordDto) => Promise<void>;
  
  // Email verification
  resendVerification: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  
  // Team actions
  inviteUser: (data: InviteUserDto) => Promise<InviteResponse>;
  acceptInvite: (email: string, firstName?: string, lastName?: string) => Promise<void>;
  
  // Utility
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        firms: [],
        currentFirm: null,
        isAuthenticated: false,
        isLoading: false,
        requiresFirmCreation: false,
        requiresFirmSelection: false,
        authError: null,
        
        login: async (emailOrUsername, password, firmId) => {
          set({ isLoading: true, authError: null });
          try {
            const response = await authService.login(emailOrUsername, password, firmId);
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
            
            set({
              user: response.user,
              firms: response.firms,
              currentFirm: response.currentFirm || null,
              isAuthenticated: true,
              requiresFirmCreation: response.requiresFirmCreation || false,
              requiresFirmSelection: response.requiresFirmSelection || false,
              isLoading: false,
              authError: null,
            });
          } catch (error: any) {
            set({ 
              isLoading: false, 
              authError: error.response?.data?.message || 'Login failed' 
            });
            throw error;
          }
        },
        
        register: async (data) => {
          set({ isLoading: true, authError: null });
          try {
            const response = await authService.register(data);
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
            
            set({
              user: response.user,
              firms: response.firms,
              currentFirm: null,
              isAuthenticated: true,
              requiresFirmCreation: true,
              requiresFirmSelection: false,
              isLoading: false,
              authError: null,
            });
          } catch (error: any) {
            set({ 
              isLoading: false, 
              authError: error.response?.data?.message || 'Registration failed' 
            });
            throw error;
          }
        },
        
        createFirm: async (data) => {
          set({ isLoading: true, authError: null });
          try {
            const response = await authService.createFirm(data);
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
            
            set({
              user: response.user,
              firms: response.firms,
              currentFirm: response.currentFirm,
              isAuthenticated: true,
              requiresFirmCreation: false,
              requiresFirmSelection: false,
              isLoading: false,
              authError: null,
            });
          } catch (error: any) {
            set({ 
              isLoading: false, 
              authError: error.response?.data?.message || 'Failed to create firm' 
            });
            throw error;
          }
        },
        
        switchFirm: async (firmId) => {
          set({ isLoading: true, authError: null });
          try {
            const response = await authService.switchFirm(firmId);
            
            // Update tokens
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
            
            set({
              user: response.user,
              firms: response.firms,
              currentFirm: response.currentFirm,
              isAuthenticated: true,
              requiresFirmCreation: false,
              requiresFirmSelection: false,
              isLoading: false,
              authError: null,
            });
          } catch (error: any) {
            set({ 
              isLoading: false, 
              authError: error.response?.data?.message || 'Failed to switch firm' 
            });
            throw error;
          }
        },
        
        logout: async () => {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await authService.logout(refreshToken).catch(console.error);
          }
          get().clearAuth();
          window.location.href = '/login';
        },
        
        setCurrentFirm: (firm) => {
          set({ currentFirm: firm });
        },
        
        updateProfile: async (data) => {
          set({ isLoading: true });
          try {
            await authService.updateProfile(data);
            const profile = await authService.getProfile();
            set({ user: profile, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },
        
        changePassword: async (data) => {
          set({ isLoading: true });
          try {
            await authService.changePassword(data);
            set({ isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },
        
        resendVerification: async (email) => {
          await authService.resendVerification(email);
        },
        
        verifyEmail: async (token) => {
          await authService.verifyEmail(token);
          // Update user email verification status
          const profile = await authService.getProfile();
          set({ user: profile });
        },
        
        inviteUser: async (data) => {
          return await authService.inviteUser(data);
        },
        
        acceptInvite: async (email, firstName, lastName) => {
          set({ isLoading: true });
          try {
            const response = await authService.acceptInvite(email, firstName, lastName);
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
            
            set({
              user: response.user,
              firms: response.firms,
              currentFirm: response.currentFirm,
              isAuthenticated: true,
              requiresFirmCreation: false,
              requiresFirmSelection: false,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },
        
        clearAuth: () => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          delete api.defaults.headers.common['Authorization'];
          set({
            user: null,
            firms: [],
            currentFirm: null,
            isAuthenticated: false,
            requiresFirmCreation: false,
            requiresFirmSelection: false,
            isLoading: false,
            authError: null,
          });
        },
        
        refreshToken: async () => {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) return false;
          
          try {
            const response = await authService.refreshToken(refreshToken);
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.accessToken}`;
            
            set({
              user: response.user,
              firms: response.firms,
              currentFirm: response.currentFirm,
              isAuthenticated: true,
              requiresFirmCreation: false,
              requiresFirmSelection: false,
              isLoading: false,
              authError: null,
            });
            return true;
          } catch (error) {
            console.error('Token refresh failed:', error);
            get().clearAuth();
            return false;
          }
        },
        
        initializeAuth: async () => {
          if (get().isAuthenticated) {
            return;
          }
          
          set({ isLoading: true, authError: null });
          
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (!accessToken || !refreshToken) {
            get().clearAuth();
            set({ isLoading: false });
            return;
          }
          
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          try {
            const profile = await authService.getProfile();
            
            // Try to restore stored firms from localStorage
            const storedState = localStorage.getItem('auth-storage');
            let firms: Firm[] = [];
            let currentFirm: Firm | null = null;
            
            if (storedState) {
              try {
                const parsed = JSON.parse(storedState);
                firms = parsed.state?.firms || [];
                currentFirm = parsed.state?.currentFirm || null;
              } catch (e) {
                console.error('Failed to parse stored state:', e);
              }
            }
            
            set({
              user: profile,
              firms: firms,
              currentFirm: currentFirm,
              isAuthenticated: true,
              requiresFirmCreation: false,
              requiresFirmSelection: false,
              isLoading: false,
            });
          } catch (error: any) {
            if (error.response?.status === 401) {
              const refreshed = await get().refreshToken();
              if (refreshed) {
                set({ isLoading: false });
                return;
              }
            }
            
            get().clearAuth();
            set({ isLoading: false, authError: 'Session expired. Please login again.' });
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          firms: state.firms,
          currentFirm: state.currentFirm,
        }),
      }
    )
  )
);