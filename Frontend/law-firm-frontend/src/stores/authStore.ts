// src/stores/authStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, Firm, AuthResponse, RegisterDto, CreateFirmDto, UpdateProfileDto } from '../types';
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
  
  login: (emailOrUsername: string, password: string, firmId?: number) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  createFirm: (data: CreateFirmDto) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentFirm: (firm: Firm) => void;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  clearAuth: () => void;
  initializeAuth: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
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
          // Update localStorage to persist current firm
          const stored = localStorage.getItem('auth-storage');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.state.currentFirm = firm;
              localStorage.setItem('auth-storage', JSON.stringify(parsed));
            } catch (e) {
              console.error('Failed to update stored firm:', e);
            }
          }
        },
        
        updateProfile: async (data) => {
          await authService.updateProfile(data);
          const profile = await authService.getProfile();
          set({ user: profile });
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
            
            // Get stored firms from persist
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
              user: response.user,
              firms: firms.length > 0 ? firms : response.firms,
              currentFirm: currentFirm || response.currentFirm,
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
          // Prevent multiple initializations
          if (get().isAuthenticated) {
            return;
          }
          
          set({ isLoading: true, authError: null });
          
          const accessToken = localStorage.getItem('accessToken');
          const refreshToken = localStorage.getItem('refreshToken');
          
          // If no tokens, clear auth and return
          if (!accessToken || !refreshToken) {
            get().clearAuth();
            set({ isLoading: false });
            return;
          }
          
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          try {
            // Try to get user profile to validate token
            const profile = await authService.getProfile();
            
            // Get stored state from localStorage (persist middleware)
            const storedState = localStorage.getItem('auth-storage');
            let firms: Firm[] = [];
            let currentFirm: Firm | null = null;
            let requiresFirmCreation = false;
            let requiresFirmSelection = false;
            
            if (storedState) {
              try {
                const parsed = JSON.parse(storedState);
                firms = parsed.state?.firms || [];
                currentFirm = parsed.state?.currentFirm || null;
                requiresFirmCreation = parsed.state?.requiresFirmCreation || false;
                requiresFirmSelection = parsed.state?.requiresFirmSelection || false;
              } catch (e) {
                console.error('Failed to parse stored state:', e);
              }
            }
            
            set({
              user: profile,
              firms: firms,
              currentFirm: currentFirm,
              isAuthenticated: true,
              requiresFirmCreation,
              requiresFirmSelection,
              isLoading: false,
              authError: null,
            });
          } catch (error: any) {
            console.error('Auth initialization failed:', error);
            
            // If token is expired, try to refresh
            if (error.response?.status === 401) {
              const refreshed = await get().refreshToken();
              if (refreshed) {
                set({ isLoading: false });
                return;
              }
            }
            
            // If all fails, clear auth
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
          requiresFirmCreation: state.requiresFirmCreation,
          requiresFirmSelection: state.requiresFirmSelection,
        }),
      }
    )
  )
);