import express, { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = express.Router();

// Get all customers
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { tier, is_active, search } = req.query;

    const where: any = {};

    if (tier) {
      where.tier = tier;
    }

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: id as string },
      include: {
        orders: {
          orderBy: { created_at: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { name, phone, email, tier, points, total_spent, discount_percentage, is_active } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Auto-upgrade tier based on total_spent
    const newTier = autoUpgradeTier(total_spent || 0);
    const tierConfig = getTierConfig(newTier);

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
        tier: newTier,
        points: points || 0,
        total_spent: total_spent || 0,
        discount_percentage: tierConfig.discount,
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, tier, points, total_spent, discount_percentage, is_active } = req.body;

    // Auto-upgrade tier if total_spent is being updated
    let finalTier = tier;
    let finalDiscount = discount_percentage;

    if (total_spent !== undefined) {
      finalTier = autoUpgradeTier(total_spent);
      const tierConfig = getTierConfig(finalTier);
      finalDiscount = tierConfig.discount;
    }

    const customer = await prisma.customer.update({
      where: { id: id as string },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(email !== undefined && { email }),
        ...(finalTier && { tier: finalTier }),
        ...(points !== undefined && { points }),
        ...(total_spent !== undefined && { total_spent }),
        ...(finalDiscount !== undefined && { discount_percentage: finalDiscount }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({
      where: { id: id as string },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Toggle customer active status
router.patch('/:id/toggle-active', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: id as string },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: id as string },
      data: { is_active: !customer.is_active },
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error toggling customer status:', error);
    res.status(500).json({ error: 'Failed to toggle customer status' });
  }
});

// Add points to customer (any authenticated staff — routine part of checkout, not an admin action)
router.post('/:id/points', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { points, total_spent } = req.body;

    const customer = await prisma.customer.findUnique({
      where: { id: id as string },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const newPoints = customer.points + (points || 0);
    const newTotalSpent = customer.total_spent + (total_spent || 0);

    // Auto-upgrade tier
    const newTier = autoUpgradeTier(newTotalSpent);
    const tierConfig = getTierConfig(newTier);

    const updatedCustomer = await prisma.customer.update({
      where: { id: id as string },
      data: {
        points: newPoints,
        total_spent: newTotalSpent,
        tier: newTier,
        discount_percentage: tierConfig.discount,
      },
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: 'Failed to add points' });
  }
});

// Helper functions
const TIER_CONFIG = {
  bronze: { discount: 5, minSpent: 0 },
  silver: { discount: 10, minSpent: 500000 },
  gold: { discount: 15, minSpent: 2000000 },
  platinum: { discount: 20, minSpent: 5000000 },
};

function getTierConfig(tier: string) {
  return TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.bronze;
}

function autoUpgradeTier(totalSpent: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (totalSpent >= TIER_CONFIG.platinum.minSpent) return 'platinum';
  if (totalSpent >= TIER_CONFIG.gold.minSpent) return 'gold';
  if (totalSpent >= TIER_CONFIG.silver.minSpent) return 'silver';
  return 'bronze';
}

export default router;
