import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

describe('Audit Trail API', () => {
  let authToken: string;

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
  });

  afterAll(async () => {
    // Clean up test audit logs
    await prisma.auditLog.deleteMany({
      where: { description: { contains: 'TEST' } },
    });
    await prisma.$disconnect();
  });

  describe('GET /audit', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/audit');

      expect(response.status).toBe(401);
    });

    it('should reject without admin role', async () => {
      // Create a non-admin user
      const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
      if (cashierRole) {
        const passwordHash = await bcrypt.hash('cashier123', 10);
        const cashier = await prisma.profile.create({
          data: {
            username: 'test-cashier-audit',
            password_hash: passwordHash,
            role_id: cashierRole.id,
          },
        });

        const loginResponse = await request(app)
          .post('/auth/login')
          .send({ username: 'test-cashier-audit', password: 'cashier123' });
        
        const cashierToken = loginResponse.body.token;

        const response = await request(app)
          .get('/audit')
          .set('Authorization', `Bearer ${cashierToken}`);

        expect(response.status).toBe(403);

        // Cleanup
        await prisma.profile.delete({ where: { id: cashier.id } });
      }
    });

    it('should get audit logs with admin role', async () => {
      const response = await request(app)
        .get('/audit')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it('should filter by action', async () => {
      const response = await request(app)
        .get('/audit?action=create')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
    });

    it('should filter by entity_type', async () => {
      const response = await request(app)
        .get('/audit?entity_type=order')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('logs');
    });
  });

  describe('GET /audit/:id', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/audit/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent log', async () => {
      const response = await request(app)
        .get('/audit/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /audit/stats/summary', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/audit/stats/summary');

      expect(response.status).toBe(401);
    });

    it('should reject without admin role', async () => {
      const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
      if (cashierRole) {
        const passwordHash = await bcrypt.hash('cashier123', 10);
        const cashier = await prisma.profile.create({
          data: {
            username: 'test-cashier-audit2',
            password_hash: passwordHash,
            role_id: cashierRole.id,
          },
        });

        const loginResponse = await request(app)
          .post('/auth/login')
          .send({ username: 'test-cashier-audit2', password: 'cashier123' });
        
        const cashierToken = loginResponse.body.token;

        const response = await request(app)
          .get('/audit/stats/summary')
          .set('Authorization', `Bearer ${cashierToken}`);

        expect(response.status).toBe(403);

        await prisma.profile.delete({ where: { id: cashier.id } });
      }
    });

    it('should get audit statistics with admin role', async () => {
      const response = await request(app)
        .get('/audit/stats/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalLogs');
      expect(response.body).toHaveProperty('logsByAction');
      expect(response.body).toHaveProperty('logsByEntityType');
    });
  });
});
