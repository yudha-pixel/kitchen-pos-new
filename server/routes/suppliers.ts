import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// GET /suppliers - Get all suppliers
router.get('/', async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      include: {
        ingredients: true,
        purchaseOrders: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET /suppliers/:id - Get supplier by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      include: {
        ingredients: true,
        purchaseOrders: {
          orderBy: {
            order_date: 'desc',
          },
        },
      },
    });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// POST /suppliers - Create new supplier
router.post('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.create), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address } = req.body;
    
    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone,
        email: email || null,
        address: address || null,
      },
    });
    
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// PUT /suppliers/:id - Update supplier
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, address } = req.body;
    
    const supplier = await prisma.supplier.update({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      data: {
        name,
        phone,
        email: email || null,
        address: address || null,
      },
    });
    
    res.json(supplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE /suppliers/:id - Delete supplier
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.delete), async (req: Request, res: Response) => {
  try {
    await prisma.supplier.delete({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

// POST /suppliers/:id/purchase-orders - Create purchase order
router.post('/:id/purchase-orders', authMiddleware, requirePermission(PERMISSIONS.purchasing.create), async (req: Request, res: Response) => {
  try {
    const { ingredient_id, quantity, unit_price, notes } = req.body;
    const supplierId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const ingredient = await prisma.ingredient.findUnique({ where: { id: ingredient_id } });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    const total_price = quantity * unit_price;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        po_number: `PO-${Date.now()}`,
        supplier_id: supplierId,
        subtotal: total_price,
        tax: 0,
        total: total_price,
        status: 'pending',
        notes: notes || null,
        items: {
          create: {
            ingredient_id,
            ingredient_name: ingredient.name,
            quantity,
            unit: ingredient.unit,
            unit_price,
            total_price,
          },
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            ingredient: true,
          },
        },
      },
    });
    
    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// PATCH /suppliers/:id/purchase-orders/:poId/receive - Receive purchase order (adds stock)
router.patch('/:id/purchase-orders/:poId/receive', authMiddleware, requirePermission(PERMISSIONS.purchasing.receive), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const supplierId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const poId = Array.isArray(req.params.poId) ? req.params.poId[0] : req.params.poId;

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      const purchaseOrder = await tx.purchaseOrder.findFirst({
        where: { id: poId, supplier_id: supplierId },
        include: { items: true },
      });

      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      if (purchaseOrder.status !== 'pending') {
        throw new Error('Purchase order is not in pending status');
      }

      const claimed = await tx.purchaseOrder.updateMany({
        where: { id: poId, status: 'pending' },
        data: { status: 'received' },
      });
      if (claimed.count !== 1) {
        throw new Error('Purchase order is not in pending status');
      }

      for (const item of purchaseOrder.items) {
        const updatedIngredient = await tx.ingredient.update({
          where: { id: item.ingredient_id },
          data: { current_stock: { increment: item.quantity } },
        });
        const previousStock = updatedIngredient.current_stock - item.quantity;

        await tx.stockAdjustmentLog.create({
          data: {
            ingredient_id: item.ingredient_id,
            previous_stock: previousStock,
            new_stock: updatedIngredient.current_stock,
            adjustment_type: 'purchase',
            reason: `Purchase order #${poId} received`,
            user_id: userId,
          },
        });
      }

      return tx.purchaseOrder.findUnique({
        where: { id: poId },
        include: { items: true },
      });
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error receiving purchase order:', error);
    if (error.message === 'Purchase order not found') {
      return res.status(404).json({ error: 'Purchase order not found' });
    }
    if (error.message === 'Purchase order is not in pending status') {
      return res.status(400).json({ error: 'Purchase order is not in pending status' });
    }
    res.status(500).json({ error: 'Failed to receive purchase order' });
  }
});

// GET /suppliers/:id/purchase-orders - Get purchase orders for supplier
router.get('/:id/purchase-orders', async (req: Request, res: Response) => {
  try {
    const supplierId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { supplier_id: supplierId },
      orderBy: {
        order_date: 'desc',
      },
    });
    
    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

export default router;
