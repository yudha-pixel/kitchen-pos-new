import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductWithCategory, Category, CustomerOrderWithItems } from './selfOrderService';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  modifiers_applied?: any[];
}

interface SelfOrderState {
  tableId: string | null;
  tableNumber: string | null;
  customerName: string;
  cart: CartItem[];
  categories: Category[];
  products: ProductWithCategory[];
  selectedCategory: string | null;
  searchQuery: string;
  currentOrder: CustomerOrderWithItems | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setTableId: (tableId: string, tableNumber: string) => void;
  setCustomerName: (name: string) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: ProductWithCategory[]) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCurrentOrder: (order: CustomerOrderWithItems | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

export const useSelfOrderStore = create<SelfOrderState>()(
  persist(
    (set, get) => ({
      tableId: null,
      tableNumber: null,
      customerName: '',
      cart: [],
      categories: [],
      products: [],
      selectedCategory: null,
      searchQuery: '',
      currentOrder: null,
      loading: false,
      error: null,

      setTableId: (tableId, tableNumber) => set({ tableId, tableNumber }),
      
      setCustomerName: (name) => set({ customerName: name }),
      
      addToCart: (item) => set((state) => {
        const existingItem = state.cart.find(i => i.productId === item.productId);
        if (existingItem) {
          return {
            cart: state.cart.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          };
        }
        return {
          cart: [...state.cart, { ...item, quantity: 1 }],
        };
      }),
      
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(i => i.productId !== productId),
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(i =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, quantity) }
            : i
        ),
      })),
      
      clearCart: () => set({ cart: [] }),
      
      setCategories: (categories) => set({ categories }),
      
      setProducts: (products) => set({ products }),
      
      setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setCurrentOrder: (order) => set({ currentOrder: order }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      getCartTotal: () => {
        const state = get();
        return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getCartItemCount: () => {
        const state = get();
        return state.cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'self-order-storage',
      partialize: (state) => ({
        tableId: state.tableId,
        tableNumber: state.tableNumber,
        customerName: state.customerName,
        cart: state.cart,
      }),
    }
  )
);
