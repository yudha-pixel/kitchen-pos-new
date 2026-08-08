import { prisma } from '../server/lib/prisma';
import * as bcrypt from 'bcrypt';

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
      password_hash: hashedPassword,
      role_id: adminRole.id,
    },
  });

  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
