class OdooApi {
  private baseUrl: string;
  private database: string;
  private sessionId: string | null = null;
  private uid: number | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_ODOO_URL || '';
    this.database = process.env.ODOO_DATABASE || '';
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  setUid(uid: number) {
    this.uid = uid;
  }

  getSessionId() {
    return this.sessionId;
  }

  getUid() {
    return this.uid;
  }

  private async callJsonRpc(method: string, params: any) {
    const response = await fetch(`${this.baseUrl}/jsonrpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.sessionId && { 'Cookie': `session_id=${this.sessionId}` }),
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: Math.random().toString(36).substring(7),
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.data?.message || data.error.message || 'Odoo API Error');
    }
    
    return data.result;
  }

  async login(username: string, password: string) {
    try {
      const result = await this.callJsonRpc('call', {
        service: 'common',
        method: 'login',
        args: [this.database, username, password],
      });

      this.sessionId = result;
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.callJsonRpc('call', {
        service: 'common',
        method: 'logout',
        args: [this.database, this.sessionId],
      });
      this.sessionId = null;
      this.uid = null;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async call(model: string, method: string, args: any[] = [], kwargs: any = {}) {
    if (!this.sessionId) {
      throw new Error('Not authenticated. Please login first.');
    }

    try {
      return await this.callJsonRpc('call', {
        service: 'object',
        method: 'execute_kw',
        args: [this.database, this.uid, this.sessionId, model, method, args, kwargs],
      });
    } catch (error) {
      console.error(`Odoo API call failed (${model}.${method}):`, error);
      throw error;
    }
  }

  // Product methods
  async getProducts(fields: string[] = ['id', 'name', 'price', 'list_price', 'description_sale'], domain: any[] = []) {
    return this.call('product.product', 'search_read', [domain], {
      fields: fields,
      limit: 1000,
    });
  }

  async getProductById(productId: number, fields: string[] = ['id', 'name', 'price', 'list_price', 'description_sale']) {
    return this.call('product.product', 'read', [[productId]], { fields });
  }

  // Category methods
  async getCategories(fields: string[] = ['id', 'name', 'parent_id']) {
    return this.call('product.category', 'search_read', [[]], {
      fields: fields,
      order: 'name ASC',
    });
  }

  // Modifier methods (assuming custom model)
  async getModifiers(productId: number, fields: string[] = ['id', 'name', 'price', 'modifier_group_id']) {
    return this.call('product.modifier', 'search_read', [[['product_id', '=', productId]]], {
      fields: fields,
    });
  }

  async getModifierGroups(fields: string[] = ['id', 'name', 'required', 'multi_select']) {
    return this.call('product.modifier.group', 'search_read', [[]], {
      fields: fields,
    });
  }

  // Order methods
  async createOrder(orderData: any) {
    return this.call('pos.order', 'create', [orderData]);
  }

  async getOrder(orderId: number) {
    return this.call('pos.order', 'read', [[orderId]]);
  }

  async getOrders(domain: any[] = [], fields: string[] = ['id', 'name', 'amount_total', 'state', 'date_order']) {
    return this.call('pos.order', 'search_read', [domain], {
      fields: fields,
      order: 'date_order DESC',
      limit: 100,
    });
  }

  // Table methods (assuming custom model)
  async getTables(fields: string[] = ['id', 'name', 'seats', 'state']) {
    return this.call('restaurant.table', 'search_read', [[]], {
      fields: fields,
      order: 'name ASC',
    });
  }

  async getTableById(tableId: number) {
    return this.call('restaurant.table', 'read', [[tableId]]);
  }

  // Partner/Customer methods
  async getPartners(fields: string[] = ['id', 'name', 'email', 'phone', 'street']) {
    return this.call('res.partner', 'search_read', [['customer_rank', '>', 0]], {
      fields: fields,
      order: 'name ASC',
      limit: 100,
    });
  }

  async createPartner(partnerData: any) {
    return this.call('res.partner', 'create', [partnerData]);
  }

  // Payment methods
  async getPaymentMethods(fields: string[] = ['id', 'name', 'journal_id', 'is_cash_count']) {
    return this.call('pos.payment.method', 'search_read', [['active', '=', true]], {
      fields: fields,
    });
  }
}

// Export singleton instance
export const odooApi = new OdooApi();

// Export types for TypeScript
export interface OdooProduct {
  id: number;
  name: string;
  price?: number;
  list_price?: number;
  description_sale?: string;
}

export interface OdooCategory {
  id: number;
  name: string;
  parent_id?: number | false;
}

export interface OdooModifier {
  id: number;
  name: string;
  price: number;
  modifier_group_id: number;
}

export interface OdooModifierGroup {
  id: number;
  name: string;
  required: boolean;
  multi_select: boolean;
}

export interface OdooOrder {
  id: number;
  name: string;
  amount_total: number;
  state: string;
  date_order: string;
}

export interface OdooTable {
  id: number;
  name: string;
  seats: number;
  state: string;
}

export interface OdooPartner {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  street?: string;
}
