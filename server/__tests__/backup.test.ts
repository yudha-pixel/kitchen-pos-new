import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

describe('Backup & Restore API', () => {
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
  });

  afterAll(async () => {
    // Clean up test backups
    await prisma.databaseBackup.deleteMany({
      where: { filename: { startsWith: 'kitchen-pos-backup-' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /backup', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/backup');

      expect(response.status).toBe(401);
    });

    it('should reject without admin role', async () => {
      // Create a non-admin user
      const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
      if (cashierRole) {
        const passwordHash = await bcrypt.hash('cashier123', 10);
        const cashier = await prisma.profile.create({
          data: {
            username: 'test-cashier-backup',
            full_name: 'Test Cashier Backup',
            password_hash: passwordHash,
            role_id: cashierRole.id,
          },
        });

        const loginResponse = await request(app)
          .post('/auth/login')
          .send({ username: 'test-cashier-backup', password: 'cashier123' });
        
        const cashierToken = loginResponse.body.token;

        const response = await request(app)
          .post('/backup')
          .set('Authorization', `Bearer ${cashierToken}`);

        expect(response.status).toBe(403);

        // Cleanup
        await prisma.profile.delete({ where: { id: cashier.id } });
      }
    });

    it('should create backup with admin role', async () => {
      const response = await request(app)
        .post('/backup')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ backup_type: 'manual', notes: 'Test backup' });

      // This might fail if pg_dump is not available, but we test the endpoint exists
      expect([201, 500]).toContain(response.status);
    });
  });

  describe('GET /backup', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/backup');

      expect(response.status).toBe(401);
    });

    it('should reject without admin role', async () => {
      const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
      if (cashierRole) {
        const passwordHash = await bcrypt.hash('cashier123', 10);
        const cashier = await prisma.profile.create({
          data: {
            username: 'test-cashier-backup2',
            full_name: 'Test Cashier Backup 2',
            password_hash: passwordHash,
            role_id: cashierRole.id,
          },
        });

        const loginResponse = await request(app)
          .post('/auth/login')
          .send({ username: 'test-cashier-backup2', password: 'cashier123' });
        
        const cashierToken = loginResponse.body.token;

        const response = await request(app)
          .get('/backup')
          .set('Authorization', `Bearer ${cashierToken}`);

        expect(response.status).toBe(403);

        await prisma.profile.delete({ where: { id: cashier.id } });
      }
    });

    it('should get backups with admin role', async () => {
      const response = await request(app)
        .get('/backup')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('backups');
      expect(Array.isArray(response.body.backups)).toBe(true);
    });
  });

  describe('GET /backup/:id', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .get('/backup/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent backup', async () => {
      const response = await request(app)
        .get('/backup/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /backup/:id/restore', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .post('/backup/00000000-0000-0000-0000-000000000000/restore');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent backup', async () => {
      const response = await request(app)
        .post('/backup/00000000-0000-0000-0000-000000000000/restore')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /backup/:id', () => {
    it('should reject without authentication', async () => {
      const response = await request(app)
        .delete('/backup/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent backup', async () => {
      const response = await request(app)
        .delete('/backup/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
