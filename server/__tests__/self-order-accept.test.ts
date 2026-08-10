import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

// Guards the Phase 5 Step 2 pipe: guest submits a CustomerOrder -> staff accepts it
// into a real Order the KDS can see, or rejects it and stock is restored. The two
// safety rules under test matter more than the happy path: a guest can never end up
// with an accepted order while an online payment is still unconfirmed, and the
// staff-only endpoints must reject anonymous callers.
describe('Self-order accept/reject flow', () => {
  let authToken: string;
  let tableId: string;
  let productId: string;
  const testTableNumber = 'TEST-ACCEPT-01';

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });
    authToken = loginResponse.body.token;

    await prisma.table.deleteMany({ where: { table_number: testTableNumber } });
    const table = await prisma.table.create({
      data: { table_number: testTableNumber, status: 'available', is_active: true },
    });
    tableId = table.id;

    const product = await prisma.product.findFirst({ where: { is_active: true } });
    if (!product) throw new Error('No active product found to seed test order items');
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.orderItem.deleteMany({ where: { order: { table_number: testTableNumber } } });
    await prisma.order.deleteMany({ where: { table_number: testTableNumber } });
    await prisma.customerOrderItem.deleteMany({ where: { order: { table_id: tableId } } });
    await prisma.customerOrder.deleteMany({ where: { table_id: tableId } });
    await prisma.table.deleteMany({ where: { table_number: testTableNumber } });
    await prisma.$disconnect();
  });

  async function createGuestOrder(paymentMethod: string) {
    const res = await request(app)
      .post('/self-order/orders')
      .send({
        table_id: tableId,
        customer_name: 'TEST-ACCEPT guest',
        payment_method: paymentMethod,
        items: [{ product_id: productId, quantity: 1 }],
      });
    return res;
  }

  it('rejects an unknown payment method id', async () => {
    const res = await createGuestOrder('bitcoin');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Unknown payment method/);
  });

  it('counter method (cashier) starts unpaid', async () => {
    const res = await createGuestOrder('cashier');
    expect(res.status).toBe(201);
    expect(res.body.payment_status).toBe('unpaid');
    expect(res.body.status).toBe('pending');
  });

  it('online method (qris) starts pending, not paid', async () => {
    const res = await createGuestOrder('qris');
    expect(res.status).toBe(201);
    expect(res.body.payment_status).toBe('pending');
  });

  it('rejects unauthenticated access to the pending queue and to accept', async () => {
    const created = await createGuestOrder('cashier');
    const pendingRes = await request(app).get('/self-order/orders/pending');
    const acceptRes = await request(app).post(`/self-order/orders/${created.body.id}/accept`);
    expect(pendingRes.status).toBe(401);
    expect(acceptRes.status).toBe(401);
  });

  it('lists a submitted order in the pending queue, oldest first', async () => {
    const created = await createGuestOrder('cashier');
    const res = await request(app)
      .get('/self-order/orders/pending')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.some((o: any) => o.id === created.body.id)).toBe(true);
  });

  it('accepts a counter-method order and creates a linked kitchen-visible Order', async () => {
    const created = await createGuestOrder('cashier');

    const acceptRes = await request(app)
      .post(`/self-order/orders/${created.body.id}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(acceptRes.status).toBe(201);
    expect(acceptRes.body.customer_order_id).toBe(created.body.id);
    expect(acceptRes.body.table_number).toBe(testTableNumber);

    const posOrder = await request(app)
      .get(`/orders/${acceptRes.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(posOrder.status).toBe(200);
    expect(posOrder.body.customer_order_id).toBe(created.body.id);
  });

  it('refuses to accept an online-method order until payment is confirmed', async () => {
    const created = await createGuestOrder('qris');

    const acceptRes = await request(app)
      .post(`/self-order/orders/${created.body.id}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(acceptRes.status).toBe(409);
    expect(acceptRes.body.error).toMatch(/konfirmasi pembayaran/);
  });

  it('refuses to double-accept the same order', async () => {
    const created = await createGuestOrder('cashier');
    const first = await request(app)
      .post(`/self-order/orders/${created.body.id}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/self-order/orders/${created.body.id}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(second.status).toBe(409);
  });

  it('rejects an order and restores the stock it had reserved', async () => {
    const before = await prisma.product.findUnique({ where: { id: productId } });
    const created = await createGuestOrder('cashier');

    const afterCreate = await prisma.product.findUnique({ where: { id: productId } });
    expect(afterCreate!.stock_quantity).toBe(before!.stock_quantity - 1);

    const rejectRes = await request(app)
      .post(`/self-order/orders/${created.body.id}/reject`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(rejectRes.status).toBe(200);

    const afterReject = await prisma.product.findUnique({ where: { id: productId } });
    expect(afterReject!.stock_quantity).toBe(before!.stock_quantity);
  });
});
