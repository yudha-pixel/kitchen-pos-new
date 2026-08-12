import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { ZodError } from 'zod';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import {
  SELF_ORDER_PAYMENT_METHODS,
  initialPaymentStatus,
  resolveSelfOrderPaymentMethods,
  resolveSelfOrderPaymentInstructions,
} from '../../src/features/self-order/paymentMethods';
import { resolveSelfOrderRouting } from '../../src/features/self-order/orderRouting';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// Thrown by acceptCustomerOrder so both the manual accept endpoint and the
// auto-routing path (called right after creation) can react appropriately —
// a route turns these into a 409; auto-routing just leaves the order 'pending'
// for a human to look at instead of failing the guest's whole request.
class OrderNotAcceptableError extends Error {}

// The one transaction that turns a customer request into a kitchen-visible order.
// Its conditional update is the concurrency claim shared by manual, automatic,
// and payment-verification acceptance paths.
async function acceptCustomerOrder(customerOrderId: string, acceptedByUserId: string | null, verifyDigitalPayment = false) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.customerOrder.findUnique({ where: { id: customerOrderId } });
    if (!current) throw new OrderNotAcceptableError('Order not found');
    if (verifyDigitalPayment) {
      if (!['qris', 'transfer'].includes(current.payment_method ?? '') || current.payment_status !== 'pending') {
        throw new OrderNotAcceptableError('Only pending QRIS or transfer orders can be verified');
      }
    } else if (current.payment_status === 'pending') {
      throw new OrderNotAcceptableError('Menunggu konfirmasi pembayaran — belum bisa diterima');
    }

    const claimed = await tx.customerOrder.updateMany({
      where: {
        id: customerOrderId,
        status: 'pending',
        ...(verifyDigitalPayment ? { payment_status: 'pending', payment_method: { in: ['qris', 'transfer'] } } : {}),
      },
      data: {
        status: 'accepted',
        ...(verifyDigitalPayment ? {
          payment_status: 'paid',
          payment_verified_at: new Date(),
          payment_verified_by: acceptedByUserId,
        } : {}),
      },
    });
    if (claimed.count !== 1) throw new OrderNotAcceptableError('Order is no longer pending');

    const customerOrder = await tx.customerOrder.findUniqueOrThrow({
      where: { id: customerOrderId },
      include: { items: true, table: true },
    });
    const newOrder = await tx.order.create({
      data: {
        id: randomUUID(),
        cashier_id: acceptedByUserId,
        total_amount: customerOrder.total_amount,
        payment_method: customerOrder.payment_method,
        status: 'pending',
        table_number: customerOrder.table.table_number,
        customer_order_id: customerOrder.id,
        items: {
          create: customerOrder.items.map((item) => ({
            id: randomUUID(), product_id: item.product_id, quantity: item.quantity,
            price_at_time: item.price_at_time, modifiers_applied: item.modifiers_applied ?? [], status: 'pending',
          })),
        },
      },
      include: { items: true },
    });
    if (verifyDigitalPayment) {
      await tx.auditLog.create({
        data: {
          user_id: acceptedByUserId, action: 'verify_payment_and_accept', entity_type: 'customer_order',
          entity_id: customerOrder.id,
          old_value: { payment_status: 'pending', status: 'pending' },
          new_value: { payment_status: 'paid', status: 'accepted', order_id: newOrder.id },
          description: `Verified ${customerOrder.payment_method} payment and sent order to kitchen`,
        },
      });
    }
    return newOrder;
  });
}

// Fan out a lightweight in-app notification to every active profile that can
// view orders — the staff-facing side of "notify kasir" / "notify kasir dan dapur". The kitchen
// side of the "both" mode needs no separate notification: auto-routing already
// wrote a real Order, and the KDS already polls that table (auto_refresh in
// AppSettings), so it shows up there without any new plumbing.
async function notifyStaffOfCustomerOrder(customerOrder: { id: string; total_amount: number; table: { table_number: string } }, mode: 'review' | 'auto') {
  try {
    const staff = await prisma.profile.findMany({
      where: {
        is_active: true,
        role: {
          permissions: {
            some: { permission: { name: PERMISSIONS.orders.view } },
          },
        },
      },
      select: { id: true },
    });
    if (staff.length === 0) return;

    const title = mode === 'auto' ? 'Pesanan baru dikirim ke dapur' : 'Pesanan baru menunggu konfirmasi';
    const message = `${customerOrder.table.table_number} — Rp ${customerOrder.total_amount.toLocaleString('id-ID')}`;

    await prisma.notification.createMany({
      data: staff.map((s) => ({
        user_id: s.id,
        type: mode === 'auto' ? 'self_order_auto_accepted' : 'self_order_pending',
        title,
        message,
        data: { customerOrderId: customerOrder.id },
      })),
    });
  } catch (error) {
    // Notification delivery is best-effort — a guest's order must never fail
    // to submit because the notification fan-out had a problem.
    console.error('Error notifying staff of self-order:', error);
  }
}

// UUID validation function
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Validation schemas
const createCustomerOrderSchema = z.object({
  // Client-generated (matches this project's existing offline-sync convention of
  // client-generated UUIDs, see AGENTS.md/CLAUDE.md). Lets a retried or double-tapped
  // submit be recognized as the same request instead of creating a duplicate order —
  // see the id-exists check in POST /orders below.
  id: z.string().uuid().optional(),
  table_id: z.string().uuid(),
  customer_name: z.string().optional(),
  // Must be one of paymentMethods.ts's ids; checked against the live catalog below
  // rather than a hardcoded zod enum, since the catalog is the single source of truth.
  payment_method: z.string(),
  payment_reference: z.string().trim().min(1).max(120).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    modifiers_applied: z.array(z.any()).optional(),
  })).min(1),
});

// 'accepted' = staff converted this request into an Order (see POST /orders/:id/accept);
// from that point on, fulfillment progress lives on the linked Order, not here.
const updateCustomerOrderStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'cancelled']),
});

// Public, deliberately narrow DTO. Authenticated application settings contain
// operational and security fields that must never be exposed to a guest device.
router.get('/config', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.appSettings.findFirst({
      select: { selforder_payment_methods: true, selforder_payment_instructions: true, selforder_routing: true },
    });
    const instructions = resolveSelfOrderPaymentInstructions(settings?.selforder_payment_instructions);
    const methods = resolveSelfOrderPaymentMethods(settings?.selforder_payment_methods).filter((method) => {
      return method.type === 'counter' || Boolean(instructions[method.id as 'qris' | 'transfer']?.instructions);
    });
    const safeMethods = methods.length ? methods : [SELF_ORDER_PAYMENT_METHODS.cashier];
    res.json({
      methods: safeMethods.map((method) => ({
        ...method,
        ...(method.type === 'manual_verification' ? instructions[method.id as 'qris' | 'transfer'] : {}),
      })),
      counter_routing: resolveSelfOrderRouting(settings?.selforder_routing),
    });
  } catch (error) {
    console.error('Error fetching public self-order config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all tables (for table management)
router.get('/tables', async (req: Request, res: Response) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { table_number: 'asc' },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get table by table number (for QR code validation)
router.get('/tables/:tableNumber', async (req: Request, res: Response) => {
  try {
    const { tableNumber } = req.params;
    const tableNumberStr = Array.isArray(tableNumber) ? tableNumber[0] : tableNumber;

    const table = await prisma.table.findUnique({
      where: { table_number: tableNumberStr },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (!table.is_active) {
      return res.status(400).json({ error: 'Table is not active' });
    }

    res.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get table by table ID (for QR code - handles both UUID and simple IDs)
router.get('/tables/id/:tableId', async (req: Request, res: Response) => {
  try {
    const { tableId } = req.params;
    const tableIdStr = Array.isArray(tableId) ? tableId[0] : tableId;

    let table;

    // Check if parameter is a valid UUID before using findUnique
    if (isValidUUID(tableIdStr)) {
      table = await prisma.table.findUnique({
        where: { id: tableIdStr },
        include: {
          outlet: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });
    } else {
      // For non-UUID parameters, use findFirst with table_number to avoid P2023 error
      table = await prisma.table.findFirst({
        where: { table_number: tableIdStr },
        include: {
          outlet: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });
    }

    if (!table) {
      return res.status(404).json({ error: 'Meja tidak ditemukan' });
    }

    if (!table.is_active) {
      return res.status(400).json({ error: 'Table is not active' });
    }

    res.json(table);
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products for self-order (with outlet filter if applicable)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { outlet_id, category_id } = req.query;

    const where: any = {
      is_active: true,
    };

    if (outlet_id) {
      where.outlet_id = outlet_id as string;
    }

    if (category_id) {
      where.category_id = category_id as string;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        // Mirrors GET /products' mapping below — without this a guest could never
        // customize an item (e.g. "Iced, Extra Shot") the way staff-facing POS can.
        productModifierGroups: {
          include: {
            modifierGroup: {
              include: {
                modifiers: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(
      products.map((p) => ({
        ...p,
        modifier_groups: p.productModifierGroups.map((pmg) => ({
          ...pmg.modifierGroup,
          modifiers: pmg.modifierGroup.modifiers,
        })),
        productModifierGroups: undefined,
      }))
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get categories for self-order
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer order
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const data = createCustomerOrderSchema.parse(req.body);
    const orderId = data.id ?? randomUUID();

    // Idempotency: a guest's phone retrying a slow/dropped request, or a double
    // tap on the confirm button before the button disables, must resolve to the
    // one order it already created — not a second stock-reserving duplicate.
    if (data.id) {
      const existing = await prisma.customerOrder.findUnique({
        where: { id: data.id },
        include: {
          items: { include: { product: { include: { category: true } } } },
          table: true,
        },
      });
      if (existing) {
        return res.status(200).json({ ...existing, alreadyExisted: true });
      }
    }

    const selfOrderSettings = await prisma.appSettings.findFirst({
      select: { selforder_payment_methods: true, selforder_payment_instructions: true, selforder_routing: true },
    });
    const configuredInstructions = resolveSelfOrderPaymentInstructions(selfOrderSettings?.selforder_payment_instructions);
    const enabledMethods = resolveSelfOrderPaymentMethods(selfOrderSettings?.selforder_payment_methods).filter(
      (method) => method.type === 'counter' || Boolean(configuredInstructions[method.id as 'qris' | 'transfer']?.instructions)
    );
    const usableMethods = enabledMethods.length ? enabledMethods : [SELF_ORDER_PAYMENT_METHODS.cashier];
    const paymentMethod = usableMethods.find((method) => method.id === data.payment_method);
    if (!paymentMethod) {
      return res.status(400).json({
        error: `Payment method is not currently enabled: ${data.payment_method}`,
      });
    }
    if (paymentMethod.type === 'manual_verification' && !data.payment_reference) {
      return res.status(400).json({ error: 'payment_reference is required for QRIS and transfer orders' });
    }

    // Verify table exists and is active
    const table = await prisma.table.findUnique({
      where: { id: data.table_id },
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (!table.is_active) {
      return res.status(400).json({ error: 'Table is not active' });
    }

    // Get product details and calculate total
    const productIds = data.items.map(item => item.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Modifier prices are looked up from the DB, never trusted from the request —
    // same reasoning as product price above. A guest client claiming
    // {"id": "...", "price": -50000} for a modifier must not be able to discount
    // (or, submitting an inflated price, inconsistently overcharge) their own order.
    const modifierIds = data.items.flatMap((item) => (item.modifiers_applied ?? []).map((m: any) => m?.id).filter(Boolean));
    const modifiers = modifierIds.length > 0
      ? await prisma.modifier.findMany({ where: { id: { in: modifierIds } } })
      : [];
    const modifierPriceMap = new Map(modifiers.map((m) => [m.id, m.price_extra]));

    let totalAmount = 0;
    const orderItems = data.items.map(item => {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      const priceAtTime = (product as any).price;
      const modifiersApplied = item.modifiers_applied || [];
      const modifiersTotal = modifiersApplied.reduce(
        (sum: number, m: any) => sum + (modifierPriceMap.get(m?.id) ?? 0),
        0
      );
      totalAmount += (priceAtTime + modifiersTotal) * item.quantity;
      return {
        id: randomUUID(),
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: priceAtTime,
        modifiers_applied: modifiersApplied,
      };
    });

    // Create customer order with items
    const customerOrder = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.customerOrder.create({
        data: {
          id: orderId,
          table_id: data.table_id,
          customer_name: data.customer_name || null,
          total_amount: totalAmount,
          status: 'pending',
          payment_method: paymentMethod.id,
          payment_status: initialPaymentStatus(paymentMethod),
          payment_reference: paymentMethod.type === 'manual_verification' ? data.payment_reference : null,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          table: true,
        },
      });

      // Reduce stock for each ordered item
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            stock_quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    const routing = resolveSelfOrderRouting(selfOrderSettings?.selforder_routing);
    let autoAccepted = false;

    if (routing === 'auto' && paymentMethod.type === 'counter') {
      try {
        await acceptCustomerOrder(customerOrder.id, null);
        autoAccepted = true;
      } catch (error) {
        // Should not happen for a brand-new order (nothing else could have raced
        // to accept/cancel it yet), but if it ever does, degrade to the 'review'
        // queue rather than failing the guest's already-successful submission —
        // a cashier can still accept it manually.
        console.error('Auto-accept failed, leaving order in review queue:', error);
      }
    }

    await notifyStaffOfCustomerOrder(customerOrder, autoAccepted ? 'auto' : 'review');

    res.status(201).json({
      ...customerOrder,
      status: autoAccepted ? 'accepted' : customerOrder.status,
      routing: autoAccepted ? 'auto' : 'review',
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
    }

    console.error('Error creating customer order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List pending guest requests for the staff review queue — oldest first (FIFO).
// Registered before GET /orders/:id so 'pending' is never swallowed as an :id param.
router.get('/orders/pending', authMiddleware, requirePermission(PERMISSIONS.orders.view), async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.customerOrder.findMany({
      where: { status: 'pending' },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
      },
      orderBy: { created_at: 'asc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching pending customer orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer order by ID
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const order = await prisma.customerOrder.findUnique({
      where: { id: idStr },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching customer order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer orders by table
router.get('/tables/:tableId/orders', async (req: Request, res: Response) => {
  try {
    const { tableId } = req.params;
    const tableIdStr = Array.isArray(tableId) ? tableId[0] : tableId;

    const orders = await prisma.customerOrder.findMany({
      where: { table_id: tableIdStr },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching table orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer order status — staff only. Guests never mutate an order once
// submitted; the flow forward from here is accept/reject below.
router.patch('/orders/:id/status', authMiddleware, requirePermission(PERMISSIONS.orders.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { status } = updateCustomerOrderStatusSchema.parse(req.body);

    const order = await prisma.customerOrder.update({
      where: { id: idStr },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        table: true,
      },
    });

    res.json(order);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
      });
    }

    console.error('Error updating customer order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer order payment status — staff only, e.g. confirming a gateway
// callback or recording cash collected at the counter. `payment_status` is required
// and validated rather than defaulting to 'paid' when omitted.
router.patch('/orders/:id/payment-status', authMiddleware, requirePermission(PERMISSIONS.orders.edit), async (req: Request, res: Response) => {
  res.status(404).json({ error: 'Payment status mutation has been retired' });
});

router.post(
  '/orders/:id/verify-payment-and-accept',
  authMiddleware,
  requirePermission(PERMISSIONS.orders.create),
  async (req: Request, res: Response) => {
    try {
      const id = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
      const order = await acceptCustomerOrder(id, req.user?.id ?? null, true);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof OrderNotAcceptableError) {
        const status = error.message === 'Order not found' ? 404 : 409;
        return res.status(status).json({ error: error.message });
      }
      console.error('Error verifying self-order payment:', error);
      res.status(500).json({ error: 'Payment verification failed; no changes were saved' });
    }
  }
);

// Accept a guest request: convert it into a real POS Order so the KDS sees it.
// Product/ingredient stock was already decremented when the guest submitted the
// request (see POST /orders above) — this step does not touch stock again.
router.post('/orders/:id/accept', authMiddleware, requirePermission(PERMISSIONS.orders.create), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const order = await acceptCustomerOrder(idStr, req.user?.id ?? null);
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof OrderNotAcceptableError) {
      const status = error.message === 'Order not found' ? 404 : 409;
      return res.status(status).json({ error: error.message });
    }
    console.error('Error accepting customer order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject a guest request: it never becomes a kitchen order, and stock decremented
// at submission time (POST /orders above) is restored since nothing was fulfilled.
router.post('/orders/:id/reject', authMiddleware, requirePermission(PERMISSIONS.orders.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const customerOrder = await prisma.customerOrder.findUnique({
      where: { id: idStr },
      include: { items: true },
    });

    if (!customerOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (customerOrder.status !== 'pending') {
      return res.status(409).json({ error: `Order is already '${customerOrder.status}', not pending` });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of customerOrder.items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: { stock_quantity: { increment: item.quantity } },
        });
      }

      await tx.customerOrder.update({
        where: { id: customerOrder.id },
        data: { status: 'cancelled' },
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error rejecting customer order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
