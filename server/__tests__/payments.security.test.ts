import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { app } from '../app';
import { prisma } from '../lib/prisma';

/**
 * Regression safety net for fix-4: payment-amount manipulation vulnerability
 * on POST /payments.
 *
 * Before the fix, this route was unauthenticated AND took `amount` directly
 * from the client request body, letting anyone (or a modified/malicious
 * client) create a payment transaction for any arbitrary amount, completely
 * decoupled from what the order actually totals to.
 *
 * Covers:
 *  - POST /payments requires a valid auth token (401 without one).
 *  - The created payment's `amount` always equals order.total_amount from
 *    the database, even if the client sends a manipulated `amount` field in
 *    the request body (which the server must ignore entirely).
 *  - 404 for a non-existent order; 400 for a duplicate payment on the same
 *    order (existing behavior, still correct after the refactor).
 */

let token: string;
let categoryId: string;
const createdOrderIds: string[] = [];
const createdPaymentIds: string[] = [];

async function createTestOrder(totalAmount: number) {
  const res = await request(app)
    .post('/orders')
    .set('Authorization', `Bearer ${token}`)
    .send({
      order: { id: randomUUID(), total_amount: totalAmount, payment_method: 'cash' },
      items: [],
    });
  expect(res.status).toBe(200);
  createdOrderIds.push(res.body.id);
  return res.body as { id: string; total_amount: number };
}

beforeAll(async () => {
  const loginRes = await request(app).post('/auth/login').send({ username: 'admin', password: 'admin' });
  expect(loginRes.status).toBe(200);
  token = loginRes.body.token;

  const categoriesRes = await request(app).get('/categories');
  expect(categoriesRes.status).toBe(200);
  categoryId = categoriesRes.body[0]?.id;
});

afterAll(async () => {
  for (const paymentId of createdPaymentIds) {
    await prisma.paymentTransaction.delete({ where: { id: paymentId } }).catch(() => {});
  }
  for (const orderId of createdOrderIds) {
    await prisma.order.delete({ where: { id: orderId } }).catch(() => {});
  }
  await prisma.$disconnect();
});

describe('POST /payments - security hardening', () => {
  it('rejects requests without an auth token (401)', async () => {
    const order = await createTestOrder(50000);

    const res = await request(app)
      .post('/payments')
      .send({ order_id: order.id, gateway: 'midtrans', payment_method: 'qris' });

    expect(res.status).toBe(401);
  });

  it('ignores a manipulated `amount` in the request body and uses order.total_amount instead', async () => {
    const order = await createTestOrder(75000);

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        order_id: order.id,
        gateway: 'midtrans',
        payment_method: 'qris',
        amount: 1, // attempted manipulation: pay only Rp 1 for a Rp 75.000 order
      });

    expect(res.status).toBe(201);
    createdPaymentIds.push(res.body.id);

    // The server must have ignored the client's `amount: 1` entirely.
    expect(res.body.amount).toBe(75000);

    const dbPayment = await prisma.paymentTransaction.findUnique({ where: { id: res.body.id } });
    expect(dbPayment?.amount).toBe(75000);
  });

  it('derives amount correctly even when the client omits amount entirely', async () => {
    const order = await createTestOrder(123000);

    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: order.id, gateway: 'xendit', payment_method: 'va' });

    expect(res.status).toBe(201);
    createdPaymentIds.push(res.body.id);
    expect(res.body.amount).toBe(123000);
  });

  it('returns 404 for a non-existent order', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: randomUUID(), gateway: 'midtrans', payment_method: 'qris' });

    expect(res.status).toBe(404);
  });

  it('returns 400 when a payment already exists for the order', async () => {
    const order = await createTestOrder(20000);

    const first = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: order.id, gateway: 'midtrans', payment_method: 'qris' });
    expect(first.status).toBe(201);
    createdPaymentIds.push(first.body.id);

    const second = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: order.id, gateway: 'midtrans', payment_method: 'qris' });
    expect(second.status).toBe(400);
  });
});

describe('PATCH /payments/:id/status - security hardening', () => {
  // Regression test: this route previously had NO authMiddleware at all,
  // meaning anyone with network access - no login required - could mark ANY
  // payment as 'paid', which cascades into marking the parent order
  // 'completed' without any real payment ever happening. This is at least
  // as severe as the POST /payments amount-manipulation issue fixed above.
  it('rejects requests without an auth token (401)', async () => {
    const order = await createTestOrder(40000);
    const paymentRes = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: order.id, gateway: 'midtrans', payment_method: 'qris' });
    expect(paymentRes.status).toBe(201);
    createdPaymentIds.push(paymentRes.body.id);

    const res = await request(app)
      .patch(`/payments/${paymentRes.body.id}/status`)
      .send({ status: 'paid' });

    expect(res.status).toBe(401);

    // Confirm the exploit is actually blocked, not just the response code:
    // neither the payment nor the order should have changed state.
    const dbPayment = await prisma.paymentTransaction.findUnique({ where: { id: paymentRes.body.id } });
    const dbOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(dbPayment?.status).toBe('pending');
    expect(dbOrder?.status).not.toBe('completed');
  });

  it('allows an authenticated request to update payment status and cascades order completion', async () => {
    const order = await createTestOrder(60000);
    const paymentRes = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: order.id, gateway: 'midtrans', payment_method: 'qris' });
    expect(paymentRes.status).toBe(201);
    createdPaymentIds.push(paymentRes.body.id);

    const res = await request(app)
      .patch(`/payments/${paymentRes.body.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('paid');

    const dbOrder = await prisma.order.findUnique({ where: { id: order.id } });
    expect(dbOrder?.status).toBe('completed');
  });

  it('rejects a request with an invalid/expired token (401)', async () => {
    const order = await createTestOrder(30000);
    const paymentRes = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: order.id, gateway: 'midtrans', payment_method: 'qris' });
    expect(paymentRes.status).toBe(201);
    createdPaymentIds.push(paymentRes.body.id);

    const res = await request(app)
      .patch(`/payments/${paymentRes.body.id}/status`)
      .set('Authorization', 'Bearer not-a-real-token')
      .send({ status: 'paid' });

    expect(res.status).toBe(401);
  });
});
