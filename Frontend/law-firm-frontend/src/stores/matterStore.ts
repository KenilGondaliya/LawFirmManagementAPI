import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { matterService } from '../services/matter.service';
import toast from 'react-hot-toast';
import {
  Matter,
  MatterStats,
  MatterType,
  PracticeArea,
  MatterTimeline,
  MatterDocument,
  MatterTask,
  MatterEvent,
  MatterBill,
  TimeEntry,
  MatterDeadline,
  CreateMatterData,
  AddMatterParty,
  AddMatterNote,
  AddTimeEntry,
  AddDeadline,
  AdvancedSearchParams,
  BulkUpdateData
} from '../types/matter.types';

interface MatterState {
  matters: Matter[];
  selectedMatter: Matter | null;
  matterTypes: MatterType[];
  practiceAreas: PracticeArea[];
  stats: MatterStats | null;
  timeline: MatterTimeline[];
  documents: MatterDocument[];
  tasks: MatterTask[];
  events: MatterEvent[];
  bills: MatterBill[];
  timeEntries: TimeEntry[];
  deadlines: MatterDeadline[];
  isLoading: boolean;
  totalPages: number;
  currentPage: number;
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  
  fetchMatters: (params?: { status?: string; priority?: string; search?: string; page?: number }) => Promise<void>;
  fetchMatterById: (id: number) => Promise<void>;
  createMatter: (data: CreateMatterData) => Promise<Matter | null>;
  updateMatter: (id: number, data: Partial<CreateMatterData>) => Promise<Matter | null>;
  deleteMatter: (id: number) => Promise<boolean>;
  updateMatterStatus: (id: number, status: string) => Promise<Matter | null>;
  
  fetchMatterTypes: () => Promise<void>;
  createMatterType: (data: { name: string; category: string; description?: string }) => Promise<MatterType | null>;
  updateMatterType: (id: number, data: { name?: string; description?: string; isActive?: boolean }) => Promise<MatterType | null>;
  deleteMatterType: (id: number) => Promise<boolean>;
  
  fetchPracticeAreas: () => Promise<void>;
  createPracticeArea: (data: { name: string; description?: string; color?: string }) => Promise<PracticeArea | null>;
  updatePracticeArea: (id: number, data: { name?: string; description?: string; color?: string; isActive?: boolean }) => Promise<PracticeArea | null>;
  deletePracticeArea: (id: number) => Promise<boolean>;
  
  addMatterParty: (matterId: number, data: AddMatterParty) => Promise<any>;
  removeMatterParty: (matterId: number, partyId: number) => Promise<boolean>;
  
  addMatterNote: (matterId: number, data: AddMatterNote) => Promise<any>;
  updateMatterNote: (noteId: number, data: { note?: string; isPrivate?: boolean }) => Promise<any>;
  deleteMatterNote: (noteId: number) => Promise<boolean>;
  
  fetchTimeEntries: (matterId: number, startDate?: string, endDate?: string) => Promise<void>;
  addTimeEntry: (matterId: number, data: AddTimeEntry) => Promise<TimeEntry | null>;
  updateTimeEntry: (entryId: number, data: Partial<AddTimeEntry>) => Promise<TimeEntry | null>;
  deleteTimeEntry: (entryId: number) => Promise<boolean>;
  
  fetchDeadlines: (matterId: number) => Promise<void>;
  addDeadline: (matterId: number, data: AddDeadline) => Promise<MatterDeadline | null>;
  markDeadlineAsMet: (deadlineId: number) => Promise<boolean>;
  
  fetchMatterDocuments: (matterId: number) => Promise<void>;
  fetchMatterTasks: (matterId: number) => Promise<void>;
  fetchMatterEvents: (matterId: number) => Promise<void>;
  fetchMatterBills: (matterId: number) => Promise<void>;
  fetchMatterTimeline: (matterId: number) => Promise<void>;
  
  fetchStats: () => Promise<void>;
  advancedSearch: (params: AdvancedSearchParams) => Promise<Matter[]>;
  bulkUpdateStatus: (data: BulkUpdateData) => Promise<number>;
  bulkAssignAdvocate: (data: BulkUpdateData) => Promise<number>;
  bulkDeleteMatters: (matterIds: number[]) => Promise<number>;
  
  exportMatters: (format: 'csv' | 'excel', filters?: { status?: string; priority?: string; startDate?: string; endDate?: string }) => Promise<Blob>;
  importMatters: (file: File) => Promise<any>;
  
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setCurrentPage: (page: number) => void;
  clearSelectedMatter: () => void;
  clearFilters: () => void;
}

export const useMatterStore = create<MatterState>()(
  devtools(
    (set, get) => ({
      matters: [],
      selectedMatter: null,
      matterTypes: [],
      practiceAreas: [],
      stats: null,
      timeline: [],
      documents: [],
      tasks: [],
      events: [],
      bills: [],
      timeEntries: [],
      deadlines: [],
      isLoading: false,
      totalPages: 1,
      currentPage: 1,
      searchQuery: '',
      statusFilter: '',
      priorityFilter: '',
      
      fetchMatters: async (params) => {
        set({ isLoading: true });
        try {
          const response = await matterService.getAllMatters({
            ...params,
            search: get().searchQuery || params?.search,
            status: get().statusFilter || params?.status,
            priority: get().priorityFilter || params?.priority,
            page: get().currentPage || params?.page
          });
          set({ 
            matters: response.matters || response,
            totalPages: response.totalPages || 1,
            isLoading: false 
          });
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
          await Promise.all([
            get().fetchMatterDocuments(id),
            get().fetchMatterTasks(id),
            get().fetchMatterEvents(id),
            get().fetchMatterBills(id),
            get().fetchMatterTimeline(id),
            get().fetchTimeEntries(id)
          ]);
        } catch (error) {
          console.error('Failed to fetch matter:', error);
          toast.error('Failed to load matter details');
          set({ isLoading: false });
        }
      },
      
      createMatter: async (data) => {
        set({ isLoading: true });
        try {
          const cleanedData = {
            ...data,
            estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : undefined,
            hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
            fixedFee: data.fixedFee ? Number(data.fixedFee) : undefined,
          };
          
          const matter = await matterService.createMatter(cleanedData);
          set((state) => ({ 
            matters: [matter, ...state.matters],
            isLoading: false 
          }));
          toast.success('Matter created successfully');
          return matter;
        } catch (error: any) {
          console.error('Failed to create matter:', error);
          const errorMessage = error.response?.data?.errors 
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response?.data?.title || 'Failed to create matter';
          toast.error(errorMessage);
          set({ isLoading: false });
          return null;
        }
      },
      
      updateMatter: async (id, data) => {
        set({ isLoading: true });
        try {
          const cleanedData = {
            ...data,
            estimatedValue: data.estimatedValue ? Number(data.estimatedValue) : undefined,
            hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
            fixedFee: data.fixedFee ? Number(data.fixedFee) : undefined,
          };
          
          const matter = await matterService.updateMatter(id, cleanedData);
          set((state) => ({
            matters: state.matters.map((m) => m.id === id ? matter : m),
            selectedMatter: matter,
            isLoading: false
          }));
          toast.success('Matter updated successfully');
          return matter;
        } catch (error: any) {
          console.error('Failed to update matter:', error);
          const errorMessage = error.response?.data?.errors 
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response?.data?.title || 'Failed to update matter';
          toast.error(errorMessage);
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
      
      updateMatterType: async (id, data) => {
        try {
          const type = await matterService.updateMatterType(id, data);
          set((state) => ({
            matterTypes: state.matterTypes.map((t) => t.id === id ? type : t)
          }));
          toast.success('Matter type updated successfully');
          return type;
        } catch (error) {
          console.error('Failed to update matter type:', error);
          toast.error('Failed to update matter type');
          return null;
        }
      },
      
      deleteMatterType: async (id) => {
        try {
          await matterService.deleteMatterType(id);
          set((state) => ({
            matterTypes: state.matterTypes.filter((t) => t.id !== id)
          }));
          toast.success('Matter type deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete matter type:', error);
          toast.error('Failed to delete matter type');
          return false;
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
      
      updatePracticeArea: async (id, data) => {
        try {
          const area = await matterService.updatePracticeArea(id, data);
          set((state) => ({
            practiceAreas: state.practiceAreas.map((a) => a.id === id ? area : a)
          }));
          toast.success('Practice area updated successfully');
          return area;
        } catch (error) {
          console.error('Failed to update practice area:', error);
          toast.error('Failed to update practice area');
          return null;
        }
      },
      
      deletePracticeArea: async (id) => {
        try {
          await matterService.deletePracticeArea(id);
          set((state) => ({
            practiceAreas: state.practiceAreas.filter((a) => a.id !== id)
          }));
          toast.success('Practice area deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete practice area:', error);
          toast.error('Failed to delete practice area');
          return false;
        }
      },
      
      addMatterParty: async (matterId, data) => {
        try {
          const party = await matterService.addMatterParty(matterId, data);
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
      
      updateMatterNote: async (noteId, data) => {
        try {
          const note = await matterService.updateMatterNote(noteId, data);
          const { selectedMatter } = get();
          if (selectedMatter) {
            await get().fetchMatterById(selectedMatter.id);
          }
          toast.success('Note updated successfully');
          return note;
        } catch (error) {
          console.error('Failed to update note:', error);
          toast.error('Failed to update note');
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
      
      fetchTimeEntries: async (matterId, startDate, endDate) => {
        try {
          const entries = await matterService.getTimeEntries(matterId, { startDate, endDate });
          set({ timeEntries: entries });
        } catch (error) {
          console.error('Failed to fetch time entries:', error);
        }
      },
      
      addTimeEntry: async (matterId, data) => {
        try {
          const entry = await matterService.addTimeEntry(matterId, data);
          set((state) => ({ timeEntries: [entry, ...state.timeEntries] }));
          toast.success('Time entry added successfully');
          return entry;
        } catch (error) {
          console.error('Failed to add time entry:', error);
          toast.error('Failed to add time entry');
          return null;
        }
      },
      
      updateTimeEntry: async (entryId, data) => {
        try {
          const entry = await matterService.updateTimeEntry(entryId, data);
          set((state) => ({
            timeEntries: state.timeEntries.map((e) => e.id === entryId ? entry : e)
          }));
          toast.success('Time entry updated successfully');
          return entry;
        } catch (error) {
          console.error('Failed to update time entry:', error);
          toast.error('Failed to update time entry');
          return null;
        }
      },
      
      deleteTimeEntry: async (entryId) => {
        try {
          await matterService.deleteTimeEntry(entryId);
          set((state) => ({
            timeEntries: state.timeEntries.filter((e) => e.id !== entryId)
          }));
          toast.success('Time entry deleted successfully');
          return true;
        } catch (error) {
          console.error('Failed to delete time entry:', error);
          toast.error('Failed to delete time entry');
          return false;
        }
      },
      
      fetchDeadlines: async (matterId) => {
        try {
          const deadlines = await matterService.getMatterDeadlines(matterId);
          set({ deadlines });
        } catch (error) {
          console.error('Failed to fetch deadlines:', error);
        }
      },
      
      addDeadline: async (matterId, data) => {
        try {
          const deadline = await matterService.addDeadline(matterId, data);
          set((state) => ({ deadlines: [...state.deadlines, deadline] }));
          toast.success('Deadline added successfully');
          return deadline;
        } catch (error) {
          console.error('Failed to add deadline:', error);
          toast.error('Failed to add deadline');
          return null;
        }
      },
      
      markDeadlineAsMet: async (deadlineId) => {
        try {
          await matterService.markDeadlineAsMet(deadlineId);
          set((state) => ({
            deadlines: state.deadlines.map((d) => 
              d.id === deadlineId ? { ...d, isMet: true } : d
            )
          }));
          toast.success('Deadline marked as met');
          return true;
        } catch (error) {
          console.error('Failed to mark deadline:', error);
          toast.error('Failed to mark deadline');
          return false;
        }
      },
      
      fetchMatterDocuments: async (matterId) => {
        try {
          const documents = await matterService.getMatterDocuments(matterId);
          set({ documents });
        } catch (error) {
          console.error('Failed to fetch matter documents:', error);
        }
      },
      
      fetchMatterTasks: async (matterId) => {
        try {
          const tasks = await matterService.getMatterTasks(matterId);
          set({ tasks });
        } catch (error) {
          console.error('Failed to fetch matter tasks:', error);
        }
      },
      
      fetchMatterEvents: async (matterId) => {
        try {
          const events = await matterService.getMatterEvents(matterId);
          set({ events });
        } catch (error) {
          console.error('Failed to fetch matter events:', error);
        }
      },
      
      fetchMatterBills: async (matterId) => {
        try {
          const bills = await matterService.getMatterBills(matterId);
          set({ bills });
        } catch (error) {
          console.error('Failed to fetch matter bills:', error);
        }
      },
      
      fetchMatterTimeline: async (matterId) => {
        try {
          const timeline = await matterService.getMatterTimeline(matterId);
          set({ timeline });
        } catch (error) {
          console.error('Failed to fetch matter timeline:', error);
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
      
      advancedSearch: async (params) => {
        set({ isLoading: true });
        try {
          const matters = await matterService.advancedSearch(params);
          set({ matters, isLoading: false });
          return matters;
        } catch (error) {
          console.error('Failed to search matters:', error);
          toast.error('Failed to search matters');
          set({ isLoading: false });
          return [];
        }
      },
      
      bulkUpdateStatus: async (data) => {
        try {
          const result = await matterService.bulkUpdateStatus(data);
          await get().fetchMatters();
          toast.success(`${result.updatedCount} matters updated`);
          return result.updatedCount;
        } catch (error) {
          console.error('Failed to bulk update status:', error);
          toast.error('Failed to update matters');
          return 0;
        }
      },
      
      bulkAssignAdvocate: async (data) => {
        try {
          const result = await matterService.bulkAssignAdvocate(data);
          await get().fetchMatters();
          toast.success(`${result.updatedCount} matters assigned`);
          return result.updatedCount;
        } catch (error) {
          console.error('Failed to bulk assign advocate:', error);
          toast.error('Failed to assign matters');
          return 0;
        }
      },
      
      bulkDeleteMatters: async (matterIds) => {
        try {
          const result = await matterService.bulkDeleteMatters(matterIds);
          await get().fetchMatters();
          toast.success(`${result.deletedCount} matters deleted`);
          return result.deletedCount;
        } catch (error) {
          console.error('Failed to bulk delete matters:', error);
          toast.error('Failed to delete matters');
          return 0;
        }
      },
      
      exportMatters: async (format, filters) => {
        try {
          const blob = await matterService.exportMatters(format, filters);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `matters_export.${format === 'csv' ? 'csv' : 'xlsx'}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('Export started');
          return blob;
        } catch (error) {
          console.error('Failed to export matters:', error);
          toast.error('Failed to export matters');
          throw error;
        }
      },
      
      importMatters: async (file) => {
        try {
          const result = await matterService.importMatters(file);
          await get().fetchMatters();
          toast.success(`Imported ${result.imported} matters`);
          return result;
        } catch (error) {
          console.error('Failed to import matters:', error);
          toast.error('Failed to import matters');
          throw error;
        }
      },
      
      setSearchQuery: (query) => {
        set({ searchQuery: query, currentPage: 1 });
        get().fetchMatters();
      },
      
      setStatusFilter: (status) => {
        set({ statusFilter: status, currentPage: 1 });
        get().fetchMatters();
      },
      
      setPriorityFilter: (priority) => {
        set({ priorityFilter: priority, currentPage: 1 });
        get().fetchMatters();
      },
      
      setCurrentPage: (page) => {
        set({ currentPage: page });
        get().fetchMatters();
      },
      
      clearSelectedMatter: () => {
        set({ 
          selectedMatter: null, 
          timeline: [], 
          documents: [], 
          tasks: [], 
          events: [], 
          bills: [],
          timeEntries: [],
          deadlines: []
        });
      },
      
      clearFilters: () => {
        set({ searchQuery: '', statusFilter: '', priorityFilter: '', currentPage: 1 });
        get().fetchMatters();
      },
    })
  )
);