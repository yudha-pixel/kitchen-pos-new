import { prisma } from '../server/lib/prisma';
import * as bcrypt from 'bcrypt';

const defaultPreferences = {
  favorites: ['/pos', '/admin/products', '/admin/settings'],
  recent: [
    { route: '/pos', title: 'Point of Sale', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
    { route: '/admin/products', title: 'Menu & Products', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  ],
};

async function main() {
  // Get admin role
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  if (!adminRole) {
    console.log('Admin role not found, skipping user creation');
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin', 10);

  const admin = await prisma.profile.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      full_name: 'System Administrator',
      password_hash: hashedPassword,
      role_id: adminRole.id,
    },
  });

  const preferencesJson = JSON.stringify(defaultPreferences);
  await prisma.$executeRaw`UPDATE "profiles" SET "preferences" = ${preferencesJson}::jsonb WHERE "username" = 'admin'`;

  console.log('Admin user seeded with preferences:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
