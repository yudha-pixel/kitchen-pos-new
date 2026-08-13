import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import { z } from 'zod';

const router = Router();

// Helper function to update table status based on reservations
async function updateTableStatusBasedOnReservations(tableId: string) {
  const now = new Date();
  
  // Check for upcoming reservations
  const upcomingReservation = await prisma.reservation.findFirst({
    where: {
      table_id,
      status: { in: ['pending', 'confirmed'] },
      reservation_date: { gte: now },
    },
  });

  // Check for active orders
  const activeOrder = await prisma.order.findFirst({
    where: {
      table_id,
      status: { in: ['pending', 'preparing', 'ready', 'served'] },
    },
  });

  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });

  if (!table) return;

  // Update status based on orders and reservations
  if (activeOrder) {
    // Has active order - mark as occupied
    if (table.status !== 'occupied') {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'occupied' }
      });
    }
  } else if (upcomingReservation) {
    // Has upcoming reservation - mark as reserved
    if (table.status !== 'reserved') {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'reserved' }
      });
    }
  } else {
    // No active orders or reservations - mark as available
    if (table.status === 'occupied' || table.status === 'reserved') {
      await prisma.table.update({
        where: { id: tableId },
        data: { status: 'available' }
      });
    }
  }
}

// Validation schemas
const createReservationSchema = z.object({
  customer_name: z.string().min(1),
  customer_phone: z.string().min(10),
  customer_email: z.string().email().optional(),
  party_size: z.number().int().min(1).max(20),
  reservation_date: z.string(),
  reservation_time: z.string(),
  duration_minutes: z.number().int().optional(),
  area: z.enum(['Indoor', 'Outdoor', 'VIP']),
  special_requests: z.string().optional(),
  deposit_amount: z.number().optional(),
  table_id: z.string().uuid().optional(),
  outlet_id: z.string().uuid().optional(),
});

const updateReservationSchema = z.object({
  customer_name: z.string().min(1).optional(),
  customer_phone: z.string().min(10).optional(),
  customer_email: z.string().email().optional(),
  party_size: z.number().int().min(1).max(20).optional(),
  reservation_date: z.string().optional(),
  reservation_time: z.string().optional(),
  duration_minutes: z.number().int().optional(),
  area: z.enum(['Indoor', 'Outdoor', 'VIP']).optional(),
  special_requests: z.string().optional(),
  deposit_amount: z.number().optional(),
  deposit_paid: z.boolean().optional(),
  table_id: z.string().uuid().optional(),
});

const confirmReservationSchema = z.object({
  confirmation_notes: z.string().optional(),
});

const cancelReservationSchema = z.object({
  cancellation_reason: z.string().min(1),
});

// GET /reservations - List all reservations with filters
router.get('/', authMiddleware, requirePermission(PERMISSIONS.reservations.view), async (req: Request, res: Response) => {
  try {
    const { date, status, area, customer_name } = req.query;

    const where: any = {};

    if (date && typeof date === 'string') {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);
      where.reservation_date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (status && typeof status === 'string') {
      where.status = status;
    }

    if (area && typeof area === 'string') {
      where.area = area;
    }

    if (customer_name && typeof customer_name === 'string') {
      where.customer_name = {
        contains: customer_name,
        mode: 'insensitive',
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        table: {
          select: {
            id: true,
            table_number: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
        confirmedBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
        cancelledBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
      orderBy: [
        { reservation_date: 'asc' },
        { reservation_time: 'asc' },
      ],
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /reservations/:id - Get single reservation
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.reservations.view), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
        createdBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
        confirmedBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
        cancelledBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /reservations - Create new reservation
router.post('/', authMiddleware, requirePermission(PERMISSIONS.reservations.create), async (req: Request, res: Response) => {
  try {
    const data = createReservationSchema.parse(req.body);

    // Check for overlapping reservations
    const reservationDateTime = new Date(`${data.reservation_date}T${data.reservation_time}`);
    const duration = data.duration_minutes || 120; // Default 2 hours
    const endTime = new Date(reservationDateTime.getTime() + duration * 60000);

    const overlapping = await prisma.reservation.findMany({
      where: {
        area: data.area,
        status: { in: ['pending', 'confirmed'] },
        reservation_date: {
          gte: new Date(reservationDateTime),
          lte: endTime,
        },
      },
    });

    if (overlapping.length > 0) {
      return res.status(409).json({ 
        error: 'Waktu reservasi bentrok dengan reservasi lain di area yang sama',
        overlapping: overlapping.map(r => ({
          id: r.id,
          time: r.reservation_time,
          party_size: r.party_size,
        }))
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        id: randomUUID(),
        ...data,
        reservation_date: new Date(data.reservation_date),
        reservation_time: new Date(data.reservation_time),
        created_by: req.user?.id,
      },
      include: {
        table: true,
        createdBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    res.status(201).json(reservation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /reservations/:id - Update reservation
router.patch('/:id', authMiddleware, requirePermission(PERMISSIONS.reservations.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateReservationSchema.parse(req.body);

    const existing = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (existing.status !== 'pending') {
      return res.status(400).json({ error: 'Hanya reservasi pending yang dapat diubah' });
    }

    // Check for overlapping if date/time/area changed
    if (data.reservation_date || data.reservation_time || data.area) {
      const newDate = data.reservation_date ? new Date(data.reservation_date) : existing.reservation_date;
      const newTime = data.reservation_time ? new Date(data.reservation_time) : existing.reservation_time;
      const newArea = data.area || existing.area;
      
      const reservationDateTime = new Date(`${newDate.toISOString().split('T')[0]}T${newTime.toISOString().split('T')[1]}`);
      const duration = data.duration_minutes || existing.duration_minutes || 120;
      const endTime = new Date(reservationDateTime.getTime() + duration * 60000);

      const overlapping = await prisma.reservation.findMany({
        where: {
          area: newArea,
          status: { in: ['pending', 'confirmed'] },
          id: { not: id },
          reservation_date: {
            gte: new Date(reservationDateTime),
            lte: endTime,
          },
        },
      });

      if (overlapping.length > 0) {
        return res.status(409).json({ 
          error: 'Waktu reservasi bentrok dengan reservasi lain di area yang sama',
          overlapping: overlapping.map(r => ({
            id: r.id,
            time: r.reservation_time,
            party_size: r.party_size,
          }))
        });
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        ...data,
        reservation_date: data.reservation_date ? new Date(data.reservation_date) : undefined,
        reservation_time: data.reservation_time ? new Date(data.reservation_time) : undefined,
      },
      include: {
        table: true,
      },
    });

    res.json(reservation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /reservations/:id - Delete reservation
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.reservations.delete), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (existing.status !== 'pending') {
      return res.status(400).json({ error: 'Hanya reservasi pending yang dapat dihapus' });
    }

    await prisma.reservation.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /reservations/:id/confirm - Confirm reservation
router.patch('/:id/confirm', authMiddleware, requirePermission(PERMISSIONS.reservations.confirm), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { confirmation_notes } = confirmReservationSchema.parse(req.body);

    const existing = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (existing.status !== 'pending') {
      return res.status(400).json({ error: 'Hanya reservasi pending yang dapat dikonfirmasi' });
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: 'confirmed',
        confirmation_notes,
        confirmed_by: req.user?.id,
        confirmed_at: new Date(),
      },
      include: {
        table: true,
        confirmedBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    // Update table status if table is assigned
    if (reservation.table_id) {
      await updateTableStatusBasedOnReservations(reservation.table_id);
    }

    res.json(reservation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error confirming reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /reservations/:id/cancel - Cancel reservation
router.patch('/:id/cancel', authMiddleware, requirePermission(PERMISSIONS.reservations.cancel), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cancellation_reason } = cancelReservationSchema.parse(req.body);

    const existing = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (existing.status === 'cancelled' || existing.status === 'completed' || existing.status === 'no_show') {
      return res.status(400).json({ error: 'Reservasi sudah tidak dapat dibatalkan' });
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancellation_reason,
        cancelled_by: req.user?.id,
        cancelled_at: new Date(),
      },
      include: {
        table: true,
        cancelledBy: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    // Update table status if table is assigned
    if (reservation.table_id) {
      await updateTableStatusBasedOnReservations(reservation.table_id);
    }

    res.json(reservation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /reservations/availability - Check availability
router.get('/availability', authMiddleware, requirePermission(PERMISSIONS.reservations.view), async (req: Request, res: Response) => {
  try {
    const { date, time, area, party_size } = req.query;

    if (!date || !time || !area) {
      return res.status(400).json({ error: 'Date, time, and area are required' });
    }

    const reservationDateTime = new Date(`${date}T${time}`);
    const duration = 120; // Default 2 hours
    const endTime = new Date(reservationDateTime.getTime() + duration * 60000);

    const overlapping = await prisma.reservation.findMany({
      where: {
        area: area as string,
        status: { in: ['pending', 'confirmed'] },
        reservation_date: {
          gte: new Date(reservationDateTime),
          lte: endTime,
        },
      },
      select: {
        id: true,
        reservation_time: true,
        party_size: true,
      },
    });

    const available = overlapping.length === 0;

    res.json({
      available,
      overlapping: overlapping.length > 0 ? overlapping : undefined,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
