import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = express.Router();

// Get all attendances
router.get('/', authMiddleware, requirePermission(PERMISSIONS.attendance.view), async (req: Request, res: Response) => {
  try {
    const { employee_id, shift_type, date_from, date_to } = req.query;

    const where: any = {};

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (shift_type) {
      where.shift_type = shift_type;
    }

    if (date_from || date_to) {
      where.check_in_time = {};
      if (date_from) {
        where.check_in_time.gte = new Date(date_from as string);
      }
      if (date_to) {
        where.check_in_time.lte = new Date(date_to as string);
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: true,
      },
      orderBy: { check_in_time: 'desc' },
    });

    res.json(attendances);
  } catch (error) {
    console.error('Error fetching attendances:', error);
    res.status(500).json({ error: 'Failed to fetch attendances' });
  }
});

// Get attendance by ID
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.attendance.view), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const attendance = await prisma.attendance.findUnique({
      where: { id: id as string },
      include: {
        employee: true,
      },
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance not found' });
    }

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Check in (create attendance)
router.post('/check-in', authMiddleware, requirePermission(PERMISSIONS.attendance.edit), async (req: Request, res: Response) => {
  try {
    const { employee_id, photo_url, location_lat, location_lng, location_address, shift_type, notes } = req.body;

    if (!employee_id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employee_id },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employee_id,
        check_in_time: { gte: today },
        check_out_time: null,
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Already checked in today' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        employee_id,
        photo_url,
        location_lat,
        location_lng,
        location_address,
        shift_type,
        notes,
      },
      include: {
        employee: true,
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Check out (update attendance)
router.post('/check-out', authMiddleware, requirePermission(PERMISSIONS.attendance.edit), async (req: Request, res: Response) => {
  try {
    const { attendance_id, notes } = req.body;

    if (!attendance_id) {
      return res.status(400).json({ error: 'Attendance ID is required' });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendance_id },
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance not found' });
    }

    if (attendance.check_out_time) {
      return res.status(400).json({ error: 'Already checked out' });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance_id },
      data: {
        check_out_time: new Date(),
        notes: notes || attendance.notes,
      },
      include: {
        employee: true,
      },
    });

    res.json(updatedAttendance);
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ error: 'Failed to check out' });
  }
});

// Update attendance
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.attendance.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { check_out_time, notes, location_lat, location_lng, location_address } = req.body;

    const attendance = await prisma.attendance.update({
      where: { id: id as string },
      data: {
        ...(check_out_time !== undefined && { check_out_time }),
        ...(notes !== undefined && { notes }),
        ...(location_lat !== undefined && { location_lat }),
        ...(location_lng !== undefined && { location_lng }),
        ...(location_address !== undefined && { location_address }),
      },
      include: {
        employee: true,
      },
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// Delete attendance
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.attendance.delete), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.attendance.delete({
      where: { id: id as string },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance' });
  }
});

// Get attendance summary for today
router.get('/summary/today', authMiddleware, requirePermission(PERMISSIONS.attendance.view), async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        check_in_time: { gte: today },
      },
      include: {
        employee: true,
      },
    });

    const present = attendances.length;
    const checkedOut = attendances.filter((a: any) => a.check_out_time !== null).length;
    const stillWorking = present - checkedOut;

    res.json({
      date: today.toISOString().split('T')[0],
      present,
      checkedOut,
      stillWorking,
      attendances,
    });
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

export default router;
