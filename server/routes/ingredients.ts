import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import { createCategorySchema, updateCategorySchema } from '../lib/validation';
import { getStockLogs, getActiveBatches, getInventoryKPI } from '../lib/inventoryService';

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
    // Add supplier_name and category_name for easier frontend access
    const enrichedIngredients = ingredients.map(ing => ({
      ...ing,
      supplier_name: ing.supplier?.name || ing.ad_hoc_supplier || null,
      category_name: ing.category?.name || null,
    }));
    res.json(enrichedIngredients);
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

// GET /ingredients/low-stock - Ingredients at/below min_stock with a restock quantity set,
// used to seed the Purchase Requisition form. Registered before /:id so "low-stock" isn't
// swallowed as an id param.
router.get('/low-stock', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const { supplier_id } = req.query;

    // Only surface candidates when auto-restock is enabled — otherwise this list has no purpose.
    const settings = await prisma.appSettings.findFirst();
    if (!settings?.auto_restock_enabled) {
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
    const { name, sku, barcode, current_stock, unit, min_stock, restock_quantity, unit_price, supplier_id, ad_hoc_supplier, ad_hoc_price, category_id } = req.body;

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        sku: sku || null,
        barcode: barcode || null,
        current_stock: parseFloat(current_stock) || 0,
        unit,
        min_stock: parseFloat(min_stock) || 0,
        restock_quantity: parseFloat(restock_quantity) || 0,
        unit_price: parseFloat(unit_price) || 0,
        supplier_id: supplier_id || null,
        ad_hoc_supplier: ad_hoc_supplier || null,
        ad_hoc_price: ad_hoc_price ? parseFloat(ad_hoc_price) : null,
        category_id: category_id || null,
      },
      include: {
        supplier: true,
        category: true,
      },
    });

    const enrichedIngredient = {
      ...ingredient,
      supplier_name: ingredient.supplier?.name || ingredient.ad_hoc_supplier || null,
      category_name: ingredient.category?.name || null,
    };

    res.status(201).json(enrichedIngredient);
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// PUT /ingredients/:id - Update ingredient
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.inventory.edit), async (req: Request, res: Response) => {
  try {
    const { name, sku, barcode, current_stock, unit, min_stock, restock_quantity, unit_price, supplier_id, ad_hoc_supplier, ad_hoc_price, category_id, adjustment_type, reason } = req.body;
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
        sku: sku !== undefined ? (sku || null) : currentIngredient.sku,
        barcode: barcode !== undefined ? (barcode || null) : currentIngredient.barcode,
        current_stock: newStock,
        unit,
        min_stock: parseFloat(min_stock) || 0,
        restock_quantity: parseFloat(restock_quantity) || 0,
        unit_price: parseFloat(unit_price) || 0,
        supplier_id: supplier_id || null,
        ad_hoc_supplier: ad_hoc_supplier || null,
        ad_hoc_price: ad_hoc_price ? parseFloat(ad_hoc_price) : null,
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

    const enrichedIngredient = {
      ...ingredient,
      supplier_name: ingredient.supplier?.name || ingredient.ad_hoc_supplier || null,
      category_name: ingredient.category?.name || null,
    };

    res.json(enrichedIngredient);
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

// ---------------------------------------------------------------------------
// Feature 5: Stock Logs and Active Batches Endpoints
// ---------------------------------------------------------------------------

// GET /ingredients/:id/stock-logs - Get paginated stock logs for an ingredient
router.get('/:id/stock-logs', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '50'), 10) || 50, 1), 200);

    const result = await getStockLogs(id, page, limit);
    res.json(result);
  } catch (error) {
    console.error('Error fetching stock logs:', error);
    res.status(500).json({ error: 'Failed to fetch stock logs' });
  }
});

// GET /ingredients/:id/active-batches - Get active batches for an ingredient
router.get('/:id/active-batches', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const batches = await getActiveBatches(id);
    res.json(batches);
  } catch (error) {
    console.error('Error fetching active batches:', error);
    res.status(500).json({ error: 'Failed to fetch active batches' });
  }
});

// GET /ingredients/kpi - Get inventory KPI summary for dashboard
router.get('/kpi', authMiddleware, requirePermission(PERMISSIONS.inventory.view), async (_req: Request, res: Response) => {
  try {
    const kpi = await getInventoryKPI();
    res.json(kpi);
  } catch (error) {
    console.error('Error fetching inventory KPI:', error);
    res.status(500).json({ error: 'Failed to fetch inventory KPI' });
  }
});

// POST /ingredients/import - Import ingredients from CSV
router.post('/import', authMiddleware, requirePermission(PERMISSIONS.inventory.create), async (req: Request, res: Response) => {
  try {
    const { csvData } = req.body;

    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    const lines = csvData.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    let imported = 0;
    let updated = 0;

    // Parse CSV with flexible column mapping
    // Expected headers: Item Name, SKU, Category, Unit, Unit Cost, Selling Price, Reorder Point
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));

    // Create column index mapping
    const colMap: Record<string, number> = {};
    headers.forEach((h, idx) => {
      if (h.includes('name') || h.includes('item')) colMap.name = idx;
      else if (h.includes('sku')) colMap.sku = idx;
      else if (h.includes('category')) colMap.category = idx;
      else if (h.includes('unit')) colMap.unit = idx;
      else if (h.includes('cost') || h.includes('price')) colMap.unitCost = idx;
      else if (h.includes('selling')) colMap.sellingPrice = idx;
      else if (h.includes('reorder') || h.includes('min') || h.includes('stock')) colMap.reorderPoint = idx;
    });

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));

        const name = values[colMap.name] || '';
        const sku = values[colMap.sku] || '';
        const category = values[colMap.category] || '';
        const unit = values[colMap.unit] || 'pcs';
        const unitCost = parseFloat(values[colMap.unitCost]) || 0;
        const reorderPoint = parseFloat(values[colMap.reorderPoint]) || 0;

        if (!name) {
          errors.push(`Row ${i + 1}: Name is required`);
          continue;
        }

        // Find or create category
        let categoryId: string | null = null;
        if (category) {
          const existingCategory = await prisma.ingredientCategory.findFirst({
            where: { name: { equals: category, mode: 'insensitive' } }
          });
          if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            const newCategory = await prisma.ingredientCategory.create({
              data: { name: category }
            });
            categoryId = newCategory.id;
          }
        }

        // Check if ingredient with same SKU exists
        const existing = await prisma.ingredient.findFirst({
          where: { sku: sku || name }
        });

        if (existing) {
          // Update existing
          await prisma.ingredient.update({
            where: { id: existing.id },
            data: {
              name,
              sku: sku || null,
              category_id: categoryId,
              unit,
              unit_price: unitCost,
              min_stock: reorderPoint,
            }
          });
          updated++;
          console.log(`✅ Updated ingredient: ${name}`);
        } else {
          // Create new
          await prisma.ingredient.create({
            data: {
              name,
              sku: sku || null,
              category_id: categoryId,
              unit,
              unit_price: unitCost,
              min_stock: reorderPoint,
              current_stock: 0,
            }
          });
          imported++;
          console.log(`✅ Imported ingredient: ${name}`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Row ${i + 1}: ${errorMsg}`);
        console.error(`❌ Failed to import row ${i + 1}:`, err);
      }
    }

    res.json({
      success: true,
      imported,
      updated,
      errors,
      message: `Imported ${imported} new ingredients, updated ${updated} existing ingredients`
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Failed to import ingredients' });
  }
});

export default router;
