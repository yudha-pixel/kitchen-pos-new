import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import { createCategorySchema, updateCategorySchema } from '../lib/validation';

const router = Router();

// ---------------------------------------------------------------------------
// Ingredient categories — a distinct domain from Product's /api/products/categories
// (menu categories). Registered before /:id so "categories" isn't swallowed as
// an ingredient id param.
// ---------------------------------------------------------------------------

router.get('/categories', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (_req: Request, res: Response) => {
  const categories = await prisma.ingredientCategory.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
});

router.post('/categories', authMiddleware, requirePermission(PERMISSIONS.inventory.edit), async (req: Request, res: Response) => {
  try {
    const data = createCategorySchema.parse(req.body);
    const created = await prisma.ingredientCategory.create({ data: { name: data.name, color: data.color ?? null } });
    res.status(201).json(created);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') return res.status(400).json({ error: error.message });
    console.error('Error creating ingredient category:', error);
    res.status(500).json({ error: 'Failed to create ingredient category' });
  }
});

router.patch('/categories/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const data = updateCategorySchema.parse(req.body);
    const updated = await prisma.ingredientCategory.update({ where: { id }, data });
    res.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') return res.status(400).json({ error: error.message });
    console.error('Error updating ingredient category:', error);
    res.status(500).json({ error: 'Failed to update ingredient category' });
  }
});

router.delete('/categories/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.edit), async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    // Ingredients keep existing (category_id becomes null via the optional relation).
    await prisma.ingredientCategory.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting ingredient category:', error);
    res.status(500).json({ error: 'Failed to delete ingredient category' });
  }
});

// GET /ingredients - Get all ingredients
router.get('/', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        supplier: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// GET /ingredients/adjustments - Recent manual/automatic stock corrections across all
// ingredients (registered before /:id so "adjustments" isn't swallowed as an id param).
router.get('/adjustments', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const take = Math.min(Math.max(parseInt(String(req.query.limit ?? '50'), 10) || 50, 1), 200);
    const logs = await prisma.stockAdjustmentLog.findMany({
      take,
      orderBy: { created_at: 'desc' },
      include: {
        ingredient: { select: { id: true, name: true, unit: true } },
      },
    });
    const userIds = [...new Set(logs.map((log) => log.user_id).filter((id): id is string => Boolean(id)))];
    const users = userIds.length
      ? await prisma.profile.findMany({ where: { id: { in: userIds } }, select: { id: true, full_name: true, username: true } })
      : [];
    const userById = new Map(users.map((u) => [u.id, u.full_name?.trim() || u.username]));
    res.json(
      logs.map((log) => ({
        id: log.id,
        ingredient_id: log.ingredient_id,
        ingredient_name: log.ingredient.name,
        unit: log.ingredient.unit,
        previous_stock: log.previous_stock,
        new_stock: log.new_stock,
        delta: log.new_stock - log.previous_stock,
        adjustment_type: log.adjustment_type,
        reason: log.reason,
        user_name: log.user_id ? userById.get(log.user_id) ?? null : null,
        created_at: log.created_at,
      }))
    );
  } catch (error) {
    console.error('Error fetching stock adjustments:', error);
    res.status(500).json({ error: 'Failed to fetch stock adjustments' });
  }
});

// GET /ingredients/:id - Get ingredient by ID
router.get('/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      include: {
        supplier: true,
        category: true,
      },
    });
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error) {
    console.error('Error fetching ingredient:', error);
    res.status(500).json({ error: 'Failed to fetch ingredient' });
  }
});

// POST /ingredients - Create new ingredient
router.post('/', authMiddleware, requirePermission(PERMISSIONS.inventory.create), async (req: Request, res: Response) => {
  try {
    const { name, current_stock, unit, min_stock, unit_price, supplier_id, category_id } = req.body;

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        current_stock: parseFloat(current_stock) || 0,
        unit,
        min_stock: parseFloat(min_stock) || 0,
        unit_price: parseFloat(unit_price) || 0,
        supplier_id: supplier_id || null,
        category_id: category_id || null,
      },
      include: {
        supplier: true,
        category: true,
      },
    });
    
    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// PUT /ingredients/:id - Update ingredient
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.edit), async (req: Request, res: Response) => {
  try {
    const { name, current_stock, unit, min_stock, unit_price, supplier_id, category_id, adjustment_type, reason } = req.body;
    const userId = (req as any).user?.id;
    
    // Get current ingredient for audit log
    const currentIngredient = await prisma.ingredient.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });

    if (!currentIngredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    const newStock = parseFloat(current_stock) || 0;
    const previousStock = currentIngredient.current_stock;

    const ingredient = await prisma.ingredient.update({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      data: {
        name,
        current_stock: newStock,
        unit,
        min_stock: parseFloat(min_stock) || 0,
        unit_price: parseFloat(unit_price) || 0,
        supplier_id: supplier_id || null,
        // Falls back to the existing value when omitted (e.g. the stock-adjustment
        // flow doesn't send category_id) instead of silently clearing it — unlike
        // the other fields above, callers of this endpoint aren't guaranteed to
        // always know/send this one.
        category_id: category_id !== undefined ? (category_id || null) : currentIngredient.category_id,
      },
      include: {
        supplier: true,
        category: true,
      },
    });

    // Log stock adjustment if stock changed
    if (previousStock !== newStock) {
      await prisma.stockAdjustmentLog.create({
        data: {
          ingredient_id: ingredient.id,
          previous_stock: previousStock,
          new_stock: newStock,
          adjustment_type: typeof adjustment_type === 'string' && adjustment_type ? adjustment_type : 'manual',
          reason: typeof reason === 'string' && reason ? reason : 'Manual stock adjustment via API',
          user_id: userId,
        },
      });
    }
    
    res.json(ingredient);
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// DELETE /ingredients/:id - Delete ingredient
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.delete), async (req: Request, res: Response) => {
  try {
    await prisma.ingredient.delete({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

export default router;
