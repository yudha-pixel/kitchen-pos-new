/**
 * Discounts Reports Service
 * Handles fetching discount and free item data for the discounts report page
 */

interface DiscountOrder {
  id?: string;
  created_at?: string;
  total_amount?: number;
  global_discount_amount?: number;
  global_discount_type?: 'nominal' | 'percentage';
  global_discount_authorized_by?: string;
  global_discount_reason?: string;
  table_number?: string | null;
  payment_method?: string;
  order_category?: string;
}

interface VoucherOrder {
  id?: string;
  created_at?: string;
  total_amount?: number;
  voucher_code?: string | null;
  voucher_id?: string | null;
  voucher_discount_type?: 'nominal' | 'percentage' | null;
  voucher_discount_value?: number;
  voucher_discount_amount?: number;
  table_number?: string | null;
  payment_method?: string;
  order_category?: string;
}

interface FreeOrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  quantity?: number;
  price_at_time?: number;
  is_free?: boolean;
  created_at?: string;
}

/**
 * Get orders with global discounts
 */
export async function getGlobalDiscountOrders(dateFrom?: string, dateTo?: string): Promise<DiscountOrder[]> {
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Try API first when online, fall back to IndexedDB
    if (isOnline) {
      try {
        const { API_BASE_URL } = await import('@/src/config/runtime');
        const { getToken } = await import('@/src/lib/api');
        const token = getToken();
        
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        
        const response = await fetch(`${API_BASE_URL}/api/reports/discounts/global?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (apiError) {
        console.warn('API fetch failed, falling back to IndexedDB:', apiError);
      }
    }
    
    // Fallback to IndexedDB
    const { db } = await import('@/src/lib/db');
    let allOrders = await db.orders
      .where('global_discount_amount')
      .above(0)
      .reverse()
      .sortBy('created_at');
    
    // Apply date filters
    if (dateFrom) {
      allOrders = allOrders.filter(order =>
        order.created_at && new Date(order.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      allOrders = allOrders.filter(order =>
        order.created_at && new Date(order.created_at) <= new Date(dateTo + 'T23:59:59')
      );
    }
    
    return allOrders as DiscountOrder[];
  } catch (error) {
    console.error('Failed to get global discount orders:', error);
    return [];
  }
}

/**
 * Get orders with voucher discounts
 */
export async function getVoucherOrders(dateFrom?: string, dateTo?: string): Promise<VoucherOrder[]> {
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Try API first when online, fall back to IndexedDB
    if (isOnline) {
      try {
        const { API_BASE_URL } = await import('@/src/config/runtime');
        const { getToken } = await import('@/src/lib/api');
        const token = getToken();
        
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        
        const response = await fetch(`${API_BASE_URL}/api/reports/discounts/vouchers?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (apiError) {
        console.warn('API fetch failed, falling back to IndexedDB:', apiError);
      }
    }
    
    // Fallback to IndexedDB
    const { db } = await import('@/src/lib/db');
    let allOrders = await db.orders
      .where('voucher_discount_amount')
      .above(0)
      .reverse()
      .sortBy('created_at');
    
    // Apply date filters
    if (dateFrom) {
      allOrders = allOrders.filter(order =>
        order.created_at && new Date(order.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      allOrders = allOrders.filter(order =>
        order.created_at && new Date(order.created_at) <= new Date(dateTo + 'T23:59:59')
      );
    }
    
    return allOrders as VoucherOrder[];
  } catch (error) {
    console.error('Failed to get voucher orders:', error);
    return [];
  }
}

/**
 * Get free items from orders
 */
export async function getFreeItems(dateFrom?: string, dateTo?: string): Promise<FreeOrderItem[]> {
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Try API first when online, fall back to IndexedDB
    if (isOnline) {
      try {
        const { API_BASE_URL } = await import('@/src/config/runtime');
        const { getToken } = await import('@/src/lib/api');
        const token = getToken();
        
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        
        const response = await fetch(`${API_BASE_URL}/api/reports/discounts/free-items?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (apiError) {
        console.warn('API fetch failed, falling back to IndexedDB:', apiError);
      }
    }
    
    // Fallback to IndexedDB
    const { db } = await import('@/src/lib/db');
    const allOrderItems = await db.order_items.toArray();
    let allFreeItems = allOrderItems.filter(item => item.is_free === true);
    
    // Apply date filters by checking order created_at
    if (dateFrom || dateTo) {
      const orderIds = allFreeItems.map(item => item.order_id);
      const orders = await db.orders.where('id').anyOf(orderIds).toArray();
      
      allFreeItems = allFreeItems.filter(item => {
        const order = orders.find(o => o.id === item.order_id);
        if (!order || !order.created_at) return true;
        
        if (dateFrom && new Date(order.created_at) < new Date(dateFrom)) return false;
        if (dateTo && new Date(order.created_at) > new Date(dateTo + 'T23:59:59')) return false;
        
        return true;
      });
    }
    
    return allFreeItems as FreeOrderItem[];
  } catch (error) {
    console.error('Failed to get free items:', error);
    return [];
  }
}