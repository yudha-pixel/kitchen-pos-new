import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';

// Guards against a real bug found during manual verification: POST /self-order/orders
// computed total_amount from product.price alone, silently dropping any priced
// modifier (e.g. "Iced" +Rp3.000) the guest selected. A guest was shown one total
// in the review screen and charged a lower one. Also guards the trust-boundary fix
// that went in alongside it: modifier prices must come from the DB, never from
// whatever price the client claims for a modifier id.
describe('Self-order total_amount includes modifier prices, from the DB not the client', () => {
  let tableId: string;
  let productId: string;
  let modifierId: string;
  let modifierPrice: number;
  const testTableNumber = 'TEST-PRICING-01';

  beforeAll(async () => {
    await prisma.table.deleteMany({ where: { table_number: testTableNumber } });
    const table = await prisma.table.create({
      data: { table_number: testTableNumber, status: 'available', is_active: true },
    });
    tableId = table.id;

    const modifier = await prisma.modifier.findFirst({
      where: { price_extra: { gt: 0 } },
      include: { modifierGroup: { include: { productModifierGroups: true } } },
    });
    if (!modifier || modifier.modifierGroup.productModifierGroups.length === 0) {
      throw new Error('No priced modifier with a linked product found to seed this test');
    }
    modifierId = modifier.id;
    modifierPrice = modifier.price_extra;
    productId = modifier.modifierGroup.productModifierGroups[0].product_id;
  });

  afterAll(async () => {
    await prisma.customerOrderItem.deleteMany({ where: { order: { table_id: tableId } } });
    await prisma.customerOrder.deleteMany({ where: { table_id: tableId } });
    await prisma.table.deleteMany({ where: { table_number: testTableNumber } });
    await prisma.$disconnect();
  });

  it('adds the modifier price_extra to total_amount', async () => {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    const res = await request(app)
      .post('/self-order/orders')
      .send({
        id: crypto.randomUUID(),
        table_id: tableId,
        payment_method: 'cashier',
        items: [{
          product_id: productId,
          quantity: 1,
          modifiers_applied: [{ id: modifierId, name: 'test modifier', price: modifierPrice, selected: true }],
        }],
      });

    expect(res.status).toBe(201);
    expect(res.body.total_amount).toBe(product!.price + modifierPrice);
  });

  it('ignores a client-claimed price and uses the DB price_extra instead', async () => {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    const res = await request(app)
      .post('/self-order/orders')
      .send({
        id: crypto.randomUUID(),
        table_id: tableId,
        payment_method: 'cashier',
        items: [{
          product_id: productId,
          quantity: 1,
          // Client lies about the price — must be ignored in favor of the real
          // price_extra looked up server-side.
          modifiers_applied: [{ id: modifierId, name: 'test modifier', price: -999999, selected: true }],
        }],
      });

    expect(res.status).toBe(201);
    expect(res.body.total_amount).toBe(product!.price + modifierPrice);
    expect(res.body.total_amount).toBeGreaterThan(0);
  });

  it('scales the modifier price with quantity', async () => {
    const product = await prisma.product.findUnique({ where: { id: productId } });

    const res = await request(app)
      .post('/self-order/orders')
      .send({
        id: crypto.randomUUID(),
        table_id: tableId,
        payment_method: 'cashier',
        items: [{
          product_id: productId,
          quantity: 2,
          modifiers_applied: [{ id: modifierId, name: 'test modifier', price: modifierPrice, selected: true }],
        }],
      });

    expect(res.status).toBe(201);
    expect(res.body.total_amount).toBe((product!.price + modifierPrice) * 2);
  });
});
