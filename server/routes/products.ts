import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.get('/categories', async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

router.get('/products', async (req: Request, res: Response) => {
  const { categoryId } = req.query;
  const where: any = {};
  if (categoryId) {
    where.category_id = categoryId as string;
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { name: 'asc' },
  });

  res.json(
    products.map((p) => ({
      ...p,
      category_name: p.category?.name || null,
      category: undefined,
    }))
  );
});

router.get('/modifiers', async (req: Request, res: Response) => {
  const { productId } = req.query;
  const where: any = {};
  if (productId) {
    where.product_id = productId as string;
  }

  const modifiers = await prisma.modifier.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  res.json(modifiers);
});

router.patch(
  '/products/:id',
  authMiddleware,
  requireRole('admin'),
  async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { name, price, stock_quantity, image_url, category_id } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        stock_quantity,
        image_url,
        category_id,
      },
    });

    res.json(updated);
  }
);

export default router;
