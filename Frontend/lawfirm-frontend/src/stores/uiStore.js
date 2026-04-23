import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  modalOpen: false,
  modalContent: null,
  modalTitle: null,
  loading: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  openModal: (content, title = null) => {
    console.log('Opening modal with content:', content);
    set({ 
      modalOpen: true, 
      modalContent: content,
      modalTitle: title 
    });
  },
  
  closeModal: () => {
    console.log('Closing modal');
    set({ 
      modalOpen: false, 
      modalContent: null,
      modalTitle: null 
    });
  },
  
  setLoading: (loading) => set({ loading }),
}));

export default useUIStore;