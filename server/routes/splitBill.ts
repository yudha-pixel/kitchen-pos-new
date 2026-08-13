import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// Validation schemas
const splitByItemsSchema = z.object({
  order_id: z.string().uuid(),
  splits: z.array(z.object({
    name: z.string().min(1),
    item_ids: z.array(z.string().uuid()),
  })),
});

const splitByAmountSchema = z.object({
  order_id: z.string().uuid(),
  splits: z.array(z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
  })),
});

// Helper function to calculate tax and service charge
function calculateTaxAndService(
  subtotal: number,
  taxRate: number,
  serviceChargeRate: number
): { tax: number; serviceCharge: number; total: number } {
  const tax = subtotal * (taxRate / 100);
  const serviceCharge = subtotal * (serviceChargeRate / 100);
  const total = subtotal + tax + serviceCharge;
  return { tax, serviceCharge, total };
}

async function getCompanyCharges() {
  const company = await prisma.company.findFirst({
    orderBy: { created_at: 'asc' },
    select: { tax_rate: true, service_charge: true },
  });
  return {
    taxRate: company?.tax_rate ?? 10,
    serviceChargeRate: company?.service_charge ?? 0,
  };
}

// GET /split-bill/:orderId - Get split bill options for an order
router.get('/:orderId', authMiddleware, requirePermission(PERMISSIONS.orders.view), async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const orderIdStr = Array.isArray(orderId) ? orderId[0] : orderId;

    const order = await prisma.order.findUnique({
      where: { id: orderIdStr },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { taxRate, serviceChargeRate } = await getCompanyCharges();

    // Calculate item-level breakdown
    const itemBreakdown = order.items.map((item: any) => ({
      id: item.id,
      name: item.product?.name || 'Unknown',
      quantity: item.quantity,
      price: item.price_at_time,
      subtotal: item.price_at_time * item.quantity,
      modifiers: item.modifiers_applied,
    }));

    res.json({
      order: {
        id: order.id,
        total_amount: order.total_amount,
        discount_amount: order.discount_amount,
        rounding_amount: order.rounding_amount,
        table_number: order.table_number,
      },
      items: itemBreakdown,
      tax_rate: taxRate,
      service_charge_rate: serviceChargeRate,
    });
  } catch (error) {
    console.error('Error fetching split bill options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /split-bill/by-items - Split bill by items
router.post('/by-items', authMiddleware, requirePermission(PERMISSIONS.orders.edit), async (req: Request, res: Response) => {
  try {
    const data = splitByItemsSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: data.order_id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { taxRate, serviceChargeRate } = await getCompanyCharges();

    // Calculate each split
    const splits = data.splits.map(split => {
      const splitItems = order.items.filter((item: any) => 
        split.item_ids.includes(item.id)
      );

      const subtotal = splitItems.reduce(
        (sum: number, item: any) => sum + (item.price_at_time * item.quantity),
        0
      );

      const { tax, serviceCharge, total } = calculateTaxAndService(
        subtotal,
        taxRate,
        serviceChargeRate
      );

      return {
        name: split.name,
        items: splitItems.map((item: any) => ({
          id: item.id,
          name: item.product?.name || 'Unknown',
          quantity: item.quantity,
          price: item.price_at_time,
          subtotal: item.price_at_time * item.quantity,
        })),
        subtotal,
        tax,
        serviceCharge,
        total,
      };
    });

    // Validate that all items are assigned
    const assignedItemIds = new Set(data.splits.flatMap((s: any) => s.item_ids));
    const unassignedItems = order.items.filter((item: any) => !assignedItemIds.has(item.id));

    if (unassignedItems.length > 0) {
      return res.status(400).json({
        error: 'Not all items are assigned to splits',
        unassigned_items: unassignedItems.map((i: any) => i.id),
      });
    }

    res.json({
      order_id: order.id,
      tax_rate: taxRate,
      service_charge_rate: serviceChargeRate,
      splits,
      total_amount: splits.reduce((sum, s) => sum + s.total, 0),
    });
  } catch (error) {
    console.error('Error splitting bill by items:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /split-bill/by-amount - Split bill by custom amounts
router.post('/by-amount', authMiddleware, requirePermission(PERMISSIONS.orders.edit), async (req: Request, res: Response) => {
  try {
    const data = splitByAmountSchema.parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: data.order_id },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { taxRate, serviceChargeRate } = await getCompanyCharges();

    // Calculate subtotal from total (reverse calculation)
    const totalWithTaxAndService = data.splits.reduce((sum, s) => sum + s.amount, 0);
    const subtotal = totalWithTaxAndService / (1 + (taxRate + serviceChargeRate) / 100);

    // Calculate each split's tax and service charge proportionally
    const splits = data.splits.map(split => {
      const proportion = split.amount / totalWithTaxAndService;
      const splitSubtotal = subtotal * proportion;
      const { tax, serviceCharge, total } = calculateTaxAndService(
        splitSubtotal,
        taxRate,
        serviceChargeRate
      );

      return {
        name: split.name,
        amount: split.amount,
        subtotal: splitSubtotal,
        tax,
        serviceCharge,
        total,
      };
    });

    // Validate total matches order
    const totalDifference = Math.abs(totalWithTaxAndService - order.total_amount);
    if (totalDifference > 100) { // Allow small rounding differences
      return res.status(400).json({
        error: 'Split amounts do not match order total',
        order_total: order.total_amount,
        split_total: totalWithTaxAndService,
        difference: totalDifference,
      });
    }

    res.json({
      order_id: order.id,
      tax_rate: taxRate,
      service_charge_rate: serviceChargeRate,
      splits,
      total_amount: totalWithTaxAndService,
    });
  } catch (error) {
    console.error('Error splitting bill by amount:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /split-bill/equal - Split bill equally among N people
router.post('/equal', authMiddleware, requirePermission(PERMISSIONS.orders.edit), async (req: Request, res: Response) => {
  try {
    const { order_id, number_of_people } = req.body;

    if (!order_id || !number_of_people || number_of_people < 2) {
      return res.status(400).json({ 
        error: 'Invalid input. order_id and number_of_people (>= 2) are required' 
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const { taxRate, serviceChargeRate } = await getCompanyCharges();

    // Calculate per-person amount
    const totalPerPerson = order.total_amount / number_of_people;
    const subtotalPerPerson = totalPerPerson / (1 + (taxRate + serviceChargeRate) / 100);

    const { tax, serviceCharge } = calculateTaxAndService(
      subtotalPerPerson,
      taxRate,
      serviceChargeRate
    );

    const splits = Array.from({ length: number_of_people }, (_: any, i: number) => ({
      name: `Person ${i + 1}`,
      subtotal: subtotalPerPerson,
      tax,
      serviceCharge,
      total: totalPerPerson,
    }));

    res.json({
      order_id: order.id,
      number_of_people,
      tax_rate: taxRate,
      service_charge_rate: serviceChargeRate,
      splits,
      total_amount: order.total_amount,
    });
  } catch (error) {
    console.error('Error splitting bill equally:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
