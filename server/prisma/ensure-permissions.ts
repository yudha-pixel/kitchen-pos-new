import { prisma } from '../lib/prisma';
import { synchronizePermissionCatalog } from '../lib/permissionBackfill';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const plan = await synchronizePermissionCatalog(prisma, { dryRun });
  console.log(JSON.stringify({ dryRun, ...plan }, null, 2));
}

main()
  .catch((error) => {
    console.error('Error ensuring permissions:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
