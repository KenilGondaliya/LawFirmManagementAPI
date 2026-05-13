// src/services/matter.service.ts
import api from './api';
import { Matter, MatterType, PracticeArea, Court, JudicialDistrict, MatterStats } from '../types';

export const matterService = {
  // ==================== Basic CRUD Operations ====================
  
  /**
   * Get all matters with optional filters
   */
  getAllMatters: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    matterTypeId?: number;
    practiceAreaId?: number;
    responsibleAdvocateId?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Matter[]> => {
    const response = await api.get('/matters', { params });
    return response.data;
  },
  
  /**
   * Get matter by ID with all details
   */
  getMatterById: async (id: number): Promise<Matter> => {
    const response = await api.get(`/matters/${id}`);
    return response.data;
  },
  
  /**
   * Create new matter
   */
  createMatter: async (data: {
    matterTypeId: number;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    openDate: string;
    pendingDate?: string;
    statuteOfLimitationsDate?: string;
    estimatedValue?: number;
    billingMethod?: string;
    hourlyRate?: number;
    fixedFee?: number;
    originatingAdvocateId?: number;
    responsibleAdvocateId?: number;
    practiceAreaId?: number;
    courtId?: number;
    judicialDistrictId?: number;
    clientReference?: string;
    isConfidential?: boolean;
    parties?: Array<{
      contactId: number;
      partyType: string;
      roleDescription?: string;
      isPrimary?: boolean;
    }>;
  }): Promise<Matter> => {
    const response = await api.post('/matters', data);
    return response.data;
  },
  
  /**
   * Update existing matter
   */
  updateMatter: async (id: number, data: {
    title?: string;
    description?: string;
    priority?: string;
    estimatedValue?: number;
    billingMethod?: string;
    hourlyRate?: number;
    fixedFee?: number;
    responsibleAdvocateId?: number;
    practiceAreaId?: number;
    clientReference?: string;
    closedDate?: string;
  }): Promise<Matter> => {
    const response = await api.put(`/matters/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete matter (soft delete)
   */
  deleteMatter: async (id: number): Promise<void> => {
    await api.delete(`/matters/${id}`);
  },
  
  /**
   * Update matter status
   */
  updateMatterStatus: async (id: number, status: string): Promise<Matter> => {
    const response = await api.patch(`/matters/${id}/status?status=${status}`);
    return response.data;
  },
  
  // ==================== Matter Types ====================
  
  /**
   * Get all matter types
   */
  getMatterTypes: async (): Promise<MatterType[]> => {
    const response = await api.get('/matters/types');
    return response.data;
  },
  
  /**
   * Get matter type by ID
   */
  getMatterTypeById: async (id: number): Promise<MatterType> => {
    const response = await api.get(`/matters/types/${id}`);
    return response.data;
  },
  
  /**
   * Create matter type
   */
  createMatterType: async (data: {
    name: string;
    category: string;
    description?: string;
  }): Promise<MatterType> => {
    const response = await api.post('/matters/types', data);
    return response.data;
  },
  
  /**
   * Update matter type
   */
  updateMatterType: async (id: number, data: {
    name?: string;
    category?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<MatterType> => {
    const response = await api.put(`/matters/types/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete matter type
   */
  deleteMatterType: async (id: number): Promise<void> => {
    await api.delete(`/matters/types/${id}`);
  },
  
  // ==================== Matter Parties ====================
  
  /**
   * Get all parties for a matter
   */
  getMatterParties: async (matterId: number): Promise<Array<{
    id: number;
    contactId: number;
    contactName: string;
    contactEmail?: string;
    contactPhone?: string;
    partyType: string;
    roleDescription?: string;
    isPrimary: boolean;
    createdAt: string;
  }>> => {
    const response = await api.get(`/matters/${matterId}/parties`);
    return response.data;
  },
  
  /**
   * Add party to matter
   */
  addMatterParty: async (matterId: number, data: {
    contactId: number;
    partyType: string;
    roleDescription?: string;
    isPrimary?: boolean;
  }): Promise<any> => {
    const response = await api.post(`/matters/${matterId}/parties`, data);
    return response.data;
  },
  
  /**
   * Update matter party
   */
  updateMatterParty: async (partyId: number, data: {
    partyType?: string;
    roleDescription?: string;
    isPrimary?: boolean;
  }): Promise<any> => {
    const response = await api.put(`/matters/parties/${partyId}`, data);
    return response.data;
  },
  
  /**
   * Remove party from matter
   */
  removeMatterParty: async (matterId: number, partyId: number): Promise<void> => {
    await api.delete(`/matters/${matterId}/parties/${partyId}`);
  },
  
  // ==================== Matter Notes ====================
  
  /**
   * Get all notes for a matter
   */
  getMatterNotes: async (matterId: number): Promise<Array<{
    id: number;
    note: string;
    isPrivate: boolean;
    userName: string;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await api.get(`/matters/${matterId}/notes`);
    return response.data;
  },
  
  /**
   * Add note to matter
   */
  addMatterNote: async (matterId: number, data: {
    note: string;
    isPrivate?: boolean;
  }): Promise<any> => {
    const response = await api.post(`/matters/${matterId}/notes`, data);
    return response.data;
  },
  
  /**
   * Update matter note
   */
  updateMatterNote: async (noteId: number, data: {
    note: string;
    isPrivate?: boolean;
  }): Promise<any> => {
    const response = await api.put(`/matters/notes/${noteId}`, data);
    return response.data;
  },
  
  /**
   * Delete matter note
   */
  deleteMatterNote: async (noteId: number): Promise<void> => {
    await api.delete(`/matters/notes/${noteId}`);
  },
  
  // ==================== Practice Areas ====================
  
  /**
   * Get all practice areas
   */
  getPracticeAreas: async (): Promise<PracticeArea[]> => {
    const response = await api.get('/matters/practice-areas');
    return response.data;
  },
  
  /**
   * Get practice area by ID
   */
  getPracticeAreaById: async (id: number): Promise<PracticeArea> => {
    const response = await api.get(`/matters/practice-areas/${id}`);
    return response.data;
  },
  
  /**
   * Create practice area
   */
  createPracticeArea: async (data: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<PracticeArea> => {
    const response = await api.post('/matters/practice-areas', data);
    return response.data;
  },
  
  /**
   * Update practice area
   */
  updatePracticeArea: async (id: number, data: {
    name?: string;
    description?: string;
    color?: string;
    isActive?: boolean;
  }): Promise<PracticeArea> => {
    const response = await api.put(`/matters/practice-areas/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete practice area
   */
  deletePracticeArea: async (id: number): Promise<void> => {
    await api.delete(`/matters/practice-areas/${id}`);
  },
  
  // ==================== Courts ====================
  
  /**
   * Get all courts
   */
  getCourts: async (params?: {
    search?: string;
    state?: string;
  }): Promise<Court[]> => {
    const response = await api.get('/matters/courts', { params });
    return response.data;
  },
  
  /**
   * Get court by ID
   */
  getCourtById: async (id: number): Promise<Court> => {
    const response = await api.get(`/matters/courts/${id}`);
    return response.data;
  },
  
  /**
   * Create court
   */
  createCourt: async (data: {
    name: string;
    level?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    email?: string;
  }): Promise<Court> => {
    const response = await api.post('/matters/courts', data);
    return response.data;
  },
  
  /**
   * Update court
   */
  updateCourt: async (id: number, data: {
    name?: string;
    level?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    email?: string;
  }): Promise<Court> => {
    const response = await api.put(`/matters/courts/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete court
   */
  deleteCourt: async (id: number): Promise<void> => {
    await api.delete(`/matters/courts/${id}`);
  },
  
  // ==================== Judicial Districts ====================
  
  /**
   * Get all judicial districts
   */
  getJudicialDistricts: async (params?: {
    search?: string;
    state?: string;
  }): Promise<JudicialDistrict[]> => {
    const response = await api.get('/matters/judicial-districts', { params });
    return response.data;
  },
  
  /**
   * Get judicial district by ID
   */
  getJudicialDistrictById: async (id: number): Promise<JudicialDistrict> => {
    const response = await api.get(`/matters/judicial-districts/${id}`);
    return response.data;
  },
  
  /**
   * Create judicial district
   */
  createJudicialDistrict: async (data: {
    name: string;
    state?: string;
    description?: string;
  }): Promise<JudicialDistrict> => {
    const response = await api.post('/matters/judicial-districts', data);
    return response.data;
  },
  
  /**
   * Update judicial district
   */
  updateJudicialDistrict: async (id: number, data: {
    name?: string;
    state?: string;
    description?: string;
  }): Promise<JudicialDistrict> => {
    const response = await api.put(`/matters/judicial-districts/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete judicial district
   */
  deleteJudicialDistrict: async (id: number): Promise<void> => {
    await api.delete(`/matters/judicial-districts/${id}`);
  },
  
  // ==================== Matter Filters ====================
  
  /**
   * Get matters by status
   */
  getMattersByStatus: async (status: string): Promise<Matter[]> => {
    const response = await api.get(`/matters/status/${status}`);
    return response.data;
  },
  
  /**
   * Get open matters
   */
  getOpenMatters: async (): Promise<Matter[]> => {
    const response = await api.get('/matters/open');
    return response.data;
  },
  
  /**
   * Get pending matters
   */
  getPendingMatters: async (): Promise<Matter[]> => {
    const response = await api.get('/matters/pending');
    return response.data;
  },
  
  /**
   * Get closed matters
   */
  getClosedMatters: async (): Promise<Matter[]> => {
    const response = await api.get('/matters/closed');
    return response.data;
  },
  
  /**
   * Get matters by priority
   */
  getMattersByPriority: async (priority: string): Promise<Matter[]> => {
    const response = await api.get(`/matters/priority/${priority}`);
    return response.data;
  },
  
  /**
   * Get litigation matters
   */
  getLitigationMatters: async (): Promise<Matter[]> => {
    const response = await api.get('/matters/litigation');
    return response.data;
  },
  
  /**
   * Get non-litigation matters
   */
  getNonLitigationMatters: async (): Promise<Matter[]> => {
    const response = await api.get('/matters/non-litigation');
    return response.data;
  },
  
  /**
   * Get matters assigned to user
   */
  getMattersAssignedToUser: async (userId: number): Promise<Matter[]> => {
    const response = await api.get(`/matters/assigned-to/${userId}`);
    return response.data;
  },
  
  /**
   * Get matters by client contact
   */
  getMattersByClient: async (contactId: number): Promise<Matter[]> => {
    const response = await api.get(`/matters/by-client/${contactId}`);
    return response.data;
  },
  
  // ==================== Matter Statistics ====================
  
  /**
   * Get matter statistics
   */
  getMatterStats: async (): Promise<MatterStats> => {
    const response = await api.get('/matters/stats');
    return response.data;
  },
  
  /**
   * Get matter timeline
   */
  getMatterTimeline: async (matterId: number): Promise<Array<{
    id: number;
    activityType: string;
    entityType: string;
    entityId: number;
    entityName: string;
    description: string;
    createdAt: string;
    userName?: string;
  }>> => {
    const response = await api.get(`/matters/${matterId}/timeline`);
    return response.data;
  },
  
  // ==================== Matter Documents ====================
  
  /**
   * Get all documents for a matter
   */
  getMatterDocuments: async (matterId: number): Promise<Array<{
    id: number;
    title: string;
    fileName: string;
    uploadedAt: string;
    fileSize: number;
    documentType?: string;
  }>> => {
    const response = await api.get(`/matters/${matterId}/documents`);
    return response.data;
  },
  
  /**
   * Get all tasks for a matter
   */
  getMatterTasks: async (matterId: number): Promise<Array<{
    id: number;
    title: string;
    dueDate?: string;
    status: string;
    priority: string;
    assignees: string[];
  }>> => {
    const response = await api.get(`/matters/${matterId}/tasks`);
    return response.data;
  },
  
  /**
   * Get all events for a matter
   */
  getMatterEvents: async (matterId: number): Promise<Array<{
    id: number;
    title: string;
    startDateTime: string;
    endDateTime: string;
    location?: string;
    eventType: string;
  }>> => {
    const response = await api.get(`/matters/${matterId}/events`);
    return response.data;
  },
  
  /**
   * Get all bills for a matter
   */
  getMatterBills: async (matterId: number): Promise<Array<{
    id: number;
    billNumber: string;
    totalAmount: number;
    balanceDue: number;
    dueDate: string;
    status: string;
  }>> => {
    const response = await api.get(`/matters/${matterId}/bills`);
    return response.data;
  },
  
  /**
   * Get time entries for a matter
   */
  getTimeEntries: async (matterId: number, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<Array<{
    id: number;
    date: string;
    duration: number;
    description: string;
    billable: boolean;
    billingRate: number;
    total: number;
  }>> => {
    const response = await api.get(`/matters/${matterId}/time-entries`, { params });
    return response.data;
  },
  
  /**
   * Add time entry to matter
   */
  addTimeEntry: async (matterId: number, data: {
    date: string;
    duration: number;
    description: string;
    billable?: boolean;
    billingRate?: number;
  }): Promise<any> => {
    const response = await api.post(`/matters/${matterId}/time-entries`, data);
    return response.data;
  },
  
  /**
   * Update time entry
   */
  updateTimeEntry: async (entryId: number, data: {
    date?: string;
    duration?: number;
    description?: string;
    billable?: boolean;
    billingRate?: number;
  }): Promise<any> => {
    const response = await api.put(`/matters/time-entries/${entryId}`, data);
    return response.data;
  },
  
  /**
   * Delete time entry
   */
  deleteTimeEntry: async (entryId: number): Promise<void> => {
    await api.delete(`/matters/time-entries/${entryId}`);
  },
  
  // ==================== Matter Deadlines ====================
  
  /**
   * Get all deadlines for a matter
   */
  getMatterDeadlines: async (matterId: number): Promise<Array<{
    id: number;
    title: string;
    deadlineDate: string;
    isMet: boolean;
    notes?: string;
  }>> => {
    const response = await api.get(`/matters/${matterId}/deadlines`);
    return response.data;
  },
  
  /**
   * Add deadline to matter
   */
  addDeadline: async (matterId: number, data: {
    title: string;
    deadlineDate: string;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post(`/matters/${matterId}/deadlines`, data);
    return response.data;
  },
  
  /**
   * Mark deadline as met
   */
  markDeadlineAsMet: async (deadlineId: number): Promise<void> => {
    await api.patch(`/matters/deadlines/${deadlineId}/met`);
  },
  
  // ==================== Matter Export/Import ====================
  
  /**
   * Export matters to CSV/Excel
   */
  exportMatters: async (format: 'csv' | 'excel', filters?: {
    status?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> => {
    const response = await api.post('/matters/export', { format, filters }, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Import matters from CSV/Excel
   */
  importMatters: async (file: File): Promise<{
    total: number;
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/matters/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  // ==================== Bulk Operations ====================
  
  /**
   * Bulk update matter status
   */
  bulkUpdateStatus: async (matterIds: number[], status: string): Promise<void> => {
    await api.post('/matters/bulk/status', { matterIds, status });
  },
  
  /**
   * Bulk assign matters to advocate
   */
  bulkAssignAdvocate: async (matterIds: number[], advocateId: number): Promise<void> => {
    await api.post('/matters/bulk/assign', { matterIds, advocateId });
  },
  
  /**
   * Bulk delete matters
   */
  bulkDeleteMatters: async (matterIds: number[]): Promise<void> => {
    await api.post('/matters/bulk/delete', { matterIds });
  },
  
  // ==================== Matter Search ====================
  
  /**
   * Advanced search for matters
   */
  advancedSearch: async (searchParams: {
    title?: string;
    matterNumber?: string;
    status?: string[];
    priority?: string[];
    practiceAreaId?: number[];
    responsibleAdvocateId?: number[];
    clientName?: string;
    openDateFrom?: string;
    openDateTo?: string;
    estimatedValueMin?: number;
    estimatedValueMax?: number;
  }): Promise<Matter[]> => {
    const response = await api.post('/matters/search', searchParams);
    return response.data;
  },
  
  // ==================== Matter Templates ====================
  
  /**
   * Get matter templates
   */
  getMatterTemplates: async (): Promise<Array<{
    id: number;
    name: string;
    description?: string;
    matterTypeId: number;
    practiceAreaId?: number;
    defaultPriority: string;
    templateData: any;
  }>> => {
    const response = await api.get('/matters/templates');
    return response.data;
  },
  
  /**
   * Create matter from template
   */
  createMatterFromTemplate: async (templateId: number, overrides?: {
    title?: string;
    clientId?: number;
    openDate?: string;
  }): Promise<Matter> => {
    const response = await api.post(`/matters/templates/${templateId}/apply`, overrides);
    return response.data;
  },
  
  // ==================== Matter Activity Logs ====================
  
  /**
   * Get activity logs for a matter
   */
  getMatterActivityLogs: async (matterId: number, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<Array<{
    id: number;
    action: string;
    entityType: string;
    entityId: number;
    oldValues?: string;
    newValues?: string;
    userName: string;
    createdAt: string;
  }>> => {
    const response = await api.get(`/matters/${matterId}/activity-logs`, { params });
    return response.data;
  },
  
  // ==================== Matter Follow-ups ====================
  
  /**
   * Get follow-up reminders for matters
   */
  getFollowUps: async (params?: {
    status?: 'pending' | 'completed' | 'overdue';
    assignedTo?: number;
  }): Promise<Array<{
    id: number;
    matterId: number;
    matterTitle: string;
    title: string;
    dueDate: string;
    status: string;
    assignedTo: number;
    assignedToName: string;
    notes?: string;
  }>> => {
    const response = await api.get('/matters/follow-ups', { params });
    return response.data;
  },
  
  /**
   * Create follow-up reminder
   */
  createFollowUp: async (data: {
    matterId: number;
    title: string;
    dueDate: string;
    assignedTo: number;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post('/matters/follow-ups', data);
    return response.data;
  },
  
  /**
   * Complete follow-up
   */
  completeFollowUp: async (followUpId: number): Promise<void> => {
    await api.patch(`/matters/follow-ups/${followUpId}/complete`);
  },
};