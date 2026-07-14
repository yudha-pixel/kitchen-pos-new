import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';
import {
  createCategorySchema,
  updateCategorySchema,
  createModifierGroupSchema,
  updateModifierGroupSchema,
  createModifierSchema,
  updateModifierSchema,
  createProductSchema,
  updateProductSchema,
  paginationSchema,
} from '../lib/validation';

const router = Router();
const adminOnly = [authMiddleware, requireRole('admin')] as const;

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

router.get('/categories', async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

router.post('/categories', ...adminOnly, async (req: Request, res: Response) => {
  const data = createCategorySchema.parse(req.body);
  const created = await prisma.category.create({
    data: { name: data.name, color: data.color ?? null },
  });
  res.status(201).json(created);
});

router.patch('/categories/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = updateCategorySchema.parse(req.body);
  const updated = await prisma.category.update({ where: { id }, data });
  res.json(updated);
});

router.delete('/categories/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  // Products keep existing (category_id becomes null via the optional relation).
  await prisma.category.delete({ where: { id } });
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// Modifier groups
// ---------------------------------------------------------------------------

router.get('/modifier-groups', async (_req: Request, res: Response) => {
  const modifierGroups = await prisma.modifierGroup.findMany({
    include: {
      modifiers: true,
    },
    orderBy: { name: 'asc' },
  });
  res.json(modifierGroups);
});

router.post('/modifier-groups', ...adminOnly, async (req: Request, res: Response) => {
  const data = createModifierGroupSchema.parse(req.body);
  const created = await prisma.modifierGroup.create({ data });
  res.status(201).json(created);
});

router.patch('/modifier-groups/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = updateModifierGroupSchema.parse(req.body);
  const updated = await prisma.modifierGroup.update({ where: { id }, data });
  res.json(updated);
});

router.delete('/modifier-groups/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  // Cascades to modifiers and product links (see schema onDelete: Cascade).
  await prisma.modifierGroup.delete({ where: { id } });
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// Modifiers
// ---------------------------------------------------------------------------

router.get('/modifiers', async (req: Request, res: Response) => {
  const { productId } = req.query;

  if (productId) {
    // Get modifiers for a specific product via its modifier groups
    const product = await prisma.product.findUnique({
      where: { id: productId as string },
      include: {
        productModifierGroups: {
          include: {
            modifierGroup: {
              include: {
                modifiers: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const allModifiers = product.productModifierGroups.flatMap((pmg) =>
      pmg.modifierGroup.modifiers.map((m) => ({
        ...m,
        group_name: pmg.modifierGroup.name,
        group_required: pmg.modifierGroup.is_required,
        group_max_selections: pmg.modifierGroup.max_selections,
      }))
    );

    res.json(allModifiers);
  } else {
    // Get all modifiers with their group info
    const modifiers = await prisma.modifier.findMany({
      include: {
        modifierGroup: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json(modifiers);
  }
});

router.post('/modifiers', ...adminOnly, async (req: Request, res: Response) => {
  const data = createModifierSchema.parse(req.body);
  const created = await prisma.modifier.create({
    data: {
      name: data.name,
      price_extra: data.price_extra ?? 0,
      modifier_group_id: data.modifier_group_id,
    },
  });
  res.status(201).json(created);
});

router.patch('/modifiers/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const data = updateModifierSchema.parse(req.body);
  const updated = await prisma.modifier.update({ where: { id }, data });
  res.json(updated);
});

router.delete('/modifiers/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await prisma.modifier.delete({ where: { id } });
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

router.get('/products', async (req: Request, res: Response) => {
  const { categoryId, includeInactive } = req.query;
  const { limit, offset } = paginationSchema.parse(req.query);

  const where: Record<string, unknown> = {};
  if (categoryId) {
    where.category_id = categoryId as string;
  }
  if (includeInactive !== 'true') {
    where.is_active = true;
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      productModifierGroups: {
        include: {
          modifierGroup: {
            include: {
              modifiers: true,
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
    take: limit ?? 500,
    skip: offset ?? 0,
  });

  res.json(
    products.map((p) => ({
      ...p,
      category_name: p.category?.name || null,
      category_color: p.category?.color || null,
      modifier_groups: p.productModifierGroups.map((pmg) => ({
        ...pmg.modifierGroup,
        modifiers: pmg.modifierGroup.modifiers,
      })),
      category: undefined,
      productModifierGroups: undefined,
    }))
  );
});

router.post('/products', ...adminOnly, async (req: Request, res: Response) => {
  const data = createProductSchema.parse(req.body);

  const category = await prisma.category.findUnique({ where: { id: data.category_id } });
  if (!category) {
    res.status(400).json({ error: 'Category not found' });
    return;
  }

  const created = await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock_quantity: data.stock_quantity ?? 0,
      image_url: data.image_url ?? null,
      sku: data.sku ?? null,
      description: data.description ?? null,
      category_id: data.category_id,
      productModifierGroups: data.modifier_group_ids?.length
        ? {
            create: data.modifier_group_ids.map((modifier_group_id) => ({
              modifier_group_id,
            })),
          }
        : undefined,
    },
    include: {
      productModifierGroups: {
        include: { modifierGroup: { include: { modifiers: true } } },
      },
    },
  });

  res.status(201).json(created);
});

router.patch('/products/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { modifier_group_ids, ...data } = updateProductSchema.parse(req.body);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (modifier_group_ids) {
      await tx.productModifierGroup.deleteMany({ where: { product_id: id } });
      if (modifier_group_ids.length > 0) {
        await tx.productModifierGroup.createMany({
          data: modifier_group_ids.map((modifier_group_id) => ({
            product_id: id,
            modifier_group_id,
          })),
        });
      }
    }

    return tx.product.update({
      where: { id },
      data,
      include: {
        productModifierGroups: {
          include: { modifierGroup: { include: { modifiers: true } } },
        },
      },
    });
  });

  res.json(updated);
});

// Soft delete: keeps the product row so historic order items stay intact.
router.delete('/products/:id', ...adminOnly, async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  await prisma.product.update({
    where: { id },
    data: { is_active: false },
  });

  res.json({ success: true });
});

export default router;
