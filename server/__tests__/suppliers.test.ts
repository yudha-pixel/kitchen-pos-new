import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

describe('Supplier & Purchase Order Integration Tests', () => {
  let adminToken: string;
  let cashierToken: string;
  let ingredientId: string | undefined;
  let poSupplierId: string | undefined;
  let updateSupplierId: string | undefined;
  let deleteSupplierId: string | undefined;
  let pendingPurchaseOrderId: string | undefined;
  let receivedPurchaseOrderId: string | undefined;
  let adminUserId: string | undefined;
  let cashierUserId: string | undefined;
  const createdSupplierIds: string[] = [];
  const createdPurchaseOrderIds: string[] = [];
  const fixturePrefix = `UXR-${Date.now()}-suppliers-${randomUUID().slice(0, 8)}`;

  beforeAll(async () => {
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
    if (!adminRole || !cashierRole) {
      throw new Error('Supplier tests require seeded admin and cashier roles');
    }

    const adminUser = await prisma.profile.create({
      data: {
        username: `${fixturePrefix}-admin`,
        full_name: 'Supplier Admin Fixture',
        password_hash: 'hash',
        role_id: adminRole.id,
      },
    });
    adminUserId = adminUser.id;

    const cashierUser = await prisma.profile.create({
      data: {
        username: `${fixturePrefix}-cashier`,
        full_name: 'Supplier Cashier Fixture',
        password_hash: 'hash',
        role_id: cashierRole.id,
      },
    });
    cashierUserId = cashierUser.id;

    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: adminUser.id, username: adminUser.username, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    cashierToken = jwt.sign(
      { id: cashierUser.id, username: cashierUser.username, role: 'cashier' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    const ingredient = await prisma.ingredient.create({
      data: {
        name: `${fixturePrefix}-ingredient`,
        current_stock: 50,
        unit: 'kg',
        min_stock: 10,
        unit_price: 5000,
      },
    });
    ingredientId = ingredient.id;

    const poSupplier = await prisma.supplier.create({
      data: { name: `${fixturePrefix}-po`, phone: '081200000001' },
    });
    poSupplierId = poSupplier.id;
    createdSupplierIds.push(poSupplier.id);

    const updateSupplier = await prisma.supplier.create({
      data: { name: `${fixturePrefix}-update`, phone: '081200000002' },
    });
    updateSupplierId = updateSupplier.id;
    createdSupplierIds.push(updateSupplier.id);

    const deleteSupplier = await prisma.supplier.create({
      data: { name: `${fixturePrefix}-delete`, phone: '081200000003' },
    });
    deleteSupplierId = deleteSupplier.id;
    createdSupplierIds.push(deleteSupplier.id);

    const pendingPurchaseOrder = await prisma.purchaseOrder.create({
      data: {
        po_number: `${fixturePrefix}-receive-pending`,
        supplier_id: poSupplier.id,
        subtotal: 5000,
        tax: 0,
        total: 5000,
        status: 'pending',
        items: {
          create: {
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            quantity: 100,
            unit: ingredient.unit,
            unit_price: 50,
            total_price: 5000,
          },
        },
      },
    });
    pendingPurchaseOrderId = pendingPurchaseOrder.id;
    createdPurchaseOrderIds.push(pendingPurchaseOrder.id);

    const receivedPurchaseOrder = await prisma.purchaseOrder.create({
      data: {
        po_number: `${fixturePrefix}-already-received`,
        supplier_id: poSupplier.id,
        subtotal: 500,
        tax: 0,
        total: 500,
        status: 'received',
        items: {
          create: {
            ingredient_id: ingredient.id,
            ingredient_name: ingredient.name,
            quantity: 10,
            unit: ingredient.unit,
            unit_price: 50,
            total_price: 500,
          },
        },
      },
    });
    receivedPurchaseOrderId = receivedPurchaseOrder.id;
    createdPurchaseOrderIds.push(receivedPurchaseOrder.id);
  });

  afterAll(async () => {
    const supplierIds = [...new Set(createdSupplierIds)];
    const persistedOrders = supplierIds.length > 0
      ? await prisma.purchaseOrder.findMany({
          where: { supplier_id: { in: supplierIds } },
          select: { id: true },
        })
      : [];
    const purchaseOrderIds = [...new Set([
      ...createdPurchaseOrderIds,
      ...persistedOrders.map(({ id }) => id),
    ])];
    const profileIds = [adminUserId, cashierUserId].filter(
      (id): id is string => Boolean(id),
    );

    if (purchaseOrderIds.length > 0) {
      await prisma.purchaseOrderItem.deleteMany({
        where: { purchase_order_id: { in: purchaseOrderIds } },
      });
      await prisma.purchaseOrder.deleteMany({ where: { id: { in: purchaseOrderIds } } });
    }
    if (ingredientId) {
      await prisma.stockAdjustmentLog.deleteMany({ where: { ingredient_id: ingredientId } });
    }
    if (supplierIds.length > 0) {
      await prisma.supplier.deleteMany({ where: { id: { in: supplierIds } } });
    }
    if (ingredientId) {
      await prisma.ingredient.deleteMany({ where: { id: ingredientId } });
    }
    if (profileIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { user_id: { in: profileIds } } });
      await prisma.profile.deleteMany({ where: { id: { in: profileIds } } });
    }
  });

  describe('Supplier CRUD Operations', () => {
    it('allows admin to create a supplier', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `${fixturePrefix}-create`,
          phone: '08123456789',
          email: `${fixturePrefix}@example.com`,
          address: '123 Supplier Street',
        });

      if (response.body.id) {
        createdSupplierIds.push(response.body.id);
      }
      expect(response.status).toBe(201);
      expect(response.body.name).toBe(`${fixturePrefix}-create`);
      expect(response.body.phone).toBe('08123456789');
    });

    it('rejects unauthenticated requests to create supplier (401)', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .send({
          name: 'Unauthorized Supplier',
          phone: '08123456789',
        });

      expect(response.status).toBe(401);
    });

    it('allows public access to fetch all suppliers', async () => {
      const response = await request(app).get('/api/suppliers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some(({ id }: { id: string }) => id === poSupplierId)).toBe(true);
    });

    it('allows admin to update supplier', async () => {
      const response = await request(app)
        .put(`/api/suppliers/${updateSupplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `${fixturePrefix}-updated`,
          phone: '08987654321',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(`${fixturePrefix}-updated`);
    });

    it('allows admin to delete supplier', async () => {
      const response = await request(app)
        .delete(`/api/suppliers/${deleteSupplierId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      // Verify deletion
      const deleted = await prisma.supplier.findUnique({
        where: { id: deleteSupplierId },
      });
      expect(deleted).toBeNull();
    });
  });

  describe('Purchase Order Operations', () => {
    it('allows admin to create purchase order', async () => {
      const response = await request(app)
        .post(`/api/suppliers/${poSupplierId}/purchase-orders`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ingredient_id: ingredientId,
          quantity: 100,
          unit_price: 50,
          notes: 'Test purchase order',
        });

      if (response.body.id) {
        createdPurchaseOrderIds.push(response.body.id);
      }
      expect(response.status).toBe(201);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].quantity).toBe(100);
      expect(response.body.items[0].total_price).toBe(5000);
      expect(response.body.total).toBe(5000);
      expect(response.body.status).toBe('pending');
    });

    it('rejects unauthenticated purchase order creation (401)', async () => {
      const response = await request(app)
        .post(`/api/suppliers/${poSupplierId}/purchase-orders`)
        .send({
          ingredient_id: ingredientId,
          quantity: 50,
          unit_price: 50,
        });

      expect(response.status).toBe(401);
    });

    it('allows fetching purchase orders for a supplier', async () => {
      const response = await request(app).get(`/api/suppliers/${poSupplierId}/purchase-orders`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some(({ id }: { id: string }) => id === pendingPurchaseOrderId)).toBe(true);
    });
  });

  describe('Purchase Order Receipt & Stock Adjustment', () => {
    it('allows admin to receive purchase order and updates stock', async () => {
      const stockBefore = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      const response = await request(app)
        .patch(`/api/suppliers/${poSupplierId}/purchase-orders/${pendingPurchaseOrderId}/receive`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('received');

      // Verify stock was updated
      const stockAfter = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      expect(stockAfter?.current_stock).toBe((stockBefore?.current_stock || 0) + 100);

      // Verify stock adjustment log was created
      const log = await prisma.stockAdjustmentLog.findFirst({
        where: {
          ingredient_id: ingredientId,
          adjustment_type: 'purchase',
        },
        orderBy: { created_at: 'desc' },
      });

      expect(log).toBeTruthy();
      expect(log?.new_stock).toBe(stockAfter?.current_stock);
      expect(log?.previous_stock).toBe(stockBefore?.current_stock);
      expect(log?.user_id).toBe(adminUserId);
    });

    it('rejects receiving already received purchase order (400)', async () => {
      const response = await request(app)
        .patch(`/api/suppliers/${poSupplierId}/purchase-orders/${receivedPurchaseOrderId}/receive`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not in pending status');
    });

    it('rejects unauthenticated receive request (401)', async () => {
      // Create a new pending PO
      const newPO = await prisma.purchaseOrder.create({
        data: {
          po_number: `${fixturePrefix}-unauthenticated`,
          supplier_id: poSupplierId!,
          subtotal: 2500,
          tax: 0,
          total: 2500,
          status: 'pending',
          items: {
            create: {
              ingredient_id: ingredientId!,
              ingredient_name: 'Test Ingredient',
              quantity: 50,
              unit: 'kg',
              unit_price: 50,
              total_price: 2500,
            },
          },
        },
      });
      createdPurchaseOrderIds.push(newPO.id);

      const response = await request(app)
        .patch(`/api/suppliers/${poSupplierId}/purchase-orders/${newPO.id}/receive`);

      expect(response.status).toBe(401);
    });
  });

  describe('Security & Authorization', () => {
    it('rejects supplier creation without admin role (403)', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          name: 'Cashier Supplier',
          phone: '08123456789',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Concurrent Purchase Order Receipt', () => {
    it('handles concurrent PO receipt without data inconsistency', async () => {
      // Create multiple pending POs
      const po1 = await prisma.purchaseOrder.create({
        data: {
          po_number: `${fixturePrefix}-concurrent-1`,
          supplier_id: poSupplierId!,
          subtotal: 1250,
          tax: 0,
          total: 1250,
          status: 'pending',
          items: {
            create: {
              ingredient_id: ingredientId!,
              ingredient_name: 'Test Ingredient',
              quantity: 25,
              unit: 'kg',
              unit_price: 50,
              total_price: 1250,
            },
          },
        },
      });
      createdPurchaseOrderIds.push(po1.id);

      const po2 = await prisma.purchaseOrder.create({
        data: {
          po_number: `${fixturePrefix}-concurrent-2`,
          supplier_id: poSupplierId!,
          subtotal: 1500,
          tax: 0,
          total: 1500,
          status: 'pending',
          items: {
            create: {
              ingredient_id: ingredientId!,
              ingredient_name: 'Test Ingredient',
              quantity: 30,
              unit: 'kg',
              unit_price: 50,
              total_price: 1500,
            },
          },
        },
      });
      createdPurchaseOrderIds.push(po2.id);

      const stockBefore = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      // Receive both POs concurrently
      const [res1, res2] = await Promise.all([
        request(app)
          .patch(`/api/suppliers/${poSupplierId}/purchase-orders/${po1.id}/receive`)
          .set('Authorization', `Bearer ${adminToken}`),
        request(app)
          .patch(`/api/suppliers/${poSupplierId}/purchase-orders/${po2.id}/receive`)
          .set('Authorization', `Bearer ${adminToken}`),
      ]);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);

      // Verify final stock is correct (should be stockBefore + 25 + 30)
      const stockAfter = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      const expectedStock = (stockBefore?.current_stock || 0) + 55;
      expect(stockAfter?.current_stock).toBe(expectedStock);

      // Verify both POs are marked as received
      const updatedPO1 = await prisma.purchaseOrder.findUnique({
        where: { id: po1.id },
      });
      const updatedPO2 = await prisma.purchaseOrder.findUnique({
        where: { id: po2.id },
      });

      expect(updatedPO1?.status).toBe('received');
      expect(updatedPO2?.status).toBe('received');

      // Verify two stock adjustment logs were created
      const logs = await prisma.stockAdjustmentLog.findMany({
        where: {
          ingredient_id: ingredientId,
          adjustment_type: 'purchase',
        },
        orderBy: { created_at: 'desc' },
        take: 2,
      });

      expect(logs.length).toBeGreaterThanOrEqual(2);
    });
  });
});
