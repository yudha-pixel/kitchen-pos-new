import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
  taxRate: number; // Percentage (e.g., 10 for 10%)
  serviceChargeRate: number; // Percentage (e.g., 5 for 5%)
  webBaseUrl: string; // Base URL for QR codes (e.g., http://192.168.1.36:3000)
  setTaxRate: (rate: number) => void;
  setServiceChargeRate: (rate: number) => void;
  setWebBaseUrl: (url: string) => void;
  updateFromSettings: (settings: { taxRate: number; serviceCharge: number; webBaseUrl?: string }) => void;
  getTaxRateAsDecimal: () => number; // Returns 0.1 for 10%
  getServiceChargeRateAsDecimal: () => number; // Returns 0.05 for 5%
  getWebBaseUrl: () => string; // Returns the web base URL, with fallback to window.location.origin
}

const defaultConfig = {
  taxRate: 10, // 10%
  serviceChargeRate: 0, // 0%
  webBaseUrl: 'http://localhost:3000', // Default fallback
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      ...defaultConfig,

      setTaxRate: (rate) => set({ taxRate: rate }),

      setServiceChargeRate: (rate) => set({ serviceChargeRate: rate }),

      setWebBaseUrl: (url) => set({ webBaseUrl: url }),

      updateFromSettings: (settings) => set({
        taxRate: settings.taxRate,
        serviceChargeRate: settings.serviceCharge,
        webBaseUrl: settings.webBaseUrl ?? defaultConfig.webBaseUrl,
      }),

      getTaxRateAsDecimal: () => get().taxRate / 100,

      getServiceChargeRateAsDecimal: () => get().serviceChargeRate / 100,

      getWebBaseUrl: () => {
        const configuredUrl = get().webBaseUrl;
        // If configured URL is not localhost, use it. Otherwise fallback to window.location.origin
        if (configuredUrl && !configuredUrl.includes('localhost')) {
          return configuredUrl;
        }
        // Fallback to current origin if not configured or is localhost
        return typeof window !== 'undefined' ? window.location.origin : configuredUrl;
      },
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
              if (parsed.taxRate !== undefined || parsed.serviceCharge !== undefined || parsed.web_base_url !== undefined) {
                state.taxRate = parsed.taxRate ?? defaultConfig.taxRate;
                state.serviceChargeRate = parsed.serviceCharge ?? defaultConfig.serviceChargeRate;
                state.webBaseUrl = parsed.web_base_url ?? defaultConfig.webBaseUrl;
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
