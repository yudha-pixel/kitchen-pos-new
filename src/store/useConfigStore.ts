import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
  taxRate: number; // Percentage (e.g., 10 for 10%)
  serviceChargeRate: number; // Percentage (e.g., 5 for 5%)
  setTaxRate: (rate: number) => void;
  setServiceChargeRate: (rate: number) => void;
  updateFromSettings: (settings: { taxRate: number; serviceCharge: number }) => void;
  getTaxRateAsDecimal: () => number; // Returns 0.1 for 10%
  getServiceChargeRateAsDecimal: () => number; // Returns 0.05 for 5%
}

const defaultConfig = {
  taxRate: 10, // 10%
  serviceChargeRate: 0, // 0%
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      ...defaultConfig,

      setTaxRate: (rate) => set({ taxRate: rate }),

      setServiceChargeRate: (rate) => set({ serviceChargeRate: rate }),

      updateFromSettings: (settings) => set({
        taxRate: settings.taxRate,
        serviceChargeRate: settings.serviceCharge,
      }),

      getTaxRateAsDecimal: () => get().taxRate / 100,

      getServiceChargeRateAsDecimal: () => get().serviceChargeRate / 100,
    }),
    {
      name: 'kitchenpos-config-store',
      // Sync with localStorage key used by Settings page
      onRehydrateStorage: () => (state) => {
        // Try to load from Settings page localStorage key if not already set
        if (state && typeof window !== 'undefined') {
          try {
            const savedStoreSettings = localStorage.getItem('kitchenpos_store_settings');
            if (savedStoreSettings) {
              const parsed = JSON.parse(savedStoreSettings);
              if (parsed.taxRate !== undefined || parsed.serviceCharge !== undefined) {
                state.taxRate = parsed.taxRate ?? defaultConfig.taxRate;
                state.serviceChargeRate = parsed.serviceCharge ?? defaultConfig.serviceChargeRate;
              }
            }
          } catch (error) {
            console.error('Failed to sync config from settings:', error);
          }
        }
      },
    }
  )
);
