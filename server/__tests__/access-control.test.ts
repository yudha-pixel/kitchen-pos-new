import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

describe('Access Control Tests', () => {
  let adminToken: string;
  let cashierToken: string;
  let managerToken: string;
  let ownerToken: string;
  const registeredUsername = `access_control_newuser_${Date.now()}`;

  beforeAll(async () => {
    // Clean up test users
    await prisma.profile.deleteMany({
      where: {
        username: {
          in: ['test_admin', 'test_cashier', 'test_manager', 'test_owner', registeredUsername],
        },
      },
    });

    // Create test roles if they don't exist
    const roles = ['admin', 'cashier', 'management', 'owner'];
    for (const roleName of roles) {
      const roleExists = await prisma.role.findUnique({ where: { name: roleName } });
      if (!roleExists) {
        await prisma.role.create({
          data: {
            name: roleName,
            description: `${roleName} role`,
            is_system: true,
          },
        });
      }
    }

    // Create test users
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const cashierRole = await prisma.role.findUnique({ where: { name: 'cashier' } });
    const managementRole = await prisma.role.findUnique({ where: { name: 'management' } });
    const ownerRole = await prisma.role.findUnique({ where: { name: 'owner' } });

    const adminPassword = await bcrypt.hash('test123', 10);
    const cashierPassword = await bcrypt.hash('test123', 10);
    const managerPassword = await bcrypt.hash('test123', 10);
    const ownerPassword = await bcrypt.hash('test123', 10);

    await prisma.profile.create({
      data: {
        username: 'test_admin',
        full_name: 'Test Admin',
        password_hash: adminPassword,
        role_id: adminRole!.id,
        is_active: true,
      },
    });

    await prisma.profile.create({
      data: {
        username: 'test_cashier',
        full_name: 'Test Cashier',
        password_hash: cashierPassword,
        role_id: cashierRole!.id,
        is_active: true,
      },
    });

    await prisma.profile.create({
      data: {
        username: 'test_manager',
        full_name: 'Test Manager',
        password_hash: managerPassword,
        role_id: managementRole!.id,
        is_active: true,
      },
    });

    await prisma.profile.create({
      data: {
        username: 'test_owner',
        full_name: 'Test Owner',
        password_hash: ownerPassword,
        role_id: ownerRole!.id,
        is_active: true,
      },
    });

    // Login and get tokens
    const adminRes = await request(app).post('/auth/login').send({
      username: 'test_admin',
      password: 'test123',
    });
    adminToken = adminRes.body.token;

    const cashierRes = await request(app).post('/auth/login').send({
      username: 'test_cashier',
      password: 'test123',
    });
    cashierToken = cashierRes.body.token;

    const managerRes = await request(app).post('/auth/login').send({
      username: 'test_manager',
      password: 'test123',
    });
    managerToken = managerRes.body.token;

    const ownerRes = await request(app).post('/auth/login').send({
      username: 'test_owner',
      password: 'test123',
    });
    ownerToken = ownerRes.body.token;
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.profile.deleteMany({
      where: {
        username: {
          in: ['test_admin', 'test_cashier', 'test_manager', 'test_owner', registeredUsername],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Public Routes', () => {
    it('should allow access to login endpoint without token', async () => {
      const res = await request(app).post('/auth/login').send({
        username: 'test_admin',
        password: 'test123',
      });
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('admin');
    });

    it('should reject access to protected settings without a token', async () => {
      const res = await request(app).get('/api/settings');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Authenticated Routes', () => {
    it('should return 401 for authenticated routes without token', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should allow access to authenticated routes with valid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('admin');
    });
  });

  describe('Admin-Only Routes', () => {
    it('should allow admin to access user management routes', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 403 for cashier accessing admin routes', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${cashierToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });

    it('should return 403 for manager accessing admin routes', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });
  });

  describe('Role-Based Access', () => {
    it('should allow admin to register new users', async () => {
      const res = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          username: registeredUsername,
          password: 'password123',
        });
      expect(res.status).toBe(200);
      expect(res.body.username).toBe(registeredUsername);
    });

    it('should deny cashier from registering new users', async () => {
      const res = await request(app)
        .post('/auth/register')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          username: 'newuser2',
          password: 'password123',
        });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden');
    });
  });

  describe('Sensitive Operations', () => {
    it('should require authentication for DELETE operations', async () => {
      const res = await request(app).delete('/api/products/test-id');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should require authentication for payment operations', async () => {
      const res = await request(app).post('/api/payments').send({
        amount: 10000,
        method: 'cash',
      });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Token Validation', () => {
    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid or expired token');
    });

    it('should reject missing token', async () => {
      const res = await request(app).get('/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });

    it('should reject malformed authorization header', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', 'InvalidFormat token');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });

  describe('Cross-Role Access', () => {
    it('should allow owner to access admin routes', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${ownerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should allow manager to access management routes', async () => {
      const res = await request(app)
        .get('/api/hr/employees')
        .set('Authorization', `Bearer ${managerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
