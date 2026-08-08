import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

describe('HR API', () => {
  let authToken: string;
  let employeeId: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Get admin role
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    
    // Create admin user for testing
    const adminUser = await prisma.profile.create({
      data: {
        username: `hr_admin_test_${Date.now()}`,
        password_hash: 'hash',
        role_id: adminRole!.id,
      },
    });
    adminUserId = adminUser.id;

    // Generate auth token
    const jwt = require('jsonwebtoken');
    authToken = jwt.sign(
      { userId: adminUserId, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Clean up test data
    await prisma.employee.deleteMany({
      where: { phone: { startsWith: 'TEST_' } }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.employee.deleteMany({
      where: { phone: { startsWith: 'TEST_' } }
    });
    await prisma.profile.delete({
      where: { id: adminUserId }
    });
  });

  describe('POST /hr/employees', () => {
    it('should create a new employee', async () => {
      const response = await request(app)
        .post('/hr/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Employee',
          phone: 'TEST_08123456789',
          email: 'test.employee@example.com',
          position: 'Chef',
          employment_type: 'permanent',
          base_salary: 5000000,
          hourly_rate: 0,
          join_date: new Date().toISOString(),
          is_active: true
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Employee');
      expect(response.body.phone).toBe('TEST_08123456789');
      employeeId = response.body.id;
    });

    it('should require name, phone, and position', async () => {
      const response = await request(app)
        .post('/hr/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/hr/employees')
        .send({
          name: 'Test Employee',
          phone: 'TEST_08123456789',
          position: 'Chef'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /hr/employees', () => {
    it('should get all employees', async () => {
      const response = await request(app)
        .get('/hr/employees')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/hr/employees');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /hr/employees/:id', () => {
    it('should get an employee by ID', async () => {
      const response = await request(app)
        .get(`/hr/employees/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(employeeId);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app)
        .get(`/hr/employees/${randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /hr/employees/:id', () => {
    it('should update an employee', async () => {
      const response = await request(app)
        .put(`/hr/employees/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Employee',
          email: 'updated.employee@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Employee');
      expect(response.body.email).toBe('updated.employee@example.com');
    });

    it('should require admin role', async () => {
      const jwt = require('jsonwebtoken');
      const userToken = jwt.sign(
        { userId: randomUUID(), role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      const response = await request(app)
        .put(`/hr/employees/${employeeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Employee'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /hr/employees/:id', () => {
    it('should delete an employee', async () => {
      const response = await request(app)
        .delete(`/hr/employees/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for deleted employee', async () => {
      const response = await request(app)
        .get(`/hr/employees/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /hr/statistics', () => {
    it('should get HR statistics', async () => {
      const response = await request(app)
        .get('/hr/statistics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalEmployees');
      expect(response.body).toHaveProperty('activeEmployees');
    });
  });
});
