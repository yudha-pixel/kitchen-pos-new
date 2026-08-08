import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { app } from '../app';
import { prisma } from '../lib/prisma';

/**
 * Regression safety net for fix-3: stock restoration on order cancellation
 * (PATCH /orders/:id/status -> 'cancelled') and item voiding (POST
 * /void-logs).
 *
 * Covers:
 *  - Cancelling an order restores product.stock_quantity and every
 *    ingredient's current_stock (via Recipe/BOM) for its items.
 *  - Voiding an item restores stock for just that voided quantity.
 *  - Partial void followed by full cancel restores only the REMAINING
 *    (not-yet-voided) quantity - no double-credit.
 *  - Void logs are idempotent: replaying the same void log id (as
 *    useSyncManager does on retry) restores stock exactly once.
 *  - A void log arriving after the order was already cancelled does not
 *    double-restore stock that cancellation already returned.
 */

let token: string;
let categoryId: string;

const createdIngredientIds: string[] = [];
const createdProductIds: string[] = [];
const createdOrderIds: string[] = [];

async function createTestIngredient(currentStock: number, unit = 'kg') {
  const res = await request(app)
    .post('/ingredients')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `TestRestoreIngredient-${randomUUID()}`,
      current_stock: currentStock,
      unit,
      min_stock: 1,
      unit_price: 1000,
    });
  expect(res.status).toBe(201);
  createdIngredientIds.push(res.body.id);
  return res.body as { id: string; name: string };
}

async function createTestProduct(stockQuantity = 1000) {
  const res = await request(app)
    .post('/products')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `TestRestoreProduct-${randomUUID()}`,
      price: 10000,
      category_id: categoryId,
      stock_quantity: stockQuantity,
    });
  expect(res.status).toBe(201);
  createdProductIds.push(res.body.id);
  return res.body as { id: string; name: string };
}

async function createTestRecipe(menuItemId: string, ingredientId: string, quantityRequired: number, unit: string) {
  const res = await request(app)
    .post('/recipes')
    .set('Authorization', `Bearer ${token}`)
    .send({ menu_item_id: menuItemId, ingredient_id: ingredientId, quantity_required: quantityRequired, unit });
  expect(res.status).toBe(201);
}

async function createOrder(productId: string, quantity: number) {
  const orderId = randomUUID();
  createdOrderIds.push(orderId);
  const res = await request(app)
    .post('/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      order: { id: orderId, total_amount: quantity * 10000, payment_method: 'cash' },
      items: [{ id: randomUUID(), product_id: productId, quantity, price_at_time: 10000 }],
    });
  expect(res.status).toBe(200);
  return orderId;
}

function patchStatus(orderId: string, status: string) {
  return request(app)
    .patch(`/orders/${orderId}/status`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status });
}

function postVoidLog(orderId: string, productId: string, quantity: number, id = randomUUID()) {
  return request(app)
    .post('/void-logs')
    .set('Authorization', `Bearer ${token}`)
    .send({ voidLogs: [{ id, order_id: orderId, product_id: productId, quantity, reason: 'test void' }] });
}

beforeAll(async () => {
  const loginRes = await request(app).post('/auth/login').send({ username: 'admin', password: 'admin' });
  expect(loginRes.status).toBe(200);
  token = loginRes.body.token;

  const categoriesRes = await request(app).get('/categories');
  expect(categoriesRes.status).toBe(200);
  expect(categoriesRes.body.length).toBeGreaterThan(0);
  categoryId = categoriesRes.body[0].id;
});

afterAll(async () => {
  // Orders are hard-deleted directly via Prisma (not exposed via any DELETE
  // API route). OrderItem and OrderVoidLog rows must go first: OrderItem has
  // `onDelete: Cascade` on its Order relation (handled automatically), but
  // OrderVoidLog does NOT cascade, so it must be deleted explicitly before
  // the order itself.
  await prisma.orderVoidLog.deleteMany({ where: { order_id: { in: createdOrderIds } } });
  await prisma.order.deleteMany({ where: { id: { in: createdOrderIds } } });

  for (const productId of createdProductIds) {
    await request(app).delete(`/recipes/menu/${productId}`).set('Authorization', `Bearer ${token}`);
  }
  // Now that every order/order_item referencing these test products has been
  // removed above, they can be hard-deleted directly instead of only
  // soft-deleted (is_active: false) - avoids leaving thousands of dead rows
  // behind from repeated test runs.
  await prisma.product.deleteMany({ where: { id: { in: createdProductIds } } });
  await prisma.ingredient.deleteMany({ where: { id: { in: createdIngredientIds } } });
  await prisma.$disconnect();
});

describe('Stock restoration on cancel/void', () => {
  it('restores product stock and ingredient stock when an order is cancelled', async () => {
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct(50);
    await createTestRecipe(product.id, ingredient.id, 0.5, 'kg');

    const orderId = await createOrder(product.id, 3); // consumes 1.5kg, product -3

    const afterOrder = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    expect(afterOrder?.current_stock).toBeCloseTo(8.5, 6);

    const res = await patchStatus(orderId, 'cancelled');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('cancelled');

    const ingredientAfterCancel = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    const productAfterCancel = await prisma.product.findUnique({ where: { id: product.id } });
    expect(ingredientAfterCancel?.current_stock).toBeCloseTo(10, 6);
    expect(productAfterCancel?.stock_quantity).toBe(50);
  });

  it('does not restore stock twice when cancelled status is set again (idempotent)', async () => {
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct(50);
    await createTestRecipe(product.id, ingredient.id, 1, 'kg');

    const orderId = await createOrder(product.id, 2); // consumes 2kg, product -2

    await patchStatus(orderId, 'cancelled');
    const secondAttempt = await patchStatus(orderId, 'cancelled');
    expect(secondAttempt.status).toBe(200); // existing.status === status short-circuit

    const ingredientAfter = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    const productAfter = await prisma.product.findUnique({ where: { id: product.id } });
    expect(ingredientAfter?.current_stock).toBeCloseTo(10, 6); // not 12
    expect(productAfter?.stock_quantity).toBe(50); // not 52
  });

  it('restores stock for a voided item', async () => {
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct(50);
    await createTestRecipe(product.id, ingredient.id, 0.2, 'kg');

    const orderId = await createOrder(product.id, 5); // consumes 1kg, product -5

    const voidRes = await postVoidLog(orderId, product.id, 2); // void 2 units -> restore 0.4kg
    expect(voidRes.status).toBe(200);

    const ingredientAfter = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    const productAfter = await prisma.product.findUnique({ where: { id: product.id } });
    expect(ingredientAfter?.current_stock).toBeCloseTo(9.4, 6); // 10 - 1.0 + 0.4
    expect(productAfter?.stock_quantity).toBe(47); // 50 - 5 + 2
  });

  it('replaying the same void log id does not restore stock twice (idempotent)', async () => {
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct(50);
    await createTestRecipe(product.id, ingredient.id, 0.5, 'kg');

    const orderId = await createOrder(product.id, 4); // consumes 2kg, product -4
    const voidLogId = randomUUID();

    await postVoidLog(orderId, product.id, 1, voidLogId); // void 1 unit -> restore 0.5kg
    const replay = await postVoidLog(orderId, product.id, 1, voidLogId); // same id, simulated retry
    expect(replay.status).toBe(200);

    const ingredientAfter = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    const productAfter = await prisma.product.findUnique({ where: { id: product.id } });
    expect(ingredientAfter?.current_stock).toBeCloseTo(8.5, 6); // 10 - 2.0 + 0.5, not +1.0
    expect(productAfter?.stock_quantity).toBe(47); // 50 - 4 + 1, not +2
  });

  it('partial void then full cancel restores only the remaining (not already voided) quantity', async () => {
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct(50);
    await createTestRecipe(product.id, ingredient.id, 1, 'kg');

    const orderId = await createOrder(product.id, 5); // consumes 5kg, product -5

    await postVoidLog(orderId, product.id, 2); // void 2 of 5 -> restore 2kg, product +2

    const midway = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    expect(midway?.current_stock).toBeCloseTo(7, 6); // 10 - 5 + 2

    const cancelRes = await patchStatus(orderId, 'cancelled');
    expect(cancelRes.status).toBe(200);

    // Only the remaining 3 units (5 ordered - 2 already voided) should be
    // restored now, not the full original 5 - otherwise the already-voided
    // 2 units would be credited twice.
    const finalIngredient = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(finalIngredient?.current_stock).toBeCloseTo(10, 6); // fully restored, exactly once
    expect(finalProduct?.stock_quantity).toBe(50); // fully restored, exactly once
  });

  it('does not double-restore when a void log arrives after the order was already cancelled', async () => {
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct(50);
    await createTestRecipe(product.id, ingredient.id, 1, 'kg');

    const orderId = await createOrder(product.id, 3); // consumes 3kg, product -3

    const cancelRes = await patchStatus(orderId, 'cancelled'); // restores all 3
    expect(cancelRes.status).toBe(200);

    const afterCancel = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    expect(afterCancel?.current_stock).toBeCloseTo(10, 6);

    // A late void log for this already-cancelled order must be recorded for
    // audit purposes but must NOT restore stock again.
    const lateVoid = await postVoidLog(orderId, product.id, 3);
    expect(lateVoid.status).toBe(200);

    const finalIngredient = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(finalIngredient?.current_stock).toBeCloseTo(10, 6); // still 10, not 13
    expect(finalProduct?.stock_quantity).toBe(50); // still 50, not 53
  });

  it('prevents double-restore under real concurrent duplicate cancel requests', async () => {
    // Regression test for a race found during audit: the `existing.status
    // === status` guard used to be read OUTSIDE the transaction, so two
    // simultaneous cancel requests for the SAME order could both pass it
    // and both run the restoration logic. Fixed via an atomic conditional
    // `updateMany({ where: { id, status: existing.status } })` inside the
    // transaction - only one request's WHERE clause can still match once
    // the row is locked/updated by the other.
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct(50);
    await createTestRecipe(product.id, ingredient.id, 1, 'kg');

    const orderId = await createOrder(product.id, 4); // consumes 4kg, product -4

    const [resA, resB] = await Promise.all([
      patchStatus(orderId, 'cancelled'),
      patchStatus(orderId, 'cancelled'),
    ]);

    const statuses = [resA.status, resB.status];

    // The HTTP status codes themselves are intentionally NOT asserted as a
    // fixed 1x200+1x409 pair here: depending on exact scheduling, the
    // "loser" can legitimately land on either outcome and both are correct:
    //   (a) 409 - it lost the atomic conditional update inside the
    //       transaction (the classic race window), or
    //   (b) 200 - request A fully committed before request B's OWN initial
    //       `existing.status === status` read even ran, so B takes the
    //       idempotent "already cancelled" fast path (a plain read + early
    //       return, never touching stock) - this is not a race at all, just
    //       B observing an already-settled state, and is just as safe.
    // What must ALWAYS hold regardless of that timing is: no 500s, and the
    // stock ends up restored EXACTLY once - that is the actual invariant
    // this test protects, not the HTTP status code distribution.
    for (const s of statuses) {
      expect([200, 409]).toContain(s);
    }
    expect(statuses.filter((s) => s === 200).length).toBeGreaterThanOrEqual(1);

    const finalIngredient = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    expect(finalIngredient?.current_stock).toBeCloseTo(10, 6); // restored exactly once
    expect(finalProduct?.stock_quantity).toBe(50); // restored exactly once
  });

  it('prevents double-restore under real concurrent duplicate void-log id submissions', async () => {
    // Regression test for a race found during audit: two concurrent requests
    // submitting the exact same void log id could both pass a naive
    // findUnique-then-create check before either commits. Worse, catching
    // the resulting P2002 in JS does NOT recover the underlying Postgres
    // transaction (verified empirically: 25P02 "current transaction is
    // aborted" poisons every subsequent statement in that transaction block).
    // Fixed via createMany+skipDuplicates (ON CONFLICT DO NOTHING), which
    // never throws at all.
    const ingredient = await createTestIngredient(10);
    const product = await createTestProduct(50);
    await createTestRecipe(product.id, ingredient.id, 0.5, 'kg');

    const orderId = await createOrder(product.id, 4); // consumes 2kg, product -4
    const voidLogId = randomUUID();

    const [resA, resB] = await Promise.all([
      postVoidLog(orderId, product.id, 2, voidLogId),
      postVoidLog(orderId, product.id, 2, voidLogId),
    ]);

    // Both requests must return success (idempotent no-op for the loser),
    // never a 409/500 from an unhandled constraint violation.
    expect(resA.status).toBe(200);
    expect(resB.status).toBe(200);

    const finalIngredient = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    const finalProduct = await prisma.product.findUnique({ where: { id: product.id } });
    // Restored exactly once (1kg for 2 units), not twice (2kg).
    expect(finalIngredient?.current_stock).toBeCloseTo(9, 6); // 10 - 2.0 + 1.0
    expect(finalProduct?.stock_quantity).toBe(48); // 50 - 4 + 2, not 50

    const logCount = await prisma.orderVoidLog.count({ where: { id: voidLogId } });
    expect(logCount).toBe(1);
  });

  it('restores an ingredient shared by two different products in one order as one exact combined sum (no split-rounding dust)', async () => {
    // Regression test for a precision asymmetry found during audit: the
    // decrement path (POST /orders) aggregates ingredientNeeds across every
    // product BEFORE rounding and decrementing once per ingredient. The
    // restore path used to call restoreStockForProduct once PER PRODUCT,
    // rounding each product's partial contribution independently - for an
    // ingredient shared by multiple products this could leave up to a few
    // 1e-6-scale dust after a full decrement-then-restore round trip. Fixed
    // by aggregating all products' contributions into one Map BEFORE
    // rounding/applying, mirroring the decrement path exactly.
    const ingredient = await createTestIngredient(10, 'kg');
    const productA = await createTestProduct(50);
    const productB = await createTestProduct(50);
    // Fractions chosen so independent per-product rounding to 6 decimals
    // would very plausibly diverge from rounding the combined sum.
    await createTestRecipe(productA.id, ingredient.id, 0.1, 'kg');
    await createTestRecipe(productB.id, ingredient.id, 0.2, 'kg');

    const orderId = randomUUID();
    createdOrderIds.push(orderId);
    const createRes = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        order: { id: orderId, total_amount: 90000, payment_method: 'cash' },
        items: [
          { id: randomUUID(), product_id: productA.id, quantity: 3, price_at_time: 10000 }, // 0.3kg
          { id: randomUUID(), product_id: productB.id, quantity: 3, price_at_time: 10000 }, // 0.6kg
        ],
      });
    expect(createRes.status).toBe(200);

    const afterOrder = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    expect(afterOrder?.current_stock).toBeCloseTo(9.1, 6); // 10 - 0.3 - 0.6

    const cancelRes = await patchStatus(orderId, 'cancelled');
    expect(cancelRes.status).toBe(200);

    const finalIngredient = await prisma.ingredient.findUnique({ where: { id: ingredient.id } });
    // Must land on EXACTLY 10, not 10.000000999999 or similar split-rounding
    // dust from restoring 0.3 and 0.6 as two separately-rounded increments.
    expect(finalIngredient?.current_stock).toBe(10);
  });
});
