import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// GET /ingredients - Get all ingredients
router.get('/', async (req: Request, res: Response) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      include: {
        supplier: true,
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

// GET /ingredients/:id - Get ingredient by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      include: {
        supplier: true,
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
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { name, category, current_stock, unit, min_stock, unit_price, supplier_id, restock_quantity } = req.body;
    
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        category: category || null,
        current_stock: parseFloat(current_stock) || 0,
        unit,
        min_stock: parseFloat(min_stock) || 0,
        restock_quantity: parseFloat(restock_quantity) || 0,
        unit_price: parseFloat(unit_price) || 0,
        supplier_id: supplier_id || null,
      },
      include: {
        supplier: true,
      },
    });
    
    res.status(201).json(ingredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// PUT /ingredients/:id - Update ingredient
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { name, category, current_stock, unit, min_stock, unit_price, supplier_id, restock_quantity, ad_hoc_supplier, ad_hoc_price } = req.body;
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
        category: category || null,
        current_stock: newStock,
        unit,
        min_stock: parseFloat(min_stock) || 0,
        restock_quantity: parseFloat(restock_quantity) || 0,
        unit_price: parseFloat(unit_price) || 0,
        supplier_id: supplier_id || null,
        ad_hoc_supplier: ad_hoc_supplier || null,
        ad_hoc_price: ad_hoc_price ? parseFloat(ad_hoc_price) : null,
      },
      include: {
        supplier: true,
      },
    });

    // Log stock adjustment if stock changed
    if (previousStock !== newStock) {
      await prisma.stockAdjustmentLog.create({
        data: {
          ingredient_id: ingredient.id,
          previous_stock: previousStock,
          new_stock: newStock,
          adjustment_type: 'manual',
          reason: 'Manual stock adjustment via API',
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
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
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

// GET /ingredients/low-stock - Get ingredients that need restocking
router.get('/low-stock', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.query;
    
    // Fetch app settings to check if auto_restock is enabled
    const settings = await prisma.appSettings.findFirst();
    const autoRestockEnabled = settings?.auto_restock_enabled || false;
    
    if (!autoRestockEnabled) {
      return res.json([]);
    }
    
    const where: any = {
      current_stock: {
        lte: prisma.ingredient.fields.min_stock,
      },
      restock_quantity: {
        gt: 0,
      },
    };
    
    // Filter by supplier if specified
    if (supplier_id && supplier_id !== 'all') {
      where.supplier_id = supplier_id as string;
    }
    
    const ingredients = await prisma.ingredient.findMany({
      where,
      include: {
        supplier: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching low-stock ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch low-stock ingredients' });
  }
});

export default router;
