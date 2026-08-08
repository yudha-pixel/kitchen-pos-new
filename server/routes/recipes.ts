import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// GET /recipes - Get all recipes
router.get('/', async (req: Request, res: Response) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredient: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /recipes/menu/:menuItemId - Get recipes for a specific menu item
router.get('/menu/:menuItemId', async (req: Request, res: Response) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        menu_item_id: Array.isArray(req.params.menuItemId) ? req.params.menuItemId[0] : req.params.menuItemId,
      },
      include: {
        ingredient: true,
      },
    });
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes for menu item:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// GET /recipes/:id - Get recipe by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      include: {
        ingredient: true,
      },
    });
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// POST /recipes - Create new recipe
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { menu_item_id, ingredient_id, quantity_required, unit } = req.body;
    
    const recipe = await prisma.recipe.create({
      data: {
        menu_item_id,
        ingredient_id,
        quantity_required: parseFloat(quantity_required),
        unit,
      },
      include: {
        ingredient: true,
      },
    });
    
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

// PUT /recipes/:id - Update recipe
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { menu_item_id, ingredient_id, quantity_required, unit } = req.body;
    
    const recipe = await prisma.recipe.update({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
      data: {
        menu_item_id,
        ingredient_id,
        quantity_required: parseFloat(quantity_required),
        unit,
      },
      include: {
        ingredient: true,
      },
    });
    
    res.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// DELETE /recipes/:id - Delete recipe
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    await prisma.recipe.delete({
      where: { id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// DELETE /recipes/menu/:menuItemId - Delete all recipes for a menu item
router.delete('/menu/:menuItemId', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    await prisma.recipe.deleteMany({
      where: {
        menu_item_id: Array.isArray(req.params.menuItemId) ? req.params.menuItemId[0] : req.params.menuItemId,
      },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting recipes for menu item:', error);
    res.status(500).json({ error: 'Failed to delete recipes' });
  }
});

export default router;
