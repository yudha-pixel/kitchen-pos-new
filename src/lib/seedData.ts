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
      { id: crypto.randomUUID(), name: 'Kopi', created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Teh', created_at: new Date().toISOString() },
      { id: crypto.randomUUID(), name: 'Bakery', created_at: new Date().toISOString() },
    ];
    await db.categories.bulkAdd(categories);
    console.log(`✅ Added ${categories.length} categories`);

    // Seed Products
    console.log('🍽️ Seeding products...');
    const products = [
      // Makanan Utama
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Nasi Goreng Spesial',
        sku: 'NG-001',
        price: 25000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Mie Goreng',
        sku: 'MG-002',
        price: 22000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Mie Goreng Jawa',
        sku: 'MGJ-003',
        price: 24000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Ayam Bakar',
        sku: 'AB-004',
        price: 35000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Beef Lasagna',
        sku: 'BL-005',
        price: 45000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Burger Cheese',
        sku: 'BC-006',
        price: 30000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Caesar Salad',
        sku: 'CS-007',
        price: 32000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Chicken Sandwich',
        sku: 'CHS-008',
        price: 28000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Fish and Chips',
        sku: 'FC-009',
        price: 38000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Sate Ayam',
        sku: 'SA-010',
        price: 30000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[0].id,
        name: 'Spaghetti Carbonara',
        sku: 'SC-011',
        price: 42000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      // Minuman
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Es Teh Manis',
        sku: 'ETM-012',
        price: 5000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Jus Jeruk Segar',
        sku: 'JJS-013',
        price: 12000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Hot Chocolate',
        sku: 'HC-014',
        price: 22000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Thai Milk Tea',
        sku: 'TMT-015',
        price: 25000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      // Dessert
      {
        id: crypto.randomUUID(),
        category_id: categories[2].id,
        name: 'Banana Bread',
        sku: 'BB-016',
        price: 18000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[2].id,
        name: 'Blueberry Muffin',
        sku: 'BM-017',
        price: 15000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[2].id,
        name: 'Brownie',
        sku: 'BR-018',
        price: 12000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[2].id,
        name: 'Carrot Cake',
        sku: 'CC-019',
        price: 20000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[2].id,
        name: 'Cheesecake Slice',
        sku: 'CSL-020',
        price: 25000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[2].id,
        name: 'Chocolate Muffin',
        sku: 'CM-021',
        price: 15000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[2].id,
        name: 'Cinnamon Roll',
        sku: 'CR-022',
        price: 18000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[2].id,
        name: 'Red Velvet Cake',
        sku: 'RVC-023',
        price: 28000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      // Kopi
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Affogato',
        sku: 'AF-024',
        price: 28000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Americano',
        sku: 'AM-025',
        price: 20000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Caffe Latte',
        sku: 'CL-026',
        price: 28000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Cappuccino',
        sku: 'CP-027',
        price: 25000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Caramel Macchiato',
        sku: 'CM-028',
        price: 30000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Cold Brew',
        sku: 'CB-029',
        price: 25000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Espresso',
        sku: 'ES-030',
        price: 18000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Flat White',
        sku: 'FW-031',
        price: 26000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Iced Americano',
        sku: 'IAM-032',
        price: 22000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Iced Cappuccino',
        sku: 'ICP-033',
        price: 27000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Iced Caramel Macchiato',
        sku: 'ICM-034',
        price: 32000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Iced Flat White',
        sku: 'IFW-035',
        price: 28000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Iced Latte',
        sku: 'IL-036',
        price: 30000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Iced Mocha',
        sku: 'IM-037',
        price: 32000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Irish Coffee',
        sku: 'IRC-038',
        price: 45000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Latte',
        sku: 'LT-039',
        price: 28000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Mocha',
        sku: 'MC-040',
        price: 30000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Nitro Cold Brew',
        sku: 'NCB-041',
        price: 30000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Vienna Coffee',
        sku: 'VC-042',
        price: 32000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Vietnamese Iced Coffee',
        sku: 'VIC-043',
        price: 28000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      // Teh
      {
        id: crypto.randomUUID(),
        category_id: categories[4].id,
        name: 'Chai Latte',
        sku: 'CHL-044',
        price: 25000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[4].id,
        name: 'Earl Grey Tea',
        sku: 'EGT-045',
        price: 18000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[4].id,
        name: 'Iced Chai Latte',
        sku: 'ICL-046',
        price: 27000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[4].id,
        name: 'Iced Lemon Tea',
        sku: 'ILT-047',
        price: 20000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[4].id,
        name: 'Iced Peach Tea',
        sku: 'IPT-048',
        price: 22000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[4].id,
        name: 'Jasmine Tea',
        sku: 'JT-049',
        price: 15000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      // Bakery
      {
        id: crypto.randomUUID(),
        category_id: categories[5].id,
        name: 'Croissant Almond',
        sku: 'CA-050',
        price: 22000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[5].id,
        name: 'Croissant Butter',
        sku: 'CB-051',
        price: 18000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      // Additional drinks
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Iced Matcha Latte',
        sku: 'IML-052',
        price: 30000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[1].id,
        name: 'Iced Espresso Tonic',
        sku: 'IET-053',
        price: 28000,
        stock_quantity: 10,
        image_url: null,
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        category_id: categories[3].id,
        name: 'Matcha Latte',
        sku: 'ML-054',
        price: 30000,
        stock_quantity: 10,
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
