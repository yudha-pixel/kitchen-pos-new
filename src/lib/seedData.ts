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

    // Seed Ingredients
    console.log('📦 Seeding ingredients...');
    const ingredients = [
      {
        id: crypto.randomUUID(),
        name: 'Beras',
        current_stock: 2.0, // 10 portions × 0.2 kg = 2 kg
        unit: 'kg',
        min_stock: 2.0, // Minimum for 10 portions
        unit_price: 15000, // Rp 15.000 per kg
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Daging Ayam',
        current_stock: 1.0, // 10 portions × 0.1 kg = 1 kg
        unit: 'kg',
        min_stock: 1.0, // Minimum for 10 portions
        unit_price: 45000, // Rp 45.000 per kg
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Minyak Goreng',
        current_stock: 0.5, // 10 portions × 0.05 liter = 0.5 liter
        unit: 'liter',
        min_stock: 0.5, // Minimum for 10 portions
        unit_price: 20000, // Rp 20.000 per liter
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Bumbu Dasar',
        current_stock: 0.3, // 10 portions × 0.03 kg = 0.3 kg
        unit: 'kg',
        min_stock: 0.3, // Minimum for 10 portions
        unit_price: 25000, // Rp 25.000 per kg
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    await db.ingredients.bulkAdd(ingredients);
    console.log(`✅ Added ${ingredients.length} ingredients`);

    // Seed Recipes (BOM) - Per portion ratios
    console.log('📋 Seeding recipes (BOM)...');
    const recipes = [
      // Nasi Goreng Spesial (products[0])
      {
        id: crypto.randomUUID(),
        menu_item_id: products[0].id,
        ingredient_id: ingredients[0].id, // Beras
        quantity_required: 0.2, // 0.2 kg per portion
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        menu_item_id: products[0].id,
        ingredient_id: ingredients[1].id, // Daging Ayam
        quantity_required: 0.1, // 0.1 kg per portion
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        menu_item_id: products[0].id,
        ingredient_id: ingredients[2].id, // Minyak Goreng
        quantity_required: 0.05, // 0.05 liter per portion
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        menu_item_id: products[0].id,
        ingredient_id: ingredients[3].id, // Bumbu Dasar
        quantity_required: 0.03, // 0.03 kg per portion
        created_at: new Date().toISOString(),
      },
      // Mie Ayam Bakso (products[1])
      {
        id: crypto.randomUUID(),
        menu_item_id: products[1].id,
        ingredient_id: ingredients[1].id, // Daging Ayam
        quantity_required: 0.1, // 0.1 kg per portion
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        menu_item_id: products[1].id,
        ingredient_id: ingredients[2].id, // Minyak Goreng
        quantity_required: 0.05, // 0.05 liter per portion
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        menu_item_id: products[1].id,
        ingredient_id: ingredients[3].id, // Bumbu Dasar
        quantity_required: 0.03, // 0.03 kg per portion
        created_at: new Date().toISOString(),
      },
      // Ayam Bakar Madu (products[2])
      {
        id: crypto.randomUUID(),
        menu_item_id: products[2].id,
        ingredient_id: ingredients[1].id, // Daging Ayam
        quantity_required: 0.15, // 0.15 kg per portion (more chicken)
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        menu_item_id: products[2].id,
        ingredient_id: ingredients[2].id, // Minyak Goreng
        quantity_required: 0.05, // 0.05 liter per portion
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        menu_item_id: products[2].id,
        ingredient_id: ingredients[3].id, // Bumbu Dasar
        quantity_required: 0.04, // 0.04 kg per portion (more seasoning)
        created_at: new Date().toISOString(),
      },
    ];
    await db.recipes.bulkAdd(recipes);
    console.log(`✅ Added ${recipes.length} recipes (BOM)`);

    console.log('🎉 Dummy data seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Modifiers: ${modifiers.length}`);
    console.log(`   - Ingredients: ${ingredients.length}`);
    console.log(`   - Recipes (BOM): ${recipes.length}`);
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
    await db.ingredients.clear();
    await db.recipes.clear();
    console.log('✅ Dummy data cleared');
  } catch (error) {
    console.error('❌ Error clearing dummy data:', error);
    throw error;
  }
};
