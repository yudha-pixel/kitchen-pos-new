import { API_BASE_URL } from '../config/runtime';

const TOKEN_KEY = 'kitchen-pos-token';

export class NetworkError extends Error {
  constructor(message = 'Network error — the local API is unreachable') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type');
    const data = contentType?.includes('application/json') ? await res.json() : null;

    if (!res.ok) {
      throw new ApiError(data?.error || `HTTP ${res.status}`, res.status);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof TypeError) {
      throw new NetworkError();
    }
    throw error;
  }
}

// Auth
export async function login(body: { username: string; password: string }) {
  const data = await request<{ token: string; user: { id: string; username: string; role: 'admin' | 'cashier' } }>(
    'POST',
    '/auth/login',
    body
  );
  setToken(data.token);
  return data;
}

export async function register(body: { username: string; password: string; role?: 'admin' | 'cashier' }) {
  return request<{ id: string; username: string; role: 'admin' | 'cashier' }>('POST', '/auth/register', body);
}

export async function getMe() {
  return request<{ id: string; username: string; role: 'admin' | 'cashier' }>('GET', '/auth/me');
}

// Products
export async function fetchCategories() {
  return request<unknown>('GET', '/api/categories');
}

export async function fetchProducts(categoryId?: string | null) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return request<unknown>('GET', `/api/products${query}`);
}

export async function fetchModifiers(productId?: string) {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  return request<unknown>('GET', `/api/modifiers${query}`);
}

export async function addProduct(data: {
  name: string;
  price: number;
  stock_quantity?: number;
  image_url?: string;
  category_id: string;
  sku?: string;
  description?: string;
  modifier_group_ids?: string[];
}) {
  return request<unknown>('POST', '/api/products', data);
}

export async function updateProduct(id: string, data: unknown) {
  return request<unknown>('PATCH', `/api/products/${id}`, data);
}

export async function updateProductStock(id: string, stockQuantity: number) {
  return request<unknown>('PATCH', `/api/products/${id}`, { stock_quantity: stockQuantity });
}

// Soft delete: the product is deactivated, not removed.
export async function deleteProduct(id: string) {
  return request<{ success: boolean }>('DELETE', `/api/products/${id}`);
}

// Categories
export async function createCategory(data: { name: string; color?: string | null }) {
  return request<unknown>('POST', '/api/categories', data);
}

export async function updateCategory(id: string, data: { name?: string; color?: string | null }) {
  return request<unknown>('PATCH', `/api/categories/${id}`, data);
}

export async function deleteCategory(id: string) {
  return request<{ success: boolean }>('DELETE', `/api/categories/${id}`);
}

// Modifier groups
export async function fetchModifierGroups() {
  return request<unknown>('GET', '/api/modifier-groups');
}

export async function createModifierGroup(data: {
  name: string;
  is_required?: boolean;
  max_selections?: number;
}) {
  return request<unknown>('POST', '/api/modifier-groups', data);
}

export async function updateModifierGroup(
  id: string,
  data: { name?: string; is_required?: boolean; max_selections?: number }
) {
  return request<unknown>('PATCH', `/api/modifier-groups/${id}`, data);
}

export async function deleteModifierGroup(id: string) {
  return request<{ success: boolean }>('DELETE', `/api/modifier-groups/${id}`);
}

// Modifiers CRUD
export async function createModifier(data: {
  name: string;
  price_extra?: number;
  modifier_group_id: string;
}) {
  return request<unknown>('POST', '/api/modifiers', data);
}

export async function updateModifier(
  id: string,
  data: { name?: string; price_extra?: number; modifier_group_id?: string }
) {
  return request<unknown>('PATCH', `/api/modifiers/${id}`, data);
}

export async function deleteModifier(id: string) {
  return request<{ success: boolean }>('DELETE', `/api/modifiers/${id}`);
}

// Orders
export async function fetchOrders(cashierId?: string | null, status?: string | null) {
  const params = new URLSearchParams();
  if (cashierId) params.append('cashierId', cashierId);
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request<unknown>('GET', `/api/orders${query}`);
}

export async function fetchOrderItems(orderId: string) {
  return request<unknown>('GET', `/api/orders/${orderId}/items`);
}

export async function fetchOrder(orderId: string) {
  return request<unknown>('GET', `/api/orders/${orderId}`);
}

// Active (pending/preparing) orders with items + product + category in one call,
// used by the Kitchen Display.
export async function fetchActiveOrders() {
  return request<unknown>('GET', '/api/orders/active');
}

export async function createOrder(order: unknown, items: unknown[]) {
  return request<unknown>('POST', '/api/orders', { order, items });
}

export async function updateOrderStatus(id: string, status: string) {
  return request<unknown>('PATCH', `/api/orders/${id}/status`, { status });
}

export async function updateOrderItemStatus(id: string, status: string) {
  return request<unknown>('PATCH', `/api/order-items/${id}/status`, { status });
}

export async function createOrderItems(items: unknown[]) {
  return request<{ success: boolean }>('POST', '/api/order-items', { items });
}

export async function createVoidLogs(voidLogs: unknown[]) {
  return request<{ success: boolean }>('POST', '/api/void-logs', { voidLogs });
}

export async function mergeTable(sourceTable: string, targetTable: string) {
  return request<{ success: boolean }>('POST', '/api/orders/merge-table', { sourceTable, targetTable });
}

export async function healthCheck() {
  return request<{ status: string }>('GET', '/health');
}

// Printers
export async function fetchPrinters() {
  return request<unknown>('GET', '/api/printers');
}

export async function fetchPrintersForCategory(categoryId: string) {
  return request<unknown>('GET', `/api/printers/category/${categoryId}`);
}

export async function createPrinter(data: {
  name: string;
  type: 'kitchen' | 'bar' | 'receipt';
  ip_address?: string;
  port?: number;
}) {
  return request<unknown>('POST', '/api/printers', data);
}

export async function updatePrinter(id: string, data: {
  name?: string;
  type?: 'kitchen' | 'bar' | 'receipt';
  ip_address?: string;
  port?: number;
  is_active?: boolean;
}) {
  return request<unknown>('PATCH', `/api/printers/${id}`, data);
}

export async function deletePrinter(id: string) {
  return request<unknown>('DELETE', `/api/printers/${id}`);
}

export async function routeCategoryToPrinter(categoryId: string, printerId: string) {
  return request<unknown>('POST', '/api/printers/route', { category_id: categoryId, printer_id: printerId });
}

export async function removeCategoryFromPrinter(routeId: string) {
  return request<unknown>('DELETE', `/api/printers/route/${routeId}`);
}

export async function getPrintJobsForOrder(orderId: string) {
  return request<unknown>('GET', `/api/printers/orders/${orderId}/jobs`);
}
