import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';
import { auditLogger } from './audit';
import bcrypt from 'bcrypt';

const router = Router();

// Validation schemas
const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role_id: z.string().uuid().optional(),
  outlet_id: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role_id: z.string().uuid().optional(),
  outlet_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
});

// GET /users - List all users (admin/manager only)
router.get('/', async (req: Request, res: Response) => {
  try {
    const users = await prisma.profile.findMany({
      include: {
        role: true,
        outlet: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Remove password_hash from response
    const sanitizedUsers = users.map((user: any) => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id - Get specific user
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const user = await prisma.profile.findUnique({
      where: { id: idStr },
      include: {
        role: true,
        outlet: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password_hash, ...sanitizedUser } = user as any;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /users - Create new user (admin only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = createUserSchema.parse(req.body);

    // Check if username already exists
    const existing = await prisma.profile.findUnique({
      where: { username: data.username },
    });

    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    if (data.email) {
      const existingEmail = await prisma.profile.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(data.password, 10);

    // If role_id is not provided, get default role
    let finalRoleId = data.role_id;
    if (!finalRoleId) {
      const defaultRole = await prisma.role.findFirst({
        where: { name: 'admin' },
      });
      if (!defaultRole) {
        return res.status(400).json({ error: 'Default role not found' });
      }
      finalRoleId = defaultRole.id;
    }

    const user = await prisma.profile.create({
      data: {
        username: data.username,
        password_hash,
        full_name: data.full_name || data.username,
        email: data.email,
        phone: data.phone,
        role_id: finalRoleId,
        outlet_id: data.outlet_id,
      },
      include: {
        role: true,
        outlet: true,
      },
    });

    const { password_hash: _, ...sanitizedUser } = user as any;
    res.status(201).json(sanitizedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /users/:id - Update user (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const data = updateUserSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.profile.findUnique({
      where: { id: idStr },
    });

    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email already exists (if changing email)
    if (data.email && data.email !== existing.email) {
      const existingEmail = await prisma.profile.findUnique({
        where: { email: data.email },
      });

      if (existingEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    const user = await prisma.profile.update({
      where: { id: idStr },
      data,
      include: {
        role: true,
        outlet: true,
      },
    });

    const { password_hash, ...sanitizedUser } = user as any;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /users/:id/password - Change password
router.patch('/:id/password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = await prisma.profile.findUnique({
      where: { id: idStr },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    await prisma.profile.update({
      where: { id: idStr },
      data: { password_hash },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /users/:id/status - Activate/deactivate user (admin only)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' });
    }

    const user = await prisma.profile.update({
      where: { id: idStr },
      data: { is_active },
      include: {
        role: true,
      },
    });

    const { password_hash, ...sanitizedUser } = user as any;
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /users/:id - Delete user (admin only)
router.delete('/:id', auditLogger('delete', 'user'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    // Check if user exists
    const existing = await prisma.profile.findUnique({
      where: { id: idStr },
      include: {
        role: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting system admin
    if (existing.username === 'admin') {
      return res.status(403).json({ error: 'Cannot delete system admin' });
    }

    await prisma.profile.delete({
      where: { id: idStr },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
