import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

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
          include: {
            ingredient: true,
          },
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
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
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
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
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
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
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
router.post('/:id/purchase-orders', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { ingredient_id, quantity, unit_price, notes } = req.body;
    const userId = (req as any).user?.id;
    const supplierId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    
    const total_price = quantity * unit_price;
    
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplier_id: supplierId,
        ingredient_id,
        quantity,
        unit_price,
        total_price,
        notes: notes || null,
        user_id: userId,
      },
      include: {
        supplier: true,
        ingredient: true,
      },
    });
    
    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

// PATCH /suppliers/:id/purchase-orders/:poId/receive - Receive purchase order (adds stock)
router.patch('/:id/purchase-orders/:poId/receive', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const poId = Array.isArray(req.params.poId) ? req.params.poId[0] : req.params.poId;
    
    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx: any) => {
      // Get current purchase order and ingredient
      const purchaseOrder = await tx.purchaseOrder.findUnique({
        where: { id: poId },
        include: {
          ingredient: true,
        },
      });
      
      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }
      
      if (purchaseOrder.status !== 'pending') {
        throw new Error('Purchase order is not in pending status');
      }
      
      const previousStock = purchaseOrder.ingredient.current_stock;
      const newStock = previousStock + purchaseOrder.quantity;
      
      // Update purchase order status
      const updatedPO = await tx.purchaseOrder.update({
        where: { id: poId },
        data: {
          status: 'received',
          received_date: new Date(),
        },
      });
      
      // Update ingredient stock
      await tx.ingredient.update({
        where: { id: purchaseOrder.ingredient_id },
        data: {
          current_stock: newStock,
        },
      });
      
      // Log stock adjustment
      await tx.stockAdjustmentLog.create({
        data: {
          ingredient_id: purchaseOrder.ingredient_id,
          previous_stock: previousStock,
          new_stock: newStock,
          adjustment_type: 'purchase',
          reason: `Purchase order #${poId} received`,
          user_id: userId,
        },
      });
      
      return updatedPO;
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
      include: {
        ingredient: true,
      },
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
