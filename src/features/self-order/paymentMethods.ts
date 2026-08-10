/**
 * Self-order payment methods.
 *
 * Which methods a guest may choose is configurable (AppSettings.selforder_payment_methods).
 * What each method *means* is not: a method's `type` decides whether a guest is even
 * capable of settling the order, so the catalog lives in code and the settings UI can
 * only pick from it. That split is deliberate — making `type` editable would let a
 * misconfiguration hand guests the ability to mark their own bill paid.
 */

export type SelfOrderPaymentType = 'counter' | 'online';

export interface SelfOrderPaymentMethod {
  id: string;
  label: string;
  description: string;
  type: SelfOrderPaymentType;
}

export const SELF_ORDER_PAYMENT_METHODS: Record<string, SelfOrderPaymentMethod> = {
  cashier: {
    id: 'cashier',
    label: 'Bayar di Kasir',
    description: 'Pesan sekarang, bayar di kasir saat selesai',
    type: 'counter',
  },
  qris: {
    id: 'qris',
    label: 'QRIS',
    description: 'Bayar sekarang dengan scan QRIS',
    type: 'online',
  },
  ewallet: {
    id: 'ewallet',
    label: 'E-Wallet',
    description: 'Bayar sekarang dengan e-wallet',
    type: 'online',
  },
  transfer: {
    id: 'transfer',
    label: 'Transfer Bank',
    description: 'Bayar sekarang dengan transfer bank',
    type: 'online',
  },
};

/** Pay-at-cashier only. A guest ordering from a table needs no gateway to eat. */
export const DEFAULT_SELF_ORDER_PAYMENT_METHODS = ['cashier'];

/**
 * Turn whatever is stored in settings into a usable method list.
 * Unknown ids are dropped rather than trusted, and an empty/invalid result falls back
 * to the default — a guest must always have at least one way to complete an order.
 */
export function resolveSelfOrderPaymentMethods(configured: unknown): SelfOrderPaymentMethod[] {
  const ids = Array.isArray(configured) ? configured : DEFAULT_SELF_ORDER_PAYMENT_METHODS;

  const methods = ids
    .filter((id): id is string => typeof id === 'string')
    .map((id) => SELF_ORDER_PAYMENT_METHODS[id])
    .filter((method): method is SelfOrderPaymentMethod => Boolean(method));

  if (methods.length === 0) {
    return DEFAULT_SELF_ORDER_PAYMENT_METHODS.map((id) => SELF_ORDER_PAYMENT_METHODS[id]);
  }

  return methods;
}

/**
 * The payment_status a guest-created order starts in.
 * Never 'paid' — a guest cannot confirm their own payment. `counter` methods are
 * settled by a cashier; `online` methods wait for server-side gateway verification.
 */
export function initialPaymentStatus(method: SelfOrderPaymentMethod): 'unpaid' | 'pending' {
  return method.type === 'counter' ? 'unpaid' : 'pending';
}

/**
 * Whether the guest UI may show a paid/receipt-like confirmation for this order.
 * Only a server-confirmed 'paid' qualifies; anything else is still a promise.
 */
export function isSettled(paymentStatus: string | null | undefined): boolean {
  return paymentStatus === 'paid';
}
