import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Outlet } from '@/src/lib/db';
import { getOutlets } from './outletService';

interface OutletState {
  outlets: Outlet[];
  selectedOutletId: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setOutlets: (outlets: Outlet[]) => void;
  setSelectedOutletId: (outletId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadOutlets: () => Promise<void>;
  getSelectedOutlet: () => Outlet | null;
}

export const useOutletStore = create<OutletState>()(
  persist(
    (set, get) => ({
      outlets: [],
      selectedOutletId: null,
      loading: false,
      error: null,

      setOutlets: (outlets) => set({ outlets }),
      
      setSelectedOutletId: (outletId) => set({ selectedOutletId: outletId }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      loadOutlets: async () => {
        set({ loading: true, error: null });
        try {
          const outlets = await getOutlets();
          set({ outlets, loading: false });
        } catch (error) {
          set({ error: 'Gagal memuat outlet', loading: false });
        }
      },
      
      getSelectedOutlet: () => {
        const state = get();
        return state.outlets.find(o => o.id === state.selectedOutletId) || null;
      },
    }),
    {
      name: 'outlet-storage',
      partialize: (state) => ({
        selectedOutletId: state.selectedOutletId,
      }),
    }
  )
);
