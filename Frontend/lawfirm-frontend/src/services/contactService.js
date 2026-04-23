import api from './api';

export const contactService = {
  getContacts: async (params = {}) => {
    const { search, isClient, page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (isClient !== undefined) queryParams.append('isClient', isClient);
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    
    const response = await api.get(`/Contacts?${queryParams}`);
    return response.data;
  },

  getContactById: async (id) => {
    const response = await api.get(`/Contacts/${id}`);
    return response.data;
  },

  createContact: async (data) => {
    const response = await api.post('/Contacts', data);
    return response.data;
  },

  updateContact: async (id, data) => {
    const response = await api.put(`/Contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id) => {
    const response = await api.delete(`/Contacts/${id}`);
    return response.data;
  },

  addAddress: async (contactId, data) => {
    const response = await api.post(`/contacts/${contactId}/addresses`, data);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/contacts/addresses/${addressId}`);
    return response.data;
  },

  addPhone: async (contactId, data) => {
    const response = await api.post(`/contacts/${contactId}/phones`, data);
    return response.data;
  },

  deletePhone: async (phoneId) => {
    const response = await api.delete(`/contacts/phones/${phoneId}`);
    return response.data;
  },

  addEmail: async (contactId, data) => {
    const response = await api.post(`/contacts/${contactId}/emails`, data);
    return response.data;
  },

  deleteEmail: async (emailId) => {
    const response = await api.delete(`/contacts/emails/${emailId}`);
    return response.data;
  },

  addSpouse: async (contactId, spouseContactId) => {
    const response = await api.post(`/contacts/${contactId}/spouse`, { spouseContactId });
    return response.data;
  },

  addRelative: async (contactId, data) => {
    const response = await api.post(`/contacts/${contactId}/relatives`, data);
    return response.data;
  },

  removeRelationship: async (relationshipId) => {
    const response = await api.delete(`/contacts/relationships/${relationshipId}`);
    return response.data;
  },

  getTags: async () => {
    const response = await api.get('/Contacts/tags');
    return response.data;
  },

  createTag: async (data) => {
    const response = await api.post('/Contacts/tags', data);
    return response.data;
  },

  addTagToContact: async (contactId, tagId) => {
    const response = await api.post(`/Contacts/${contactId}/tags/${tagId}`);
    return response.data;
  },

  removeTagFromContact: async (contactId, tagId) => {
    const response = await api.delete(`/Contacts/${contactId}/tags/${tagId}`);
    return response.data;
  },

  getContactMatters: async (contactId) => {
    const response = await api.get(`/contacts/${contactId}/matters`);
    return response.data;
  },

  getContactTasks: async (contactId) => {
    const response = await api.get(`/contacts/${contactId}/tasks`);
    return response.data;
  },

  getContactDocuments: async (contactId) => {
    const response = await api.get(`/contacts/${contactId}/documents`);
    return response.data;
  },

  getContactStats: async () => {
    const response = await api.get('/Contacts/stats');
    return response.data;
  },
};