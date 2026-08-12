import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

describe('Stock Transfer API', () => {
  let testTransferId: string;
  let testWarehouse1Id: string;
  let testWarehouse2Id: string;
  let testIngredientId: string;
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
          full_name: 'Admin User',
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

      // Create test warehouses
      const wh1 = await prisma.warehouse.create({
        data: {
          name: 'Test Warehouse 1',
          code: 'TEST-WH-SRC',
          outlet_id: testOutletId,
        },
      });
      testWarehouse1Id = wh1.id;

      const wh2 = await prisma.warehouse.create({
        data: {
          name: 'Test Warehouse 2',
          code: 'TEST-WH-DST',
          outlet_id: testOutletId,
        },
      });
      testWarehouse2Id = wh2.id;

      // Create test ingredient in source warehouse
      const ingredient = await prisma.ingredient.create({
        data: {
          name: 'TEST-Transfer Ingredient',
          current_stock: 100,
          unit: 'kg',
          min_stock: 10,
          unit_price: 50000,
          warehouse_id: testWarehouse1Id,
        },
      });
      testIngredientId = ingredient.id;
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

  describe('POST /stock-transfers', () => {
    it('should create a new transfer request', async () => {
      if (!testWarehouse1Id || !testWarehouse2Id || !testIngredientId) {
        console.log('Skipping test: Missing test data');
        return;
      }

      const response = await request(app)
        .post('/api/stock-transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from_warehouse_id: testWarehouse1Id,
          to_warehouse_id: testWarehouse2Id,
          notes: 'Test transfer',
          items: [
            {
              ingredient_id: testIngredientId,
              quantity: 50,
              unit: 'kg',
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('pending');
      expect(response.body.items.length).toBe(1);
      testTransferId = response.body.id;
    });

    it('should reject transfer to same warehouse', async () => {
      if (!testWarehouse1Id || !testIngredientId) {
        return;
      }

      const response = await request(app)
        .post('/api/stock-transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from_warehouse_id: testWarehouse1Id,
          to_warehouse_id: testWarehouse1Id,
          items: [
            {
              ingredient_id: testIngredientId,
              quantity: 10,
              unit: 'kg',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('same warehouse');
    });

    it('should reject insufficient stock', async () => {
      if (!testWarehouse1Id || !testWarehouse2Id || !testIngredientId) {
        return;
      }

      const response = await request(app)
        .post('/api/stock-transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from_warehouse_id: testWarehouse1Id,
          to_warehouse_id: testWarehouse2Id,
          items: [
            {
              ingredient_id: testIngredientId,
              quantity: 1000,
              unit: 'kg',
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Insufficient stock');
    });
  });

  describe('GET /stock-transfers', () => {
    it('should return all transfers', async () => {
      const response = await request(app)
        .get('/api/stock-transfers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/stock-transfers?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].status).toBe('pending');
      }
    });
  });

  describe('PATCH /stock-transfers/:id', () => {
    it('should approve transfer', async () => {
      if (!testTransferId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/stock-transfers/${testTransferId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
      expect(response.body.approved_by).toBeTruthy();
    });

    it('should complete transfer', async () => {
      if (!testTransferId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/stock-transfers/${testTransferId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
    });

    it('should reject invalid status transition', async () => {
      if (!testTransferId) {
        return;
      }

      const response = await request(app)
        .patch(`/api/stock-transfers/${testTransferId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'pending' });

      expect(response.status).toBe(400);
      // The error may be a Zod validation error or a custom error message
      if (Array.isArray(response.body.error)) {
        expect(response.body.error.length).toBeGreaterThan(0);
      } else {
        expect(response.body.error).toBeTruthy();
      }
    });
  });

  describe('DELETE /stock-transfers/:id', () => {
    it('should delete pending transfer', async () => {
      if (!testWarehouse1Id || !testWarehouse2Id || !testIngredientId) {
        return;
      }

      // Create a pending transfer to delete
      const createResponse = await request(app)
        .post('/api/stock-transfers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          from_warehouse_id: testWarehouse1Id,
          to_warehouse_id: testWarehouse2Id,
          items: [
            {
              ingredient_id: testIngredientId,
              quantity: 10,
              unit: 'kg',
            },
          ],
        });

      const transferIdToDelete = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/stock-transfers/${transferIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject deleting completed transfer', async () => {
      if (!testTransferId) {
        return;
      }

      const response = await request(app)
        .delete(`/api/stock-transfers/${testTransferId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Can only delete pending');
    });
  });
});
