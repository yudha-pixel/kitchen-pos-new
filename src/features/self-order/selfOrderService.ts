import { TableEntity, Product, Category, CustomerOrder, CustomerOrderItem } from '@/src/lib/db';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
    const response = await fetch(`${API_BASE}/self-order/tables/id/${tableId}`);
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
    const response = await fetch(`${API_BASE}/self-order/tables/${tableNumber}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
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

    const response = await fetch(`${API_BASE}/self-order/products?${params.toString()}`);
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
    const response = await fetch(`${API_BASE}/self-order/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Create customer order
export async function createCustomerOrder(
  tableId: string,
  customerName: string | undefined,
  items: Array<{
    product_id: string;
    quantity: number;
    modifiers_applied?: any[];
  }>
): Promise<CustomerOrderWithItems | null> {
  try {
    const response = await fetch(`${API_BASE}/self-order/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table_id: tableId,
        customer_name: customerName,
        items,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

// Get customer order by ID
export async function getCustomerOrder(orderId: string): Promise<CustomerOrderWithItems | null> {
  try {
    const response = await fetch(`${API_BASE}/self-order/orders/${orderId}`);
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
    const response = await fetch(`${API_BASE}/self-order/tables/${tableId}/orders`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching table orders:', error);
    return [];
  }
}

// Update customer order status
export async function updateCustomerOrderStatus(
  orderId: string,
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'completed' | 'cancelled'
): Promise<CustomerOrderWithItems | null> {
  try {
    const response = await fetch(`${API_BASE}/self-order/orders/${orderId}/status`, {
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

// Update customer order payment status
export async function updateCustomerOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'unpaid' | 'paid',
  paymentMethod?: string
): Promise<CustomerOrderWithItems | null> {
  try {
    const response = await fetch(`${API_BASE}/self-order/orders/${orderId}/payment-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_status: paymentStatus,
        payment_method: paymentMethod,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating payment status:', error);
    return null;
  }
}
