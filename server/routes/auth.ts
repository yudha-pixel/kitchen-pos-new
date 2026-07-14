import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, getJwtSecret } from '../middleware/auth';
import { loginSchema, registerSchema } from '../lib/validation';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = loginSchema.parse(req.body);

  const user = await prisma.profile.findUnique({ where: { username } });
  if (!user) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

router.post(
  '/register',
  authMiddleware,
  requireRole('admin'),
  async (req: Request, res: Response) => {
    const { username, password, role = 'cashier' } = registerSchema.parse(req.body);

    const existing = await prisma.profile.findUnique({ where: { username } });
    if (existing) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.profile.create({
      data: { username, password_hash, role },
    });

    res.json({ id: user.id, username: user.username, role: user.role });
  }
);

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  const user = await prisma.profile.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ id: user.id, username: user.username, role: user.role });
});

export default router;
