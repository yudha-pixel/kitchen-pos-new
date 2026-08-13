import { Request, Response, NextFunction } from 'express';
import LRU from 'lru-cache';
import { prisma } from '../lib/prisma';
import type { PermissionName } from '../../src/config/permissions';

interface PermissionCache {
  get(key: string): string[] | undefined;
  set(key: string, value: string[]): void;
  del(key: string): void;
  reset(): void;
}

const permissionCache = new (LRU as any)({
  max: 1000,
  maxAge: 60 * 1000,
  stale: false,
  updateAgeOnGet: true,
}) as PermissionCache;

function cacheKey(roleId: string): string {
  return `role_permissions:${roleId}`;
}

export async function loadRolePermissions(roleId: string): Promise<string[]> {
  const key = cacheKey(roleId);
  const cached = permissionCache.get(key);
  if (cached) {
    return cached;
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      permissions: {
        include: {
          permission: {
            select: { name: true },
          },
        },
      },
    },
  });

  const permissions = role?.permissions.map((rp) => rp.permission.name) ?? [];
  permissionCache.set(key, permissions);
  return permissions;
}

export function getCachedRolePermissions(roleId: string): string[] | undefined {
  return permissionCache.get(cacheKey(roleId));
}

export function clearRolePermissionsCache(roleId?: string): void {
  if (roleId) {
    permissionCache.del(cacheKey(roleId));
  } else {
    permissionCache.reset();
  }
}

declare module 'express' {
  interface Request {
    userPermissions?: string[];
  }
}

function logDenial(
  req: Request,
  required: string[],
  reason: 'unauthorized' | 'no_permissions' | 'missing_permissions'
): void {
  console.warn(
    JSON.stringify({
      type: 'permission_denial',
      reason,
      userId: req.user?.id,
      required,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    })
  );
}

function checkPermissions(
  req: Request,
  res: Response,
  next: NextFunction,
  required: string[],
  mode: 'all' | 'any'
): void {
  if (!req.user) {
    logDenial(req, required, 'unauthorized');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userPermissions = req.userPermissions ?? [];
  if (userPermissions.length === 0) {
    logDenial(req, required, 'no_permissions');
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  const has =
    mode === 'all'
      ? required.every((p) => userPermissions.includes(p))
      : required.some((p) => userPermissions.includes(p));

  if (!has) {
    logDenial(req, required, 'missing_permissions');
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  next();
}

export const requirePermission =
  (permission: PermissionName) =>
  (req: Request, res: Response, next: NextFunction): void => {
    checkPermissions(req, res, next, [permission], 'all');
  };

export const requireAnyPermission =
  (...permissions: PermissionName[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    checkPermissions(req, res, next, permissions, 'any');
  };

export const requireAllPermissions =
  (...permissions: PermissionName[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    checkPermissions(req, res, next, permissions, 'all');
  };
