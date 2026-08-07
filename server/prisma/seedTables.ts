import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding tables...');

  // Create sample tables
  const tables = [
    { table_number: 'Meja 1', is_active: true },
    { table_number: 'Meja 2', is_active: true },
    { table_number: 'Meja 3', is_active: true },
    { table_number: 'Meja 4', is_active: true },
    { table_number: 'Meja 5', is_active: true },
    { table_number: 'Meja 6', is_active: true },
    { table_number: 'Meja 7', is_active: true },
    { table_number: 'Meja 8', is_active: true },
    { table_number: 'Meja 9', is_active: true },
    { table_number: 'Meja 10', is_active: true },
    { table_number: 'Meja 11', is_active: true },
    { table_number: 'Meja 12', is_active: true },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: { table_number: table.table_number },
      update: {},
      create: table,
    });
  }

  console.log('Tables seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
