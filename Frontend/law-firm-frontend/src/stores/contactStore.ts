// src/stores/contactStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Contact, Tag, ContactStats } from '../types';
import { contactService } from '../services/contact.service';
import toast from 'react-hot-toast';

interface ContactState {
  contacts: Contact[];
  selectedContact: Contact | null;
  tags: Tag[];
  stats: ContactStats | null;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  
  // Actions
  fetchContacts: (params?: { search?: string; isClient?: boolean; page?: number }) => Promise<void>;
  fetchContactById: (id: number) => Promise<void>;
  createContact: (data: any) => Promise<Contact | null>;
  updateContact: (id: number, data: any) => Promise<Contact | null>;
  deleteContact: (id: number) => Promise<boolean>;
  fetchTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag | null>;
  addTagToContact: (contactId: number, tagId: number) => Promise<void>;
  removeTagFromContact: (contactId: number, tagId: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  clearSelectedContact: () => void;
  setCurrentPage: (page: number) => void;
}

export const useContactStore = create<ContactState>()(
  devtools(
    (set, get) => ({
      contacts: [],
      selectedContact: null,
      tags: [],
      stats: null,
      isLoading: false,
      totalPages: 1,
      currentPage: 1,
      
      fetchContacts: async (params) => {
        set({ isLoading: true });
        try {
          const contacts = await contactService.getAllContacts(params);
          set({ contacts, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch contacts:', error);
          toast.error('Failed to load contacts');
          set({ isLoading: false });
        }
      },
      
      fetchContactById: async (id) => {
        set({ isLoading: true });
        try {
          const contact = await contactService.getContactById(id);
          set({ selectedContact: contact, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch contact:', error);
          toast.error('Failed to load contact details');
          set({ isLoading: false });
        }
      },
      
      createContact: async (data) => {
        set({ isLoading: true });
        try {
          const contact = await contactService.createContact(data);
          set((state) => ({ 
            contacts: [contact, ...state.contacts],
            isLoading: false 
          }));
          toast.success('Contact created successfully');
          return contact;
        } catch (error) {
          console.error('Failed to create contact:', error);
          toast.error('Failed to create contact');
          set({ isLoading: false });
          return null;
        }
      },
      
      updateContact: async (id, data) => {
        set({ isLoading: true });
        try {
          const contact = await contactService.updateContact(id, data);
          set((state) => ({
            contacts: state.contacts.map((c) => c.id === id ? contact : c),
            selectedContact: contact,
            isLoading: false
          }));
          toast.success('Contact updated successfully');
          return contact;
        } catch (error) {
          console.error('Failed to update contact:', error);
          toast.error('Failed to update contact');
          set({ isLoading: false });
          return null;
        }
      },
      
      deleteContact: async (id) => {
        set({ isLoading: true });
        try {
          await contactService.deleteContact(id);
          set((state) => ({
            contacts: state.contacts.filter((c) => c.id !== id),
            selectedContact: state.selectedContact?.id === id ? null : state.selectedContact,
            isLoading: false
          }));
          toast.success('Contact deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete contact:', error);
          toast.error('Failed to delete contact');
          set({ isLoading: false });
          return false;
        }
      },
      
      fetchTags: async () => {
        try {
          const tags = await contactService.getTags();
          set({ tags });
        } catch (error) {
          console.error('Failed to fetch tags:', error);
        }
      },
      
      createTag: async (name, color) => {
        try {
          const tag = await contactService.createTag({ name, color });
          set((state) => ({ tags: [...state.tags, tag] }));
          toast.success('Tag created successfully');
          return tag;
        } catch (error) {
          console.error('Failed to create tag:', error);
          toast.error('Failed to create tag');
          return null;
        }
      },
      
      addTagToContact: async (contactId, tagId) => {
        try {
          await contactService.addTagToContact(contactId, tagId);
          // Refresh contact to get updated tags
          await get().fetchContactById(contactId);
          toast.success('Tag added to contact');
        } catch (error) {
          console.error('Failed to add tag:', error);
          toast.error('Failed to add tag');
        }
      },
      
      removeTagFromContact: async (contactId, tagId) => {
        try {
          await contactService.removeTagFromContact(contactId, tagId);
          await get().fetchContactById(contactId);
          toast.success('Tag removed from contact');
        } catch (error) {
          console.error('Failed to remove tag:', error);
          toast.error('Failed to remove tag');
        }
      },
      
      fetchStats: async () => {
        try {
          const stats = await contactService.getContactStats();
          set({ stats });
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        }
      },
      
      clearSelectedContact: () => {
        set({ selectedContact: null });
      },
      
      setCurrentPage: (page) => {
        set({ currentPage: page });
      },
    })
  )
);