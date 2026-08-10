import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

const createWorkflowSchema = z.object({
  name: z.string(),
  level: z.number().int().min(1).max(3),
  role_id: z.string().uuid(),
  role_name: z.string(),
});

// GET /approval-workflows - List all
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const workflows = await prisma.approvalWorkflow.findMany({
      where: { is_active: true },
      orderBy: { level: 'asc' },
    });

    res.json(workflows);
  } catch (error) {
    console.error('Error fetching approval workflows:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /approval-workflows - Create workflow
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const data = createWorkflowSchema.parse(req.body);

    const workflow = await prisma.approvalWorkflow.create({
      data,
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error('Error creating approval workflow:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /approval-workflows/:id - Update workflow
router.patch('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = createWorkflowSchema.partial().parse(req.body);

    const workflow = await prisma.approvalWorkflow.update({
      where: { id },
      data,
    });

    res.json(workflow);
  } catch (error) {
    console.error('Error updating approval workflow:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /approval-workflows/:id - Delete workflow
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await prisma.approvalWorkflow.update({
      where: { id },
      data: { is_active: false },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting approval workflow:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
