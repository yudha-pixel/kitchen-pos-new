import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

// Guards the "kirim ke kasir untuk konfirmasi" vs "kirim ke kasir dan dapur
// sekaligus" configuration (AppSettings.selforder_routing), and the double-order
// guard that has to hold regardless of which mode is active: a guest retrying a
// dropped request, or double-tapping submit, must never produce two kitchen
// orders or double-reserve stock for one order.
describe('Self-order routing modes and idempotent submission', () => {
  let authToken: string;
  let tableId: string;
  let productId: string;
  const testTableNumber = 'TEST-ROUTING-01';

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
    await prisma.appSettings.updateMany({
      data: {
        selforder_payment_methods: ['cashier', 'qris'],
        selforder_payment_instructions: { qris: { instructions: 'Instruksi QRIS pengujian.' } },
      },
    });
  });

  afterEach(async () => {
    // Restore the default so other suites (and re-runs) start from a known state.
    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ selforder_routing: 'review' });
  });

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { message: { contains: testTableNumber } } });
    await prisma.orderItem.deleteMany({ where: { order: { table_number: testTableNumber } } });
    await prisma.order.deleteMany({ where: { table_number: testTableNumber } });
    await prisma.customerOrderItem.deleteMany({ where: { order: { table_id: tableId } } });
    await prisma.customerOrder.deleteMany({ where: { table_id: tableId } });
    await prisma.table.deleteMany({ where: { table_number: testTableNumber } });
    await prisma.appSettings.updateMany({
      data: { selforder_payment_methods: ['cashier'], selforder_payment_instructions: {}, selforder_routing: 'review' },
    });
    await prisma.$disconnect();
  });

  function orderPayload(id: string, paymentMethod = 'cashier') {
    return {
      id,
      table_id: tableId,
      customer_name: 'TEST-ROUTING guest',
      payment_method: paymentMethod,
      ...(paymentMethod === 'cashier' ? {} : { payment_reference: 'TEST-ROUTING-REF' }),
      items: [{ product_id: productId, quantity: 1 }],
    };
  }

  it('rejects an unknown routing value at the settings boundary', async () => {
    const res = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ selforder_routing: 'yolo' });
    expect(res.status).toBe(400);
  });

  it('returns only sanitized guest self-order configuration', async () => {
    const res = await request(app).get('/api/self-order/config');
    expect(res.status).toBe(200);
    expect(res.body.counter_routing).toBe('review');
    expect(res.body.methods.map((method: any) => method.id)).toEqual(['cashier', 'qris']);
    expect(res.body.methods.find((method: any) => method.id === 'qris').instructions).toBeTruthy();
    expect(res.body).not.toHaveProperty('manager_pin');
    expect(res.body).not.toHaveProperty('store_email');
  });

  it('rejects enabled digital methods without instructions and non-HTTPS QR images', async () => {
    const missing = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ selforder_payment_methods: ['cashier', 'transfer'], selforder_payment_instructions: {} });
    expect(missing.status).toBe(400);

    const insecure = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        selforder_payment_methods: ['cashier', 'qris'],
        selforder_payment_instructions: { qris: { instructions: 'Test', image_url: 'http://example.test/qr.png' } },
      });
    expect(insecure.status).toBe(400);
    expect(insecure.body.error).toMatch(/HTTPS/);
  });

  it('review mode (default): counter-method order stays pending for staff to accept', async () => {
    const id = crypto.randomUUID();
    const res = await request(app).post('/api/self-order/orders').send(orderPayload(id));
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.routing).toBe('review');

    const pos = await request(app)
      .get(`/api/self-order/orders/${id}`);
    expect(pos.body.status).toBe('pending');
  });

  it('auto mode: counter-method order is immediately accepted into a kitchen-visible Order', async () => {
    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ selforder_routing: 'auto' });

    const id = crypto.randomUUID();
    const res = await request(app).post('/api/self-order/orders').send(orderPayload(id));
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('accepted');
    expect(res.body.routing).toBe('auto');

    const posOrder = await prisma.order.findFirst({ where: { customer_order_id: id } });
    expect(posOrder).not.toBeNull();
    expect(posOrder!.table_number).toBe(testTableNumber);
  });

  it('auto mode: an online method still waits for payment confirmation, not auto-accepted', async () => {
    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ selforder_routing: 'auto' });

    const id = crypto.randomUUID();
    const res = await request(app).post('/api/self-order/orders').send(orderPayload(id, 'qris'));
    expect(res.status).toBe(201);
    // Payment is 'pending' (unconfirmed) — acceptCustomerOrder must refuse it even
    // in auto mode, same guard as the manual accept endpoint.
    expect(res.body.status).toBe('pending');
    expect(res.body.routing).toBe('review');

    const posOrder = await prisma.order.findFirst({ where: { customer_order_id: id } });
    expect(posOrder).toBeNull();
  });

  it('a repeated submission with the same client id resolves to the one order, not a duplicate', async () => {
    const id = crypto.randomUUID();
    const first = await request(app).post('/api/self-order/orders').send(orderPayload(id));
    expect(first.status).toBe(201);

    const stockAfterFirst = await prisma.product.findUnique({ where: { id: productId } });

    const second = await request(app).post('/api/self-order/orders').send(orderPayload(id));
    expect(second.status).toBe(200);
    expect(second.body.id).toBe(id);
    expect(second.body.alreadyExisted).toBe(true);

    const stockAfterSecond = await prisma.product.findUnique({ where: { id: productId } });
    expect(stockAfterSecond!.stock_quantity).toBe(stockAfterFirst!.stock_quantity);

    const count = await prisma.customerOrder.count({ where: { id } });
    expect(count).toBe(1);
  });

  it('notifies active admin/cashier staff when a guest order is submitted', async () => {
    const before = await prisma.notification.count({ where: { type: 'self_order_pending' } });
    const id = crypto.randomUUID();
    await request(app).post('/api/self-order/orders').send(orderPayload(id));
    const after = await prisma.notification.count({ where: { type: 'self_order_pending' } });
    expect(after).toBeGreaterThan(before);
  });
});
