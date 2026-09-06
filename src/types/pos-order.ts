import type { AppliedModifier, Order, OrderItem } from '@/src/lib/db';

/**
 * An order line as the POS screens and payment modals consume it: the stored
 * order item plus the joined product and the display fields the API adds.
 */
export interface PosOrderItem extends Partial<OrderItem> {
  id?: string;
  name?: string;
  price?: number;
  quantity: number;
  product?: { name?: string } | null;
  modifiers?: AppliedModifier[];
  modifiers_applied?: (AppliedModifier & { price_extra?: number })[];
}

/**
 * An order joined with its line items. Every field is optional because the
 * various order endpoints differ in what they include, so callers keep the
 * fallbacks they already have.
 */
export type PosOrder = Partial<Order> & {
  items?: PosOrderItem[];
};
