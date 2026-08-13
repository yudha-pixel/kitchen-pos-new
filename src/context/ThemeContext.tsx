'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { API_BASE_URL } from '@/src/config/runtime';
import {
  DEFAULT_APPEARANCE_RECORD,
  type AppearanceSettingsRecord,
  getAppearanceStyleVariables,
  normalizeAppearanceSettings,
} from '@/src/features/settings/settings-resolver';

interface ThemeContextType {
  settings: AppearanceSettingsRecord;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

async function loadAppearanceSettings(): Promise<AppearanceSettingsRecord> {
  const response = await fetch(`${API_BASE_URL}/api/settings/appearance`);
  if (!response.ok) throw new Error(`Appearance settings request failed: ${response.status}`);
  return response.json();
}

function applyAppearanceToDocument(settings: AppearanceSettingsRecord) {
  const visual = normalizeAppearanceSettings(settings);
  const root = document.documentElement;

  root.classList.toggle('dark', visual.colorMode === 'dark');
  root.dataset.density = visual.density;
  root.dataset.cardStyle = visual.cardStyle;
  root.dataset.cardView = settings.card_view;
  root.dataset.cartPosition = settings.cart_position;

  for (const [property, value] of Object.entries(getAppearanceStyleVariables(visual))) {
    root.style.setProperty(property, value);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettingsRecord>(DEFAULT_APPEARANCE_RECORD);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadAppearanceSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch((error) => {
        console.warn('Failed to fetch appearance settings, using defaults:', error);
        if (active) setSettings(DEFAULT_APPEARANCE_RECORD);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applyAppearanceToDocument(settings);
  }, [settings]);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    try {
      setSettings(await loadAppearanceSettings());
    } catch (error) {
      console.warn('Failed to refresh appearance settings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
