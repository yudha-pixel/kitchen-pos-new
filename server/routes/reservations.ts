import { Prisma } from '@prisma/client';
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

  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });

  if (!table) return;

  // Check for upcoming reservations
  const upcomingReservation = await prisma.reservation.findFirst({
    where: {
      table_id: tableId,
      status: { in: ['pending', 'confirmed'] },
      reservation_date: { gte: now },
    },
  });

  // Check for active orders. Orders reference the table by its number, not its id.
  const activeOrder = await prisma.order.findFirst({
    where: {
      table_number: table.table_number,
      status: { in: ['pending', 'preparing', 'ready', 'served'] },
    },
  });

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

const DEFAULT_DURATION_MINUTES = 120;
// Widest booking we look back for when hunting overlaps. A stored reservation
// has a start and a duration but no end column, so the end has to be computed
// per row in JS; this bounds how far back the candidate scan must reach.
const MAX_DURATION_MINUTES = 24 * 60;

/**
 * Reservations in the same area that actually overlap [start, start+duration).
 *
 * A pure date-range query can only find bookings that *start* inside the new
 * window, which misses the common case of an earlier booking still running.
 * So the range query is only a coarse prefilter and the real interval test
 * (existing.start < newEnd && existing.end > newStart) runs on the rows.
 */
async function findOverlappingReservations(
  area: string,
  start: Date,
  durationMinutes: number,
  excludeId?: string,
) {
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const candidates = await prisma.reservation.findMany({
    where: {
      area,
      status: { in: ['pending', 'confirmed'] },
      ...(excludeId ? { id: { not: excludeId } } : {}),
      reservation_date: {
        gte: new Date(start.getTime() - MAX_DURATION_MINUTES * 60000),
        lt: end,
      },
    },
  });

  return candidates.filter((r) => {
    const rStart = r.reservation_date;
    const rEnd = new Date(rStart.getTime() + (r.duration_minutes ?? DEFAULT_DURATION_MINUTES) * 60000);
    return rStart < end && rEnd > start;
  });
}

// A reservation is stored as a single instant in both reservation_date and
// reservation_time. The wire format keeps them apart ("2026-09-20" + "19:00")
// because that is how the booking form collects them; a bare time string is not
// a parseable Date on its own, so it is only ever combined, never parsed alone.
// Times are interpreted in server-local time — the outlet's own clock.
function combineDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr.length === 5 ? `${timeStr}:00` : timeStr}`);
}

function localDatePart(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localTimePart(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}(:\d{2})?$/;

// Validation schemas
const createReservationSchema = z.object({
  customer_name: z.string().min(1),
  customer_phone: z.string().min(10),
  customer_email: z.string().email().optional(),
  party_size: z.number().int().min(1).max(20),
  reservation_date: z.string().regex(DATE_RE, 'Format tanggal harus YYYY-MM-DD'),
  reservation_time: z.string().regex(TIME_RE, 'Format waktu harus HH:mm atau HH:mm:ss'),
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
  reservation_date: z.string().regex(DATE_RE, 'Format tanggal harus YYYY-MM-DD').optional(),
  reservation_time: z.string().regex(TIME_RE, 'Format waktu harus HH:mm atau HH:mm:ss').optional(),
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

    const where: Prisma.ReservationWhereInput = {};

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

// Registered before /:id so "availability" isn't swallowed as an id param.
// GET /reservations/availability - Check availability
router.get('/availability', authMiddleware, requirePermission(PERMISSIONS.reservations.view), async (req: Request, res: Response) => {
  try {
    const { date, time, area } = req.query;

    if (!date || !time || !area) {
      return res.status(400).json({ error: 'Date, time, and area are required' });
    }

    const reservationDateTime = combineDateTime(String(date), String(time));
    if (Number.isNaN(reservationDateTime.getTime())) {
      return res.status(400).json({ error: 'Tanggal atau waktu reservasi tidak valid' });
    }

    const overlapping = (
      await findOverlappingReservations(String(area), reservationDateTime, DEFAULT_DURATION_MINUTES)
    ).map((r) => ({ id: r.id, reservation_time: r.reservation_time, party_size: r.party_size }));

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

// GET /reservations/:id - Get single reservation
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.reservations.view), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

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
    const reservationDateTime = combineDateTime(data.reservation_date, data.reservation_time);
    if (Number.isNaN(reservationDateTime.getTime())) {
      return res.status(400).json({ error: 'Tanggal atau waktu reservasi tidak valid' });
    }
    const duration = data.duration_minutes || DEFAULT_DURATION_MINUTES;
    const overlapping = await findOverlappingReservations(data.area, reservationDateTime, duration);

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
        // Both columns hold the same combined instant: the day-range filter in
        // GET / reads reservation_date, the ordering reads reservation_time.
        reservation_date: reservationDateTime,
        reservation_time: reservationDateTime,
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
    const { id } = req.params as { id: string };
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

    const combined = combineDateTime(
      data.reservation_date ?? localDatePart(existing.reservation_date),
      data.reservation_time ?? localTimePart(existing.reservation_time),
    );
    if (Number.isNaN(combined.getTime())) {
      return res.status(400).json({ error: 'Tanggal atau waktu reservasi tidak valid' });
    }

    // Check for overlapping if date/time/area changed
    if (data.reservation_date || data.reservation_time || data.area) {
      const newArea = data.area || existing.area;
      const duration = data.duration_minutes || existing.duration_minutes || DEFAULT_DURATION_MINUTES;
      const overlapping = await findOverlappingReservations(newArea, combined, duration, id);

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
        // Recombine into a single instant (see the create handler) rather than
        // parsing the bare "HH:mm" time, which is not a valid Date.
        reservation_date: combined,
        reservation_time: combined,
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
    const { id } = req.params as { id: string };

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
    const { id } = req.params as { id: string };
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
    const { id } = req.params as { id: string };
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

export default router;
