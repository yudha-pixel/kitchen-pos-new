import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL } from '@/src/config/runtime';
import { getToken } from '@/src/lib/api';

interface UserPreferences {
  favorites: string[];
  recent: { route: string; title: string; timestamp: string }[];
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    favorites: [],
    recent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error(`Failed to fetch preferences: ${res.status}`);
      const data = await res.json();
      setPreferences({ favorites: data.favorites ?? [], recent: data.recent ?? [] });
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...preferences, ...newPrefs })
      });
      if (!res.ok) throw new Error(`Failed to update preferences: ${res.status}`);
      const data = await res.json();
      setPreferences({ favorites: data.favorites ?? [], recent: data.recent ?? [] });
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  const addFavorite = (route: string) => {
    if (preferences.favorites.length >= 6) return;
    if (!preferences.favorites.includes(route)) {
      updatePreferences({
        favorites: [...preferences.favorites, route]
      });
    }
  };

  const removeFavorite = (route: string) => {
    updatePreferences({
      favorites: preferences.favorites.filter(r => r !== route)
    });
  };

  const reorderFavorites = (favorites: string[]) => {
    updatePreferences({ favorites });
  };

  const addRecent = (route: string, title: string) => {
    const newRecent = [
      { route, title, timestamp: new Date().toISOString() },
      ...preferences.recent.filter(r => r.route !== route)
    ].slice(0, 10);
    updatePreferences({ recent: newRecent });
  };

  const clearRecent = () => {
    updatePreferences({ recent: [] });
  };

  return {
    preferences,
    loading,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    addRecent,
    clearRecent,
    updatePreferences
  };
}
