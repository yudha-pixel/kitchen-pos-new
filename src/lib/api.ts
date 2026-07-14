const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const url = `${API_URL}${path}`;
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
  return request<unknown>('GET', '/categories');
}

export async function fetchProducts(categoryId?: string | null) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  return request<unknown>('GET', `/products${query}`);
}

export async function fetchModifiers(productId?: string) {
  const query = productId ? `?productId=${encodeURIComponent(productId)}` : '';
  return request<unknown>('GET', `/modifiers${query}`);
}

export async function updateProduct(id: string, data: unknown) {
  return request<unknown>('PATCH', `/products/${id}`, data);
}

// Orders
export async function fetchOrders(cashierId?: string | null, status?: string | null) {
  const params = new URLSearchParams();
  if (cashierId) params.append('cashierId', cashierId);
  if (status) params.append('status', status);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request<unknown>('GET', `/orders${query}`);
}

export async function fetchOrderItems(orderId: string) {
  return request<unknown>('GET', `/orders/${orderId}/items`);
}

export async function createOrder(order: unknown, items: unknown[]) {
  return request<unknown>('POST', '/orders', { order, items });
}

export async function updateOrderStatus(id: string, status: string) {
  return request<unknown>('PATCH', `/orders/${id}/status`, { status });
}

export async function createOrderItems(items: unknown[]) {
  return request<{ success: boolean }>('POST', '/order-items', { items });
}

export async function createVoidLogs(voidLogs: unknown[]) {
  return request<{ success: boolean }>('POST', '/void-logs', { voidLogs });
}

export async function mergeTable(sourceTable: string, targetTable: string) {
  return request<{ success: boolean }>('POST', '/orders/merge-table', { sourceTable, targetTable });
}

export async function healthCheck() {
  return request<{ status: string }>('GET', '/health');
}
