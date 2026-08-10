import { describe, expect, it } from 'vitest';
import { elapsedMinutes } from '../../src/lib/format';

// Urgency thresholds in minutes (matching KDS contract)
const URGENCY_WARN_MIN = 10;
const URGENCY_LATE_MIN = 20;

type Urgency = 'ok' | 'warn' | 'late';

const getUrgency = (createdAt: string, now: Date = new Date()): Urgency => {
  const orderTime = new Date(createdAt).getTime();
  const mins = Math.max(0, Math.floor((now.getTime() - orderTime) / 60000));
  if (mins >= URGENCY_LATE_MIN) return 'late';
  if (mins >= URGENCY_WARN_MIN) return 'warn';
  return 'ok';
};

export function calculateShiftVariance(
  startingCash: number,
  totalSales: number,
  totalExpenses: number,
  endingCash: number
): { expectedEndingCash: number; variance: number; isBalanced: boolean } {
  const expectedEndingCash = startingCash + totalSales - totalExpenses;
  const variance = endingCash - expectedEndingCash;
  return {
    expectedEndingCash,
    variance,
    isBalanced: variance === 0,
  };
}

describe('Phase 2 — KDS & Shift Reliability Contract', () => {
  describe('KDS Order Urgency Timers', () => {
    it('returns "ok" (Baru) for orders created within 10 minutes', () => {
      const now = new Date('2026-08-10T12:00:00Z');
      const createdAt = new Date('2026-08-10T11:55:00Z').toISOString();
      expect(getUrgency(createdAt, now)).toBe('ok');
    });

    it('returns "warn" (Perhatian) for orders created 10-20 minutes ago', () => {
      const now = new Date('2026-08-10T12:00:00Z');
      const createdAt = new Date('2026-08-10T11:45:00Z').toISOString();
      expect(getUrgency(createdAt, now)).toBe('warn');
    });

    it('returns "late" (Terlambat) for orders created over 20 minutes ago', () => {
      const now = new Date('2026-08-10T12:00:00Z');
      const createdAt = new Date('2026-08-10T11:35:00Z').toISOString();
      expect(getUrgency(createdAt, now)).toBe('late');
    });
  });

  describe('Shift Cash Variance Calculations', () => {
    it('calculates expected ending cash and zero variance when balanced', () => {
      const result = calculateShiftVariance(500000, 1200000, 100000, 1600000);
      expect(result.expectedEndingCash).toBe(1600000);
      expect(result.variance).toBe(0);
      expect(result.isBalanced).toBe(true);
    });

    it('calculates negative variance when cash drawer is short', () => {
      const result = calculateShiftVariance(500000, 1200000, 100000, 1550000);
      expect(result.expectedEndingCash).toBe(1600000);
      expect(result.variance).toBe(-50000);
      expect(result.isBalanced).toBe(false);
    });

    it('calculates positive variance when cash drawer has overage', () => {
      const result = calculateShiftVariance(500000, 1200000, 100000, 1620000);
      expect(result.expectedEndingCash).toBe(1600000);
      expect(result.variance).toBe(20000);
      expect(result.isBalanced).toBe(false);
    });
  });
});
