import { API_BASE_URL } from '../config/runtime';
import type { AuthenticatedUser } from '@/src/types/auth';

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
  const data = await request<{ token: string; user: AuthenticatedUser; permissions: AuthenticatedUser['permissions'] }>(
    'POST',
    '/auth/login',
    body
  );
  setToken(data.token);
  return data;
}

export async function register(body: { username: string; password: string; role?: string }) {
  return request<AuthenticatedUser>('POST', '/auth/register', body);
}

export async function getMe() {
  return request<AuthenticatedUser>('GET', '/auth/me');
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
  recipes?: Array<{ ingredient_id: string; quantity_required: number; unit: string }>;
}) {
  return request<unknown>('POST', '/api/products', data);
}

export async function fetchIngredients() {
  return request<unknown>('GET', '/api/ingredients');
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

// User Profile & Preferences
export async function updateUserProfile(data: { full_name?: string; email?: string | null; phone?: string | null }) {
  return request<{ success: boolean; message: string; user: AuthenticatedUser }>('PATCH', '/api/user/profile', data);
}

export async function changeUserPassword(data: { current_password: string; new_password: string; confirm_password: string }) {
  return request<{ success: boolean; message: string }>('POST', '/api/user/change-password', data);
}

export async function updateUserPin(data: { pin?: string; enabled: boolean }) {
  return request<{ success: boolean; message: string; enabled: boolean }>('POST', '/api/user/pin', data);
}

export async function getUserPreferences() {
  return request<Record<string, any>>('GET', '/api/user/preferences');
}

export async function updateUserPreferences(preferences: Record<string, any>) {
  return request<Record<string, any>>('PUT', '/api/user/preferences', preferences);
}

// User Management (List & CRUD for Settings)
export interface UserRecord {
  id: string;
  username: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  is_active: boolean;
  role_id: string;
  outlet_id?: string | null;
  created_at: string;
  updated_at: string;
  role: { id: string; name: string; description?: string | null };
  outlet?: { id: string; name: string } | null;
}

export async function fetchUsers() {
  return request<UserRecord[]>('GET', '/api/users');
}

export async function createUser(data: {
  username: string;
  password: string;
  full_name?: string;
  email?: string;
  phone?: string;
  role_id?: string;
  outlet_id?: string;
}) {
  return request<UserRecord>('POST', '/api/users', data);
}

export async function updateUser(id: string, data: {
  full_name?: string;
  email?: string;
  phone?: string;
  role_id?: string;
  outlet_id?: string;
  is_active?: boolean;
}) {
  return request<UserRecord>('PATCH', `/api/users/${id}`, data);
}

export async function fetchRoles() {
  return request<Array<{ id: string; name: string; description?: string | null }>>('GET', '/api/roles');
}

export async function fetchOutlets() {
  return request<any[]>('GET', '/api/outlets');
}

export interface SmtpSettingsData {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_email: string;
  smtp_from_name: string;
  smtp_secure: boolean;
}

export async function fetchSmtpSettings() {
  return request<SmtpSettingsData>('GET', '/api/settings/smtp');
}

export async function updateSmtpSettings(data: Partial<SmtpSettingsData>) {
  return request<{ success: boolean; message: string }>('PUT', '/api/settings/smtp', data);
}

export async function testSmtpConnection(data: Partial<SmtpSettingsData> & { test_recipient?: string }) {
  return request<{ success: boolean; message: string }>('POST', '/api/settings/smtp/test', data);
}

export async function sendPasswordResetEmailApi(userId: string) {
  return request<{ success: boolean; message: string }>('POST', '/api/user/send-reset-password', { user_id: userId });
}

// ---------------- EMAIL TEMPLATES & LOGS API ----------------

export interface EmailTemplateRecord {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  subject: string;
  body_html: string;
  body_text?: string | null;
  variables?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLogRecord {
  id: string;
  recipient: string;
  subject: string;
  template_code?: string | null;
  status: 'SENT' | 'FAILED' | 'SIMULATED';
  error_message?: string | null;
  message_id?: string | null;
  sent_at: string;
}

export async function fetchEmailTemplates() {
  return request<EmailTemplateRecord[]>('GET', '/api/email/templates');
}

export async function updateEmailTemplate(id: string, data: Partial<EmailTemplateRecord>) {
  return request<{ success: boolean; message: string; template: EmailTemplateRecord }>('PUT', `/api/email/templates/${id}`, data);
}

export async function resetEmailTemplate(id: string) {
  return request<{ success: boolean; message: string; template: EmailTemplateRecord }>('POST', `/api/email/templates/${id}/reset`);
}

export async function fetchEmailLogs(status?: string, search?: string) {
  const query = new URLSearchParams();
  if (status) query.set('status', status);
  if (search) query.set('search', search);
  return request<EmailLogRecord[]>('GET', `/api/email/logs?${query.toString()}`);
}

export async function resendEmailLog(id: string) {
  return request<{ success: boolean; message: string }>('POST', `/api/email/logs/${id}/resend`);
}


