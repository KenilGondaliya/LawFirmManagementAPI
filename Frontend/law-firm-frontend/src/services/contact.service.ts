// src/services/contact.service.ts - Complete with all APIs

import api from './api';
import { Contact, ContactStats, Tag } from '../types';

export const contactService = {
  // ==================== Basic CRUD Operations ====================
  
  getAllContacts: async (params?: {
    search?: string;
    isClient?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Contact[]> => {
    const response = await api.get('/contacts', { params });
    return response.data;
  },
  
  getContactById: async (id: number): Promise<Contact> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
  
  createContact: async (data: any): Promise<Contact> => {
    const response = await api.post('/contacts', data);
    return response.data.contact || response.data;
  },
  
  updateContact: async (id: number, data: any): Promise<Contact> => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data.contact || response.data;
  },
  
  deleteContact: async (id: number): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
  
  searchContacts: async (query: string): Promise<Contact[]> => {
    const response = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  // ==================== Address Management ====================
  
  getContactAddresses: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/addresses`);
    return response.data;
  },
  
  addContactAddress: async (contactId: number, data: any): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/addresses`, data);
    return response.data.address || response.data;
  },
  
  updateContactAddress: async (addressId: number, data: any): Promise<any> => {
    const response = await api.put(`/contacts/addresses/${addressId}`, data);
    return response.data;
  },
  
  deleteContactAddress: async (addressId: number): Promise<void> => {
    await api.delete(`/contacts/addresses/${addressId}`);
  },
  
  // ==================== Phone Management ====================
  
  getContactPhones: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/phones`);
    return response.data;
  },
  
  addContactPhone: async (contactId: number, data: any): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/phones`, data);
    return response.data.phone || response.data;
  },
  
  updateContactPhone: async (phoneId: number, data: any): Promise<any> => {
    const response = await api.put(`/contacts/phones/${phoneId}`, data);
    return response.data;
  },
  
  deleteContactPhone: async (phoneId: number): Promise<void> => {
    await api.delete(`/contacts/phones/${phoneId}`);
  },
  
  // ==================== Email Management ====================
  
  getContactEmails: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/emails`);
    return response.data;
  },
  
  addContactEmail: async (contactId: number, data: any): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/emails`, data);
    return response.data.email || response.data;
  },
  
  updateContactEmail: async (emailId: number, data: any): Promise<any> => {
    const response = await api.put(`/contacts/emails/${emailId}`, data);
    return response.data;
  },
  
  deleteContactEmail: async (emailId: number): Promise<void> => {
    await api.delete(`/contacts/emails/${emailId}`);
  },
  
  // ==================== Relationship Management ====================
  
  /**
   * Add spouse to contact - POST /api/v1/contacts/{id}/spouse/{spouseId}
   */
  addSpouse: async (contactId: number, spouseContactId: number): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/spouse/${spouseContactId}`);
    return response.data.relationship || response.data;
  },
  
  /**
   * Add relative to contact - POST /api/v1/contacts/{id}/relatives
   */
  addRelative: async (contactId: number, data: {
    relatedContactId: number;
    relationshipType: string;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/relatives`, data);
    return response.data.relationship || response.data;
  },
  
  /**
   * Get all relationships for a contact
   */
  getContactRelationships: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/relationships`);
    return response.data;
  },
  
  /**
   * Remove relationship - DELETE /api/v1/contacts/relationships/{relationshipId}
   */
  removeRelationship: async (relationshipId: number): Promise<void> => {
    await api.delete(`/contacts/relationships/${relationshipId}`);
  },
  
  // ==================== Contact Type Management ====================
  
  /**
   * Get all contact types - GET /api/v1/ContactTypes
   */
  getContactTypes: async (): Promise<Array<{
    id: number;
    name: string;
    description?: string;
    color?: string;
    isSystem: boolean;
    createdAt: string;
  }>> => {
    const response = await api.get('/ContactTypes');
    return response.data;
  },
  
  /**
   * Get contact type by ID
   */
  getContactTypeById: async (typeId: number): Promise<any> => {
    const response = await api.get(`/ContactTypes/${typeId}`);
    return response.data;
  },
  
  /**
   * Create contact type - POST /api/v1/ContactTypes
   */
  createContactType: async (data: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<any> => {
    const response = await api.post('/ContactTypes', data);
    return response.data;
  },
  
  /**
   * Update contact type - PUT /api/v1/ContactTypes/{id}
   */
  updateContactType: async (typeId: number, data: {
    name?: string;
    description?: string;
    color?: string;
  }): Promise<any> => {
    const response = await api.put(`/ContactTypes/${typeId}`, data);
    return response.data;
  },
  
  /**
   * Delete contact type - DELETE /api/v1/ContactTypes/{id}
   */
  deleteContactType: async (typeId: number): Promise<void> => {
    await api.delete(`/ContactTypes/${typeId}`);
  },
  
  // ==================== Tag Management ====================
  
  /**
   * Get all tags - GET /api/v1/contacts/tags
   */
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/contacts/tags');
    return response.data;
  },
  
  getTagById: async (tagId: number): Promise<Tag> => {
    const response = await api.get(`/contacts/tags/${tagId}`);
    return response.data;
  },
  
  /**
   * Create tag - POST /api/v1/contacts/tags
   */
  createTag: async (data: {
    name: string;
    color?: string;
  }): Promise<Tag> => {
    const response = await api.post('/contacts/tags', data);
    return response.data.tag || response.data;
  },
  
  updateTag: async (tagId: number, data: {
    name?: string;
    color?: string;
  }): Promise<Tag> => {
    const response = await api.put(`/contacts/tags/${tagId}`, data);
    return response.data;
  },
  
  deleteTag: async (tagId: number): Promise<void> => {
    await api.delete(`/contacts/tags/${tagId}`);
  },
  
  /**
   * Add tag to contact - POST /api/v1/contacts/{id}/tags/{tagId}
   */
  addTagToContact: async (contactId: number, tagId: number): Promise<void> => {
    await api.post(`/contacts/${contactId}/tags/${tagId}`);
  },
  
  /**
   * Remove tag from contact - DELETE /api/v1/contacts/{id}/tags/{tagId}
   */
  removeTagFromContact: async (contactId: number, tagId: number): Promise<void> => {
    await api.delete(`/contacts/${contactId}/tags/${tagId}`);
  },
  
  /**
   * Get contacts by tag - GET /api/v1/contacts/by-tag/{tagId}
   */
  getContactsByTag: async (tagId: number): Promise<Contact[]> => {
    const response = await api.get(`/contacts/by-tag/${tagId}`);
    return response.data;
  },
  
  getContactTags: async (contactId: number): Promise<Tag[]> => {
    const response = await api.get(`/contacts/${contactId}/tags`);
    return response.data;
  },
  
  // ==================== Contact Dashboard/Related Data ====================
  
  getContactMatters: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/matters`);
    return response.data;
  },
  
  getContactTasks: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/tasks`);
    return response.data;
  },
  
  getContactDocuments: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/documents`);
    return response.data;
  },
  
  getContactCommunications: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/communications`);
    return response.data;
  },
  
  getContactBills: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/bills`);
    return response.data;
  },
  
  // ==================== Statistics ====================
  
  getContactStats: async (): Promise<ContactStats> => {
    const response = await api.get('/contacts/stats');
    return response.data;
  },
  
  getContactTimeline: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/timeline`);
    return response.data;
  },
  
  // ==================== Bulk Operations ====================
  
  bulkDeleteContacts: async (contactIds: number[]): Promise<void> => {
    await api.post('/contacts/bulk-delete', { contactIds });
  },
  
  bulkUpdateTags: async (contactIds: number[], tagIds: number[]): Promise<void> => {
    await api.post('/contacts/bulk-update-tags', { contactIds, tagIds });
  },
  
  exportContacts: async (format: 'csv' | 'excel', filters?: {
    search?: string;
    isClient?: boolean;
    tagIds?: number[];
  }): Promise<Blob> => {
    const response = await api.post('/contacts/export', { format, filters }, {
      responseType: 'blob',
    });
    return response.data;
  },
  
  importContacts: async (file: File): Promise<{
    total: number;
    imported: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/contacts/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  bulkAddTagsToContacts: async (contactIds: number[], tagIds: number[]): Promise<void> => {
  await api.post('/contacts/bulk-add-tags', { contactIds, tagIds });
},

  
  // ==================== Merge Contacts ====================
  
  mergeContacts: async (primaryContactId: number, secondaryContactIds: number[]): Promise<Contact> => {
    const response = await api.post('/contacts/merge', {
      primaryContactId,
      secondaryContactIds,
    });
    return response.data;
  },
  
  findDuplicates: async (): Promise<Array<{
    contacts: Contact[];
    similarityScore: number;
    matchFields: string[];
  }>> => {
    const response = await api.get('/contacts/duplicates');
    return response.data;
  },
  
  // ==================== Notes ====================
  
  addContactNote: async (contactId: number, data: {
    note: string;
    isPrivate?: boolean;
  }): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/notes`, data);
    return response.data;
  },
  
  getContactNotes: async (contactId: number): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/notes`);
    return response.data;
  },
  
  updateContactNote: async (noteId: number, data: {
    note: string;
    isPrivate?: boolean;
  }): Promise<any> => {
    const response = await api.put(`/contacts/notes/${noteId}`, data);
    return response.data;
  },
  
  deleteContactNote: async (noteId: number): Promise<void> => {
    await api.delete(`/contacts/notes/${noteId}`);
  },
  
  // ==================== Activity Logs ====================
  
  getContactActivityLogs: async (contactId: number, params?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any[]> => {
    const response = await api.get(`/contacts/${contactId}/activity-logs`, { params });
    return response.data;
  },
  
  // ==================== Profile Image ====================
  
  uploadProfileImage: async (contactId: number, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/contacts/${contactId}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  removeProfileImage: async (contactId: number): Promise<void> => {
    await api.delete(`/contacts/${contactId}/profile-image`);
  },
};