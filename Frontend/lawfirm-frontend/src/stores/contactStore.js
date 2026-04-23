import { create } from 'zustand';
import { contactService } from '../services/contactService';
import toast from 'react-hot-toast';

const useContactStore = create((set, get) => ({
  contacts: [],
  currentContact: null,
  tags: [],
  stats: null,
  isLoading: false,
  totalPages: 0,
  currentPage: 1,
  searchQuery: '',
  filterClient: null,

  fetchContacts: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { search = get().searchQuery, isClient = get().filterClient, page = get().currentPage } = params;
      const response = await contactService.getContacts({ search, isClient, page });
      
      set({
        contacts: response.items || response,
        totalPages: response.totalPages || 1,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch contacts');
    }
  },

  fetchContactById: async (id) => {
    set({ isLoading: true });
    try {
      const contact = await contactService.getContactById(id);
      set({ currentContact: contact, isLoading: false });
      return contact;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to fetch contact details');
      return null;
    }
  },

  createContact: async (contactData) => {
    set({ isLoading: true });
    try {
      const newContact = await contactService.createContact(contactData);
      set((state) => ({
        contacts: [newContact, ...state.contacts],
        isLoading: false,
      }));
      toast.success('Contact created successfully');
      return newContact;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to create contact');
      return null;
    }
  },

  updateContact: async (id, contactData) => {
    set({ isLoading: true });
    try {
      const updatedContact = await contactService.updateContact(id, contactData);
      set((state) => ({
        contacts: state.contacts.map((c) => (c.id === id ? updatedContact : c)),
        currentContact: updatedContact,
        isLoading: false,
      }));
      toast.success('Contact updated successfully');
      return updatedContact;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to update contact');
      return null;
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true });
    try {
      await contactService.deleteContact(id);
      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
        isLoading: false,
      }));
      toast.success('Contact deleted successfully');
      return true;
    } catch (error) {
      set({ isLoading: false });
      toast.error('Failed to delete contact');
      return false;
    }
  },

  addAddress: async (contactId, addressData) => {
    try {
      const newAddress = await contactService.addAddress(contactId, addressData);
      set((state) => ({
        currentContact: state.currentContact
          ? {
              ...state.currentContact,
              addresses: [...(state.currentContact.addresses || []), newAddress],
            }
          : null,
      }));
      toast.success('Address added successfully');
      return newAddress;
    } catch (error) {
      toast.error('Failed to add address');
      return null;
    }
  },

  deleteAddress: async (addressId) => {
    try {
      await contactService.deleteAddress(addressId);
      set((state) => ({
        currentContact: state.currentContact
          ? {
              ...state.currentContact,
              addresses: (state.currentContact.addresses || []).filter((a) => a.id !== addressId),
            }
          : null,
      }));
      toast.success('Address deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete address');
      return false;
    }
  },

  addPhone: async (contactId, phoneData) => {
    try {
      const newPhone = await contactService.addPhone(contactId, phoneData);
      set((state) => ({
        currentContact: state.currentContact
          ? {
              ...state.currentContact,
              phones: [...(state.currentContact.phones || []), newPhone],
            }
          : null,
      }));
      toast.success('Phone added successfully');
      return newPhone;
    } catch (error) {
      toast.error('Failed to add phone');
      return null;
    }
  },

  deletePhone: async (phoneId) => {
    try {
      await contactService.deletePhone(phoneId);
      set((state) => ({
        currentContact: state.currentContact
          ? {
              ...state.currentContact,
              phones: (state.currentContact.phones || []).filter((p) => p.id !== phoneId),
            }
          : null,
      }));
      toast.success('Phone deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete phone');
      return false;
    }
  },

  addEmail: async (contactId, emailData) => {
    try {
      const newEmail = await contactService.addEmail(contactId, emailData);
      set((state) => ({
        currentContact: state.currentContact
          ? {
              ...state.currentContact,
              emails: [...(state.currentContact.emails || []), newEmail],
            }
          : null,
      }));
      toast.success('Email added successfully');
      return newEmail;
    } catch (error) {
      toast.error('Failed to add email');
      return null;
    }
  },

  deleteEmail: async (emailId) => {
    try {
      await contactService.deleteEmail(emailId);
      set((state) => ({
        currentContact: state.currentContact
          ? {
              ...state.currentContact,
              emails: (state.currentContact.emails || []).filter((e) => e.id !== emailId),
            }
          : null,
      }));
      toast.success('Email deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete email');
      return false;
    }
  },

  fetchTags: async () => {
    try {
      const tags = await contactService.getTags();
      set({ tags });
      return tags;
    } catch (error) {
      toast.error('Failed to fetch tags');
      return [];
    }
  },

  createTag: async (tagData) => {
    try {
      const newTag = await contactService.createTag(tagData);
      set((state) => ({ tags: [...state.tags, newTag] }));
      toast.success('Tag created successfully');
      return newTag;
    } catch (error) {
      toast.error('Failed to create tag');
      return null;
    }
  },

  addTagToContact: async (contactId, tagId) => {
    try {
      await contactService.addTagToContact(contactId, tagId);
      toast.success('Tag added to contact');
      return true;
    } catch (error) {
      toast.error('Failed to add tag');
      return false;
    }
  },

  removeTagFromContact: async (contactId, tagId) => {
    try {
      await contactService.removeTagFromContact(contactId, tagId);
      toast.success('Tag removed from contact');
      return true;
    } catch (error) {
      toast.error('Failed to remove tag');
      return false;
    }
  },

  fetchStats: async () => {
    try {
      const stats = await contactService.getContactStats();
      set({ stats });
      return stats;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return null;
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query, currentPage: 1 }),
  setFilterClient: (filter) => set({ filterClient: filter, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  clearCurrentContact: () => set({ currentContact: null }),
}));

export default useContactStore;