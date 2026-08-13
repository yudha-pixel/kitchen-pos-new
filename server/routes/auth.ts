import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authMiddleware, getJwtSecret } from '../middleware/auth';
import { loadRolePermissions } from '../middleware/permissions';
import { PERMISSIONS } from '../../src/config/permissions';
import { requirePermission } from '../middleware/permissions';
import { loginSchema, registerSchema } from '../lib/validation';
import { serializeAuthenticatedUser } from '../lib/authenticatedUser';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = loginSchema.parse(req.body);

  const user = await prisma.profile.findUnique({ 
    where: { username },
    include: { role: true }
  });
  if (!user || !user.is_active) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role.name, role_id: user.role_id },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  const permissions = await loadRolePermissions(user.role_id);

  const authenticatedUser = serializeAuthenticatedUser(user, permissions);

  res.json({
    token,
    user: authenticatedUser,
    permissions,
  });
});

router.post(
  '/register',
  authMiddleware,
  requirePermission(PERMISSIONS.users.create),
  async (req: Request, res: Response) => {
    const { username, password, role = 'cashier' } = registerSchema.parse(req.body);

    const existing = await prisma.profile.findUnique({ where: { username } });
    if (existing) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    // Get role ID from role name
    const roleRecord = await prisma.role.findUnique({
      where: { name: role },
    });

    if (!roleRecord) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.profile.create({
      data: { username, full_name: username, password_hash, role_id: roleRecord.id },
      include: { role: true }
    });

    res.json({ id: user.id, username: user.username, role: user.role?.name });
  }
);

router.get('/permissions', authMiddleware, (req: Request, res: Response) => {
  res.json(req.userPermissions ?? []);
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const user = await prisma.profile.findUnique({
    where: { id: req.user!.id },
    include: { role: true }
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const permissions = await loadRolePermissions(user.role_id);
  res.json(serializeAuthenticatedUser(user, permissions));
});

export default router;
