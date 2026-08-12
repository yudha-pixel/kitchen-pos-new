import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';

const router = Router();

// GET /api/petty-cash/summary - Get petty cash summary for a date range
// Registered before /:id so "summary" isn't swallowed as an :id param.
router.get('/summary', authMiddleware, requirePermission(PERMISSIONS.finance.view), async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;

    const where: any = {};

    if (start_date && end_date) {
      where.expense_date = {
        gte: new Date(start_date as string),
        lte: new Date(end_date as string),
      };
    }

    const expenses = await prisma.pettyCash.findMany({
      where,
    });

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byCategory = expenses.reduce((acc, exp) => {
      const category = exp.category || 'misc';
      acc[category] = (acc[category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      total_amount: totalAmount,
      total_count: expenses.length,
      by_category: byCategory,
    });
  } catch (error) {
    console.error('Error fetching petty cash summary:', error);
    res.status(500).json({ error: 'Failed to fetch petty cash summary' });
  }
});

// GET /api/petty-cash - Get all petty cash expenses
router.get('/', authMiddleware, requirePermission(PERMISSIONS.finance.view), async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, category } = req.query;

    const where: any = {};

    if (start_date && end_date) {
      where.expense_date = {
        gte: new Date(start_date as string),
        lte: new Date(end_date as string),
      };
    }

    if (category) {
      where.category = category as string;
    }

    const expenses = await prisma.pettyCash.findMany({
      where,
      include: {
        created_by_user: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        ingredient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        expense_date: 'desc',
      },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching petty cash expenses:', error);
    res.status(500).json({ error: 'Failed to fetch petty cash expenses' });
  }
});

// GET /api/petty-cash/:id - Get single petty cash expense
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.finance.view), async (req: Request, res: Response) => {
  try {
    const expense = await prisma.pettyCash.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      include: {
        created_by_user: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        ingredient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!expense) {
      return res.status(404).json({ error: 'Petty cash expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Error fetching petty cash expense:', error);
    res.status(500).json({ error: 'Failed to fetch petty cash expense' });
  }
});

// POST /api/petty-cash - Create petty cash expense
router.post('/', authMiddleware, requirePermission(PERMISSIONS.finance.create), async (req: Request, res: Response) => {
  try {
    const { amount, description, category, receipt_url, ingredient_id, shift_id } = req.body;
    const userId = (req as any).user?.id;

    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }

    const expense = await prisma.pettyCash.create({
      data: {
        amount: parseFloat(amount),
        description,
        category: category || 'misc',
        receipt_url: receipt_url || null,
        ingredient_id: ingredient_id || null,
        shift_id: shift_id || null,
        created_by: userId,
      },
      include: {
        created_by_user: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        ingredient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating petty cash expense:', error);
    res.status(500).json({ error: 'Failed to create petty cash expense' });
  }
});

// PUT /api/petty-cash/:id - Update petty cash expense
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.finance.edit), async (req: Request, res: Response) => {
  try {
    const { amount, description, category, receipt_url } = req.body;

    const expense = await prisma.pettyCash.update({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        description: description || undefined,
        category: category || undefined,
        receipt_url: receipt_url !== undefined ? receipt_url : undefined,
      },
      include: {
        created_by_user: {
          select: {
            id: true,
            username: true,
            full_name: true,
          },
        },
        ingredient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json(expense);
  } catch (error) {
    console.error('Error updating petty cash expense:', error);
    res.status(500).json({ error: 'Failed to update petty cash expense' });
  }
});

// DELETE /api/petty-cash/:id - Delete petty cash expense
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.finance.delete), async (req: Request, res: Response) => {
  try {
    await prisma.pettyCash.delete({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting petty cash expense:', error);
    res.status(500).json({ error: 'Failed to delete petty cash expense' });
  }
});

export default router;
