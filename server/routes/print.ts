import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  createPrinterSchema,
  updatePrinterSchema,
  printerRouteSchema,
} from '../lib/validation';

const router = Router();
const adminOnly = [authMiddleware, requireRole('admin')] as const;

// Get all printers
router.get('/printers', async (_req: Request, res: Response) => {
  const printers = await prisma.printer.findMany({
    where: { is_active: true },
    include: {
      categoryPrinters: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  res.json(printers);
});

// Get printer routing for a category
router.get('/printers/category/:categoryId', async (req: Request, res: Response) => {
  const { categoryId } = req.params as { categoryId: string };
  
  const categoryPrinters = await prisma.categoryPrinter.findMany({
    where: {
      category_id: categoryId,
      printer: { is_active: true },
    },
    include: {
      printer: true,
    },
  });

  const printers = categoryPrinters.map(cp => cp.printer);
  res.json(printers);
});

// Create printer
router.post('/printers', ...adminOnly, async (req: Request, res: Response) => {
  const { name, type, ip_address, port } = createPrinterSchema.parse(req.body);

  const printer = await prisma.printer.create({
    data: {
      name,
      type,
      ip_address: ip_address || null,
      port: port || null,
    },
  });

  res.status(201).json(printer);
});

// Update printer
router.patch('/printers/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = updatePrinterSchema.parse(req.body);

  const printer = await prisma.printer.update({
    where: { id },
    data,
  });

  res.json(printer);
});

// Delete printer
router.delete('/printers/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  await prisma.printer.delete({
    where: { id },
  });

  res.json({ success: true });
});

// Route category to printer
router.post('/printers/route', ...adminOnly, async (req: Request, res: Response) => {
  const { category_id, printer_id } = printerRouteSchema.parse(req.body);

  const categoryPrinter = await prisma.categoryPrinter.create({
    data: {
      category_id,
      printer_id,
    },
  });

  res.status(201).json(categoryPrinter);
});

// Remove category from printer
router.delete('/printers/route/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  await prisma.categoryPrinter.delete({
    where: { id },
  });

  res.json({ success: true });
});

// Get print jobs for an order (grouped by printer)
router.get('/printers/orders/:orderId/jobs', async (req: Request, res: Response) => {
  const { orderId } = req.params as { orderId: string };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: {
                include: {
                  categoryPrinters: {
                    include: {
                      printer: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  // Group items by printer
  const printerJobs: Record<string, any> = {};

  for (const item of order.items) {
    if (!item.product?.category) continue;

    const categoryPrinters = item.product.category.categoryPrinters;
    
    for (const cp of categoryPrinters) {
      const printerId = cp.printer.id;
      const printerType = cp.printer.type;

      if (!printerJobs[printerId]) {
        printerJobs[printerId] = {
          printer: cp.printer,
          items: [],
        };
      }

      printerJobs[printerId].items.push({
        name: item.product.name,
        quantity: item.quantity,
        modifiers: item.modifiers_applied || [],
      });
    }
  }

  res.json(printerJobs);
});

export default router;
