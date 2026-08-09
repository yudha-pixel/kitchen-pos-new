import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { randomUUID } from 'crypto';

describe('Attendance API', () => {
  let authToken: string;
  let employeeId: string;
  let attendanceId: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Get admin role
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    
    // Create admin user for testing
    const adminUser = await prisma.profile.create({
      data: {
        username: `attendance_admin_test_${Date.now()}`,
        full_name: 'Attendance Admin Test',
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

    // Create test employee
    const employee = await prisma.employee.create({
      data: {
        name: 'Test Attendance Employee',
        phone: `TEST_ATT_${Date.now()}`,
        email: 'test.attendance@example.com',
        position: 'Waiter',
        employment_type: 'permanent',
        base_salary: 4000000,
        hourly_rate: 0,
        join_date: new Date().toISOString(),
        is_active: true
      },
    });
    employeeId = employee.id;

    // Clean up test data
    await prisma.attendance.deleteMany({
      where: { employee_id: employeeId }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.attendance.deleteMany({
      where: { employee_id: employeeId }
    });
    await prisma.employee.delete({
      where: { id: employeeId }
    });
    await prisma.profile.delete({
      where: { id: adminUserId }
    });
  });

  describe('POST /attendance/check-in', () => {
    it('should check in an employee', async () => {
      const response = await request(app)
        .post('/attendance/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          shift_type: 'morning',
          notes: 'Test check-in'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.employee_id).toBe(employeeId);
      expect(response.body.check_in_time).toBeTruthy();
      attendanceId = response.body.id;
    });

    it('should require employee_id', async () => {
      const response = await request(app)
        .post('/attendance/check-in')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          shift_type: 'morning'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/attendance/check-in')
        .send({
          employee_id: employeeId,
          shift_type: 'morning'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /attendance', () => {
    it('should get all attendance records', async () => {
      const response = await request(app)
        .get('/attendance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/attendance');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /attendance/:id', () => {
    it('should get attendance by ID', async () => {
      const response = await request(app)
        .get(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(attendanceId);
    });

    it('should return 404 for non-existent attendance', async () => {
      const response = await request(app)
        .get(`/attendance/${randomUUID()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /attendance/check-out', () => {
    it('should check out an employee', async () => {
      const response = await request(app)
        .post('/attendance/check-out')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          attendance_id: attendanceId,
          notes: 'Test check-out'
        });

      expect(response.status).toBe(200);
      expect(response.body.check_out_time).toBeTruthy();
    });

    it('should require attendance_id', async () => {
      const response = await request(app)
        .post('/attendance/check-out')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Test check-out'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /attendance/:id', () => {
    it('should update attendance', async () => {
      const response = await request(app)
        .put(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Updated notes'
        });

      expect(response.status).toBe(200);
      expect(response.body.notes).toBe('Updated notes');
    });

    it('should require admin role', async () => {
      const jwt = require('jsonwebtoken');
      const userToken = jwt.sign(
        { userId: randomUUID(), role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
      const response = await request(app)
        .put(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          notes: 'Updated notes'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /attendance/:id', () => {
    it('should delete attendance', async () => {
      const response = await request(app)
        .delete(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for deleted attendance', async () => {
      const response = await request(app)
        .get(`/attendance/${attendanceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /attendance/summary/today', () => {
    it('should get today\'s attendance summary', async () => {
      const response = await request(app)
        .get('/attendance/summary/today')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date');
      expect(response.body).toHaveProperty('present');
      expect(response.body).toHaveProperty('checkedOut');
      expect(response.body).toHaveProperty('stillWorking');
    });
  });
});
