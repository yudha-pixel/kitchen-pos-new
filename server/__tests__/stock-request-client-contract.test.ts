import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/lib/api', () => ({ getToken: () => 'test-token' }));
vi.mock('@/src/config/runtime', () => ({ API_BASE_URL: 'http://localhost:3001' }));
vi.mock('@/src/features/inventory/unitConversion', () => ({
  convertToSmallestUnit: (quantity: number) => quantity,
}));

import { createStockRequest } from '../../src/features/inventory/recipeApiService';

describe('stock-request client contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('omits a null supplier ID from the create request payload', async () => {
    let requestBody: Record<string, unknown> | undefined;

    vi.stubGlobal('fetch', async (_input: string | URL | Request, init?: RequestInit) => {
      requestBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ id: 'stock-request-1' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await createStockRequest({
      ingredient_id: '11111111-1111-4111-8111-111111111111',
      ingredient_name: 'Ingredient without supplier',
      quantity_requested: 10,
      unit: 'kg',
      supplier_id: null,
    });

    expect(requestBody).toEqual({
      ingredient_id: '11111111-1111-4111-8111-111111111111',
      ingredient_name: 'Ingredient without supplier',
      quantity_requested: 10,
      unit: 'kg',
    });
  });
});
