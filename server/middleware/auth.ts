import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { loadRolePermissions } from './permissions';

// Read lazily (not at module load) so dotenv has run regardless of import order.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

export interface TokenPayload {
  id: string;
  username: string;
  role?: string;
  role_id?: string;
}

// Augment Express Request type to include user property
declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as TokenPayload;
    const profile = await prisma.profile.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        is_active: true,
        role_id: true,
        role: { select: { name: true } },
      },
    });

    if (!profile?.is_active) {
      res.status(401).json({ error: 'Invalid or inactive user' });
      return;
    }

    req.user = {
      id: profile.id,
      username: profile.username,
      role: profile.role.name,
      role_id: profile.role_id,
    };
    req.userPermissions = await loadRolePermissions(profile.role_id);

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
