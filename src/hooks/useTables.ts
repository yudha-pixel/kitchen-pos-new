import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/src/config/runtime';
import { getToken } from '@/src/lib/api';

export type TableStatus = 'available' | 'occupied' | 'dirty' | 'reserved';

export interface Table {
  id: string;
  table_number: string;
  qr_code: string | null;
  is_active: boolean;
  status: TableStatus;
  outlet_id: string | null;
  created_at: string;
  updated_at: string;
  outlet?: {
    id: string;
    name: string;
    code: string;
  };
  hasActiveOrders?: boolean;
}

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/tables`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch tables (${response.status})`);
      }

      const data = await response.json();
      setTables(data);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Graceful fallback: keep existing tables or empty array
      setTables((prev) => prev.length > 0 ? prev : []);
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, status: TableStatus) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update table status');
      }

      // Update local state
      setTables(prev => prev.map(t =>
        t.id === tableId ? { ...t, status } : t
      ));

      return true;
    } catch (err) {
      console.error('Error updating table status:', err);
      return false;
    }
  };

  return {
    tables,
    loading,
    error,
    refetch: fetchTables,
    updateTableStatus,
  };
}
