import type { PrismaClient } from '@prisma/client';

import {
  ALL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  type PermissionName,
} from '../../src/config/permissions';
import { clearRolePermissionsCache } from '../middleware/permissions';

const SYSTEM_ROLE_NAMES = ['admin', 'owner', 'management', 'cashier'] as const;
type SystemRoleName = (typeof SYSTEM_ROLE_NAMES)[number];

interface BackfillState {
  permissions: string[];
  roles: Record<string, string[]>;
}

interface AssignmentChange {
  role: SystemRoleName;
  permission: string;
}

export interface PermissionBackfillPlan {
  permissionsToCreate: PermissionName[];
  assignmentsToCreate: AssignmentChange[];
  assignmentsToDelete: AssignmentChange[];
}

export function buildPermissionBackfillPlan(state: BackfillState): PermissionBackfillPlan {
  const existingPermissions = new Set(state.permissions);
  const catalogPermissions = new Set<string>(ALL_PERMISSIONS);
  const permissionsToCreate = ALL_PERMISSIONS.filter((permission) => !existingPermissions.has(permission));
  const assignmentsToCreate: AssignmentChange[] = [];
  const assignmentsToDelete: AssignmentChange[] = [];

  for (const role of SYSTEM_ROLE_NAMES) {
    const current = new Set(state.roles[role] ?? []);
    const desired = new Set<string>(DEFAULT_ROLE_PERMISSIONS[role]);

    for (const permission of desired) {
      if (!current.has(permission)) assignmentsToCreate.push({ role, permission });
    }

    for (const permission of current) {
      if (catalogPermissions.has(permission) && !desired.has(permission)) {
        assignmentsToDelete.push({ role, permission });
      }
    }
  }

  return { permissionsToCreate, assignmentsToCreate, assignmentsToDelete };
}

export async function synchronizePermissionCatalog(
  prisma: PrismaClient,
  options: { dryRun: boolean },
): Promise<PermissionBackfillPlan> {
  const [permissions, roles] = await Promise.all([
    prisma.permission.findMany({ select: { name: true } }),
    prisma.role.findMany({
      where: { name: { in: [...SYSTEM_ROLE_NAMES] } },
      include: { permissions: { include: { permission: { select: { name: true } } } } },
    }),
  ]);

  const state: BackfillState = {
    permissions: permissions.map(({ name }) => name),
    roles: Object.fromEntries(
      roles.map((role) => [role.name, role.permissions.map(({ permission }) => permission.name)]),
    ),
  };
  const plan = buildPermissionBackfillPlan(state);
  if (options.dryRun) return plan;

  await prisma.$transaction(async (transaction) => {
    for (const permission of ALL_PERMISSIONS) {
      const [module, action] = permission.split('.');
      await transaction.permission.upsert({
        where: { module_action: { module, action } },
        update: { name: permission },
        create: { name: permission, module, action, description: `${action} ${module}` },
      });
    }

    const persistedRoles = await transaction.role.findMany({
      where: { name: { in: [...SYSTEM_ROLE_NAMES] } },
      select: { id: true, name: true },
    });
    const persistedPermissions = await transaction.permission.findMany({
      where: { name: { in: [...ALL_PERMISSIONS] } },
      select: { id: true, name: true },
    });
    const roleIds = new Map(persistedRoles.map((role) => [role.name, role.id]));
    const permissionIds = new Map(persistedPermissions.map((permission) => [permission.name, permission.id]));

    for (const { role, permission } of plan.assignmentsToCreate) {
      const roleId = roleIds.get(role);
      const permissionId = permissionIds.get(permission);
      if (!roleId || !permissionId) continue;
      await transaction.rolePermission.upsert({
        where: { role_id_permission_id: { role_id: roleId, permission_id: permissionId } },
        update: {},
        create: { role_id: roleId, permission_id: permissionId },
      });
    }

    for (const { role, permission } of plan.assignmentsToDelete) {
      const roleId = roleIds.get(role);
      const permissionId = permissionIds.get(permission);
      if (!roleId || !permissionId) continue;
      await transaction.rolePermission.deleteMany({ where: { role_id: roleId, permission_id: permissionId } });
    }
  });

  for (const role of roles) clearRolePermissionsCache(role.id);
  return plan;
}
