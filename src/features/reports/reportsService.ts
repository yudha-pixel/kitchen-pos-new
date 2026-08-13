/**
 * Reports Service
 * Handles all report-related data aggregation and queries for the Kitchen POS system
 */

/**
 * Reverse calculation for internal reporting
 * Extracts tax and service charge from final price for accounting purposes
 * Uses dynamic rates from global configuration
 */
function getInternalBreakdown(finalPrice: number) {
  // Import config store dynamically to avoid circular dependencies
  const { useConfigStore } = require('@/src/store/useConfigStore');
  const taxRate = useConfigStore.getState().getTaxRateAsDecimal();
  const serviceChargeRate = useConfigStore.getState().getServiceChargeRateAsDecimal();
  
  // Formula: finalPrice = netSales + tax + serviceCharge
  // where tax = netSales * taxRate and serviceCharge = netSales * serviceChargeRate
  // finalPrice = netSales + (netSales * taxRate) + (netSales * serviceChargeRate)
  // finalPrice = netSales * (1 + taxRate + serviceChargeRate)
  // netSales = finalPrice / (1 + taxRate + serviceChargeRate)
  
  const divisor = 1 + taxRate + serviceChargeRate;
  const netSales = finalPrice / divisor;
  const taxAmount = netSales * taxRate;
  const serviceChargeAmount = netSales * serviceChargeRate;
  
  return {
    netSales: Math.round(netSales),
    taxAmount: Math.round(taxAmount),
    serviceChargeAmount: Math.round(serviceChargeAmount),
  };
}

/**
 * Get sales data aggregated by period (daily)
 * Returns breakdown with net sales, tax, and service charge for internal reporting
 */
export async function getSalesDataByPeriod(days: number): Promise<
  Array<{ date: string; total: number; netSales: number; taxAmount: number; serviceChargeAmount: number }>
> {
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Try API first when online, fall back to IndexedDB
    if (isOnline) {
      try {
        const { API_BASE_URL } = await import('@/src/config/runtime');
        const { getToken } = await import('@/src/lib/api');
        const token = getToken();
        
        const response = await fetch(`${API_BASE_URL}/api/reports/sales?days=${days}`, {
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
    const orders = await db.orders
      .where('status')
      .anyOf(['completed', 'paid'])
      .toArray();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredOrders = orders.filter(order => 
      new Date(order.created_at) >= cutoffDate
    );
    
    const groupedData = new Map<string, { total: number; netSales: number; taxAmount: number; serviceChargeAmount: number }>();
    
    filteredOrders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      
      // Use reverse calculation to extract components from final price
      const breakdown = getInternalBreakdown(order.total_amount);
      
      const current = groupedData.get(date) || { total: 0, netSales: 0, taxAmount: 0, serviceChargeAmount: 0 };
      groupedData.set(date, {
        total: current.total + order.total_amount,
        netSales: current.netSales + breakdown.netSales,
        taxAmount: current.taxAmount + breakdown.taxAmount,
        serviceChargeAmount: current.serviceChargeAmount + breakdown.serviceChargeAmount,
      });
    });
    
    return Array.from(groupedData.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Failed to get sales data:', error);
    return [];
  }
}

/**
 * Get expenses data aggregated by period (daily)
 */
export async function getExpensesDataByPeriod(days: number): Promise<
  Array<{ date: string; total: number }>
> {
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Try API first when online, fall back to IndexedDB
    if (isOnline) {
      try {
        const { API_BASE_URL } = await import('@/src/config/runtime');
        const { getToken } = await import('@/src/lib/api');
        const token = getToken();
        
        const response = await fetch(`${API_BASE_URL}/api/reports/expenses?days=${days}`, {
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
    const expenses = await db.expenses.toArray();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredExpenses = expenses.filter((expense: any) => 
      new Date(expense.date) >= cutoffDate
    );
    
    const groupedData = new Map<string, number>();
    
    filteredExpenses.forEach((expense: any) => {
      const date = new Date(expense.date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const currentTotal = groupedData.get(date) || 0;
      groupedData.set(date, currentTotal + expense.amount);
    });
    
    return Array.from(groupedData.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Failed to get expenses data:', error);
    return [];
  }
}

/**
 * Get payment method summary for a period
 */
export async function getPaymentMethodSummary(days: number): Promise<
  Array<{ method: string; count: number; total: number; percentage: number }>
> {
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Try API first when online, fall back to IndexedDB
    if (isOnline) {
      try {
        const { API_BASE_URL } = await import('@/src/config/runtime');
        const { getToken } = await import('@/src/lib/api');
        const token = getToken();
        
        const response = await fetch(`${API_BASE_URL}/api/reports/payment-methods?days=${days}`, {
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
    const orders = await db.orders
      .where('status')
      .anyOf(['completed', 'paid'])
      .toArray();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredOrders = orders.filter((order: any) => 
      new Date(order.created_at) >= cutoffDate
    );
    
    const summary = new Map<string, { count: number; total: number }>();
    let grandTotal = 0;
    
    filteredOrders.forEach((order: any) => {
      const method = order.payment_method || 'unknown';
      const current = summary.get(method) || { count: 0, total: 0 };
      summary.set(method, {
        count: current.count + 1,
        total: current.total + order.total_amount,
      });
      grandTotal += order.total_amount;
    });
    
    return Array.from(summary.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        total: data.total,
        percentage: grandTotal > 0 ? (data.total / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error('Failed to get payment method summary:', error);
    return [];
  }
}

/**
 * Get best selling products for a period
 */
export async function getBestSellingProducts(days: number, limit: number = 10): Promise<
  Array<{ product_id: string; product_name: string; quantity: number; revenue: number }>
> {
  try {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    // Try API first when online, fall back to IndexedDB
    if (isOnline) {
      try {
        const { API_BASE_URL } = await import('@/src/config/runtime');
        const { getToken } = await import('@/src/lib/api');
        const token = getToken();
        
        const response = await fetch(`${API_BASE_URL}/api/reports/best-products?days=${days}&limit=${limit}`, {
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
    const orders = await db.orders
      .where('status')
      .anyOf(['completed', 'paid'])
      .toArray();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredOrders = orders.filter((order: any) => 
      new Date(order.created_at) >= cutoffDate
    );
    
    const orderIds = filteredOrders.map((o: any) => o.id).filter(Boolean);
    
    if (orderIds.length === 0) {
      return [];
    }
    
    const orderItems = await db.order_items
      .where('order_id')
      .anyOf(orderIds)
      .toArray();
    
    if (orderItems.length === 0) {
      return [];
    }
    
    // Get unique product IDs from order items
    const productIds = [...new Set(orderItems.map((item: any) => item.product_id))];
    
    // Fetch product names from products table
    const products = await db.products.where('id').anyOf(productIds).toArray();
    const productMap = new Map(products.map(p => [p.id, p.name]));
    
    const productStats = new Map<string, { product_name: string; quantity: number; revenue: number }>();
    
    orderItems.forEach((item: any) => {
      const productName = productMap.get(item.product_id) || `Unknown Product (${item.product_id})`;
      const current = productStats.get(item.product_id) || {
        product_name: productName,
        quantity: 0,
        revenue: 0,
      };
      productStats.set(item.product_id, {
        product_name: productName,
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + (item.price_at_time * item.quantity),
      });
    });
    
    return Array.from(productStats.entries())
      .map(([product_id, data]) => ({
        product_id,
        product_name: data.product_name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get best selling products:', error);
    return [];
  }
}
