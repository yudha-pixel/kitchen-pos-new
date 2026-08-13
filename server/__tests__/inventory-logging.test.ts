import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('inventory seed logging', () => {
  it('does not emit informational console logs while automatically seeding IndexedDB', async () => {
    const source = await readFile('src/features/inventory/inventoryService.ts', 'utf8');
    const start = source.indexOf('export async function seedSampleInventoryData()');
    const end = source.indexOf('export async function getAllProductNames()', start);
    const seedFunction = source.slice(start, end);

    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(seedFunction).not.toContain('console.log');
  });
});
