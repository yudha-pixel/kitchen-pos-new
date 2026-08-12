import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

export interface TransferWarehouse {
  id: string;
  name: string;
  code: string;
  outlet?: { id: string; name: string };
}

export interface TransferIngredient {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
  min_stock: number;
  unit_price: number;
  warehouse_id: string | null;
}

export interface StockTransferItem {
  id: string;
  transfer_id: string;
  ingredient_id: string;
  quantity: number;
  unit: string;
  ingredient?: TransferIngredient;
}

export type StockTransferStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface StockTransfer {
  id: string;
  transfer_number: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  status: StockTransferStatus;
  requested_by: string;
  approved_by: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  from_warehouse?: TransferWarehouse;
  to_warehouse?: TransferWarehouse;
  items: StockTransferItem[];
}

function authHeaders(json = false): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function getWarehouses(): Promise<TransferWarehouse[]> {
  const res = await fetch(`${API_BASE_URL}/api/warehouses`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal memuat daftar gudang');
  return res.json();
}

export async function getTransferableIngredients(): Promise<TransferIngredient[]> {
  const res = await fetch(`${API_BASE_URL}/api/ingredients`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal memuat daftar bahan baku');
  return res.json();
}

export async function getStockTransfers(filters?: {
  status?: StockTransferStatus | 'all';
  from_warehouse?: string;
  to_warehouse?: string;
}): Promise<StockTransfer[]> {
  const params = new URLSearchParams();
  if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters?.from_warehouse) params.set('from_warehouse', filters.from_warehouse);
  if (filters?.to_warehouse) params.set('to_warehouse', filters.to_warehouse);
  const query = params.toString();
  const res = await fetch(`${API_BASE_URL}/api/stock-transfers${query ? `?${query}` : ''}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Gagal memuat data transfer stok');
  return res.json();
}

export interface CreateStockTransferPayload {
  from_warehouse_id: string;
  to_warehouse_id: string;
  notes?: string;
  items: Array<{ ingredient_id: string; quantity: number; unit: string }>;
}

export async function createStockTransfer(payload: CreateStockTransferPayload): Promise<StockTransfer> {
  const res = await fetch(`${API_BASE_URL}/api/stock-transfers`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === 'string' ? body.error : 'Gagal membuat transfer stok');
  }
  return res.json();
}

export async function updateStockTransferStatus(
  id: string,
  patch: { status?: StockTransferStatus; notes?: string }
): Promise<StockTransfer> {
  const res = await fetch(`${API_BASE_URL}/api/stock-transfers/${id}`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === 'string' ? body.error : 'Gagal memperbarui transfer stok');
  }
  return res.json();
}

export async function deleteStockTransfer(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/stock-transfers/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(typeof body?.error === 'string' ? body.error : 'Gagal menghapus transfer stok');
  }
}
