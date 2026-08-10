import { prisma } from '../lib/prisma';

const DEFAULT_MODULES: { module: string; actions: string[] }[] = [
  { module: 'users', actions: ['view', 'create', 'update', 'delete'] },
  { module: 'settings', actions: ['view', 'edit'] },
];

async function ensurePermission(module: string, action: string) {
  const name = `${module}.${action}`;
  return await prisma.permission.upsert({
    where: { module_action: { module, action } },
    update: {},
    create: {
      name,
      description: `${action} ${module}`,
      module,
      action,
    },
  });
}

async function assignToRole(roleName: string, permissionId: string) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    console.warn(`Role ${roleName} not found, skipping assignment`);
    return;
  }
  const existing = await prisma.rolePermission.findUnique({
    where: {
      role_id_permission_id: {
        role_id: role.id,
        permission_id: permissionId,
      },
    },
  });
  if (!existing) {
    await prisma.rolePermission.create({
      data: {
        role_id: role.id,
        permission_id: permissionId,
      },
    });
  }
}

async function main() {
  for (const mod of DEFAULT_MODULES) {
    for (const action of mod.actions) {
      const permission = await ensurePermission(mod.module, action);
      await assignToRole('admin', permission.id);
      await assignToRole('owner', permission.id);
    }
  }
  console.log('✅ Critical permissions ensured');
}

main()
  .catch((error) => {
    console.error('Error ensuring permissions:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
