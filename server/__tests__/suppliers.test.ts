import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

describe('Supplier & Purchase Order Integration Tests', () => {
  let adminToken: string;
  let supplierId: string;
  let ingredientId: string;
  let purchaseOrderId: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Get admin role
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    
    // Create admin user with unique username
    const adminUser = await prisma.profile.create({
      data: {
        username: `supplier_admin_test_${Date.now()}`,
        password_hash: 'hash',
        role_id: adminRole!.id,
      },
    });
    adminUserId = adminUser.id;

    // Get token
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: adminUserId, username: 'supplier_admin_test', role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test ingredient
    const ingredient = await prisma.ingredient.create({
      data: {
        name: 'Test Ingredient Supplier',
        current_stock: 50,
        unit: 'kg',
        min_stock: 10,
        unit_price: 5000,
      },
    });
    ingredientId = ingredient.id;
  });

  afterAll(async () => {
    // Cleanup in correct order to respect foreign key constraints
    await prisma.stockAdjustmentLog.deleteMany({
      where: { ingredient_id: ingredientId },
    });
    await prisma.purchaseOrder.deleteMany({
      where: { supplier_id: supplierId },
    });
    await prisma.supplier.deleteMany({
      where: { id: supplierId },
    });
    await prisma.ingredient.deleteMany({
      where: { id: ingredientId },
    });
    await prisma.profile.deleteMany({
      where: { id: adminUserId },
    });
  });

  describe('Supplier CRUD Operations', () => {
    it('allows admin to create a supplier', async () => {
      const response = await request(app)
        .post('/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Supplier',
          phone: '08123456789',
          email: 'test@supplier.com',
          address: '123 Supplier Street',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Supplier');
      expect(response.body.phone).toBe('08123456789');
      supplierId = response.body.id;
    });

    it('rejects unauthenticated requests to create supplier (401)', async () => {
      const response = await request(app)
        .post('/suppliers')
        .send({
          name: 'Unauthorized Supplier',
          phone: '08123456789',
        });

      expect(response.status).toBe(401);
    });

    it('allows public access to fetch all suppliers', async () => {
      const response = await request(app).get('/suppliers');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('allows admin to update supplier', async () => {
      const response = await request(app)
        .put(`/suppliers/${supplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Supplier Name',
          phone: '08987654321',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Supplier Name');
    });

    it('allows admin to delete supplier', async () => {
      // Create a temporary supplier to delete
      const tempSupplier = await prisma.supplier.create({
        data: {
          name: 'Temp Supplier',
          phone: '08111111111',
        },
      });

      const response = await request(app)
        .delete(`/suppliers/${tempSupplier.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);

      // Verify deletion
      const deleted = await prisma.supplier.findUnique({
        where: { id: tempSupplier.id },
      });
      expect(deleted).toBeNull();
    });
  });

  describe('Purchase Order Operations', () => {
    it('allows admin to create purchase order', async () => {
      const response = await request(app)
        .post(`/suppliers/${supplierId}/purchase-orders`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ingredient_id: ingredientId,
          quantity: 100,
          unit_price: 50,
          notes: 'Test purchase order',
        });

      expect(response.status).toBe(201);
      expect(response.body.quantity).toBe(100);
      expect(response.body.total_price).toBe(5000);
      expect(response.body.status).toBe('pending');
      purchaseOrderId = response.body.id;
    });

    it('rejects unauthenticated purchase order creation (401)', async () => {
      const response = await request(app)
        .post(`/suppliers/${supplierId}/purchase-orders`)
        .send({
          ingredient_id: ingredientId,
          quantity: 50,
          unit_price: 50,
        });

      expect(response.status).toBe(401);
    });

    it('allows fetching purchase orders for a supplier', async () => {
      const response = await request(app).get(`/suppliers/${supplierId}/purchase-orders`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Purchase Order Receipt & Stock Adjustment', () => {
    it('allows admin to receive purchase order and updates stock', async () => {
      const stockBefore = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      const response = await request(app)
        .patch(`/suppliers/${supplierId}/purchase-orders/${purchaseOrderId}/receive`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('received');
      expect(response.body.received_date).toBeDefined();

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
        .patch(`/suppliers/${supplierId}/purchase-orders/${purchaseOrderId}/receive`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not in pending status');
    });

    it('rejects unauthenticated receive request (401)', async () => {
      // Create a new pending PO
      const newPO = await prisma.purchaseOrder.create({
        data: {
          supplier_id: supplierId,
          ingredient_id: ingredientId,
          quantity: 50,
          unit_price: 50,
          total_price: 2500,
          status: 'pending',
        },
      });

      const response = await request(app)
        .patch(`/suppliers/${supplierId}/purchase-orders/${newPO.id}/receive`);

      expect(response.status).toBe(401);

      // Cleanup
      await prisma.purchaseOrder.delete({ where: { id: newPO.id } });
    });
  });

  describe('Security & Authorization', () => {
    it('rejects supplier creation without admin role (403)', async () => {
      // Get cashier role
      const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
      
      // Create cashier user
      const cashier = await prisma.profile.create({
        data: {
          username: 'supplier_cashier_test',
          password_hash: 'hash',
          role_id: cashierRole!.id,
        },
      });

      const jwt = require('jsonwebtoken');
      const cashierToken = jwt.sign(
        { id: cashier.id, username: 'supplier_cashier_test', role: 'cashier' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/suppliers')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          name: 'Cashier Supplier',
          phone: '08123456789',
        });

      expect(response.status).toBe(403);

      // Cleanup
      await prisma.profile.delete({ where: { id: cashier.id } });
    });
  });

  describe('Concurrent Purchase Order Receipt', () => {
    it('handles concurrent PO receipt without data inconsistency', async () => {
      // Create multiple pending POs
      const po1 = await prisma.purchaseOrder.create({
        data: {
          supplier_id: supplierId,
          ingredient_id: ingredientId,
          quantity: 25,
          unit_price: 50,
          total_price: 1250,
          status: 'pending',
        },
      });

      const po2 = await prisma.purchaseOrder.create({
        data: {
          supplier_id: supplierId,
          ingredient_id: ingredientId,
          quantity: 30,
          unit_price: 50,
          total_price: 1500,
          status: 'pending',
        },
      });

      const stockBefore = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
      });

      // Receive both POs concurrently
      const [res1, res2] = await Promise.all([
        request(app)
          .patch(`/suppliers/${supplierId}/purchase-orders/${po1.id}/receive`)
          .set('Authorization', `Bearer ${adminToken}`),
        request(app)
          .patch(`/suppliers/${supplierId}/purchase-orders/${po2.id}/receive`)
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
