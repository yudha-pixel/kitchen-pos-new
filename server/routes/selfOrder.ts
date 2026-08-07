import { Router, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { ZodError } from 'zod';
import { z } from 'zod';

const router = Router();

// UUID validation function
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Validation schemas
const createCustomerOrderSchema = z.object({
  table_id: z.string().uuid(),
  customer_name: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    modifiers_applied: z.array(z.any()).optional(),
  })),
});

const updateCustomerOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled']),
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

    console.log('[DEBUG] Looking up table by ID:', tableIdStr);
    console.log('[DEBUG] Is valid UUID:', isValidUUID(tableIdStr));

    let table;

    // Check if parameter is a valid UUID before using findUnique
    if (isValidUUID(tableIdStr)) {
      console.log('[DEBUG] Parameter is UUID, using findUnique with id');
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
      console.log('[DEBUG] Parameter is NOT UUID, using findFirst with table_number');
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

    console.log('[DEBUG] Table found:', table ? 'YES' : 'NO');
    if (table) {
      console.log('[DEBUG] Table details:', { id: table.id, table_number: table.table_number, is_active: table.is_active });
    }

    if (!table) {
      return res.status(404).json({ error: 'Meja tidak ditemukan' });
    }

    if (!table.is_active) {
      return res.status(400).json({ error: 'Table is not active' });
    }

    res.json(table);
  } catch (error) {
    console.error('[DEBUG] Error fetching table:', error);
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
      },
      orderBy: { name: 'asc' },
    });

    res.json(products);
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
    const orderId = randomUUID();

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

    const productMap = new Map(products.map(p => [p.id, p]));

    let totalAmount = 0;
    const orderItems = data.items.map(item => {
      const product = productMap.get(item.product_id);
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      const priceAtTime = product.price;
      totalAmount += priceAtTime * item.quantity;
      return {
        id: randomUUID(),
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: priceAtTime,
        modifiers_applied: item.modifiers_applied || [],
      };
    });

    // Create customer order with items
    const customerOrder = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.customerOrder.create({
        data: {
          id: orderId,
          table_id: data.table_id,
          customer_name: data.customer_name || null,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'unpaid',
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

    res.status(201).json(customerOrder);
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

// Update customer order status
router.patch('/orders/:id/status', async (req: Request, res: Response) => {
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

// Update customer order payment status
router.patch('/orders/:id/payment-status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { payment_status, payment_method } = req.body;

    const order = await prisma.customerOrder.update({
      where: { id: idStr },
      data: {
        payment_status: payment_status || 'paid',
        payment_method: payment_method || null,
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

    res.json(order);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
