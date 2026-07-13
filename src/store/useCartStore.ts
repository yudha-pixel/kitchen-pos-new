import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/src/lib/supabaseClient';
import { db } from '@/src/lib/db';

export interface ModifierOption {
  id: string; // UUID
  name: string;
  price: number;
  selected: boolean;
}

export interface CartItem {
  id: string; // UUID
  productId: string; // UUID
  name: string;
  price: number;
  quantity: number;
  modifiers: ModifierOption[];
  splitGroupId?: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: string;
  notes: string;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT';
  setTableNumber: (tableNumber: string) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: 'CASH' | 'QRIS' | 'DEBIT') => void;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateModifiers: (id: string, modifiers: ModifierOption[]) => void;
  clearCart: () => void;
  processPayment: (roundTo?: number) => Promise<{ success: boolean; message: string; orderId?: string; receiptData?: any }>;
  voidItem: (itemId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  voidOrderItem: (orderId: string, orderItemId: string, productId: string, quantity: number, reason: string) => Promise<{ success: boolean; message: string }>;
  calculateTotal: () => number;
  calculateRoundedTotal: (roundTo: number) => { total: number; roundingAmount: number };
  assignSplitGroup: (itemId: string, groupId: string) => void;
  removeSplitGroup: (itemId: string) => void;
  getSplitGroupTotal: (groupId: string) => number;
  getTotal: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getItemCount: () => number;
  splitBill: (selectedItemIds: string[]) => { success: boolean; message: string; splitCart?: CartItem[] };
  mergeTable: (targetTable: string, sourceTable: string) => Promise<{ success: boolean; message: string }>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: '',
      notes: '',
      paymentMethod: 'CASH',

      setTableNumber: (tableNumber) => set({ tableNumber }),
      setNotes: (notes) => set({ notes }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      
      addToCart: (item) => set((state) => {
        // Check if item with same product and modifiers exists
        const existingIndex = state.items.findIndex(
          (i) => 
            i.productId === item.productId &&
            JSON.stringify(i.modifiers.map(m => m.id).sort()) === 
            JSON.stringify(item.modifiers.map(m => m.id).sort())
        );

        if (existingIndex >= 0) {
          // Update quantity of existing item
          const updatedItems = [...state.items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + item.quantity,
          };
          return { items: updatedItems };
        }

        // Add new item with UUID
        return { 
          items: [...state.items, { ...item, id: crypto.randomUUID() }] 
        };
      }),

      removeFromCart: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),

      updateQuantity: (id, quantity) => set((state) => {
        if (quantity <= 0) {
          return { items: state.items.filter((item) => item.id !== id) };
        }
        return {
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        };
      }),

      updateModifiers: (id, modifiers) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, modifiers } : item
        ),
      })),

      clearCart: () => set({ items: [], tableNumber: '', notes: '' }),

      processPayment: async (roundTo = 0) => {
        const state = get();

        if (state.items.length === 0) {
          return { success: false, message: 'Keranjang kosong' };
        }

        if (!state.tableNumber) {
          return { success: false, message: 'Mohon isi nomor meja terlebih dahulu' };
        }

        const subtotal = state.getSubtotal();
        const tax = state.getTax();
        const total = state.getTotal();
        const orderId = crypto.randomUUID();
        const paymentMethod = state.paymentMethod;

        // Calculate rounding
        let roundingAmount = 0;
        let finalTotal = total;

        if (roundTo > 0) {
          const rounded = state.calculateRoundedTotal(roundTo);
          roundingAmount = rounded.roundingAmount;
          finalTotal = rounded.total;
        }

        // Create order data
        const orderData = {
          id: orderId,
          cashier_id: null, // TODO: Get from auth
          total_amount: finalTotal,
          payment_method: paymentMethod.toLowerCase() as 'cash' | 'card' | 'qr' | 'transfer',
          status: 'completed' as const,
          table_number: state.tableNumber,
          discount_amount: 0,
          rounding_amount: roundingAmount,
          notes: state.notes,
          created_at: new Date().toISOString(),
        };

        // Create order items
        const orderItems = state.items.map((item) => ({
          id: crypto.randomUUID(),
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          price_at_time: item.price,
          discount_item: 0,
          modifiers_applied: item.modifiers,
          split_group_id: null,
        }));

        // Check connection and Supabase configuration
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        const { isSupabaseConfigured } = await import('@/src/lib/supabaseClient');

        if (isOnline && isSupabaseConfigured) {
          // Online: Send directly to Supabase
          console.log('🌐 Online mode: Sending payment directly to Supabase...');
          try {
            console.log(`📤 Inserting order ${orderId} to Supabase...`);
            // Insert order
            const { error: orderError } = await supabase.from('orders').insert(orderData);
            if (orderError) throw orderError;
            console.log(`✅ Order ${orderId} inserted to Supabase successfully`);

            console.log(`📤 Inserting ${orderItems.length} order items to Supabase...`);
            // Insert order items
            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;
            console.log(`✅ Order items inserted to Supabase successfully`);

            // Prepare receipt data BEFORE clearing cart
            const receiptData = {
              orderId,
              tableNumber: state.tableNumber,
              items: state.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                modifiers: item.modifiers.map(m => m.name),
              })),
              subtotal: state.getSubtotal(),
              tax: state.getTax(),
              discount: 0,
              roundingAmount,
              total: finalTotal,
              paymentMethod,
              notes: state.notes,
            };

            // Clear cart after successful payment
            set({ items: [], tableNumber: '', notes: '' });
            console.log('🧹 Cart cleared after successful payment');

            return { 
              success: true, 
              message: 'Pembayaran berhasil!', 
              orderId,
              receiptData,
            };
          } catch (error) {
            console.error('❌ Payment failed:', error);
            return { 
              success: false, 
              message: `Pembayaran gagal: ${error instanceof Error ? error.message : 'Unknown error'}` 
            };
          }
        } else {
          // Offline or Supabase not configured: Save to Dexie with status 'pending'
          const mode = !isOnline ? 'Offline' : 'Supabase not configured';
          console.log(`📴 ${mode} mode: Saving payment to IndexedDB...`);
          try {
            console.log(`📥 Saving order ${orderId} to IndexedDB with status 'pending'...`);
            // Save order to IndexedDB
            await db.orders.add({
              ...orderData,
              status: 'pending',
            });
            console.log(`✅ Order ${orderId} saved to IndexedDB successfully`);

            console.log(`📥 Saving ${orderItems.length} order items to IndexedDB...`);
            // Save order items to IndexedDB
            await db.order_items.bulkAdd(orderItems);
            console.log(`✅ Order items saved to IndexedDB successfully`);

            // Prepare receipt data BEFORE clearing cart
            const receiptData = {
              orderId,
              tableNumber: state.tableNumber,
              items: state.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                modifiers: item.modifiers.map(m => m.name),
              })),
              subtotal: state.getSubtotal(),
              tax: state.getTax(),
              discount: 0,
              roundingAmount,
              total: finalTotal,
              paymentMethod,
              notes: state.notes,
            };

            // Clear cart after saving
            set({ items: [], tableNumber: '', notes: '' });
            console.log('🧹 Cart cleared after saving to IndexedDB');

            return { 
              success: true, 
              message: `${mode}: Transaksi tersimpan lokal, akan disinkron saat online.`, 
              orderId,
              receiptData,
            };
          } catch (error) {
            console.error('❌ Failed to save offline order:', error);
            return { 
              success: false, 
              message: `Gagal menyimpan transaksi lokal: ${error instanceof Error ? error.message : 'Unknown error'}` 
            };
          }
        }
      },

      voidItem: async (itemId, reason) => {
        try {
          const state = get();
          const item = state.items.find((i) => i.id === itemId);
          
          if (!item) {
            return { success: false, message: 'Item tidak ditemukan' };
          }

          // Remove item from cart
          set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
          }));

          return { success: true, message: 'Item berhasil dibatalkan dari keranjang' };
        } catch (error) {
          console.error('Failed to void item:', error);
          return { 
            success: false, 
            message: `Gagal membatalkan item: ${error instanceof Error ? error.message : 'Unknown error'}` 
          };
        }
      },

      voidOrderItem: async (orderId, orderItemId, productId, quantity, reason) => {
        try {
          const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
          
          const voidLog = {
            id: crypto.randomUUID(),
            order_id: orderId,
            product_id: productId,
            quantity,
            reason,
            cashier_id: null, // TODO: Get from auth
            created_at: new Date().toISOString(),
          };

          if (isOnline) {
            // Online: Send directly to Supabase
            const { error } = await supabase.from('order_void_logs').insert(voidLog);
            if (error) throw error;
          } else {
            // Offline: Save to IndexedDB
            await db.order_void_logs.add(voidLog);
          }

          return { success: true, message: 'Item berhasil dibatalkan' };
        } catch (error) {
          console.error('Failed to void item:', error);
          return { 
            success: false, 
            message: `Gagal membatalkan item: ${error instanceof Error ? error.message : 'Unknown error'}` 
          };
        }
      },

      calculateTotal: () => {
        const state = get();
        return state.getTotal();
      },

      calculateRoundedTotal: (roundTo: number) => {
        const state = get();
        const total = state.getTotal();
        const roundingAmount = Math.round(total / roundTo) * roundTo - total;
        return {
          total: total + roundingAmount,
          roundingAmount,
        };
      },

      assignSplitGroup: (itemId, groupId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, splitGroupId: groupId } : item
          ),
        }));
      },

      removeSplitGroup: (itemId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, splitGroupId: undefined } : item
          ),
        }));
      },

      getSplitGroupTotal: (groupId) => {
        const state = get();
        return state.items
          .filter((item) => item.splitGroupId === groupId)
          .reduce((sum, item) => {
            const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
            return sum + ((item.price + modifierTotal) * item.quantity);
          }, 0);
      },

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
      },

      getTax: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
        return subtotal * 0.1; // 10% tax
      },

      getTotal: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
        return subtotal * 1.1; // subtotal + 10% tax
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      splitBill: (selectedItemIds) => {
        const state = get();
        if (selectedItemIds.length === 0) {
          return { success: false, message: 'Pilih minimal satu item untuk split bill' };
        }

        const splitItems = state.items.filter(item => selectedItemIds.includes(item.id));
        const remainingItems = state.items.filter(item => !selectedItemIds.includes(item.id));

        // Update cart with remaining items
        set({ items: remainingItems });

        return {
          success: true,
          message: 'Split bill berhasil',
          splitCart: splitItems
        };
      },

      mergeTable: async (targetTable, sourceTable) => {
        const state = get();

        if (!targetTable || !sourceTable) {
          return { success: false, message: 'Nomor meja tidak boleh kosong' };
        }

        if (targetTable === sourceTable) {
          return { success: false, message: 'Meja asal dan tujuan tidak boleh sama' };
        }

        try {
          // In a real implementation, this would:
          // 1. Fetch orders from source table
          // 2. Move items to target table
          // 3. Update orders in Supabase
          // 4. Delete source table orders

          // For now, we'll simulate the merge
          const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
          const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

          if (isOnline && isSupabaseConfigured) {
            // Fetch orders from source table
            const { data: sourceOrders, error: fetchError } = await supabase
              .from('orders')
              .select('*')
              .eq('table_number', sourceTable)
              .eq('status', 'pending');

            if (fetchError) {
              return { success: false, message: 'Gagal mengambil data meja asal' };
            }

            if (!sourceOrders || sourceOrders.length === 0) {
              return { success: false, message: 'Meja asal tidak memiliki pesanan aktif' };
            }

            // Update orders to target table
            const { error: updateError } = await supabase
              .from('orders')
              .update({ table_number: targetTable })
              .eq('table_number', sourceTable)
              .eq('status', 'pending');

            if (updateError) {
              return { success: false, message: 'Gagal menggabungkan meja' };
            }
          }

          return {
            success: true,
            message: `Berhasil menggabungkan meja ${sourceTable} ke ${targetTable}`
          };
        } catch (error) {
          return { success: false, message: 'Terjadi kesalahan saat menggabungkan meja' };
        }
      },
    }),
    {
      name: 'kitchen-pos-cart-storage',
      partialize: (state) => ({
        items: state.items,
        tableNumber: state.tableNumber,
        notes: state.notes,
      }),
    }
  )
);
