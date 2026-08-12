import { TableEntity, Product, Category, CustomerOrder, CustomerOrderItem } from '@/src/lib/db';
import { API_BASE_URL } from '@/src/config/runtime';
import { resolveSelfOrderPaymentMethods, type SelfOrderPaymentMethod } from '@/src/features/self-order/paymentMethods';

export interface GuestSelfOrderPaymentMethod extends SelfOrderPaymentMethod {
  instructions?: string;
  image_url?: string;
}
export interface GuestSelfOrderConfig {
  methods: GuestSelfOrderPaymentMethod[];
  counter_routing: 'review' | 'auto';
}

export interface TableInfo extends TableEntity {
  outlet?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface ProductWithCategory extends Product {
  category?: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface CustomerOrderWithItems extends CustomerOrder {
  items: (CustomerOrderItem & {
    product?: ProductWithCategory;
  })[];
  table?: TableEntity;
}

export type { Category };

// Get table by table ID (for QR code with UUID)
export async function getTableById(tableId: string): Promise<TableInfo | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/self-order/tables/id/${tableId}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching table by ID:', error);
    return null;
  }
}

// Get table by table number (for QR code validation)
export async function getTableByNumber(tableNumber: string): Promise<TableInfo | null> {
  try {
    // URL encode the table number to handle spaces and special characters
    const encodedTableNumber = encodeURIComponent(tableNumber);
    const response = await fetch(`${API_BASE_URL}/api/tables?table_number=${encodedTableNumber}`);
    if (!response.ok) {
      return null;
    }
    const tables = await response.json();
    // Return the first table if found, null otherwise
    return tables && tables.length > 0 ? tables[0] : null;
  } catch (error) {
    console.error('Error fetching table:', error);
    return null;
  }
}

// Get products for self-order
export async function getSelfOrderProducts(outletId?: string, categoryId?: string): Promise<ProductWithCategory[]> {
  try {
    const params = new URLSearchParams();
    if (outletId) params.append('outlet_id', outletId);
    if (categoryId) params.append('category_id', categoryId);

    const response = await fetch(`${API_BASE_URL}/api/self-order/products?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Get categories for self-order
export async function getSelfOrderCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/self-order/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Which payment methods the guest may choose from — reads AppSettings (public GET,
// no auth needed) and resolves it through the same catalog the server validates
// against, so an unknown/stale id in settings can't reach the picker UI.
// Falls back to the pay-at-cashier default on any fetch failure — a guest must
// always have a way to order even if the settings call is unreachable.
export async function getSelfOrderConfig(): Promise<GuestSelfOrderConfig> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/self-order/config`);
    if (!response.ok) {
      return { methods: resolveSelfOrderPaymentMethods(undefined), counter_routing: 'review' };
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching self-order config:', error);
    return { methods: resolveSelfOrderPaymentMethods(undefined), counter_routing: 'review' };
  }
}

// Create customer order. `orderId` should be generated once by the caller and
// reused across retries of the *same* submit attempt (not a fresh id per call) —
// the server recognizes a repeated id as the same request and returns the
// existing order instead of creating a duplicate. See the id-exists check in
// POST /self-order/orders.
export async function createCustomerOrder(
  orderId: string,
  tableId: string,
  customerName: string | undefined,
  paymentMethod: string,
  paymentReference: string | undefined,
  items: Array<{
    product_id: string;
    quantity: number;
    modifiers_applied?: any[];
  }>
): Promise<CustomerOrderWithItems & { routing: 'review' | 'auto' }> {
  const response = await fetch(`${API_BASE_URL}/api/self-order/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: orderId,
      table_id: tableId,
      customer_name: customerName,
      payment_method: paymentMethod,
      payment_reference: paymentReference,
      items,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    // Surface the server's actual reason (e.g. an out-of-stock item, or an
    // outdated payment_method id) instead of a generic failure — this is the
    // order the guest is about to pay for, "something went wrong" isn't enough.
    throw new Error(body?.error || 'Gagal mengirim pesanan');
  }

  return await response.json();
}

// Get customer order by ID
export async function getCustomerOrder(orderId: string): Promise<CustomerOrderWithItems | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/self-order/orders/${orderId}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

// Get customer orders by table
export async function getTableOrders(tableId: string): Promise<CustomerOrderWithItems[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/self-order/tables/${tableId}/orders`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching table orders:', error);
    return [];
  }
}

// Update customer order status — staff only (requires auth); kept for future staff
// UI, not called anywhere yet. Kitchen fulfillment progress lives on the linked
// Order.status once accepted, see POST /self-order/orders/:id/accept.
export async function updateCustomerOrderStatus(
  orderId: string,
  status: 'pending' | 'accepted' | 'cancelled'
): Promise<CustomerOrderWithItems | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/self-order/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update order status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    return null;
  }
}
