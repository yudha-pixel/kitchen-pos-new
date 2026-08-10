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
  role: 'admin' | 'cashier' | 'management' | 'owner';
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
    req.user = decoded;

    let roleId = decoded.role_id;
    if (!roleId) {
      const profile = await prisma.profile.findUnique({
        where: { id: decoded.id },
        select: { role_id: true },
      });
      roleId = profile?.role_id;
    }

    if (roleId) {
      req.userPermissions = await loadRolePermissions(roleId);
    } else {
      req.userPermissions = [];
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: ('admin' | 'cashier' | 'management' | 'owner')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
};
