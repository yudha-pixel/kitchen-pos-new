import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Search active customers by name/phone/email (used for member lookup at checkout)
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const token = getToken();
    const params = new URLSearchParams({ search: query, is_active: 'true' });
    const response = await fetch(`${API_BASE_URL}/customers?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to search customers');
    return await response.json();
  } catch (error) {
    console.error('Failed to search customers:', error);
    return [];
  }
}

// Accrue points/spend for a customer after a completed sale; server recomputes tier
export async function addCustomerPoints(
  customerId: string,
  pointsDelta: number,
  totalSpentDelta: number
): Promise<Customer | null> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/customers/${customerId}/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ points: pointsDelta, total_spent: totalSpentDelta }),
    });
    if (!response.ok) throw new Error('Failed to update customer points');
    return await response.json();
  } catch (error) {
    console.error('Failed to update customer points:', error);
    return null;
  }
}
