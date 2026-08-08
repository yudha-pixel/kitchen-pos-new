import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

describe('Kitchen Routing API', () => {
  let authToken: string;
  let testStationId: string;
  let testCategoryId: string;
  let testOutletId: string;

  beforeAll(async () => {
    // Create admin user for testing
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const adminUser = await prisma.profile.findUnique({ where: { username: 'admin' } });
    
    if (!adminUser && adminRole) {
      const passwordHash = await bcrypt.hash('admin', 10);
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

    // Get a test category
    const category = await prisma.category.findFirst();
    if (category) {
      testCategoryId = category.id;
    }
  });

  afterAll(async () => {
    // Clean up test kitchen stations
    await prisma.kitchenStationCategory.deleteMany({
      where: { kitchen_station: { code: { startsWith: 'TEST-' } } },
    });
    await prisma.kitchenStation.deleteMany({
      where: { code: { startsWith: 'TEST-' } },
    });
    await prisma.$disconnect();
  });

  describe('GET /kitchen/stations', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/kitchen/stations');

      expect(response.status).toBe(401);
    });

    it('should get all stations with authentication', async () => {
      const response = await request(app)
        .get('/kitchen/stations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /kitchen/stations', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/kitchen/stations')
        .send({ name: 'Test Station', code: 'TEST-STATION' });

      expect(response.status).toBe(401);
    });

    it('should reject without admin role', async () => {
      // Create a non-admin user
      const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
      if (cashierRole) {
        const passwordHash = await bcrypt.hash('cashier123', 10);
        const cashier = await prisma.profile.create({
          data: {
            username: 'test-cashier',
            password_hash: passwordHash,
            role_id: cashierRole.id,
          },
        });

        const loginResponse = await request(app)
          .post('/auth/login')
          .send({ username: 'test-cashier', password: 'cashier123' });
        
        const cashierToken = loginResponse.body.token;

        const response = await request(app)
          .post('/kitchen/stations')
          .set('Authorization', `Bearer ${cashierToken}`)
          .send({ name: 'Test Station', code: 'TEST-STATION' });

        expect(response.status).toBe(403);

        // Cleanup
        await prisma.profile.delete({ where: { id: cashier.id } });
      }
    });

    it('should create station with admin role', async () => {
      if (!testOutletId) {
        return;
      }

      const response = await request(app)
        .post('/kitchen/stations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Kitchen Station',
          code: 'TEST-KITCHEN',
          outlet_id: testOutletId,
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Kitchen Station');
      expect(response.body.code).toBe('TEST-KITCHEN');
      testStationId = response.body.id;
    });

    it('should reject duplicate code', async () => {
      const response = await request(app)
        .post('/kitchen/stations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Another Station',
          code: 'TEST-KITCHEN',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('POST /kitchen/stations/:id/categories', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .post(`/kitchen/stations/${testStationId}/categories`)
        .send({ category_id: testCategoryId });

      expect(response.status).toBe(401);
    });

    it('should assign category to station', async () => {
      if (!testStationId || !testCategoryId) {
        return;
      }

      const response = await request(app)
        .post(`/kitchen/stations/${testStationId}/categories`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ category_id: testCategoryId });

      expect(response.status).toBe(201);
      expect(response.body.category_id).toBe(testCategoryId);
    });
  });

  describe('GET /kitchen/orders', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/kitchen/orders');

      expect(response.status).toBe(401);
    });

    it('should reject without station_id', async () => {
      const response = await request(app)
        .get('/kitchen/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should get orders for station', async () => {
      if (!testStationId) {
        return;
      }

      const response = await request(app)
        .get(`/kitchen/orders?station_id=${testStationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /kitchen/stations/:id', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .delete(`/kitchen/stations/${testStationId}`);

      expect(response.status).toBe(401);
    });

    it('should delete station with admin role', async () => {
      if (!testStationId) {
        return;
      }

      const response = await request(app)
        .delete(`/kitchen/stations/${testStationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });
});
