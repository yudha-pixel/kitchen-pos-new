import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

describe('Inventory Security Tests', () => {
  let adminToken: string;
  let cashierToken: string;
  let testIngredientId: string;
  let adminUserId: string;
  let cashierUserId: string;

  beforeAll(async () => {
    // Get admin and cashier roles
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
    
    // Create admin user
    const adminUser = await prisma.profile.create({
      data: {
        username: 'inventory_admin_test',
        password_hash: 'hash',
        role_id: adminRole!.id,
      },
    });
    adminUserId = adminUser.id;

    // Create cashier user
    const cashierUser = await prisma.profile.create({
      data: {
        username: 'inventory_cashier_test',
        password_hash: 'hash',
        role_id: cashierRole!.id,
      },
    });
    cashierUserId = cashierUser.id;

    // Get tokens (simulating login)
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'inventory_admin_test', password: 'password' });
    
    const cashierLogin = await request(app)
      .post('/auth/login')
      .send({ username: 'inventory_cashier_test', password: 'password' });

    // For testing, we'll manually create JWT tokens
    const jwt = require('jsonwebtoken');
    adminToken = jwt.sign(
      { id: adminUserId, username: 'inventory_admin_test', role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
    cashierToken = jwt.sign(
      { id: cashierUserId, username: 'inventory_cashier_test', role: 'cashier' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create test ingredient
    const ingredient = await prisma.ingredient.create({
      data: {
        name: 'Test Ingredient Security',
        current_stock: 100,
        unit: 'kg',
        min_stock: 10,
        unit_price: 5000,
      },
    });
    testIngredientId = ingredient.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.stockAdjustmentLog.deleteMany({
      where: { ingredient_id: testIngredientId },
    });
    await prisma.ingredient.deleteMany({
      where: { id: testIngredientId },
    });
    await prisma.profile.deleteMany({
      where: { id: { in: [adminUserId, cashierUserId] } },
    });
  });

  describe('GET /ingredients - public access', () => {
    it('allows unauthenticated users to fetch ingredients', async () => {
      const response = await request(app)
        .get('/ingredients');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /ingredients - create ingredient', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const response = await request(app)
        .post('/ingredients')
        .send({
          name: 'Unauthorized Ingredient',
          current_stock: 50,
          unit: 'kg',
          min_stock: 5,
          unit_price: 10000,
        });

      expect(response.status).toBe(401);
    });

    it('rejects requests from cashier role (403)', async () => {
      const response = await request(app)
        .post('/ingredients')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          name: 'Cashier Ingredient',
          current_stock: 50,
          unit: 'kg',
          min_stock: 5,
          unit_price: 10000,
        });

      expect(response.status).toBe(403);
    });

    it('allows requests from admin role (201)', async () => {
      const response = await request(app)
        .post('/ingredients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Ingredient',
          current_stock: 50,
          unit: 'kg',
          min_stock: 5,
          unit_price: 10000,
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Admin Ingredient');

      // Cleanup
      await prisma.ingredient.delete({ where: { id: response.body.id } });
    });
  });

  describe('PUT /ingredients/:id - update ingredient stock', () => {
    it('rejects unauthenticated requests (401)', async () => {
      const response = await request(app)
        .put(`/ingredients/${testIngredientId}`)
        .send({
          name: 'Updated Ingredient',
          current_stock: 150,
          unit: 'kg',
          min_stock: 10,
          unit_price: 6000,
        });

      expect(response.status).toBe(401);
    });

    it('rejects requests from cashier role (403)', async () => {
      const response = await request(app)
        .put(`/ingredients/${testIngredientId}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          name: 'Updated Ingredient',
          current_stock: 150,
          unit: 'kg',
          min_stock: 10,
          unit_price: 6000,
        });

      expect(response.status).toBe(403);
    });

    it('allows requests from admin role (200)', async () => {
      const response = await request(app)
        .put(`/ingredients/${testIngredientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Ingredient',
          current_stock: 150,
          unit: 'kg',
          min_stock: 10,
          unit_price: 6000,
        });

      expect(response.status).toBe(200);
      expect(response.body.current_stock).toBe(150);
    });

    it('creates stock adjustment log when stock changes', async () => {
      const logCountBefore = await prisma.stockAdjustmentLog.count({
        where: { ingredient_id: testIngredientId },
      });

      await request(app)
        .put(`/ingredients/${testIngredientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Ingredient',
          current_stock: 200,
          unit: 'kg',
          min_stock: 10,
          unit_price: 6000,
        });

      const logCountAfter = await prisma.stockAdjustmentLog.count({
        where: { ingredient_id: testIngredientId },
      });

      expect(logCountAfter).toBe(logCountBefore + 1);

      // Verify log details
      const log = await prisma.stockAdjustmentLog.findFirst({
        where: { ingredient_id: testIngredientId },
        orderBy: { created_at: 'desc' },
      });

      expect(log).toBeTruthy();
      expect(log?.previous_stock).toBe(150);
      expect(log?.new_stock).toBe(200);
      expect(log?.adjustment_type).toBe('manual');
      expect(log?.user_id).toBe(adminUserId);
    });
  });

  describe('DELETE /ingredients/:id - delete ingredient', () => {
    let deleteTestIngredientId: string;

    beforeAll(async () => {
      const ingredient = await prisma.ingredient.create({
        data: {
          name: 'To Be Deleted',
          current_stock: 10,
          unit: 'kg',
          min_stock: 1,
          unit_price: 1000,
        },
      });
      deleteTestIngredientId = ingredient.id;
    });

    afterAll(async () => {
      await prisma.ingredient.deleteMany({
        where: { id: deleteTestIngredientId },
      });
    });

    it('rejects unauthenticated requests (401)', async () => {
      const response = await request(app)
        .delete(`/ingredients/${deleteTestIngredientId}`);

      expect(response.status).toBe(401);
    });

    it('rejects requests from cashier role (403)', async () => {
      const response = await request(app)
        .delete(`/ingredients/${deleteTestIngredientId}`)
        .set('Authorization', `Bearer ${cashierToken}`);

      expect(response.status).toBe(403);
    });

    it('allows requests from admin role (204)', async () => {
      const response = await request(app)
        .delete(`/ingredients/${deleteTestIngredientId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });
  });

  describe('Stock adjustment audit trail', () => {
    it('logs all stock changes with proper metadata', async () => {
      const initialStock = 200;
      const finalStock = 250;

      await request(app)
        .put(`/ingredients/${testIngredientId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Audit Test Ingredient',
          current_stock: finalStock,
          unit: 'kg',
          min_stock: 10,
          unit_price: 6000,
        });

      const logs = await prisma.stockAdjustmentLog.findMany({
        where: { ingredient_id: testIngredientId },
        orderBy: { created_at: 'desc' },
        take: 1,
      });

      expect(logs.length).toBeGreaterThan(0);
      const log = logs[0];
      expect(log.previous_stock).toBe(initialStock);
      expect(log.new_stock).toBe(finalStock);
      expect(log.adjustment_type).toBe('manual');
      expect(log.user_id).toBe(adminUserId);
      expect(log.reason).toBe('Manual stock adjustment via API');
      expect(log.created_at).toBeDefined();
    });
  });
});
