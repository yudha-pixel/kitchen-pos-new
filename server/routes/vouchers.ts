import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all vouchers
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { is_active, search } = req.query;

    const where: any = {};

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    if (search) {
      where.OR = [
        { code: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const vouchers = await prisma.voucher.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    res.json(vouchers);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

// Get voucher by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({
      where: { id: id as string },
    });

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json(voucher);
  } catch (error) {
    console.error('Error fetching voucher:', error);
    res.status(500).json({ error: 'Failed to fetch voucher' });
  }
});

// Validate voucher code
router.post('/validate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { code, purchaseAmount } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Voucher code is required' });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    if (!voucher.is_active) {
      return res.status(400).json({ error: 'Voucher is inactive' });
    }

    const now = new Date();
    if (now < voucher.valid_from || now > voucher.valid_until) {
      return res.status(400).json({ error: 'Voucher is expired or not yet valid' });
    }

    if (voucher.used_count >= voucher.quota) {
      return res.status(400).json({ error: 'Voucher quota exceeded' });
    }

    if (purchaseAmount && purchaseAmount < voucher.minimum_purchase) {
      return res.status(400).json({ 
        error: `Minimum purchase not met. Required: ${voucher.minimum_purchase}` 
      });
    }

    res.json({ valid: true, voucher });
  } catch (error) {
    console.error('Error validating voucher:', error);
    res.status(500).json({ error: 'Failed to validate voucher' });
  }
});

// Create new voucher
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { 
      code, 
      name, 
      description, 
      discount_type, 
      discount_value, 
      minimum_purchase, 
      max_discount, 
      quota, 
      valid_from, 
      valid_until, 
      is_active 
    } = req.body;

    if (!code || !name || !discount_value) {
      return res.status(400).json({ error: 'Code, name, and discount value are required' });
    }

    if (discount_value <= 0) {
      return res.status(400).json({ error: 'Discount value must be greater than 0' });
    }

    if (quota <= 0) {
      return res.status(400).json({ error: 'Quota must be greater than 0' });
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        name,
        description,
        discount_type: discount_type || 'nominal',
        discount_value,
        minimum_purchase: minimum_purchase || 0,
        max_discount: max_discount || null,
        quota: quota || 100,
        valid_from: valid_from ? new Date(valid_from) : new Date(),
        valid_until: valid_until ? new Date(valid_until) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    res.status(201).json(voucher);
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ error: 'Failed to create voucher' });
  }
});

// Update voucher
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      code, 
      name, 
      description, 
      discount_type, 
      discount_value, 
      minimum_purchase, 
      max_discount, 
      quota, 
      valid_from, 
      valid_until, 
      is_active 
    } = req.body;

    const voucher = await prisma.voucher.update({
      where: { id: id as string },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(discount_type && { discount_type }),
        ...(discount_value !== undefined && { discount_value }),
        ...(minimum_purchase !== undefined && { minimum_purchase }),
        ...(max_discount !== undefined && { max_discount }),
        ...(quota !== undefined && { quota }),
        ...(valid_from && { valid_from: new Date(valid_from) }),
        ...(valid_until && { valid_until: new Date(valid_until) }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    res.json(voucher);
  } catch (error) {
    console.error('Error updating voucher:', error);
    res.status(500).json({ error: 'Failed to update voucher' });
  }
});

// Delete voucher
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.voucher.delete({
      where: { id: id as string },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
});

// Toggle voucher active status
router.patch('/:id/toggle-active', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({
      where: { id: id as string },
    });

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: id as string },
      data: { is_active: !voucher.is_active },
    });

    res.json(updatedVoucher);
  } catch (error) {
    console.error('Error toggling voucher status:', error);
    res.status(500).json({ error: 'Failed to toggle voucher status' });
  }
});

// Increment voucher usage count
router.post('/:id/use', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = await prisma.voucher.findUnique({
      where: { id: id as string },
    });

    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    if (voucher.used_count >= voucher.quota) {
      return res.status(400).json({ error: 'Voucher quota exceeded' });
    }

    const updatedVoucher = await prisma.voucher.update({
      where: { id: id as string },
      data: { used_count: voucher.used_count + 1 },
    });

    res.json(updatedVoucher);
  } catch (error) {
    console.error('Error using voucher:', error);
    res.status(500).json({ error: 'Failed to use voucher' });
  }
});

export default router;
