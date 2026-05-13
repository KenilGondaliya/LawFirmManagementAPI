// src/services/contact.service.ts
import api from './api';
import { Contact, ContactStats, Tag } from '../types';

export const contactService = {
  // ==================== Basic CRUD Operations ====================
  
  /**
   * Get all contacts with optional filters
   */
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
  
  /**
   * Get contact by ID with all details
   */
  getContactById: async (id: number): Promise<Contact> => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
  
  /**
   * Create new contact
   */
  createContact: async (data: {
    // Basic Info
    contactTypeId?: number;
    prefix?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    suffix?: string;
    nickname?: string;
    
    // Professional
    companyName?: string;
    title?: string;
    department?: string;
    
    // Contact
    email?: string;
    alternativeEmail?: string;
    phone?: string;
    alternativePhone?: string;
    fax?: string;
    website?: string;
    
    // Personal
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    anniversary?: string;
    nationality?: string;
    
    // Legal
    taxId?: string;
    identificationNumber?: string;
    identificationType?: string;
    
    // Flags
    isClient?: boolean;
    isOpponent?: boolean;
    isWitness?: boolean;
    isJudge?: boolean;
    isAdvocate?: boolean;
    isImportant?: boolean;
    
    // Notes
    notes?: string;
    
    // Relationships
    spouseContactId?: number;
    relatives?: Array<{
      relatedContactId: number;
      relationshipType: string;
      notes?: string;
    }>;
    
    // Addresses
    addresses?: Array<{
      addressType: string;
      addressLine1: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      isPrimary: boolean;
    }>;
    
    // Phones
    phones?: Array<{
      phoneType: string;
      phoneNumber: string;
      countryCode?: string;
      extension?: string;
      isPrimary: boolean;
      isWhatsapp: boolean;
    }>;
    
    // Emails
    emails?: Array<{
      emailType: string;
      email: string;
      isPrimary: boolean;
    }>;
    
    // Tags
    tagIds?: number[];
  }): Promise<Contact> => {
    const response = await api.post('/contacts', data);
    return response.data;
  },
  
  /**
   * Update existing contact
   */
  updateContact: async (id: number, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    title?: string;
    department?: string;
    isClient?: boolean;
    isOpponent?: boolean;
    isImportant?: boolean;
    notes?: string;
    dateOfBirth?: string;
    maritalStatus?: string;
  }): Promise<Contact> => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },
  
  /**
   * Delete contact (soft delete)
   */
  deleteContact: async (id: number): Promise<void> => {
    await api.delete(`/contacts/${id}`);
  },
  
  /**
   * Search contacts by query string
   */
  searchContacts: async (query: string): Promise<Contact[]> => {
    const response = await api.get(`/contacts/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  // ==================== Address Management ====================
  
  /**
   * Get all addresses for a contact
   */
  getContactAddresses: async (contactId: number): Promise<Array<{
    id: number;
    addressType: string;
    addressLine1: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isPrimary: boolean;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/addresses`);
    return response.data;
  },
  
  /**
   * Add address to contact
   */
  addContactAddress: async (contactId: number, data: {
    addressType: string;
    addressLine1: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isPrimary: boolean;
  }): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/addresses`, data);
    return response.data;
  },
  
  /**
   * Update contact address
   */
  updateContactAddress: async (addressId: number, data: {
    addressType?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isPrimary?: boolean;
  }): Promise<any> => {
    const response = await api.put(`/contacts/addresses/${addressId}`, data);
    return response.data;
  },
  
  /**
   * Delete contact address
   */
  deleteContactAddress: async (addressId: number): Promise<void> => {
    await api.delete(`/contacts/addresses/${addressId}`);
  },
  
  // ==================== Phone Management ====================
  
  /**
   * Get all phone numbers for a contact
   */
  getContactPhones: async (contactId: number): Promise<Array<{
    id: number;
    phoneType: string;
    phoneNumber: string;
    countryCode?: string;
    extension?: string;
    isPrimary: boolean;
    isWhatsapp: boolean;
    createdAt: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/phones`);
    return response.data;
  },
  
  /**
   * Add phone number to contact
   */
  addContactPhone: async (contactId: number, data: {
    phoneType: string;
    phoneNumber: string;
    countryCode?: string;
    extension?: string;
    isPrimary: boolean;
    isWhatsapp: boolean;
  }): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/phones`, data);
    return response.data;
  },
  
  /**
   * Update contact phone
   */
  updateContactPhone: async (phoneId: number, data: {
    phoneType?: string;
    phoneNumber?: string;
    countryCode?: string;
    extension?: string;
    isPrimary?: boolean;
    isWhatsapp?: boolean;
  }): Promise<any> => {
    const response = await api.put(`/contacts/phones/${phoneId}`, data);
    return response.data;
  },
  
  /**
   * Delete contact phone
   */
  deleteContactPhone: async (phoneId: number): Promise<void> => {
    await api.delete(`/contacts/phones/${phoneId}`);
  },
  
  // ==================== Email Management ====================
  
  /**
   * Get all emails for a contact
   */
  getContactEmails: async (contactId: number): Promise<Array<{
    id: number;
    emailType: string;
    email: string;
    isPrimary: boolean;
    createdAt: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/emails`);
    return response.data;
  },
  
  /**
   * Add email to contact
   */
  addContactEmail: async (contactId: number, data: {
    emailType: string;
    email: string;
    isPrimary: boolean;
  }): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/emails`, data);
    return response.data;
  },
  
  /**
   * Update contact email
   */
  updateContactEmail: async (emailId: number, data: {
    emailType?: string;
    email?: string;
    isPrimary?: boolean;
  }): Promise<any> => {
    const response = await api.put(`/contacts/emails/${emailId}`, data);
    return response.data;
  },
  
  /**
   * Delete contact email
   */
  deleteContactEmail: async (emailId: number): Promise<void> => {
    await api.delete(`/contacts/emails/${emailId}`);
  },
  
  // ==================== Relationship Management ====================
  
  /**
   * Add spouse to contact
   */
  addSpouse: async (contactId: number, spouseContactId: number): Promise<{
    id: number;
    relatedContactId: number;
    relationshipType: string;
    notes?: string;
  }> => {
    const response = await api.post(`/contacts/${contactId}/spouse/${spouseContactId}`);
    return response.data;
  },
  
  /**
   * Add relative to contact
   */
  addRelative: async (contactId: number, data: {
    relatedContactId: number;
    relationshipType: string;
    notes?: string;
  }): Promise<any> => {
    const response = await api.post(`/contacts/${contactId}/relatives`, data);
    return response.data;
  },
  
  /**
   * Get all relationships for a contact
   */
  getContactRelationships: async (contactId: number): Promise<Array<{
    id: number;
    relatedContactId: number;
    relatedContactName: string;
    relationshipType: string;
    notes?: string;
    createdAt: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/relationships`);
    return response.data;
  },
  
  /**
   * Remove relationship
   */
  removeRelationship: async (relationshipId: number): Promise<void> => {
    await api.delete(`/contacts/relationships/${relationshipId}`);
  },
  
  // ==================== Tag Management ====================
  
  /**
   * Get all tags for the firm
   */
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get('/contacts/tags');
    return response.data;
  },
  
  /**
   * Get tag by ID
   */
  getTagById: async (tagId: number): Promise<Tag> => {
    const response = await api.get(`/contacts/tags/${tagId}`);
    return response.data;
  },
  
  /**
   * Create new tag
   */
  createTag: async (data: {
    name: string;
    color?: string;
  }): Promise<Tag> => {
    const response = await api.post('/contacts/tags', data);
    return response.data;
  },
  
  /**
   * Update tag
   */
  updateTag: async (tagId: number, data: {
    name?: string;
    color?: string;
  }): Promise<Tag> => {
    const response = await api.put(`/contacts/tags/${tagId}`, data);
    return response.data;
  },
  
  /**
   * Delete tag
   */
  deleteTag: async (tagId: number): Promise<void> => {
    await api.delete(`/contacts/tags/${tagId}`);
  },
  
  /**
   * Add tag to contact
   */
  addTagToContact: async (contactId: number, tagId: number): Promise<void> => {
    await api.post(`/contacts/${contactId}/tags/${tagId}`);
  },
  
  /**
   * Remove tag from contact
   */
  removeTagFromContact: async (contactId: number, tagId: number): Promise<void> => {
    await api.delete(`/contacts/${contactId}/tags/${tagId}`);
  },
  
  /**
   * Get contacts by tag
   */
  getContactsByTag: async (tagId: number): Promise<Contact[]> => {
    const response = await api.get(`/contacts/by-tag/${tagId}`);
    return response.data;
  },
  
  /**
   * Get all tags for a contact
   */
  getContactTags: async (contactId: number): Promise<Tag[]> => {
    const response = await api.get(`/contacts/${contactId}/tags`);
    return response.data;
  },
  
  // ==================== Contact Type Management ====================
  
  /**
   * Get all contact types
   */
  getContactTypes: async (): Promise<Array<{
    id: number;
    name: string;
    description?: string;
    color?: string;
    isSystem: boolean;
  }>> => {
    const response = await api.get('/contacts/types');
    return response.data;
  },
  
  /**
   * Create contact type
   */
  createContactType: async (data: {
    name: string;
    description?: string;
    color?: string;
  }): Promise<any> => {
    const response = await api.post('/contacts/types', data);
    return response.data;
  },
  
  /**
   * Update contact type
   */
  updateContactType: async (typeId: number, data: {
    name?: string;
    description?: string;
    color?: string;
  }): Promise<any> => {
    const response = await api.put(`/contacts/types/${typeId}`, data);
    return response.data;
  },
  
  /**
   * Delete contact type
   */
  deleteContactType: async (typeId: number): Promise<void> => {
    await api.delete(`/contacts/types/${typeId}`);
  },
  
  // ==================== Contact Dashboard/Related Data ====================
  
  /**
   * Get all matters for a contact (as party)
   */
  getContactMatters: async (contactId: number): Promise<Array<{
    id: number;
    matterNumber: string;
    title: string;
    status: string;
    partyType: string;
    isPrimary: boolean;
    openDate: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/matters`);
    return response.data;
  },
  
  /**
   * Get all tasks for a contact
   */
  getContactTasks: async (contactId: number): Promise<Array<{
    id: number;
    title: string;
    dueDate?: string;
    status?: string;
    priority?: string;
    completedAt?: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/tasks`);
    return response.data;
  },
  
  /**
   * Get all documents for a contact
   */
  getContactDocuments: async (contactId: number): Promise<Array<{
    id: number;
    title: string;
    fileName: string;
    uploadedAt: string;
    fileSize: number;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/documents`);
    return response.data;
  },
  
  /**
   * Get all communications for a contact
   */
  getContactCommunications: async (contactId: number): Promise<Array<{
    id: number;
    subject?: string;
    bodyPreview?: string;
    sentAt?: string;
    senderName?: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/communications`);
    return response.data;
  },
  
  /**
   * Get all bills for a contact
   */
  getContactBills: async (contactId: number): Promise<Array<{
    id: number;
    billNumber: string;
    totalAmount: number;
    balanceDue: number;
    dueDate: string;
    status: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/bills`);
    return response.data;
  },
  
  // ==================== Statistics ====================
  
  /**
   * Get contact statistics for the firm
   */
  getContactStats: async (): Promise<ContactStats> => {
    const response = await api.get('/contacts/stats');
    return response.data;
  },
  
  /**
   * Get contact activity timeline
   */
  getContactTimeline: async (contactId: number): Promise<Array<{
    id: number;
    activityType: string;
    entityType: string;
    entityId: number;
    entityName: string;
    description: string;
    createdAt: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/timeline`);
    return response.data;
  },
  
  // ==================== Bulk Operations ====================
  
  /**
   * Bulk delete contacts
   */
  bulkDeleteContacts: async (contactIds: number[]): Promise<void> => {
    await api.post('/contacts/bulk-delete', { contactIds });
  },
  
  /**
   * Bulk update contact tags
   */
  bulkUpdateTags: async (contactIds: number[], tagIds: number[]): Promise<void> => {
    await api.post('/contacts/bulk-update-tags', { contactIds, tagIds });
  },
  
  /**
   * Export contacts to CSV/Excel
   */
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
  
  /**
   * Import contacts from CSV/Excel
   */
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
  
  // ==================== Merge Contacts ====================
  
  /**
   * Merge duplicate contacts
   */
  mergeContacts: async (primaryContactId: number, secondaryContactIds: number[]): Promise<Contact> => {
    const response = await api.post('/contacts/merge', {
      primaryContactId,
      secondaryContactIds,
    });
    return response.data;
  },
  
  /**
   * Find potential duplicate contacts
   */
  findDuplicates: async (): Promise<Array<{
    contacts: Contact[];
    similarityScore: number;
    matchFields: string[];
  }>> => {
    const response = await api.get('/contacts/duplicates');
    return response.data;
  },
  
  // ==================== Notes ====================
  
  /**
   * Add note to contact
   */
  addContactNote: async (contactId: number, data: {
    note: string;
    isPrivate?: boolean;
  }): Promise<{
    id: number;
    note: string;
    isPrivate: boolean;
    userName: string;
    createdAt: string;
  }> => {
    const response = await api.post(`/contacts/${contactId}/notes`, data);
    return response.data;
  },
  
  /**
   * Get all notes for a contact
   */
  getContactNotes: async (contactId: number): Promise<Array<{
    id: number;
    note: string;
    isPrivate: boolean;
    userName: string;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await api.get(`/contacts/${contactId}/notes`);
    return response.data;
  },
  
  /**
   * Update contact note
   */
  updateContactNote: async (noteId: number, data: {
    note: string;
    isPrivate?: boolean;
  }): Promise<any> => {
    const response = await api.put(`/contacts/notes/${noteId}`, data);
    return response.data;
  },
  
  /**
   * Delete contact note
   */
  deleteContactNote: async (noteId: number): Promise<void> => {
    await api.delete(`/contacts/notes/${noteId}`);
  },
  
  // ==================== Activity Logs ====================
  
  /**
   * Get activity logs for a contact
   */
  getContactActivityLogs: async (contactId: number, params?: {
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
    const response = await api.get(`/contacts/${contactId}/activity-logs`, { params });
    return response.data;
  },
  
  // ==================== Profile Image ====================
  
  /**
   * Upload profile image for contact
   */
  uploadProfileImage: async (contactId: number, file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/contacts/${contactId}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  
  /**
   * Remove profile image
   */
  removeProfileImage: async (contactId: number): Promise<void> => {
    await api.delete(`/contacts/${contactId}/profile-image`);
  },
};