// src/stores/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Firm, AuthResponse, RegisterDto, CreateFirmDto, UpdateProfileDto } from '../types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  firms: Firm[];
  currentFirm: Firm | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresFirmCreation: boolean;
  requiresFirmSelection: boolean;
  
  login: (emailOrUsername: string, password: string, firmId?: number) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  createFirm: (data: CreateFirmDto) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentFirm: (firm: Firm) => void;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  clearAuth: () => void;
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
        
        login: async (emailOrUsername, password, firmId) => {
          set({ isLoading: true });
          try {
            const response = await authService.login(emailOrUsername, password, firmId);
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            set({
              user: response.user,
              firms: response.firms,
              currentFirm: response.currentFirm || null,
              isAuthenticated: true,
              requiresFirmCreation: response.requiresFirmCreation || false,
              requiresFirmSelection: response.requiresFirmSelection || false,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },
        
        register: async (data) => {
          set({ isLoading: true });
          try {
            const response = await authService.register(data);
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            
            set({
              user: response.user,
              firms: response.firms,
              currentFirm: null,
              isAuthenticated: true,
              requiresFirmCreation: true,
              requiresFirmSelection: false,
              isLoading: false,
            });
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },
        
        createFirm: async (data) => {
          set({ isLoading: true });
          try {
            const response = await authService.createFirm(data);
            
            localStorage.setItem('accessToken', response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            
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
        
        logout: async () => {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            await authService.logout(refreshToken).catch(console.error);
          }
          get().clearAuth();
        },
        
        setCurrentFirm: (firm) => {
          set({ currentFirm: firm });
        },
        
        updateProfile: async (data) => {
          await authService.updateProfile(data);
          const profile = await authService.getProfile();
          set({ user: profile });
        },
        
        clearAuth: () => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            firms: [],
            currentFirm: null,
            isAuthenticated: false,
            requiresFirmCreation: false,
            requiresFirmSelection: false,
          });
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