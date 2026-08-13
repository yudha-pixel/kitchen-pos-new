import { describe, it, expect } from 'vitest';
import {
  SELF_ORDER_PAYMENT_METHODS,
  DEFAULT_SELF_ORDER_PAYMENT_METHODS,
  resolveSelfOrderPaymentMethods,
  initialPaymentStatus,
  isSettled,
} from '../../src/features/self-order/paymentMethods';

describe('Self-order payment rules', () => {
  it('defaults to pay-at-cashier when nothing is configured', () => {
    const methods = resolveSelfOrderPaymentMethods(undefined);
    expect(methods.map((m) => m.id)).toEqual(DEFAULT_SELF_ORDER_PAYMENT_METHODS);
    expect(methods[0].type).toBe('counter');
  });

  it('drops unknown method ids instead of trusting them', () => {
    const methods = resolveSelfOrderPaymentMethods(['qris', 'bitcoin', 'cashier']);
    expect(methods.map((m) => m.id)).toEqual(['qris', 'cashier']);
  });

  it('always leaves the guest at least one way to order', () => {
    expect(resolveSelfOrderPaymentMethods([]).length).toBeGreaterThan(0);
    expect(resolveSelfOrderPaymentMethods(['nonsense']).length).toBeGreaterThan(0);
    expect(resolveSelfOrderPaymentMethods('not-an-array').length).toBeGreaterThan(0);
  });

  // The safety rule: a guest must never be able to mark their own order paid.
  it('never starts any method in a paid state', () => {
    for (const method of Object.values(SELF_ORDER_PAYMENT_METHODS)) {
      expect(initialPaymentStatus(method)).not.toBe('paid');
    }
  });

  it('starts counter methods unpaid and online methods pending', () => {
    expect(initialPaymentStatus(SELF_ORDER_PAYMENT_METHODS.cashier)).toBe('unpaid');
    expect(initialPaymentStatus(SELF_ORDER_PAYMENT_METHODS.qris)).toBe('pending');
    expect(initialPaymentStatus(SELF_ORDER_PAYMENT_METHODS.transfer)).toBe('pending');
  });

  it('publishes only cashier, QRIS, and transfer with immutable safety types', () => {
    expect(Object.keys(SELF_ORDER_PAYMENT_METHODS)).toEqual(['cashier', 'qris', 'transfer']);
    expect(SELF_ORDER_PAYMENT_METHODS.cashier.type).toBe('counter');
    expect(SELF_ORDER_PAYMENT_METHODS.qris.type).toBe('manual_verification');
    expect(SELF_ORDER_PAYMENT_METHODS.transfer.type).toBe('manual_verification');
    expect(SELF_ORDER_PAYMENT_METHODS).not.toHaveProperty('debit');
  });

  it('treats only a server-confirmed paid status as settled', () => {
    expect(isSettled('paid')).toBe(true);
    expect(isSettled('unpaid')).toBe(false);
    expect(isSettled('pending')).toBe(false);
    expect(isSettled(null)).toBe(false);
  });
});
