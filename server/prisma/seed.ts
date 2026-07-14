import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Seeding local PostgreSQL database...');

  // Default admin account (change password after first login)
  const adminExists = await prisma.profile.findUnique({ where: { username: 'admin' } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin', 10);
    await prisma.profile.create({
      data: {
        username: 'admin',
        role: 'admin',
        password_hash: passwordHash,
      },
    });
    console.log('✅ Created default admin user (username: admin, password: admin)');
  }

  // Seed categories if empty
  const existingCategories = await prisma.category.count();
  if (existingCategories === 0) {
    const categories = [
      { id: crypto.randomUUID(), name: 'Makanan Utama' },
      { id: crypto.randomUUID(), name: 'Minuman' },
      { id: crypto.randomUUID(), name: 'Dessert' },
    ];
    await prisma.category.createMany({ data: categories });
    console.log(`✅ Added ${categories.length} categories`);

    // Seed products
    const products = [
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Nasi Goreng Spesial',
        sku: 'NG-001',
        price: 25000,
        stock_quantity: 100,
        image_url: null,
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Mie Ayam Bakso',
        sku: 'MA-002',
        price: 20000,
        stock_quantity: 80,
        image_url: null,
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Ayam Bakar Madu',
        sku: 'AB-003',
        price: 35000,
        stock_quantity: 60,
        image_url: null,
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Es Teh Manis',
        sku: 'ET-004',
        price: 5000,
        stock_quantity: 200,
        image_url: null,
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Jus Jeruk Segar',
        sku: 'JJ-005',
        price: 12000,
        stock_quantity: 150,
        image_url: null,
      },
    ];
    await prisma.product.createMany({ data: products as any });
    console.log(`✅ Added ${products.length} products`);

    // Seed modifiers
    const modifiers = [
      { id: crypto.randomUUID(), product_id: products[0].id, name: 'Level Pedas', price_extra: 0 },
      { id: crypto.randomUUID(), product_id: products[0].id, name: 'Ekstra Telur', price_extra: 5000 },
      { id: crypto.randomUUID(), product_id: products[0].id, name: 'Ekstra Ayam', price_extra: 10000 },
      { id: crypto.randomUUID(), product_id: products[1].id, name: 'Pangsit Goreng', price_extra: 3000 },
      { id: crypto.randomUUID(), product_id: products[1].id, name: 'Bakso Extra', price_extra: 5000 },
      { id: crypto.randomUUID(), product_id: products[2].id, name: 'Sambal Extra', price_extra: 2000 },
      { id: crypto.randomUUID(), product_id: products[2].id, name: 'Nasi Extra', price_extra: 5000 },
      { id: crypto.randomUUID(), product_id: products[3].id, name: 'Less Sugar', price_extra: 0 },
      { id: crypto.randomUUID(), product_id: products[3].id, name: 'Lemon Slice', price_extra: 2000 },
      { id: crypto.randomUUID(), product_id: products[4].id, name: 'Less Ice', price_extra: 0 },
      { id: crypto.randomUUID(), product_id: products[4].id, name: 'Extra Orange', price_extra: 5000 },
    ];
    await prisma.modifier.createMany({ data: modifiers as any });
    console.log(`✅ Added ${modifiers.length} modifiers`);
  } else {
    console.log('ℹ️ Categories already exist, skipping product/modifier seeding');
  }

  console.log('🎉 Seeding complete');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
