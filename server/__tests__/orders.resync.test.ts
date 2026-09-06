import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { app } from '../app';
import { prisma } from '../lib/prisma';

/**
 * Regression safety net for fix-2: re-syncing an order must not consume stock
 * twice.
 *
 * POST /orders upserts by client-supplied UUID so offline clients can re-send a
 * queued order. The stock decrements used to run on every call regardless, so a
 * retry - the normal case when a response is lost after the server already
 * committed - silently drained product and ingredient stock a second time.
 *
 * Covers:
 *  - Re-sending an identical order leaves product stock untouched.
 *  - Re-sending an identical order leaves ingredient stock untouched.
 *  - Re-sync still corrects the order's mutable fields (the upsert's whole point).
 *  - Adding a genuinely new line to an existing order charges only that line.
 *  - Concurrent duplicate sends charge stock exactly once.
 *
 * Runs against the local dev Postgres database, same as orders.stock.test.ts.
 * Requires the seeded `admin`/`admin` user and at least one category.
 */

let token: string;
let categoryId: string;

const createdIngredientIds: string[] = [];
const createdProductIds: string[] = [];
const createdOrderIds: string[] = [];

async function createTestIngredient(currentStock: number) {
  const res = await request(app)
    .post('/api/ingredients')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `ResyncIngredient-${randomUUID()}`,
      current_stock: currentStock,
      unit: 'kg',
      min_stock: 0,
      unit_price: 1000,
    });
  expect(res.status).toBe(201);
  createdIngredientIds.push(res.body.id);
  return res.body as { id: string };
}

async function createTestProduct(stockQuantity = 100) {
  const res = await request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `ResyncProduct-${randomUUID()}`,
      price: 10000,
      category_id: categoryId,
      stock_quantity: stockQuantity,
    });
  expect(res.status).toBe(201);
  createdProductIds.push(res.body.id);
  return res.body as { id: string };
}

async function createTestRecipe(menuItemId: string, ingredientId: string, quantityRequired: number) {
  const res = await request(app)
    .post('/api/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      menu_item_id: menuItemId,
      ingredient_id: ingredientId,
      quantity_required: quantityRequired,
      unit: 'kg',
    });
  expect(res.status).toBe(201);
}

type Line = { id: string; product_id: string; quantity: number };

/**
 * Sends an order with explicit ids for both the order and every line - exactly
 * what an offline client replaying its queue does.
 */
function sendOrder(orderId: string, lines: Line[], overrides: Record<string, unknown> = {}) {
  if (!createdOrderIds.includes(orderId)) createdOrderIds.push(orderId);
  return request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      order: {
        id: orderId,
        total_amount: lines.reduce((sum, line) => sum + line.quantity * 10000, 0),
        payment_method: 'cash',
        ...overrides,
      },
      items: lines.map((line) => ({ ...line, price_at_time: 10000 })),
    });
}

const stockOf = async (productId: string) =>
  (await prisma.product.findUnique({ where: { id: productId } }))?.stock_quantity;

const ingredientStockOf = async (ingredientId: string) =>
  (await prisma.ingredient.findUnique({ where: { id: ingredientId } }))?.current_stock;

beforeAll(async () => {
  const loginRes = await request(app)
    .post('/auth/login')
    .send({ username: 'admin', password: 'admin' });
  expect(loginRes.status).toBe(200);
  token = loginRes.body.token;

  const categoriesRes = await request(app)
    .get('/api/categories')
    .set('Authorization', `Bearer ${token}`);
  expect(categoriesRes.status).toBe(200);
  expect(categoriesRes.body.length).toBeGreaterThan(0);
  categoryId = categoriesRes.body[0].id;
});

afterAll(async () => {
  // Same ordering constraints as orders.stock.test.ts: orders (cascading to
  // order_items) first, then recipes, then products and ingredients.
  await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });
  for (const productId of createdProductIds) {
    await request(app)
      .delete(`/api/recipes/menu/${productId}`)
      .set('Authorization', `Bearer ${token}`);
  }
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.ingredient.deleteMany({ where: { id: { in: createdIngredientIds } } });
  await prisma.$disconnect();
});

describe('POST /orders - offline re-sync idempotency', () => {
  it('does not decrement product stock again when the same order is re-sent', async () => {
    const product = await createTestProduct(100);
    const orderId = randomUUID();
    const lines: Line[] = [{ id: randomUUID(), product_id: product.id, quantity: 4 }];

    expect((await sendOrder(orderId, lines)).status).toBe(200);
    expect(await stockOf(product.id)).toBe(96);

    // The client never saw the first response and replays the queue.
    expect((await sendOrder(orderId, lines)).status).toBe(200);
    expect(await stockOf(product.id)).toBe(96);

    // A third replay must be equally inert.
    expect((await sendOrder(orderId, lines)).status).toBe(200);
    expect(await stockOf(product.id)).toBe(96);
  });

  it('does not decrement ingredient stock again when the same order is re-sent', async () => {
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct();
    await createTestRecipe(product.id, ingredient.id, 0.5);

    const orderId = randomUUID();
    const lines: Line[] = [{ id: randomUUID(), product_id: product.id, quantity: 3 }];

    expect((await sendOrder(orderId, lines)).status).toBe(200);
    expect(await ingredientStockOf(ingredient.id)).toBeCloseTo(8.5, 6);

    expect((await sendOrder(orderId, lines)).status).toBe(200);
    expect(await ingredientStockOf(ingredient.id)).toBeCloseTo(8.5, 6);
  });

  it('still corrects the order fields on re-sync', async () => {
    const product = await createTestProduct();
    const orderId = randomUUID();
    const lines: Line[] = [{ id: randomUUID(), product_id: product.id, quantity: 1 }];

    expect((await sendOrder(orderId, lines)).status).toBe(200);
    expect((await sendOrder(orderId, lines, { notes: 'tanpa sambal', table_number: 'A7' })).status)
      .toBe(200);

    const stored = await prisma.order.findUnique({ where: { id: orderId } });
    expect(stored?.notes).toBe('tanpa sambal');
    expect(stored?.table_number).toBe('A7');
  });

  it('charges stock only for a genuinely new line added to an existing order', async () => {
    const product = await createTestProduct(100);
    const orderId = randomUUID();
    const firstLine: Line = { id: randomUUID(), product_id: product.id, quantity: 2 };

    expect((await sendOrder(orderId, [firstLine])).status).toBe(200);
    expect(await stockOf(product.id)).toBe(98);

    const secondLine: Line = { id: randomUUID(), product_id: product.id, quantity: 5 };
    expect((await sendOrder(orderId, [firstLine, secondLine])).status).toBe(200);

    // Only the 5 from the new line, not another 2 for the replayed one.
    expect(await stockOf(product.id)).toBe(93);
  });

  it('charges stock once when duplicate sends race each other', async () => {
    const product = await createTestProduct(100);
    const orderId = randomUUID();
    const lines: Line[] = [{ id: randomUUID(), product_id: product.id, quantity: 6 }];

    const responses = await Promise.all([
      sendOrder(orderId, lines),
      sendOrder(orderId, lines),
      sendOrder(orderId, lines),
    ]);

    // Losers of the insert race may abort the whole transaction; what matters
    // is that at least one succeeded and stock moved exactly once.
    expect(responses.some((res) => res.status === 200)).toBe(true);
    expect(await stockOf(product.id)).toBe(94);
  });
});
