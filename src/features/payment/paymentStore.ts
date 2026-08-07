import { create } from 'zustand';
import { PaymentTransaction } from '@/src/lib/db';

interface PaymentState {
  currentPayment: PaymentTransaction | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setCurrentPayment: (payment: PaymentTransaction | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPayment: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  currentPayment: null,
  loading: false,
  error: null,

  setCurrentPayment: (payment) => set({ currentPayment: payment }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearPayment: () => set({ currentPayment: null, error: null }),
}));
