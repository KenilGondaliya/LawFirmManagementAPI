import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  loading: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  openModal: (content) => set({ modalOpen: true, modalContent: content }),
  closeModal: () => set({ modalOpen: false, modalContent: null }),
  
  setLoading: (loading) => set({ loading }),
}));

export default useUIStore;