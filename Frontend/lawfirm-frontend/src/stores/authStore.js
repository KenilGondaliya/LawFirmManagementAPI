import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      firms: [],
      currentFirm: null,
      isAuthenticated: false,
      isLoading: false,
      requiresFirmCreation: false,
      requiresFirmSelection: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          
          if (response.requiresFirmSelection) {
            set({
              firms: response.firms,
              user: response.user,
              requiresFirmSelection: true,
              isLoading: false,
            });
            return { requiresFirmSelection: true };
          }
          
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            user: response.user,
            firms: response.firms,
            currentFirm: response.currentFirm,
            isAuthenticated: true,
            requiresFirmCreation: response.requiresFirmCreation || false,
            requiresFirmSelection: false,
            isLoading: false,
          });
          
          toast.success('Login successful!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Login failed');
          return { success: false };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(userData);
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            user: response.user,
            isAuthenticated: true,
            requiresFirmCreation: true,
            isLoading: false,
          });
          
          toast.success('Registration successful! Please create your firm.');
          return { success: true, requiresFirmCreation: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Registration failed');
          return { success: false };
        }
      },

      createFirm: async (firmData) => {
        set({ isLoading: true });
        try {
          const response = await authService.createFirm(firmData);
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            user: response.user,
            firms: response.firms,
            currentFirm: response.currentFirm,
            isAuthenticated: true,
            requiresFirmCreation: false,
            isLoading: false,
          });
          
          toast.success('Firm created successfully!');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error(error.response?.data?.message || 'Failed to create firm');
          return { success: false };
        }
      },

      selectFirm: async (firmId) => {
        set({ isLoading: true });
        try {
          const response = await authService.switchFirm({ firmId });
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          set({
            currentFirm: response.currentFirm,
            isAuthenticated: true,
            requiresFirmSelection: false,
            isLoading: false,
          });
          
          toast.success(`Switched to ${response.currentFirm.name}`);
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error('Failed to switch firm');
          return { success: false };
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({
            user: null,
            firms: [],
            currentFirm: null,
            isAuthenticated: false,
            requiresFirmCreation: false,
            requiresFirmSelection: false,
            isLoading: false,
          });
          toast.success('Logged out successfully');
        }
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true });
        try {
          const response = await authService.updateProfile(profileData);
          set((state) => ({
            user: { ...state.user, ...response },
            isLoading: false,
          }));
          toast.success('Profile updated successfully');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          toast.error('Failed to update profile');
          return { success: false };
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true });
        try {
          await authService.changePassword(passwordData);
          set({ isLoading: false });
          toast.success('Password changed successfully');
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false };
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        firms: state.firms,
        currentFirm: state.currentFirm,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;