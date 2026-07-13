import { db } from './db';

export const seedDummyData = async () => {
  try {
    console.log('🌱 Starting dummy data seeding...');

    // Check if data already exists
    const existingProducts = await db.products.count();
    if (existingProducts > 0) {
      console.log('✅ Data already exists, skipping seeding');
      return;
    }

    // Seed Categories
    console.log('📁 Seeding categories...');
    const categories = [
      { id: crypto.randomUUID(), name: 'Makanan Utama', created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Minuman', created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Dessert', created_at: new Date().toISOString() },
    ];
    await db.categories.bulkAdd(categories);
    console.log(`✅ Added ${categories.length} categories`);

    // Seed Products
    console.log('🍽️ Seeding products...');
    const products = [
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Nasi Goreng Spesial',
        sku: 'NG-001',
        price: 25000,
        stock_quantity: 100,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Mie Ayam Bakso',
        sku: 'MA-002',
        price: 20000,
        stock_quantity: 80,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Ayam Bakar Madu',
        sku: 'AB-003',
        price: 35000,
        stock_quantity: 60,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Es Teh Manis',
        sku: 'ET-004',
        price: 5000,
        stock_quantity: 200,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Jus Jeruk Segar',
        sku: 'JJ-005',
        price: 12000,
        stock_quantity: 150,
        image_url: null,
        created_at: new Date().toISOString(),
      },
    ];
    await db.products.bulkAdd(products);
    console.log(`✅ Added ${products.length} products`);

    // Seed Modifiers
    console.log('🔧 Seeding modifiers...');
    const modifiers = [
      // Modifiers for Nasi Goreng
      {
        id: crypto.randomUUID(),
        product_id: products[0].id,
        name: 'Level Pedas',
        price_extra: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        product_id: products[0].id,
        name: 'Ekstra Telur',
        price_extra: 5000,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        product_id: products[0].id,
        name: 'Ekstra Ayam',
        price_extra: 10000,
        created_at: new Date().toISOString(),
      },
      // Modifiers for Mie Ayam
      {
        id: crypto.randomUUID(),
        product_id: products[1].id,
        name: 'Pangsit Goreng',
        price_extra: 3000,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        product_id: products[1].id,
        name: 'Bakso Extra',
        price_extra: 5000,
        created_at: new Date().toISOString(),
      },
      // Modifiers for Ayam Bakar
      {
        id: crypto.randomUUID(),
        product_id: products[2].id,
        name: 'Sambal Extra',
        price_extra: 2000,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        product_id: products[2].id,
        name: 'Nasi Extra',
        price_extra: 5000,
        created_at: new Date().toISOString(),
      },
      // Modifiers for Es Teh
      {
        id: crypto.randomUUID(),
        product_id: products[3].id,
        name: 'Less Sugar',
        price_extra: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        product_id: products[3].id,
        name: 'Lemon Slice',
        price_extra: 2000,
        created_at: new Date().toISOString(),
      },
      // Modifiers for Jus Jeruk
      {
        id: crypto.randomUUID(),
        product_id: products[4].id,
        name: 'Less Ice',
        price_extra: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        product_id: products[4].id,
        name: 'Extra Orange',
        price_extra: 5000,
        created_at: new Date().toISOString(),
      },
    ];
    await db.modifiers.bulkAdd(modifiers);
    console.log(`✅ Added ${modifiers.length} modifiers`);

    console.log('🎉 Dummy data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Modifiers: ${modifiers.length}`);
  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    throw error;
  }
};

// Function to clear all dummy data (for testing)
export const clearDummyData = async () => {
  try {
    console.log('🧹 Clearing dummy data...');
    await db.products.clear();
    await db.categories.clear();
    await db.modifiers.clear();
    console.log('✅ Dummy data cleared');
  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
    throw error;
  }
};
