import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

describe('Warehouse Management API', () => {
  let testWarehouseId: string;
  let testOutletId: string;
  let authToken: string;

  beforeAll(async () => {
    // Clean up test data in correct order to avoid foreign key violations
    // Order: StockTransferItem -> StockTransfer -> Ingredient -> Warehouse
    // First, get test warehouses and ingredients
    const testWarehouses = await prisma.warehouse.findMany({
      where: { code: { startsWith: 'TEST-' } },
      select: { id: true },
    });
    const testWarehouseIds = testWarehouses.map((w: { id: string }) => w.id);

    const testIngredients = await prisma.ingredient.findMany({
      where: { name: { startsWith: 'TEST-' } },
      select: { id: true },
    });
    const testIngredientIds = testIngredients.map((i: { id: string }) => i.id);

    // Delete stock transfer items that reference test ingredients
    if (testIngredientIds.length > 0) {
      await prisma.stockTransferItem.deleteMany({
        where: { ingredient_id: { in: testIngredientIds } },
      });
    }

    // Delete stock transfers that reference test warehouses
    if (testWarehouseIds.length > 0) {
      await prisma.stockTransfer.deleteMany({
        where: {
          OR: [
            { from_warehouse_id: { in: testWarehouseIds } },
            { to_warehouse_id: { in: testWarehouseIds } },
          ],
        },
      });
    }

    await prisma.stockTransfer.deleteMany({
      where: { transfer_number: { startsWith: 'TRF-TEST' } },
    });
    await prisma.ingredient.deleteMany({
      where: { name: { startsWith: 'TEST-' } },
    });
    await prisma.warehouse.deleteMany({
      where: { code: { startsWith: 'TEST-' } },
    });

    // Create admin user for testing
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const adminUser = await prisma.profile.findUnique({ where: { username: 'admin' } });
    
    if (!adminUser && adminRole) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await prisma.profile.create({
        data: {
          username: 'admin',
          password_hash: passwordHash,
          role_id: adminRole.id,
        },
      });
    }

    // Get auth token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin' });
    
    authToken = loginResponse.body.token;

    // Get a test outlet
    const outlet = await prisma.outlet.findFirst();
    if (outlet) {
      testOutletId = outlet.id;
    }
  });

  afterAll(async () => {
    // Clean up test data in correct order to avoid foreign key violations
    // Order: StockTransferItem -> StockTransfer -> Ingredient -> Warehouse
    // First, get test warehouses and ingredients
    const testWarehouses = await prisma.warehouse.findMany({
      where: { code: { startsWith: 'TEST-' } },
      select: { id: true },
    });
    const testWarehouseIds = testWarehouses.map((w: { id: string }) => w.id);

    const testIngredients = await prisma.ingredient.findMany({
      where: { name: { startsWith: 'TEST-' } },
      select: { id: true },
    });
    const testIngredientIds = testIngredients.map((i: { id: string }) => i.id);

    // Delete stock transfer items that reference test ingredients
    if (testIngredientIds.length > 0) {
      await prisma.stockTransferItem.deleteMany({
        where: { ingredient_id: { in: testIngredientIds } },
      });
    }

    // Delete stock transfers that reference test warehouses
    if (testWarehouseIds.length > 0) {
      await prisma.stockTransfer.deleteMany({
        where: {
          OR: [
            { from_warehouse_id: { in: testWarehouseIds } },
            { to_warehouse_id: { in: testWarehouseIds } },
          ],
        },
      });
    }

    await prisma.stockTransfer.deleteMany({
      where: { transfer_number: { startsWith: 'TRF-TEST' } },
    });
    await prisma.ingredient.deleteMany({
      where: { name: { startsWith: 'TEST-' } },
    });
    await prisma.warehouse.deleteMany({
      where: { code: { startsWith: 'TEST-' } },
    });
    await prisma.$disconnect();
  });

  describe('GET /warehouses', () => {
    it('should return all warehouses', async () => {
      const response = await request(app)
        .get('/warehouses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .get('/warehouses');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /warehouses', () => {
    it('should create a new warehouse', async () => {
      if (!testOutletId) {
        console.log('Skipping test: No outlet found');
        return;
      }

      const response = await request(app)
        .post('/warehouses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Warehouse',
          code: 'TEST-WH1',
          outlet_id: testOutletId,
          address: 'Test Address',
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Warehouse');
      expect(response.body.code).toBe('TEST-WH1');
      testWarehouseId = response.body.id;
    });

    it('should reject duplicate code', async () => {
      if (!testOutletId) {
        return;
      }

      const response = await request(app)
        .post('/warehouses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Another Warehouse',
          code: 'TEST-WH1',
          outlet_id: testOutletId,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    it('should reject invalid outlet', async () => {
      const response = await request(app)
        .post('/warehouses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Warehouse',
          code: 'TEST-WH2',
          outlet_id: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Outlet not found');
    });
  });

  describe('GET /warehouses/:id', () => {
    it('should return specific warehouse', async () => {
      if (!testWarehouseId) {
        return;
      }

      const response = await request(app)
        .get(`/warehouses/${testWarehouseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testWarehouseId);
    });

    it('should return 404 for non-existent warehouse', async () => {
      const response = await request(app)
        .get('/warehouses/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /warehouses/:id', () => {
    it('should update warehouse', async () => {
      if (!testWarehouseId) {
        return;
      }

      const response = await request(app)
        .put(`/warehouses/${testWarehouseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Warehouse',
          address: 'Updated Address',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Warehouse');
    });
  });

  describe('DELETE /warehouses/:id', () => {
    it('should delete warehouse', async () => {
      // Create a test warehouse to delete
      if (!testOutletId) {
        return;
      }

      const createResponse = await request(app)
        .post('/warehouses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete Test Warehouse',
          code: 'TEST-DELETE',
          outlet_id: testOutletId,
        });

      const warehouseIdToDelete = createResponse.body.id;

      const response = await request(app)
        .delete(`/warehouses/${warehouseIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
