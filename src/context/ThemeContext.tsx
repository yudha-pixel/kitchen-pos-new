'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AppSettings {
  id: string;
  primary_color: string;
  theme_mode: string;
  card_style: string;
  layout_density: string;
  card_view: string;
  cart_position: string;
  created_at: string;
  updated_at: string;
}

interface ThemeContextType {
  settings: AppSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  forceApplyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      console.log('Applying theme settings:', settings);
      
      // Apply theme mode to document
      if (settings.theme_mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Apply primary color as CSS variable
      const colorMap: Record<string, string> = {
        blue: '59 130 246',
        emerald: '16 185 129',
        violet: '139 92 246',
        amber: '245 158 11',
        rose: '244 63 94',
        slate: '71 85 105',
      };
      const rgbColor = colorMap[settings.primary_color] || colorMap.blue;
      document.documentElement.style.setProperty('--primary-rgb', rgbColor);
      console.log('Set --primary-rgb to:', rgbColor);

      // Apply card style as CSS variable
      const cardRadius = settings.card_style === 'rounded' ? '0.5rem' : '0';
      document.documentElement.style.setProperty('--card-radius', cardRadius);
      console.log('Set --card-radius to:', cardRadius);

      // Apply layout density as CSS variable
      const spacing = settings.layout_density === 'compact' ? '0.5rem' : '1rem';
      document.documentElement.style.setProperty('--layout-spacing', spacing);
      console.log('Set --layout-spacing to:', spacing);

      // Apply card view as CSS variable and data attribute
      document.documentElement.style.setProperty('--card-view', settings.card_view);
      document.documentElement.setAttribute('data-card-view', settings.card_view);
      console.log('Set --card-view to:', settings.card_view);

      // Apply cart position as CSS variable and data attribute
      document.documentElement.style.setProperty('--cart-position', settings.cart_position);
      document.documentElement.setAttribute('data-cart-position', settings.cart_position);
      console.log('Set --cart-position to:', settings.cart_position);
    }
  }, [settings]);

  const refreshSettings = async () => {
    console.log('Refreshing settings...');
    setLoading(true);
    await fetchSettings();
    console.log('Settings refreshed');
  };

  const forceApplyTheme = () => {
    if (settings) {
      console.log('Force applying theme settings:', settings);
      
      // Apply theme mode to document
      if (settings.theme_mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Apply primary color as CSS variable
      const colorMap: Record<string, string> = {
        blue: '59 130 246',
        emerald: '16 185 129',
        violet: '139 92 246',
        amber: '245 158 11',
        rose: '244 63 94',
        slate: '71 85 105',
      };
      const rgbColor = colorMap[settings.primary_color] || colorMap.blue;
      document.documentElement.style.setProperty('--primary-rgb', rgbColor);
      console.log('Force set --primary-rgb to:', rgbColor);

      // Apply card style as CSS variable
      const cardRadius = settings.card_style === 'rounded' ? '0.5rem' : '0';
      document.documentElement.style.setProperty('--card-radius', cardRadius);
      console.log('Force set --card-radius to:', cardRadius);

      // Apply layout density as CSS variable
      const spacing = settings.layout_density === 'compact' ? '0.5rem' : '1rem';
      document.documentElement.style.setProperty('--layout-spacing', spacing);
      console.log('Force set --layout-spacing to:', spacing);

      // Apply card view as CSS variable and data attribute
      document.documentElement.style.setProperty('--card-view', settings.card_view);
      document.documentElement.setAttribute('data-card-view', settings.card_view);
      console.log('Force set --card-view to:', settings.card_view);

      // Apply cart position as CSS variable and data attribute
      document.documentElement.style.setProperty('--cart-position', settings.cart_position);
      document.documentElement.setAttribute('data-cart-position', settings.cart_position);
      console.log('Force set --cart-position to:', settings.cart_position);
    }
  };

  return (
    <ThemeContext.Provider value={{ settings, loading, refreshSettings, forceApplyTheme }}>
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
