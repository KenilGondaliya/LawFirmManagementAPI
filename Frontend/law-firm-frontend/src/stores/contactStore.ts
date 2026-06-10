// src/stores/contactStore.ts

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Contact,
  Tag,
  ContactStats,
  ContactAddress,
  ContactPhone,
  ContactEmail,
} from "../types";
import { contactService } from "../services/contact.service";
import toast from "react-hot-toast";

interface ContactState {
  // State
  contacts: Contact[];
  selectedContact: Contact | null;
  tags: Tag[];
  stats: ContactStats | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Pagination
  totalPages: number;
  currentPage: number;
  totalItems: number;

  // Filters
  searchQuery: string;
  filterClient: boolean | null;

  // Contact Types
  contactTypes: any[];
  fetchContactTypes: () => Promise<void>;
  createContactType: (data: {
    name: string;
    description?: string;
    color?: string;
  }) => Promise<any>;
  updateContactType: (id: number, data: any) => Promise<any>;
  deleteContactType: (id: number) => Promise<boolean>;

  // Relationships
  addSpouse: (contactId: number, spouseId: number) => Promise<any>;
  addRelative: (
    contactId: number,
    data: {
      relatedContactId: number;
      relationshipType: string;
      notes?: string;
    },
  ) => Promise<any>;
  removeRelationship: (relationshipId: number) => Promise<boolean>;

  // Bulk Operations
  bulkDeleteContacts: (contactIds: number[]) => Promise<boolean>;
  bulkUpdateTags: (contactIds: number[], tagIds: number[]) => Promise<boolean>;

  // Export/Import
  exportContacts: (format: "csv" | "excel", filters?: any) => Promise<Blob>;
  importContacts: (file: File) => Promise<any>;

  // Merge
  mergeContacts: (
    primaryId: number,
    secondaryIds: number[],
  ) => Promise<Contact | null>;
  findDuplicates: () => Promise<any[]>;

  // Notes
  addNote: (
    contactId: number,
    note: string,
    isPrivate?: boolean,
  ) => Promise<any>;
  getNotes: (contactId: number) => Promise<any[]>;
  deleteNote: (noteId: number) => Promise<boolean>;

  // Actions
  fetchContacts: (params?: {
    search?: string;
    isClient?: boolean;
    page?: number;
  }) => Promise<void>;
  fetchContactById: (id: number) => Promise<void>;
  createContact: (data: any) => Promise<Contact | null>;
  updateContact: (id: number, data: any) => Promise<Contact | null>;
  deleteContact: (id: number) => Promise<boolean>;

  // Address methods
  addAddress: (
    contactId: number,
    address: any,
  ) => Promise<ContactAddress | null>;
  deleteAddress: (addressId: number) => Promise<boolean>;

  // Phone methods
  addPhone: (contactId: number, phone: any) => Promise<ContactPhone | null>;
  deletePhone: (phoneId: number) => Promise<boolean>;

  // Email methods
  addEmail: (contactId: number, email: any) => Promise<ContactEmail | null>;
  deleteEmail: (emailId: number) => Promise<boolean>;

  // Tag methods
  fetchTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag | null>;
  addTagToContact: (contactId: number, tagId: number) => Promise<void>;
  removeTagFromContact: (contactId: number, tagId: number) => Promise<void>;

  // Stats
  fetchStats: () => Promise<void>;

  // UI Actions
  clearSelectedContact: () => void;
  setSearchQuery: (query: string) => void;
  setFilterClient: (filter: boolean | null) => void;
  setCurrentPage: (page: number) => void;
  clearError: () => void;
}

export const useContactStore = create<ContactState>()(
  devtools((set, get) => ({
    // Initial state
    contacts: [],
    selectedContact: null,
    tags: [],
    stats: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    totalItems: 0,
    searchQuery: "",
    filterClient: null,
    contactTypes: [],

    // Fetch all contacts
    fetchContacts: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const search = params?.search ?? get().searchQuery;
        const isClient = params?.isClient ?? get().filterClient ?? undefined;

        const contacts = await contactService.getAllContacts({
          search,
          isClient,
          page: params?.page,
        });
        set({
          contacts,
          isLoading: false,
          totalItems: contacts.length,
        });
      } catch (error: any) {
        console.error("Failed to fetch contacts:", error);
        set({
          isLoading: false,
          error: error.response?.data?.message || "Failed to load contacts",
        });
        toast.error("Failed to load contacts");
      }
    },

    // Fetch single contact
    fetchContactById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const contact = await contactService.getContactById(id);
        set({ selectedContact: contact, isLoading: false });
      } catch (error: any) {
        console.error("Failed to fetch contact:", error);
        set({
          isLoading: false,
          error:
            error.response?.data?.message || "Failed to load contact details",
        });
        toast.error("Failed to load contact details");
      }
    },

    // Create contact
    createContact: async (data) => {
      set({ isSubmitting: true, error: null });
      try {
        const contact = await contactService.createContact(data);
        set((state) => ({
          contacts: [contact, ...state.contacts],
          isSubmitting: false,
        }));
        toast.success("Contact created successfully");
        return contact;
      } catch (error: any) {
        console.error("Failed to create contact:", error);
        set({
          isSubmitting: false,
          error: error.response?.data?.message || "Failed to create contact",
        });
        toast.error(
          error.response?.data?.message || "Failed to create contact",
        );
        return null;
      }
    },

    // Update contact
    updateContact: async (id, data) => {
      set({ isSubmitting: true, error: null });
      try {
        const contact = await contactService.updateContact(id, data);
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? contact : c)),
          selectedContact: contact,
          isSubmitting: false,
        }));
        toast.success("Contact updated successfully");
        return contact;
      } catch (error: any) {
        console.error("Failed to update contact:", error);
        set({
          isSubmitting: false,
          error: error.response?.data?.message || "Failed to update contact",
        });
        toast.error(
          error.response?.data?.message || "Failed to update contact",
        );
        return null;
      }
    },

    // Delete contact
    deleteContact: async (id) => {
      set({ isSubmitting: true, error: null });
      try {
        await contactService.deleteContact(id);
        set((state) => ({
          contacts: state.contacts.filter((c) => c.id !== id),
          selectedContact:
            state.selectedContact?.id === id ? null : state.selectedContact,
          isSubmitting: false,
        }));
        toast.success("Contact deleted successfully");
        return true;
      } catch (error: any) {
        console.error("Failed to delete contact:", error);
        set({
          isSubmitting: false,
          error: error.response?.data?.message || "Failed to delete contact",
        });
        toast.error(
          error.response?.data?.message || "Failed to delete contact",
        );
        return false;
      }
    },

    // Add address
    addAddress: async (contactId, address) => {
      set({ isSubmitting: true });
      try {
        const newAddress = await contactService.addContactAddress(
          contactId,
          address,
        );

        // Update selected contact with new address
        set((state) => {
          if (state.selectedContact) {
            return {
              selectedContact: {
                ...state.selectedContact,
                addresses: [
                  ...(state.selectedContact.addresses || []),
                  newAddress,
                ],
              },
              isSubmitting: false,
            };
          }
          return { isSubmitting: false };
        });

        toast.success("Address added successfully");
        return newAddress;
      } catch (error: any) {
        console.error("Failed to add address:", error);
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to add address");
        return null;
      }
    },

    // Delete address
    deleteAddress: async (addressId) => {
      set({ isSubmitting: true });
      try {
        await contactService.deleteContactAddress(addressId);

        set((state) => {
          if (state.selectedContact) {
            return {
              selectedContact: {
                ...state.selectedContact,
                addresses:
                  state.selectedContact.addresses?.filter(
                    (a) => a.id !== addressId,
                  ) || [],
              },
              isSubmitting: false,
            };
          }
          return { isSubmitting: false };
        });

        toast.success("Address deleted successfully");
        return true;
      } catch (error: any) {
        console.error("Failed to delete address:", error);
        set({ isSubmitting: false });
        toast.error(
          error.response?.data?.message || "Failed to delete address",
        );
        return false;
      }
    },

    // Add phone
    addPhone: async (contactId, phone) => {
      set({ isSubmitting: true });
      try {
        const newPhone = await contactService.addContactPhone(contactId, phone);

        set((state) => {
          if (state.selectedContact) {
            return {
              selectedContact: {
                ...state.selectedContact,
                phones: [...(state.selectedContact.phones || []), newPhone],
              },
              isSubmitting: false,
            };
          }
          return { isSubmitting: false };
        });

        toast.success("Phone added successfully");
        return newPhone;
      } catch (error: any) {
        console.error("Failed to add phone:", error);
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to add phone");
        return null;
      }
    },

    // Delete phone
    deletePhone: async (phoneId) => {
      set({ isSubmitting: true });
      try {
        await contactService.deleteContactPhone(phoneId);

        set((state) => {
          if (state.selectedContact) {
            return {
              selectedContact: {
                ...state.selectedContact,
                phones:
                  state.selectedContact.phones?.filter(
                    (p) => p.id !== phoneId,
                  ) || [],
              },
              isSubmitting: false,
            };
          }
          return { isSubmitting: false };
        });

        toast.success("Phone deleted successfully");
        return true;
      } catch (error: any) {
        console.error("Failed to delete phone:", error);
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to delete phone");
        return false;
      }
    },

    // Add email
    addEmail: async (contactId, email) => {
      set({ isSubmitting: true });
      try {
        const newEmail = await contactService.addContactEmail(contactId, email);

        set((state) => {
          if (state.selectedContact) {
            return {
              selectedContact: {
                ...state.selectedContact,
                emails: [...(state.selectedContact.emails || []), newEmail],
              },
              isSubmitting: false,
            };
          }
          return { isSubmitting: false };
        });

        toast.success("Email added successfully");
        return newEmail;
      } catch (error: any) {
        console.error("Failed to add email:", error);
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to add email");
        return null;
      }
    },

    // Delete email
    deleteEmail: async (emailId) => {
      set({ isSubmitting: true });
      try {
        await contactService.deleteContactEmail(emailId);

        set((state) => {
          if (state.selectedContact) {
            return {
              selectedContact: {
                ...state.selectedContact,
                emails:
                  state.selectedContact.emails?.filter(
                    (e) => e.id !== emailId,
                  ) || [],
              },
              isSubmitting: false,
            };
          }
          return { isSubmitting: false };
        });

        toast.success("Email deleted successfully");
        return true;
      } catch (error: any) {
        console.error("Failed to delete email:", error);
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to delete email");
        return false;
      }
    },

    // Fetch tags
    fetchTags: async () => {
      try {
        const tags = await contactService.getTags();
        set({ tags });
      } catch (error: any) {
        console.error("Failed to fetch tags:", error);
        toast.error("Failed to load tags");
      }
    },

    // Create tag
    createTag: async (name, color) => {
      try {
        const tag = await contactService.createTag({ name, color });
        set((state) => ({ tags: [...state.tags, tag] }));
        toast.success("Tag created successfully");
        // Refresh contacts to show new tag if any contact has it
        await get().fetchContacts();
        return tag;
      } catch (error: any) {
        console.error("Failed to create tag:", error);
        toast.error(error.response?.data?.message || "Failed to create tag");
        return null;
      }
    },

    // Add tag to contact
    addTagToContact: async (contactId, tagId) => {
  console.log('Adding tag:', { contactId, tagId }); // Debug log
  set({ isSubmitting: true });
  try {
    // Call API to add tag
    await contactService.addTagToContact(contactId, tagId);
    console.log('Tag added successfully via API');
    
    // Fetch the updated contact to get the latest tags
    const updatedContact = await contactService.getContactById(contactId);
    console.log('Updated contact with tags:', updatedContact.tags);
    
    // Update both selectedContact and contacts list
    set((state) => ({
      selectedContact: updatedContact,
      contacts: state.contacts.map(c => c.id === contactId ? updatedContact : c),
      isSubmitting: false
    }));
    
    toast.success('Tag added successfully');
  } catch (error: any) {
    console.error('Failed to add tag:', error);
    set({ isSubmitting: false });
    toast.error(error.response?.data?.message || 'Failed to add tag');
  }
},

    // Remove tag from contact
    removeTagFromContact: async (contactId, tagId) => {
      try {
        await contactService.removeTagFromContact(contactId, tagId);
        // Fetch the updated contact to get the latest tags
        const updatedContact = await contactService.getContactById(contactId);
        set((state) => ({
          selectedContact: updatedContact,
          contacts: state.contacts.map((c) =>
            c.id === contactId ? updatedContact : c,
          ),
        }));
        toast.success("Tag removed from contact");
      } catch (error: any) {
        console.error("Failed to remove tag:", error);
        toast.error(error.response?.data?.message || "Failed to remove tag");
      }
    },

    bulkAddTagsToContacts: async (contactIds: number[], tagIds: number[]) => {
      set({ isSubmitting: true });
      try {
        await contactService.bulkAddTagsToContacts(contactIds, tagIds);
        await get().fetchContacts();
        toast.success(`Tags added to ${contactIds.length} contacts`);
        set({ isSubmitting: false });
        return true;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to add tags");
        return false;
      }
    },

    // Contact Types
    fetchContactTypes: async () => {
      try {
        const types = await contactService.getContactTypes();
        set({ contactTypes: types });
      } catch (error) {
        console.error("Failed to fetch contact types:", error);
        toast.error("Failed to load contact types");
      }
    },

    createContactType: async (data) => {
      try {
        const type = await contactService.createContactType(data);
        set((state) => ({ contactTypes: [...state.contactTypes, type] }));
        toast.success("Contact type created successfully");
        return type;
      } catch (error) {
        console.error("Failed to create contact type:", error);
        toast.error("Failed to create contact type");
        return null;
      }
    },

    updateContactType: async (id, data) => {
      try {
        const type = await contactService.updateContactType(id, data);
        set((state) => ({
          contactTypes: state.contactTypes.map((t) => (t.id === id ? type : t)),
        }));
        toast.success("Contact type updated successfully");
        return type;
      } catch (error) {
        console.error("Failed to update contact type:", error);
        toast.error("Failed to update contact type");
        return null;
      }
    },

    deleteContactType: async (id) => {
      try {
        await contactService.deleteContactType(id);
        set((state) => ({
          contactTypes: state.contactTypes.filter((t) => t.id !== id),
        }));
        toast.success("Contact type deleted successfully");
        return true;
      } catch (error) {
        console.error("Failed to delete contact type:", error);
        toast.error("Failed to delete contact type");
        return false;
      }
    },

    // Relationships
    addSpouse: async (contactId, spouseId) => {
      set({ isSubmitting: true });
      try {
        const relationship = await contactService.addSpouse(
          contactId,
          spouseId,
        );
        await get().fetchContactById(contactId);
        toast.success("Spouse added successfully");
        set({ isSubmitting: false });
        return relationship;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to add spouse");
        return null;
      }
    },

    addRelative: async (contactId, data) => {
      set({ isSubmitting: true });
      try {
        const relationship = await contactService.addRelative(contactId, data);
        await get().fetchContactById(contactId);
        toast.success("Relative added successfully");
        set({ isSubmitting: false });
        return relationship;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to add relative");
        return null;
      }
    },

    removeRelationship: async (relationshipId) => {
      set({ isSubmitting: true });
      try {
        await contactService.removeRelationship(relationshipId);
        if (get().selectedContact) {
          await get().fetchContactById(get().selectedContact!.id);
        }
        toast.success("Relationship removed successfully");
        set({ isSubmitting: false });
        return true;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(
          error.response?.data?.message || "Failed to remove relationship",
        );
        return false;
      }
    },

    // Bulk Operations
    bulkDeleteContacts: async (contactIds) => {
      set({ isSubmitting: true });
      try {
        await contactService.bulkDeleteContacts(contactIds);
        await get().fetchContacts();
        toast.success(`${contactIds.length} contacts deleted successfully`);
        set({ isSubmitting: false });
        return true;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(
          error.response?.data?.message || "Failed to delete contacts",
        );
        return false;
      }
    },

    bulkUpdateTags: async (contactIds, tagIds) => {
      set({ isSubmitting: true });
      try {
        await contactService.bulkUpdateTags(contactIds, tagIds);
        await get().fetchContacts();
        toast.success("Tags updated successfully");
        set({ isSubmitting: false });
        return true;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to update tags");
        return false;
      }
    },

    // Export/Import
    exportContacts: async (format, filters) => {
      set({ isLoading: true });
      try {
        const blob = await contactService.exportContacts(format, filters);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts_${new Date().toISOString()}.${format === "csv" ? "csv" : "xlsx"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Contacts exported successfully");
        set({ isLoading: false });
      } catch (error: any) {
        set({ isLoading: false });
        toast.error(
          error.response?.data?.message || "Failed to export contacts",
        );
      }
    },

    importContacts: async (file) => {
      set({ isSubmitting: true });
      try {
        const result = await contactService.importContacts(file);
        await get().fetchContacts();
        toast.success(
          `Imported ${result.imported} of ${result.total} contacts`,
        );
        set({ isSubmitting: false });
        return result;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(
          error.response?.data?.message || "Failed to import contacts",
        );
        return null;
      }
    },

    // Merge
    mergeContacts: async (primaryId, secondaryIds) => {
      set({ isSubmitting: true });
      try {
        const contact = await contactService.mergeContacts(
          primaryId,
          secondaryIds,
        );
        await get().fetchContacts();
        toast.success("Contacts merged successfully");
        set({ isSubmitting: false });
        return contact;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(
          error.response?.data?.message || "Failed to merge contacts",
        );
        return null;
      }
    },

    findDuplicates: async () => {
      set({ isLoading: true });
      try {
        const duplicates = await contactService.findDuplicates();
        set({ isLoading: false });
        return duplicates;
      } catch (error: any) {
        set({ isLoading: false });
        toast.error(
          error.response?.data?.message || "Failed to find duplicates",
        );
        return [];
      }
    },

    // Notes
    addNote: async (contactId, note, isPrivate = false) => {
      set({ isSubmitting: true });
      try {
        const newNote = await contactService.addContactNote(contactId, {
          note,
          isPrivate,
        });
        if (get().selectedContact?.id === contactId) {
          await get().fetchContactById(contactId);
        }
        toast.success("Note added successfully");
        set({ isSubmitting: false });
        return newNote;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to add note");
        return null;
      }
    },

    getNotes: async (contactId) => {
      try {
        const notes = await contactService.getContactNotes(contactId);
        return notes;
      } catch (error: any) {
        console.error("Failed to fetch notes:", error);
        return [];
      }
    },

    deleteNote: async (noteId) => {
      set({ isSubmitting: true });
      try {
        await contactService.deleteContactNote(noteId);
        if (get().selectedContact) {
          await get().fetchContactById(get().selectedContact!.id);
        }
        toast.success("Note deleted successfully");
        set({ isSubmitting: false });
        return true;
      } catch (error: any) {
        set({ isSubmitting: false });
        toast.error(error.response?.data?.message || "Failed to delete note");
        return false;
      }
    },

    // Fetch stats
    fetchStats: async () => {
      try {
        const stats = await contactService.getContactStats();
        set({ stats });
      } catch (error: any) {
        console.error("Failed to fetch stats:", error);
      }
    },

    // UI Actions
    clearSelectedContact: () => {
      set({ selectedContact: null });
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query, currentPage: 1 });
      get().fetchContacts({ search: query });
    },

    setFilterClient: (filter) => {
      set({ filterClient: filter, currentPage: 1 });
      get().fetchContacts({ isClient: filter || undefined });
    },

    setCurrentPage: (page) => {
      set({ currentPage: page });
      get().fetchContacts({ page });
    },

    clearError: () => {
      set({ error: null });
    },
  })),
);
