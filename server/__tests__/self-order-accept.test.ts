import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import jwt from 'jsonwebtoken';

// Guards the Phase 5 Step 2 pipe: guest submits a CustomerOrder -> staff accepts it
// into a real Order the KDS can see, or rejects it and stock is restored. The two
// safety rules under test matter more than the happy path: a guest can never end up
// with an accepted order while an online payment is still unconfirmed, and the
// staff-only endpoints must reject anonymous callers.
describe('Self-order accept/reject flow', () => {
  let authToken: string;
  let insufficientToken: string;
  let missingProfileToken: string;
  let insufficientRoleId: string;
  let insufficientProfileId: string;
  let tableId: string;
  let productId: string;
  const testTableNumber = 'TEST-ACCEPT-01';

  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });
    authToken = loginResponse.body.token;
    missingProfileToken = jwt.sign(
      { id: crypto.randomUUID(), username: 'TEST-MISSING-PROFILE', role: 'admin', role_id: loginResponse.body.user.role_id },
      process.env.JWT_SECRET!,
      { expiresIn: '5m' }
    );
    const waiterRole = await prisma.role.create({
      data: { name: `TEST-NO-ORDER-CREATE-${crypto.randomUUID()}`, description: 'Temporary permission test role' },
    });
    insufficientRoleId = waiterRole.id;
    const insufficientProfile = await prisma.profile.create({
      data: {
        username: `TEST-NO-ORDER-CREATE-${crypto.randomUUID()}`,
        full_name: 'No Order Create Test',
        password_hash: 'unused',
        role_id: waiterRole.id,
      },
    });
    insufficientProfileId = insufficientProfile.id;
    insufficientToken = jwt.sign(
      { id: insufficientProfile.id, username: insufficientProfile.username, role: 'admin', role_id: loginResponse.body.user.role_id },
      process.env.JWT_SECRET!,
      { expiresIn: '5m' }
    );

    await prisma.table.deleteMany({ where: { table_number: testTableNumber } });
    const table = await prisma.table.create({
      data: { table_number: testTableNumber, status: 'available', is_active: true },
    });
    tableId = table.id;

    const product = await prisma.product.findFirst({ where: { is_active: true } });
    if (!product) throw new Error('No active product found to seed test order items');
    productId = product.id;

    await prisma.appSettings.updateMany({
      data: {
        selforder_payment_methods: ['cashier', 'qris', 'transfer'],
        selforder_payment_instructions: {
          qris: { instructions: 'Scan QRIS resmi lalu masukkan nomor referensi.' },
          transfer: { instructions: 'Transfer ke rekening uji lalu masukkan nomor referensi.' },
        },
        selforder_routing: 'review',
      },
    });
  });

  afterAll(async () => {
    const customerOrderIds = (await prisma.customerOrder.findMany({ where: { table_id: tableId }, select: { id: true } })).map((order) => order.id);
    await prisma.auditLog.deleteMany({ where: { entity_id: { in: customerOrderIds } } });
    await prisma.notification.deleteMany({ where: { message: { contains: testTableNumber } } });
    await prisma.orderItem.deleteMany({ where: { order: { table_number: testTableNumber } } });
    await prisma.order.deleteMany({ where: { table_number: testTableNumber } });
    await prisma.customerOrderItem.deleteMany({ where: { order: { table_id: tableId } } });
    await prisma.customerOrder.deleteMany({ where: { table_id: tableId } });
    await prisma.table.deleteMany({ where: { table_number: testTableNumber } });
    await prisma.appSettings.updateMany({
      data: { selforder_payment_methods: ['cashier'], selforder_payment_instructions: {}, selforder_routing: 'review' },
    });
    await prisma.profile.delete({ where: { id: insufficientProfileId } });
    await prisma.role.delete({ where: { id: insufficientRoleId } });
    await prisma.$disconnect();
  });

  async function createGuestOrder(paymentMethod: string) {
    const res = await request(app)
      .post('/api/self-order/orders')
      .send({
        table_id: tableId,
        customer_name: 'TEST-ACCEPT guest',
        payment_method: paymentMethod,
        ...(paymentMethod === 'cashier' ? {} : { payment_reference: 'TEST-REF-123' }),
        items: [{ product_id: productId, quantity: 1 }],
      });
    return res;
  }

  it('rejects an unknown payment method id', async () => {
    const res = await createGuestOrder('bitcoin');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not currently enabled/);
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
    const pendingRes = await request(app).get('/api/self-order/orders/pending');
    const acceptRes = await request(app).post(`/api/self-order/orders/${created.body.id}/accept`);
    expect(pendingRes.status).toBe(401);
    expect(acceptRes.status).toBe(401);
  });

  it('lists a submitted order in the pending queue, oldest first', async () => {
    const created = await createGuestOrder('cashier');
    const res = await request(app)
      .get('/api/self-order/orders/pending')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.some((o: any) => o.id === created.body.id)).toBe(true);
  });

  it('accepts a counter-method order and creates a linked kitchen-visible Order', async () => {
    const created = await createGuestOrder('cashier');

    const acceptRes = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(acceptRes.status).toBe(201);
    expect(acceptRes.body.customer_order_id).toBe(created.body.id);
    expect(acceptRes.body.table_number).toBe(testTableNumber);

    const posOrder = await request(app)
      .get(`/api/orders/${acceptRes.body.id}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(posOrder.status).toBe(200);
    expect(posOrder.body.customer_order_id).toBe(created.body.id);
  });

  it('refuses to accept an online-method order until payment is confirmed', async () => {
    const created = await createGuestOrder('qris');

    const acceptRes = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(acceptRes.status).toBe(409);
    expect(acceptRes.body.error).toMatch(/konfirmasi pembayaran/);
  });

  it('requires a payment reference for digital methods', async () => {
    const res = await request(app).post('/api/self-order/orders').send({
      table_id: tableId,
      payment_method: 'qris',
      items: [{ product_id: productId, quantity: 1 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/payment_reference/);
  });

  it('atomically verifies digital payment and creates one kitchen order', async () => {
    const created = await createGuestOrder('qris');
    const verify = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/verify-payment-and-accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(verify.status).toBe(201);

    const saved = await prisma.customerOrder.findUnique({ where: { id: created.body.id } });
    expect(saved).toMatchObject({ status: 'accepted', payment_status: 'paid', payment_reference: 'TEST-REF-123' });
    expect(saved?.payment_verified_at).not.toBeNull();
    expect(saved?.payment_verified_by).not.toBeNull();
    expect(await prisma.order.count({ where: { customer_order_id: created.body.id } })).toBe(1);
    expect(await prisma.auditLog.count({ where: { entity_id: created.body.id, action: 'verify_payment_and_accept' } })).toBe(1);

    const repeated = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/verify-payment-and-accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(repeated.status).toBe(409);
    expect(await prisma.order.count({ where: { customer_order_id: created.body.id } })).toBe(1);
  });

  it('does not expose a guest payment-status mutation', async () => {
    const created = await createGuestOrder('qris');
    const res = await request(app)
      .patch(`/api/self-order/orders/${created.body.id}/payment-status`)
      .send({ payment_status: 'paid' });
    expect([401, 404]).toContain(res.status);
  });

  it('requires authentication and orders.create permission for verification', async () => {
    const created = await createGuestOrder('transfer');
    const anonymous = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/verify-payment-and-accept`);
    expect(anonymous.status).toBe(401);

    const insufficient = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/verify-payment-and-accept`)
      .set('Authorization', `Bearer ${insufficientToken}`);
    expect(insufficient.status).toBe(403);
  });

  it('keeps a legacy digital order without a reference manually operable', async () => {
    const created = await createGuestOrder('qris');
    await prisma.customerOrder.update({ where: { id: created.body.id }, data: { payment_reference: null } });
    const verify = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/verify-payment-and-accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(verify.status).toBe(201);
  });

  it('allows only one winner when verification requests race', async () => {
    const created = await createGuestOrder('transfer');
    const responses = await Promise.all([
      request(app).post(`/api/self-order/orders/${created.body.id}/verify-payment-and-accept`).set('Authorization', `Bearer ${authToken}`),
      request(app).post(`/api/self-order/orders/${created.body.id}/verify-payment-and-accept`).set('Authorization', `Bearer ${authToken}`),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await prisma.order.count({ where: { customer_order_id: created.body.id } })).toBe(1);
  });

  it('rejects a deleted profile token before mutating payment or acceptance', async () => {
    const created = await createGuestOrder('qris');
    const failed = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/verify-payment-and-accept`)
      .set('Authorization', `Bearer ${missingProfileToken}`);
    expect(failed.status).toBe(401);
    const saved = await prisma.customerOrder.findUnique({ where: { id: created.body.id } });
    expect(saved).toMatchObject({ status: 'pending', payment_status: 'pending' });
    expect(await prisma.order.count({ where: { customer_order_id: created.body.id } })).toBe(0);
  });

  it('refuses to double-accept the same order', async () => {
    const created = await createGuestOrder('cashier');
    const first = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/accept`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(second.status).toBe(409);
  });

  it('rejects an order and restores the stock it had reserved', async () => {
    const before = await prisma.product.findUnique({ where: { id: productId } });
    const created = await createGuestOrder('cashier');

    const afterCreate = await prisma.product.findUnique({ where: { id: productId } });
    expect(afterCreate!.stock_quantity).toBe(before!.stock_quantity - 1);

    const rejectRes = await request(app)
      .post(`/api/self-order/orders/${created.body.id}/reject`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(rejectRes.status).toBe(200);

    const afterReject = await prisma.product.findUnique({ where: { id: productId } });
    expect(afterReject!.stock_quantity).toBe(before!.stock_quantity);
  });
});
