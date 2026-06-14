// src/services/settings.service.ts
import api from './api';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface TeamMember {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  status: string;
  joinedAt?: string;
  invitedAt?: string;
  profileImageUrl?: string;
}

export interface Role {
  name: string;
  description: string;
  permissions: string[];
}

export interface InviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface FirmSettings {
  id: number;
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  taxNumber?: string;
  registrationNumber?: string;
  logoUrl?: string;
  timezone: string;
  dateFormat: string;
  currency: string;
}

export interface Branding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface CurrentPlan {
  planName: string;
  planCode: string;
  status: string;
  billingCycle: string;
  startDate: string;
  nextBillingDate?: string;
  endDate?: string;
  autoRenew: boolean;
  featuresList: string[];  // Changed from 'features' to 'featuresList'
}

export interface Plan {
  id: number;
  name: string;
  code: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  maxUsers: number;
  maxStorageMb: number;
  featuresList: string[];  // Changed from 'features' to 'featuresList'
  isPopular: boolean;
}


export interface UserPreferences {
  theme: string;
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  calendarView: string;
  dashboardLayout?: any;
}

export interface AuditLog {
  id: number;
  action: string;
  entityType?: string;
  entityId?: number;
  oldValues?: string;
  newValues?: string;
  userName: string;
  ipAddress?: string;
  createdAt: string;
}

export interface UsageStatistics {
  users: { current: number; limit: number; remaining: number; percentage: number };
  matters: { current: number; limit: number; remaining: number; percentage: number };
  contacts: { current: number; limit: number; remaining: number; percentage: number };
  storage: { currentMb: number; limitMb: number; remainingMb: number; percentage: number; currentFormatted: string; limitFormatted: string };
}

export const settingsService = {
  // Profile Settings
  getProfile: async (): Promise<any> => {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto): Promise<any> => {
    const response = await api.put('/settings/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/settings/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.avatarUrl;
  },

  removeAvatar: async (): Promise<void> => {
    await api.delete('/settings/profile/avatar');
  },

  // Team Management
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await api.get('/settings/teams');
    return response.data;
  },

  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/settings/teams/roles');
    return response.data;
  },

  updateMemberRole: async (userId: number, role: string): Promise<TeamMember> => {
    const response = await api.put(`/settings/teams/members/${userId}/role?role=${role}`);
    return response.data.member;
  },

  removeTeamMember: async (userId: number): Promise<void> => {
    await api.delete(`/settings/teams/members/${userId}`);
  },

  inviteMember: async (data: InviteUserDto): Promise<any> => {
    const response = await api.post('/settings/teams/invite', data);
    return response.data;
  },

  cancelInvitation: async (userFirmId: number): Promise<void> => {
    await api.delete(`/settings/teams/invitations/${userFirmId}`);
  },

  // Firm Settings
  getFirmSettings: async (): Promise<FirmSettings> => {
    const response = await api.get('/settings/firm');
    return response.data;
  },

  updateFirmSettings: async (data: Partial<FirmSettings>): Promise<FirmSettings> => {
    const response = await api.put('/settings/firm', data);
    return response.data.settings;
  },

  getBranding: async (): Promise<Branding> => {
    const response = await api.get('/settings/firm/branding');
    return response.data;
  },

  updateBranding: async (data: FormData): Promise<Branding> => {
    const response = await api.put('/settings/firm/branding', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.branding;
  },

  // Plan & Billing
  getCurrentPlan: async (): Promise<CurrentPlan> => {
    const response = await api.get('/settings/plan');
    return response.data;
  },

  getAvailablePlans: async (): Promise<Plan[]> => {
    const response = await api.get('/settings/plans');
    return response.data;
  },

  changePlan: async (planCode: string, billingCycle: string): Promise<CurrentPlan> => {
    const response = await api.post(`/settings/plan/change?planCode=${planCode}&billingCycle=${billingCycle}`);
    return response.data.plan;
  },

  cancelSubscription: async (): Promise<CurrentPlan> => {
    const response = await api.post('/settings/plan/cancel');
    return response.data.plan;
  },

  // User Preferences
  getUserPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get('/settings/preferences');
    return response.data;
  },

  updateUserPreferences: async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await api.put('/settings/preferences', data);
    return response.data.preferences;
  },

  // Audit Logs
  getAuditLogs: async (page: number = 1, pageSize: number = 50, action?: string, entityType?: string): Promise<{ logs: AuditLog[]; totalCount: number; page: number; pageSize: number; totalPages: number }> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (action) params.append('action', action);
    if (entityType) params.append('entityType', entityType);
    const response = await api.get(`/settings/audit-logs?${params.toString()}`);
    return response.data;
  },

  // Usage Statistics
  getUsageStatistics: async (): Promise<UsageStatistics> => {
    const response = await api.get('/settings/usage');
    return response.data;
  },
};