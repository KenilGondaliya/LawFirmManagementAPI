// src/stores/matterStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { matterService } from '../services/matter.service';
import toast from 'react-hot-toast';
import { Matter, MatterStats, MatterType, PracticeArea } from '../types';

interface MatterState {
  matters: Matter[];
  selectedMatter: Matter | null;
  matterTypes: MatterType[];
  practiceAreas: PracticeArea[];
  stats: MatterStats | null;
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  
  // Actions
  fetchMatters: (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
  }) => Promise<void>;
  fetchMatterById: (id: number) => Promise<void>;
  createMatter: (data: any) => Promise<Matter | null>;
  updateMatter: (id: number, data: any) => Promise<Matter | null>;
  deleteMatter: (id: number) => Promise<boolean>;
  updateMatterStatus: (id: number, status: string) => Promise<Matter | null>;
  fetchMatterTypes: () => Promise<void>;
  createMatterType: (data: any) => Promise<MatterType | null>;
  fetchPracticeAreas: () => Promise<void>;
  createPracticeArea: (data: any) => Promise<PracticeArea | null>;
  fetchStats: () => Promise<void>;
  addMatterParty: (matterId: number, data: any) => Promise<any>;
  removeMatterParty: (matterId: number, partyId: number) => Promise<boolean>;
  addMatterNote: (matterId: number, data: any) => Promise<any>;
  deleteMatterNote: (noteId: number) => Promise<boolean>;
  clearSelectedMatter: () => void;
  setCurrentPage: (page: number) => void;
}

export const useMatterStore = create<MatterState>()(
  devtools(
    (set, get) => ({
      matters: [],
      selectedMatter: null,
      matterTypes: [],
      practiceAreas: [],
      stats: null,
      isLoading: false,
      totalPages: 1,
      currentPage: 1,
      
      fetchMatters: async (params) => {
        set({ isLoading: true });
        try {
          const matters = await matterService.getAllMatters(params);
          set({ matters, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch matters:', error);
          toast.error('Failed to load matters');
          set({ isLoading: false });
        }
      },
      
      fetchMatterById: async (id) => {
        set({ isLoading: true });
        try {
          const matter = await matterService.getMatterById(id);
          set({ selectedMatter: matter, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch matter:', error);
          toast.error('Failed to load matter details');
          set({ isLoading: false });
        }
      },
      
      createMatter: async (data) => {
        set({ isLoading: true });
        try {
          const matter = await matterService.createMatter(data);
          set((state) => ({ 
            matters: [matter, ...state.matters],
            isLoading: false 
          }));
          toast.success('Matter created successfully');
          return matter;
        } catch (error) {
          console.error('Failed to create matter:', error);
          toast.error('Failed to create matter');
          set({ isLoading: false });
          return null;
        }
      },
      
      updateMatter: async (id, data) => {
        set({ isLoading: true });
        try {
          const matter = await matterService.updateMatter(id, data);
          set((state) => ({
            matters: state.matters.map((m) => m.id === id ? matter : m),
            selectedMatter: matter,
            isLoading: false
          }));
          toast.success('Matter updated successfully');
          return matter;
        } catch (error) {
          console.error('Failed to update matter:', error);
          toast.error('Failed to update matter');
          set({ isLoading: false });
          return null;
        }
      },
      
      deleteMatter: async (id) => {
        set({ isLoading: true });
        try {
          await matterService.deleteMatter(id);
          set((state) => ({
            matters: state.matters.filter((m) => m.id !== id),
            selectedMatter: state.selectedMatter?.id === id ? null : state.selectedMatter,
            isLoading: false
          }));
          toast.success('Matter deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete matter:', error);
          toast.error('Failed to delete matter');
          set({ isLoading: false });
          return false;
        }
      },
      
      updateMatterStatus: async (id, status) => {
        set({ isLoading: true });
        try {
          const matter = await matterService.updateMatterStatus(id, status);
          set((state) => ({
            matters: state.matters.map((m) => m.id === id ? matter : m),
            selectedMatter: matter,
            isLoading: false
          }));
          toast.success(`Matter status updated to ${status}`);
          return matter;
        } catch (error) {
          console.error('Failed to update matter status:', error);
          toast.error('Failed to update matter status');
          set({ isLoading: false });
          return null;
        }
      },
      
      fetchMatterTypes: async () => {
        try {
          const types = await matterService.getMatterTypes();
          set({ matterTypes: types });
        } catch (error) {
          console.error('Failed to fetch matter types:', error);
        }
      },
      
      createMatterType: async (data) => {
        try {
          const type = await matterService.createMatterType(data);
          set((state) => ({ matterTypes: [...state.matterTypes, type] }));
          toast.success('Matter type created successfully');
          return type;
        } catch (error) {
          console.error('Failed to create matter type:', error);
          toast.error('Failed to create matter type');
          return null;
        }
      },
      
      fetchPracticeAreas: async () => {
        try {
          const areas = await matterService.getPracticeAreas();
          set({ practiceAreas: areas });
        } catch (error) {
          console.error('Failed to fetch practice areas:', error);
        }
      },
      
      createPracticeArea: async (data) => {
        try {
          const area = await matterService.createPracticeArea(data);
          set((state) => ({ practiceAreas: [...state.practiceAreas, area] }));
          toast.success('Practice area created successfully');
          return area;
        } catch (error) {
          console.error('Failed to create practice area:', error);
          toast.error('Failed to create practice area');
          return null;
        }
      },
      
      fetchStats: async () => {
        try {
          const stats = await matterService.getMatterStats();
          set({ stats });
        } catch (error) {
          console.error('Failed to fetch matter stats:', error);
        }
      },
      
      addMatterParty: async (matterId, data) => {
        try {
          const party = await matterService.addMatterParty(matterId, data);
          // Refresh matter to get updated parties
          await get().fetchMatterById(matterId);
          toast.success('Party added successfully');
          return party;
        } catch (error) {
          console.error('Failed to add party:', error);
          toast.error('Failed to add party');
          return null;
        }
      },
      
      removeMatterParty: async (matterId, partyId) => {
        try {
          await matterService.removeMatterParty(matterId, partyId);
          await get().fetchMatterById(matterId);
          toast.success('Party removed successfully');
          return true;
        } catch (error) {
          console.error('Failed to remove party:', error);
          toast.error('Failed to remove party');
          return false;
        }
      },
      
      addMatterNote: async (matterId, data) => {
        try {
          const note = await matterService.addMatterNote(matterId, data);
          await get().fetchMatterById(matterId);
          toast.success('Note added successfully');
          return note;
        } catch (error) {
          console.error('Failed to add note:', error);
          toast.error('Failed to add note');
          return null;
        }
      },
      
      deleteMatterNote: async (noteId) => {
        try {
          await matterService.deleteMatterNote(noteId);
          const { selectedMatter } = get();
          if (selectedMatter) {
            await get().fetchMatterById(selectedMatter.id);
          }
          toast.success('Note deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete note:', error);
          toast.error('Failed to delete note');
          return false;
        }
      },
      
      clearSelectedMatter: () => {
        set({ selectedMatter: null });
      },
      
      setCurrentPage: (page) => {
        set({ currentPage: page });
      },
    })
  )
);