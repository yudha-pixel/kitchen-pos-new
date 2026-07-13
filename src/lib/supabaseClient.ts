import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔍 Supabase Anon Key:', supabaseAnonKey ? '***' : 'undefined');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Running in offline-only mode (Dexie.js only).');
  console.warn('To enable online sync, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
}

// Create a mock supabase client for offline mode
const createMockQuery = () => ({
  select: () => createMockQuery(),
  eq: () => createMockQuery(),
  order: () => createMockQuery(),
  limit: () => createMockQuery(),
  single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } }),
  data: Promise.resolve({ data: [], error: null }),
});

const mockSupabase = {
  from: () => ({
    select: () => createMockQuery(),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  }),
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : mockSupabase as any;

/**
 * Update a product in the database
 * @param productId - The UUID of the product to update
 * @param data - The product data to update
 * @returns Promise with success status and message
 */
export const updateProduct = async (
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    image_url?: string;
  }
) => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('products')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Product updated successfully' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          name: string;
          price: number;
          description: string | null;
          image_url: string | null;
          category_id: number | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          price: number;
          description?: string | null;
          image_url?: string | null;
          category_id?: number | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number;
          description?: string | null;
          image_url?: string | null;
          category_id?: number | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: number;
          name: string;
          parent_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          parent_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          parent_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      modifiers: {
        Row: {
          id: number;
          name: string;
          price: number;
          modifier_group_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          price: number;
          modifier_group_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number;
          modifier_group_id?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      modifier_groups: {
        Row: {
          id: number;
          name: string;
          required: boolean;
          multi_select: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          required?: boolean;
          multi_select?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          required?: boolean;
          multi_select?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_modifiers: {
        Row: {
          id: number;
          product_id: number;
          modifier_group_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          product_id: number;
          modifier_group_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          product_id?: number;
          modifier_group_id?: number;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          table_id: number | null;
          total: number;
          tax: number;
          subtotal: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          table_id?: number | null;
          total: number;
          tax: number;
          subtotal: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          table_id?: number | null;
          total?: number;
          tax?: number;
          subtotal?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          modifiers: any;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id: number;
          quantity: number;
          unit_price: number;
          modifiers?: any;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number;
          quantity?: number;
          unit_price?: number;
          modifiers?: any;
          created_at?: string;
        };
      };
    };
  };
}
