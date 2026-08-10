import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

export interface Voucher {
  id: string;
  code: string;
  name: string;
  discount_type: 'nominal' | 'percentage';
  discount_value: number;
  max_discount?: number;
  minimum_purchase: number;
  quota: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

// Validate a voucher code at checkout; server enforces active/expiry/quota/minimum-purchase
export async function validateVoucher(
  code: string,
  purchaseAmount: number
): Promise<{ valid: boolean; voucher?: Voucher; error?: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/vouchers/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ code, purchaseAmount }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { valid: false, error: body.error || 'Voucher tidak valid' };
    }
    return { valid: true, voucher: body.voucher };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Gagal memvalidasi voucer' };
  }
}

// Increment a voucher's usage count after it's applied to a cart
export async function useVoucher(voucherId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/vouchers/${voucherId}/use`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to use voucher' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to use voucher' };
  }
}
