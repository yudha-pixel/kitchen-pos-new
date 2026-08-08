import { Outlet } from '@/src/lib/db';
import { getToken } from '@/src/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface OutletWithCounts extends Outlet {
  _count?: {
    profiles: number;
    products: number;
    tables: number;
    orders: number;
  };
}

// Get all outlets
export async function getOutlets(): Promise<OutletWithCounts[]> {
  try {
    console.log('Fetching outlets...');
    const token = getToken();
    const response = await fetch(`${API_BASE}/outlets`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    console.log('Outlets API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to fetch outlets:', response.status, errorData);
      throw new Error(errorData.error || 'Failed to fetch outlets');
    }
    
    const result = await response.json();
    console.log('Outlets fetched successfully:', result.length, 'outlets');
    return result;
  } catch (error) {
    console.error('Error fetching outlets:', error);
    return [];
  }
}

// Get outlet by ID
export async function getOutletById(id: string): Promise<OutletWithCounts | null> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/outlets/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching outlet:', error);
    return null;
  }
}

// Create outlet
export async function createOutlet(data: Omit<Outlet, 'id' | 'created_at' | 'updated_at'>): Promise<Outlet | null> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/outlets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create outlet');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating outlet:', error);
    return null;
  }
}

// Update outlet
export async function updateOutlet(id: string, data: Partial<Omit<Outlet, 'id' | 'created_at' | 'updated_at'>>): Promise<Outlet | null> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/outlets/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update outlet');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating outlet:', error);
    return null;
  }
}

// Delete outlet
export async function deleteOutlet(id: string): Promise<boolean> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE}/outlets/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete outlet');
    }
    return true;
  } catch (error) {
    console.error('Error deleting outlet:', error);
    return false;
  }
}
