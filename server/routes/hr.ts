import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all employees
router.get('/employees', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { position, employment_type, is_active, search } = req.query;

    const where: any = {};

    if (position) {
      where.position = position;
    }

    if (employment_type) {
      where.employment_type = employment_type;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        attendances: {
          orderBy: { check_in_time: 'desc' },
          take: 5,
        },
        payrolls: {
          orderBy: { period_start: 'desc' },
          take: 3,
        },
      },
    });

    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/employees/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await prisma.employee.findUnique({
      where: { id: id as string },
      include: {
        attendances: {
          orderBy: { check_in_time: 'desc' },
        },
        payrolls: {
          orderBy: { period_start: 'desc' },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Create new employee
router.post('/employees', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, position, employment_type, base_salary, hourly_rate, join_date, is_active } = req.body;

    if (!name || !phone || !position) {
      return res.status(400).json({ error: 'Name, phone, and position are required' });
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        phone,
        email,
        position,
        employment_type: employment_type || 'permanent',
        base_salary: base_salary || 0,
        hourly_rate: hourly_rate || 0,
        join_date: join_date ? new Date(join_date) : new Date(),
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    res.status(201).json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee
router.put('/employees/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, position, employment_type, base_salary, hourly_rate, join_date, is_active } = req.body;

    const employee = await prisma.employee.update({
      where: { id: id as string },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(position && { position }),
        ...(employment_type && { employment_type }),
        ...(base_salary !== undefined && { base_salary }),
        ...(hourly_rate !== undefined && { hourly_rate }),
        ...(join_date && { join_date: new Date(join_date) }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    res.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

// Delete employee
router.delete('/employees/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.employee.delete({
      where: { id: id as string },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Get HR statistics
router.get('/statistics', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const totalEmployees = await prisma.employee.count();
    const activeEmployees = await prisma.employee.count({ where: { is_active: true } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const presentToday = await prisma.attendance.count({
      where: {
        check_in_time: { gte: today },
      },
    });

    const totalSalary = await prisma.employee.aggregate({
      where: { is_active: true },
      _sum: { base_salary: true },
    });

    res.json({
      totalEmployees,
      activeEmployees,
      presentToday,
      totalSalary: totalSalary._sum.base_salary || 0,
    });
  } catch (error) {
    console.error('Error fetching HR statistics:', error);
    res.status(500).json({ error: 'Failed to fetch HR statistics' });
  }
});

// Get payroll summary by period
router.get('/payroll-summary', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { days } = req.query;
    const periodDays = days ? parseInt(days as string) : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const payrolls = await prisma.payroll.findMany({
      where: {
        period_start: { gte: startDate },
      },
      include: {
        employee: true,
      },
    });

    const totalPermanentSalary = payrolls
      .filter((p: any) => p.employee.employment_type === 'permanent')
      .reduce((sum: number, p: any) => sum + p.base_salary, 0);

    const totalFreelanceWages = payrolls
      .filter((p: any) => p.employee.employment_type === 'freelance')
      .reduce((sum: number, p: any) => sum + p.base_salary, 0);

    const totalOvertime = payrolls.reduce((sum: number, p: any) => sum + p.overtime_pay, 0);

    const totalHRExpenses = totalPermanentSalary + totalFreelanceWages + totalOvertime;

    res.json({
      totalPermanentSalary,
      totalFreelanceWages,
      totalOvertime,
      totalHRExpenses,
    });
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    res.status(500).json({ error: 'Failed to fetch payroll summary' });
  }
});

// Create payroll
router.post('/payroll', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { employee_id, period_start, period_end, base_salary, overtime_hours, overtime_pay, bonus, deduction } = req.body;

    if (!employee_id || !period_start || !period_end) {
      return res.status(400).json({ error: 'Employee ID and period dates are required' });
    }

    const totalPay = (base_salary || 0) + (overtime_pay || 0) + (bonus || 0) - (deduction || 0);

    const payroll = await prisma.payroll.create({
      data: {
        employee_id,
        period_start: new Date(period_start),
        period_end: new Date(period_end),
        base_salary: base_salary || 0,
        overtime_hours: overtime_hours || 0,
        overtime_pay: overtime_pay || 0,
        bonus: bonus || 0,
        deduction: deduction || 0,
        total_pay: totalPay,
      },
    });

    res.status(201).json(payroll);
  } catch (error) {
    console.error('Error creating payroll:', error);
    res.status(500).json({ error: 'Failed to create payroll' });
  }
});

// Get all payrolls
router.get('/payroll', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { employee_id, status } = req.query;

    const where: any = {};

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (status) {
      where.status = status;
    }

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: { period_start: 'desc' },
    });

    res.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    res.status(500).json({ error: 'Failed to fetch payrolls' });
  }
});

// Update payroll status
router.patch('/payroll/:id/status', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'approved', 'paid'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const payroll = await prisma.payroll.update({
      where: { id: id as string },
      data: { status },
    });

    res.json(payroll);
  } catch (error) {
    console.error('Error updating payroll status:', error);
    res.status(500).json({ error: 'Failed to update payroll status' });
  }
});

export default router;
