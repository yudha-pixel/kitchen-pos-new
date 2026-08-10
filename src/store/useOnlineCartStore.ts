import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateUUID } from '@/src/lib/utils';

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

export interface OnlineCartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: ModifierOption[];
}

interface OnlineCartState {
  items: OnlineCartItem[];
  fulfillmentType: 'delivery' | 'pickup';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: 'CASH' | 'QRIS' | 'TRANSFER' | 'EWALLET';
  notes: string;
  deliveryFee: number;
  addItem: (item: Omit<OnlineCartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateModifiers: (id: string, modifiers: ModifierOption[]) => void;
  clearCart: () => void;
  setFulfillmentType: (type: 'delivery' | 'pickup') => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setCustomerAddress: (address: string) => void;
  setPaymentMethod: (method: 'CASH' | 'QRIS' | 'TRANSFER' | 'EWALLET') => void;
  setNotes: (notes: string) => void;
  setDeliveryFee: (fee: number) => void;
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useOnlineCartStore = create<OnlineCartState>()(
  persist(
    (set, get) => ({
      items: [],
      fulfillmentType: 'pickup',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      paymentMethod: 'QRIS',
      notes: '',
      deliveryFee: 15000,

      addItem: (item) => {
        const existingItem = get().items.find(
          (i) => i.productId === item.productId && 
          JSON.stringify(i.modifiers) === JSON.stringify(item.modifiers)
        );

        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, id: generateUUID() }],
          });
        }
      },

      removeFromCart: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
        } else {
          set({
            items: get().items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          });
        }
      },

      updateModifiers: (id, modifiers) => {
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, modifiers } : item
          ),
        });
      },

      clearCart: () => set({ 
        items: [],
        fulfillmentType: 'pickup',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        paymentMethod: 'QRIS',
        notes: '',
        deliveryFee: 15000,
      }),

      setFulfillmentType: (type) => set({ fulfillmentType: type }),
      setCustomerName: (name) => set({ customerName: name }),
      setCustomerPhone: (phone) => set({ customerPhone: phone }),
      setCustomerAddress: (address) => set({ customerAddress: address }),
      setPaymentMethod: (method: 'CASH' | 'QRIS' | 'TRANSFER' | 'EWALLET') => set({ paymentMethod: method }),
      setNotes: (notes) => set({ notes: notes }),
      setDeliveryFee: (fee) => set({ deliveryFee: fee }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce(
            (modSum, mod) => modSum + (mod.selected ? mod.price : 0),
            0
          );
          return sum + (item.price + modifierTotal) * item.quantity;
        }, 0);
      },

      getDeliveryFee: () => {
        // Use dynamic delivery fee from state
        return get().fulfillmentType === 'delivery' ? get().deliveryFee : 0;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryFee();
      },
    }),
    {
      name: 'online-order-cart-storage',
      partialize: (state) => ({
        items: state.items,
        fulfillmentType: state.fulfillmentType,
        customerName: state.customerName,
        customerPhone: state.customerPhone,
        customerAddress: state.customerAddress,
        paymentMethod: state.paymentMethod,
        notes: state.notes,
      }),
    }
  )
);
