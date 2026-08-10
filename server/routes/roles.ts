import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authMiddleware, requireRole } from '../middleware/auth';
import { clearRolePermissionsCache } from '../middleware/permissions';

const router = Router();

// Validation schemas
const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const updateRoleSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
});

const assignPermissionSchema = z.object({
  permission_id: z.string().uuid(),
});

// GET /roles - List all roles
router.get('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            profiles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /roles/:id - Get specific role with permissions
router.get('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    const role = await prisma.role.findUnique({
      where: { id: idStr },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        profiles: {
          select: {
            id: true,
            username: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /roles - Create new role (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const data = createRoleSchema.parse(req.body);

    // Check if role name already exists
    const existing = await prisma.role.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    const role = await prisma.role.create({
      data,
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /roles/:id - Update role (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const data = updateRoleSchema.parse(req.body);

    // Check if role exists
    const existing = await prisma.role.findUnique({
      where: { id: idStr },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent modifying system roles
    if (existing.is_system) {
      return res.status(403).json({ error: 'Cannot modify system roles' });
    }

    // Check if new name already exists
    if (data.name && data.name !== existing.name) {
      const nameExists = await prisma.role.findUnique({
        where: { name: data.name },
      });

      if (nameExists) {
        return res.status(400).json({ error: 'Role name already exists' });
      }
    }

    const role = await prisma.role.update({
      where: { id: idStr },
      data,
    });

    res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /roles/:id - Delete role (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;

    // Check if role exists
    const existing = await prisma.role.findUnique({
      where: { id: idStr },
      include: {
        _count: {
          select: {
            profiles: true,
          },
        },
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent deleting system roles
    if (existing.is_system) {
      return res.status(403).json({ error: 'Cannot delete system roles' });
    }

    // Prevent deleting roles with assigned users
    if (existing._count.profiles > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role with assigned users',
        userCount: existing._count.profiles 
      });
    }

    await prisma.role.delete({
      where: { id: idStr },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /roles/:id/permissions - Assign permission to role
router.post('/:id/permissions', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const { permission_id } = assignPermissionSchema.parse(req.body);

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: idStr },
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permission_id },
    });

    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    // Check if already assigned
    const existing = await prisma.rolePermission.findUnique({
      where: {
        role_id_permission_id: {
          role_id: idStr,
          permission_id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Permission already assigned to role' });
    }

    const rolePermission = await prisma.rolePermission.create({
      data: {
        role_id: idStr,
        permission_id,
      },
      include: {
        permission: true,
      },
    });

    clearRolePermissionsCache(idStr);
    res.status(201).json(rolePermission);
  } catch (error) {
    console.error('Error assigning permission:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /roles/:id/permissions/:permissionId - Remove permission from role
router.delete('/:id/permissions/:permissionId', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { id, permissionId } = req.params;
    const idStr = Array.isArray(id) ? id[0] : id;
    const permissionIdStr = Array.isArray(permissionId) ? permissionId[0] : permissionId;

    await prisma.rolePermission.deleteMany({
      where: {
        role_id: idStr,
        permission_id: permissionIdStr,
      },
    });

    clearRolePermissionsCache(idStr);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing permission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
