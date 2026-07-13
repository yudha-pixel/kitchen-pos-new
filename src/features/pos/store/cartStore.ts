import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ModifierOption } from '../components/ModifierModal';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  modifiers: ModifierOption[];
  tableId?: number;
}

interface CartState {
  items: CartItem[];
  tableId: number | null;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateModifiers: (id: number, modifiers: ModifierOption[]) => void;
  clearCart: () => void;
  setTableId: (tableId: number) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableId: null,
      
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

        // Add new item
        return { 
          items: [...state.items, { ...item, id: Date.now() }] 
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

      clearCart: () => set({ items: [], tableId: null }),

      setTableId: (tableId) => set({ tableId }),

      getTotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'kitchen-pos-cart-storage',
    }
  )
);
