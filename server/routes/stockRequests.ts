import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

const createStockRequestSchema = z.object({
  ingredient_id: z.string().uuid(),
  ingredient_name: z.string(),
  quantity_requested: z.number().positive(),
  unit: z.string(),
  notes: z.string().optional(),
  supplier_id: z.string().uuid().optional(),
  proof_file: z.string().optional(),
  proof_file_name: z.string().optional(),
});

const rejectStockRequestSchema = z.object({
  rejection_reason: z.string().optional(),
});

// GET /stock-requests - List all requests, optionally filtered by status, level, user, or date range
router.get('/', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const { status, approval_level, requested_by, dateFrom, dateTo } = req.query;
    const where: any = {};
    if (status) where.status = status as string;
    if (approval_level) where.approval_level = parseInt(approval_level as string);
    if (requested_by) where.requested_by = requested_by as string;
    
    // Date range filtering
    if (dateFrom || dateTo) {
      where.requested_at = {};
      if (dateFrom) {
        where.requested_at.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        // Include the entire end date by setting to end of day
        const endDate = new Date(dateTo as string);
        endDate.setHours(23, 59, 59, 999);
        where.requested_at.lte = endDate;
      }
    }

    const requests = await prisma.stockRequest.findMany({
      where,
      include: {
        ingredient: true,
        supplier: true,
      },
      orderBy: { requested_at: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching stock requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /stock-requests/:id - Get details with approval history
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const request = await prisma.stockRequest.findUnique({
      where: { id },
      include: {
        ingredient: true,
        supplier: true,
        quotation_requests: {
          include: {
            quotations: {
              include: {
                supplier: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching stock request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /stock-requests - Create a new pending stock request (starts at level 1)
router.post('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.create), async (req: Request, res: Response) => {
  try {
    const data = createStockRequestSchema.parse(req.body);
    const userId = req.user?.id;
    const username = req.user?.username;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ingredient = await prisma.ingredient.findUnique({
      where: { id: data.ingredient_id },
    });
    if (!ingredient) {
      return res.status(400).json({ error: 'Ingredient not found' });
    }

    const request = await prisma.stockRequest.create({
      data: {
        ...data,
        requested_by: userId,
        requested_by_name: username ?? 'Unknown',
        status: 'pending_supervisor',
        approval_level: 1,
      },
      include: {
        ingredient: true,
        supplier: true,
      },
    });

    // Create notification for supervisor
    await prisma.notification.create({
      data: {
        user_id: userId || '', // In production, this would be the supervisor's ID
        type: 'stock_request_approval',
        title: 'New Stock Request',
        message: `Stock request for ${data.ingredient_name} requires supervisor approval`,
        entity_id: request.id,
        entity_type: 'stock_request',
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating stock request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-requests/:id/approve-supervisor - Level 1 approval (Supervisor)
router.patch('/:id/approve-supervisor', authMiddleware, requirePermission(PERMISSIONS.approvals.approve), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;
    const username = req.user?.username;
    const { notes } = req.body;

    const request = await prisma.stockRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (request.status !== 'pending_supervisor') {
      return res.status(400).json({ error: 'Stock request is not pending supervisor approval' });
    }

    const updatedRequest = await prisma.stockRequest.update({
      where: { id },
      data: {
        status: 'pending_manager',
        approval_level: 2,
        supervisor_id: userId,
        supervisor_name: username ?? 'Unknown',
        supervisor_approved_at: new Date(),
        supervisor_notes: notes,
      },
      include: {
        ingredient: true,
        supplier: true,
      },
    });

    // Create notification for manager
    await prisma.notification.create({
      data: {
        user_id: userId || '', // In production, this would be the manager's ID
        type: 'stock_request_approval',
        title: 'Stock Request Awaiting Manager Approval',
        message: `Stock request for ${request.ingredient_name} requires manager approval`,
        entity_id: request.id,
        entity_type: 'stock_request',
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error approving stock request at supervisor level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-requests/:id/approve-manager - Level 2 approval (Manager)
router.patch('/:id/approve-manager', authMiddleware, requirePermission(PERMISSIONS.approvals.approve), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;
    const username = req.user?.username;
    const { notes } = req.body;

    const request = await prisma.stockRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (request.status !== 'pending_manager') {
      return res.status(400).json({ error: 'Stock request is not pending manager approval' });
    }

    const updatedRequest = await prisma.stockRequest.update({
      where: { id },
      data: {
        status: 'pending_finance',
        approval_level: 3,
        manager_id: userId,
        manager_name: username ?? 'Unknown',
        manager_approved_at: new Date(),
        manager_notes: notes,
      },
      include: {
        ingredient: true,
        supplier: true,
      },
    });

    // Create notification for finance director
    await prisma.notification.create({
      data: {
        user_id: userId || '', // In production, this would be the finance director's ID
        type: 'stock_request_approval',
        title: 'Stock Request Awaiting Finance Approval',
        message: `Stock request for ${request.ingredient_name} requires finance director approval`,
        entity_id: request.id,
        entity_type: 'stock_request',
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error approving stock request at manager level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-requests/:id/approve-finance - Level 3 approval (Finance Director)
router.patch('/:id/approve-finance', authMiddleware, requirePermission(PERMISSIONS.approvals.approve), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;
    const username = req.user?.username;
    const { notes } = req.body;

    const request = await prisma.stockRequest.findUnique({ 
      where: { id },
      include: {
        ingredient: true,
      },
    });
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (request.status !== 'pending_finance') {
      return res.status(400).json({ error: 'Stock request is not pending finance approval' });
    }

    const updatedRequest = await prisma.stockRequest.update({
      where: { id },
      data: {
        status: 'approved',
        approval_level: 3,
        finance_id: userId,
        finance_name: username ?? 'Unknown',
        finance_approved_at: new Date(),
        finance_notes: notes,
      },
      include: {
        ingredient: true,
        supplier: true,
      },
    });

    // Update ingredient stock when approved by finance
    if (request.ingredient) {
      const newStock = request.ingredient.current_stock + request.quantity_requested;
      await prisma.ingredient.update({
        where: { id: request.ingredient_id },
        data: { current_stock: newStock },
      });

      // Create stock adjustment log
      await prisma.stockAdjustmentLog.create({
        data: {
          ingredient_id: request.ingredient_id,
          previous_stock: request.ingredient.current_stock,
          new_stock: newStock,
          adjustment_type: 'purchase',
          reason: `Stock request #${request.id} approved`,
          user_id: userId,
        },
      });
    }

    // Create quotation request automatically
    await prisma.quotationRequest.create({
      data: {
        stock_request_id: id,
        status: 'open',
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error approving stock request at finance level:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-requests/:id/reject - Reject at current level
router.patch('/:id/reject', authMiddleware, requirePermission(PERMISSIONS.approvals.approve), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = rejectStockRequestSchema.parse(req.body);
    const userId = req.user?.id;
    const username = req.user?.username;

    const request = await prisma.stockRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (!request.status.startsWith('pending_')) {
      return res.status(400).json({ error: 'Stock request is not pending approval' });
    }

    const updatedRequest = await prisma.stockRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        rejected_by: userId,
        rejected_by_name: username ?? 'Unknown',
        rejected_at: new Date(),
        rejection_reason: data.rejection_reason,
        rejection_level: request.approval_level,
      },
      include: {
        ingredient: true,
        supplier: true,
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error rejecting stock request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /stock-requests/:id/recall - Recall approval (before next level approves)
router.patch('/:id/recall', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    const request = await prisma.stockRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (request.requested_by !== userId) {
      return res.status(403).json({ error: 'Only the requester can recall' });
    }
    if (request.status === 'approved' || request.status === 'rejected' || request.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot recall completed request' });
    }

    // Reset to previous level or cancel
    let newStatus = 'cancelled';
    let newLevel = request.approval_level;

    if (request.status === 'pending_manager') {
      newStatus = 'pending_supervisor';
      newLevel = 1;
    } else if (request.status === 'pending_finance') {
      newStatus = 'pending_manager';
      newLevel = 2;
    }

    const updatedRequest = await prisma.stockRequest.update({
      where: { id },
      data: {
        status: newStatus,
        approval_level: newLevel,
        // Clear the approval that's being recalled
        ...(request.status === 'pending_manager' ? {
          supervisor_id: null,
          supervisor_name: null,
          supervisor_approved_at: null,
          supervisor_notes: null,
        } : {}),
        ...(request.status === 'pending_finance' ? {
          manager_id: null,
          manager_name: null,
          manager_approved_at: null,
          manager_notes: null,
        } : {}),
      },
      include: {
        ingredient: true,
        supplier: true,
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error recalling stock request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /stock-requests/:id - Cancel request
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.delete), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user?.id;

    const request = await prisma.stockRequest.findUnique({ where: { id } });
    if (!request) {
      return res.status(404).json({ error: 'Stock request not found' });
    }
    if (request.requested_by !== userId) {
      return res.status(403).json({ error: 'Only the requester can cancel' });
    }
    if (request.status === 'approved') {
      return res.status(400).json({ error: 'Cannot cancel approved request' });
    }

    await prisma.stockRequest.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error cancelling stock request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
