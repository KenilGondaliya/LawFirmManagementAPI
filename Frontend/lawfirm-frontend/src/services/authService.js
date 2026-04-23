import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    // The backend expects PascalCase property names
    const loginData = {
      EmailOrUsername: data.emailOrUsername, // Note: Capital 'O' in Or
      Password: data.password
    };
    
    console.log('Sending login request:', loginData);
    
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },

  createFirm: async (data) => {
    const response = await api.post('/auth/create-firm', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  inviteUser: async (data) => {
    const response = await api.post('/auth/invite', data);
    return response.data;
  },

  acceptInvite: async (data) => {
    const response = await api.post('/auth/accept-invite', data);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};