import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/stock-approval-requests - Create a new stock approval request
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, requester_name, item_name, quantity, unit, evidence_image } = req.body;

    // Validate required fields
    if (!type || !requester_name || !item_name || !quantity || !unit) {
      return res.status(400).json({ 
        error: 'Missing required fields: type, requester_name, item_name, quantity, unit' 
      });
    }

    // Validate type
    if (type !== 'Stock In' && type !== 'Stock Out') {
      return res.status(400).json({ 
        error: 'Invalid type. Must be "Stock In" or "Stock Out"' 
      });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ 
        error: 'Quantity must be greater than 0' 
      });
    }

    // Generate request number (auto-increment format #REQ-XXX)
    const lastRequest = await prisma.stockApprovalRequest.findFirst({
      orderBy: { created_at: 'desc' }
    });

    let nextNumber = 1;
    if (lastRequest && lastRequest.request_number) {
      const lastNum = parseInt(lastRequest.request_number.replace('#REQ-', ''));
      nextNumber = lastNum + 1;
    }

    const request_number = `#REQ-${String(nextNumber).padStart(3, '0')}`;

    // Create the stock approval request
    const request = await prisma.stockApprovalRequest.create({
      data: {
        request_number,
        type,
        requester_name,
        item_name,
        quantity,
        unit,
        status: 'Pending',
        evidence_image: evidence_image || null
      }
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating stock approval request:', error);
    res.status(500).json({ error: 'Failed to create stock approval request' });
  }
});

// GET /api/stock-approval-requests - Get all stock approval requests with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const where: any = {};

    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Search by request number, requester name, or item name
    if (search) {
      where.OR = [
        { request_number: { contains: search as string, mode: 'insensitive' } },
        { requester_name: { contains: search as string, mode: 'insensitive' } },
        { item_name: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const requests = await prisma.stockApprovalRequest.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching stock approval requests:', error);
    res.status(500).json({ error: 'Failed to fetch stock approval requests' });
  }
});

// PATCH /api/stock-approval-requests/:id/review - Review (approve/reject) a stock approval request
router.patch('/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, manager_notes, processed_by } = req.body;

    // Validate status
    if (status !== 'Approved' && status !== 'Rejected') {
      return res.status(400).json({ 
        error: 'Invalid status. Must be "Approved" or "Rejected"' 
      });
    }

    // Get the existing request
    const existingRequest = await prisma.stockApprovalRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return res.status(404).json({ error: 'Stock approval request not found' });
    }

    // Check if already processed
    if (existingRequest.status !== 'Pending') {
      return res.status(400).json({ 
        error: 'Request has already been processed' 
      });
    }

    // Update the request
    const processed_at = new Date();
    const updatedRequest = await prisma.stockApprovalRequest.update({
      where: { id },
      data: {
        status,
        manager_notes,
        processed_at,
        processed_by: processed_by || 'Admin'
      }
    });

    // If approved, update the ingredient's current stock
    if (status === 'Approved') {
      // Find the ingredient by name
      const ingredient = await prisma.ingredient.findFirst({
        where: { 
          name: { 
            equals: existingRequest.item_name,
            mode: 'insensitive'
          }
        }
      });

      if (ingredient) {
        const stockChange = existingRequest.type === 'Stock In' 
          ? existingRequest.quantity 
          : -existingRequest.quantity;

        const newStock = Math.max(0, ingredient.current_stock + stockChange);

        await prisma.ingredient.update({
          where: { id: ingredient.id },
          data: { current_stock: newStock }
        });

        // Auto-generate PR if stock falls below min_stock threshold (for Stock Out only)
        if (existingRequest.type === 'Stock Out' && newStock <= ingredient.min_stock) {
          // Check if auto-restock is enabled in settings
          const settings = await prisma.appSettings.findFirst();
          if (!settings || !settings.auto_restock_enabled) {
            // Auto-restock is disabled, skip PR generation
            return;
          }

          // Check if there's already a pending PR for this ingredient
          const existingPR = await prisma.purchaseRequisition.findFirst({
            where: {
              status: 'Pending Approval',
              prItems: {
                some: {
                  ingredient_id: ingredient.id
                }
              }
            }
          });

          if (!existingPR) {
            // Generate PR number
            const lastPR = await prisma.purchaseRequisition.findFirst({
              orderBy: { created_at: 'desc' }
            });

            let nextNumber = 1;
            if (lastPR && lastPR.pr_number) {
              const lastNum = parseInt(lastPR.pr_number.replace('#PR-', ''));
              nextNumber = lastNum + 1;
            }

            const pr_number = `#PR-${String(nextNumber).padStart(3, '0')}`;

            // Calculate reorder quantity (use ingredient's restock_quantity if set, otherwise default to min_stock * 2)
            const ingredientWithRestock = await prisma.ingredient.findUnique({
              where: { id: ingredient.id },
              select: { restock_quantity: true, supplier_id: true }
            });
            const reorderQuantity = ingredientWithRestock?.restock_quantity && ingredientWithRestock.restock_quantity > 0
              ? ingredientWithRestock.restock_quantity
              : (ingredient.min_stock * 2) - newStock;

            // Create auto-generated PR with supplier information
            await prisma.purchaseRequisition.create({
              data: {
                pr_number,
                status: 'Pending Approval',
                requested_by: 'System (Auto-Restock)',
                total_estimated: 0, // Will be calculated when PO is generated
                notes: `Automated restock triggered: stock fell below safety threshold of ${ingredient.min_stock}. Current stock: ${newStock}`,
                prItems: {
                  create: {
                    ingredient_id: ingredient.id,
                    ingredient_name: ingredient.name,
                    quantity: reorderQuantity,
                    unit: ingredient.unit,
                    estimated_price: 0, // Will be updated when PO is generated
                    supplier_id: ingredientWithRestock?.supplier_id || null
                  }
                }
              }
            });
          }
        }
      }
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error reviewing stock approval request:', error);
    res.status(500).json({ error: 'Failed to review stock approval request' });
  }
});

export default router;
