import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// GET /api/purchase-requisitions - Get all purchase requisitions
router.get('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const requisitions = await prisma.purchaseRequisition.findMany({
      include: {
        prItems: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json(requisitions);
  } catch (error) {
    console.error('Error fetching purchase requisitions:', error);
    res.status(500).json({ error: 'Failed to fetch purchase requisitions' });
  }
});

// POST /api/purchase-requisitions - Create a new purchase requisition
router.post('/', authMiddleware, requirePermission(PERMISSIONS.purchasing.create), async (req: Request, res: Response) => {
  try {
    const { requested_by, items, total_estimated, notes } = req.body;

    // Validate required fields
    if (!requested_by || !items || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: requested_by, items'
      });
    }

    // Generate PR number using Sequence Config
    const { generateNextSequenceNumber } = await import('../lib/sequence');
    const pr_number = await generateNextSequenceNumber('pr');

    // Create the purchase requisition with items
    const requisition = await prisma.purchaseRequisition.create({
      data: {
        pr_number,
        requested_by,
        total_estimated,
        notes,
        prItems: {
          create: items.map((item: any) => ({
            ingredient_id: item.ingredient_id,
            ingredient_name: item.ingredient_name,
            quantity: item.quantity,
            unit: item.unit,
            estimated_price: item.estimated_price
          }))
        }
      },
      include: {
        prItems: true
      }
    });

    res.status(201).json(requisition);
  } catch (error) {
    console.error('Error creating purchase requisition:', error);
    res.status(500).json({ error: 'Failed to create purchase requisition' });
  }
});

const isUUID = (str: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

const resolvePRId = async (id: string): Promise<string | null> => {
  if (isUUID(id)) return id;
  const found = await prisma.purchaseRequisition.findFirst({ where: { pr_number: id }, select: { id: true } });
  return found?.id || null;
};

// GET /api/purchase-requisitions/:id - Get single PR detail
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.purchasing.view), async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const requisition = isUUID(rawId)
      ? await prisma.purchaseRequisition.findUnique({
          where: { id: rawId },
          include: { prItems: true },
        })
      : await prisma.purchaseRequisition.findFirst({
          where: { pr_number: rawId },
          include: { prItems: true },
        });

    if (!requisition) {
      return res.status(404).json({ error: 'Purchase requisition not found' });
    }

    res.json(requisition);
  } catch (error) {
    console.error('Error fetching purchase requisition detail:', error);
    res.status(500).json({ error: 'Failed to fetch purchase requisition' });
  }
});

// PATCH /api/purchase-requisitions/:id/approve - Approve a PR
router.patch('/:id/approve', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = await resolvePRId(rawId);
    if (!id) {
      return res.status(404).json({ error: 'Purchase requisition not found' });
    }
    const { approved_by } = req.body;

    const requisition = await prisma.purchaseRequisition.update({
      where: { id },
      data: {
        status: 'Approved',
        approved_at: new Date(),
        approved_by: approved_by || (req as any).user?.full_name || 'Admin'
      },
      include: {
        prItems: true
      }
    });

    res.json(requisition);
  } catch (error) {
    console.error('Error approving purchase requisition:', error);
    res.status(500).json({ error: 'Failed to approve purchase requisition' });
  }
});

// PATCH /api/purchase-requisitions/:id/reject - Reject a PR
router.patch('/:id/reject', authMiddleware, requirePermission(PERMISSIONS.purchasing.edit), async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = await resolvePRId(rawId);
    if (!id) {
      return res.status(404).json({ error: 'Purchase requisition not found' });
    }

    const requisition = await prisma.purchaseRequisition.update({
      where: { id },
      data: {
        status: 'Rejected'
      },
      include: {
        prItems: true
      }
    });

    res.json(requisition);
  } catch (error) {
    console.error('Error rejecting purchase requisition:', error);
    res.status(500).json({ error: 'Failed to reject purchase requisition' });
  }
});

// POST /api/purchase-requisitions/:id/convert-to-po - Convert PR to PO
router.post('/:id/convert-to-po', authMiddleware, requirePermission(PERMISSIONS.purchasing.create), async (req: Request, res: Response) => {
  try {
    const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = await resolvePRId(rawId);
    if (!id) {
      return res.status(404).json({ error: 'Purchase requisition not found' });
    }

    // Get the PR with items including supplier_id
    const pr = await prisma.purchaseRequisition.findUnique({
      where: { id },
      include: {
        prItems: true
      }
    });

    if (!pr) {
      return res.status(404).json({ error: 'Purchase requisition not found' });
    }

    if (pr.status !== 'Approved') {
      return res.status(400).json({ error: 'Only approved PRs can be converted to PO' });
    }

    // Get supplier_id from the first PR item (for auto-generated PRs)
    const supplierId = pr.prItems[0]?.supplier_id || null;

    if (!supplierId) {
      return res.status(400).json({ error: 'Supplier must be specified before converting to PO' });
    }

    // Generate PO number
    // Generate PO number using Sequence Config
    const { generateNextSequenceNumber } = await import('../lib/sequence');
    const po_number = await generateNextSequenceNumber('po');

    // Calculate totals
    const subtotal = pr.total_estimated;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // Create PO from PR items with supplier_id
    const po = await prisma.purchaseOrder.create({
      data: {
        po_number,
        supplier_id: supplierId,
        status: 'draft',
        order_date: new Date(),
        subtotal,
        tax,
        total,
        notes: `Converted from PR ${pr.pr_number}`,
        items: {
          create: pr.prItems.map((item: any) => ({
            ingredient_id: item.ingredient_id,
            ingredient_name: item.ingredient_name,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.estimated_price / item.quantity,
            total_price: item.estimated_price
          }))
        }
      },
      include: {
        items: true,
        supplier: true
      }
    });

    // Update PR status
    await prisma.purchaseRequisition.update({
      where: { id },
      data: {
        status: 'Converted to PO'
      }
    });

    res.json(po);
  } catch (error) {
    console.error('Error converting PR to PO:', error);
    res.status(500).json({ error: 'Failed to convert PR to PO' });
  }
});

export default router;
