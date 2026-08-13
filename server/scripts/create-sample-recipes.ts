import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample recipe mapping - connects products to ingredients
// Based on actual products in the database
const sampleRecipes = [
  // Coffee drinks
  { productName: 'Espresso', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
  ]},
  { productName: 'Americano', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
  ]},
  { productName: 'Cappuccino', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
  ]},
  { productName: 'Iced Cappuccino', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Caffe Latte', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.2, unit: 'liter' },
  ]},
  { productName: 'Iced Latte', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.2, unit: 'liter' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Flat White', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
  ]},
  { productName: 'Iced Flat White', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Mocha', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
    { ingredientName: 'Cokelat Bubuk', quantity: 0.01, unit: 'kg' },
  ]},
  { productName: 'Iced Mocha', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
    { ingredientName: 'Cokelat Bubuk', quantity: 0.01, unit: 'kg' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Caramel Macchiato', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.1, unit: 'liter' },
    { ingredientName: 'Sirup Karamel', quantity: 0.02, unit: 'liter' },
  ]},
  { productName: 'Iced Caramel Macchiato', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.1, unit: 'liter' },
    { ingredientName: 'Sirup Karamel', quantity: 0.02, unit: 'liter' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Cold Brew', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.025, unit: 'kg' },
  ]},
  { productName: 'Nitro Cold Brew', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.025, unit: 'kg' },
    { ingredientName: 'Gas Nitrogen', quantity: 0.01, unit: 'tabung' },
  ]},
  { productName: 'Iced Americano', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Iced Espresso Tonic', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Air Tonic', quantity: 0.15, unit: 'liter' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Hot Chocolate', ingredients: [
    { ingredientName: 'Cokelat Bubuk', quantity: 0.03, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.2, unit: 'liter' },
  ]},
  { productName: 'Affogato', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Vanilla Ice Cream', quantity: 0.1, unit: 'liter' },
  ]},
  { productName: 'Irish Coffee', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Whipped Cream', quantity: 0.02, unit: 'liter' },
  ]},
  { productName: 'Vienna Coffee', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.018, unit: 'kg' },
    { ingredientName: 'Whipped Cream', quantity: 0.03, unit: 'liter' },
  ]},
  { productName: 'Vietnamese Iced Coffee', ingredients: [
    { ingredientName: 'Kopi Bubuk', quantity: 0.02, unit: 'kg' },
    { ingredientName: 'Susu Kental Manis', quantity: 0.05, unit: 'kaleng' },
  ]},
  
  // Tea drinks
  { productName: 'Earl Grey Tea', ingredients: [
    { ingredientName: 'Teh Earl Grey', quantity: 0.005, unit: 'kg' },
  ]},
  { productName: 'Jasmine Tea', ingredients: [
    { ingredientName: 'Daun Teh Melati', quantity: 0.005, unit: 'kg' },
  ]},
  { productName: 'Chai Latte', ingredients: [
    { ingredientName: 'Bubuk Chai', quantity: 0.01, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
  ]},
  { productName: 'Iced Chai Latte', ingredients: [
    { ingredientName: 'Bubuk Chai', quantity: 0.01, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Matcha Latte', ingredients: [
    { ingredientName: 'Bubuk Matcha', quantity: 0.01, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
  ]},
  { productName: 'Iced Matcha Latte', ingredients: [
    { ingredientName: 'Bubuk Matcha', quantity: 0.01, unit: 'kg' },
    { ingredientName: 'Susu UHT', quantity: 0.15, unit: 'liter' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Es Teh Manis', ingredients: [
    { ingredientName: 'Teh Earl Grey', quantity: 0.005, unit: 'kg' },
    { ingredientName: 'Gula Pasir', quantity: 0.02, unit: 'kg' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Thai Milk Tea', ingredients: [
    { ingredientName: 'Teh Thailand', quantity: 0.01, unit: 'liter' },
    { ingredientName: 'Susu Kental Manis', quantity: 0.03, unit: 'kaleng' },
  ]},
  { productName: 'Iced Lemon Tea', ingredients: [
    { ingredientName: 'Teh Earl Grey', quantity: 0.005, unit: 'kg' },
    { ingredientName: 'Perasan Lemon', quantity: 0.02, unit: 'liter' },
    { ingredientName: 'Gula Pasir', quantity: 0.02, unit: 'kg' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Iced Peach Tea', ingredients: [
    { ingredientName: 'Teh Earl Grey', quantity: 0.005, unit: 'kg' },
    { ingredientName: 'Gula Pasir', quantity: 0.02, unit: 'kg' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Lemonade', ingredients: [
    { ingredientName: 'Perasan Lemon', quantity: 0.05, unit: 'liter' },
    { ingredientName: 'Gula Pasir', quantity: 0.02, unit: 'kg' },
    { ingredientName: 'Es Batu', quantity: 0.1, unit: 'kg' },
  ]},
  { productName: 'Coconut Water', ingredients: [
    { ingredientName: 'Air Kelapa Murni', quantity: 0.3, unit: 'liter' },
  ]},
  { productName: 'Jus Jeruk Segar', ingredients: [
    { ingredientName: 'Buah Jeruk Segar', quantity: 0.2, unit: 'kg' },
  ]},
  
  // Food items
  { productName: 'Nasi Goreng Spesial', ingredients: [
    { ingredientName: 'Minyak Goreng', quantity: 0.03, unit: 'liter' },
    { ingredientName: 'Bawang Merah', quantity: 0.02, unit: 'kg' },
    { ingredientName: 'Bawang Putih', quantity: 0.01, unit: 'kg' },
    { ingredientName: 'Telur', quantity: 1, unit: 'butir' },
  ]},
  { productName: 'Mie Goreng Jawa', ingredients: [
    { ingredientName: 'Minyak Goreng', quantity: 0.03, unit: 'liter' },
    { ingredientName: 'Bawang Merah', quantity: 0.02, unit: 'kg' },
    { ingredientName: 'Bawang Putih', quantity: 0.01, unit: 'kg' },
  ]},
  { productName: 'Ayam Bakar', ingredients: [
    { ingredientName: 'Ayam Potong', quantity: 0.2, unit: 'kg' },
    { ingredientName: 'Kecap Manis', quantity: 0.02, unit: 'liter' },
  ]},
  { productName: 'Sate Ayam', ingredients: [
    { ingredientName: 'Ayam Potong', quantity: 0.15, unit: 'kg' },
    { ingredientName: 'Kecap Manis', quantity: 0.02, unit: 'liter' },
  ]},
  { productName: 'Burger Cheese', ingredients: [
    { ingredientName: 'Daging Sapi', quantity: 0.15, unit: 'kg' },
    { ingredientName: 'Keju Cheddar', quantity: 0.02, unit: 'kg' },
  ]},
  { productName: 'Chicken Sandwich', ingredients: [
    { ingredientName: 'Ayam Potong', quantity: 0.1, unit: 'kg' },
    { ingredientName: 'Roti Tawar', quantity: 0.1, unit: 'pack' },
  ]},
  { productName: 'Fish and Chips', ingredients: [
    { ingredientName: 'Fillet Ikan Dori', quantity: 0.15, unit: 'kg' },
    { ingredientName: 'Minyak Goreng', quantity: 0.05, unit: 'liter' },
  ]},
  { productName: 'Beef Lasagna', ingredients: [
    { ingredientName: 'Daging Sapi', quantity: 0.1, unit: 'kg' },
    { ingredientName: 'Keju Mozzarella', quantity: 0.03, unit: 'kg' },
  ]},
  { productName: 'Spaghetti Carbonara', ingredients: [
    { ingredientName: 'Pasta Spaghetti', quantity: 0.1, unit: 'kg' },
    { ingredientName: 'Krim', quantity: 0.05, unit: 'liter' },
  ]},
  { productName: 'Caesar Salad', ingredients: [
    { ingredientName: 'Selada Romaine', quantity: 0.1, unit: 'kg' },
    { ingredientName: 'Dressing Caesar', quantity: 0.03, unit: 'liter' },
  ]},
  
  // Bakery items
  { productName: 'Croissant Butter', ingredients: [
    { ingredientName: 'Adonan Croissant', quantity: 0.08, unit: 'kg' },
    { ingredientName: 'Mentega Butter', quantity: 0.01, unit: 'kg' },
  ]},
  { productName: 'Croissant Almond', ingredients: [
    { ingredientName: 'Adonan Croissant', quantity: 0.08, unit: 'kg' },
    { ingredientName: 'Mentega Butter', quantity: 0.01, unit: 'kg' },
    { ingredientName: 'Kacang Almond', quantity: 0.01, unit: 'kg' },
  ]},
  { productName: 'Blueberry Muffin', ingredients: [
    { ingredientName: 'Blueberry', quantity: 0.05, unit: 'kg' },
  ]},
  { productName: 'Chocolate Muffin', ingredients: [
    { ingredientName: 'Cokelat Bubuk', quantity: 0.02, unit: 'kg' },
  ]},
  { productName: 'Banana Bread', ingredients: [
    { ingredientName: 'Pisang', quantity: 0.1, unit: 'sisir' },
  ]},
  { productName: 'Brownie', ingredients: [
    { ingredientName: 'Cokelat Bubuk', quantity: 0.03, unit: 'kg' },
  ]},
  { productName: 'Cheesecake Slice', ingredients: [
    { ingredientName: 'Cream Cheese', quantity: 0.05, unit: 'kg' },
  ]},
  { productName: 'Carrot Cake', ingredients: [
    { ingredientName: 'Wortel', quantity: 0.05, unit: 'kg' },
  ]},
  { productName: 'Cinnamon Roll', ingredients: [
    { ingredientName: 'Kayu Manis Bubuk', quantity: 0.005, unit: 'kg' },
  ]},
  { productName: 'Red Velvet Cake', ingredients: [
    { ingredientName: 'Pewarna Makanan Merah', quantity: 0.005, unit: 'liter' },
  ]},
];

async function createSampleRecipes() {
  console.log('=== CREATING SAMPLE RECIPE MAPPINGS ===\n');

  // Get all products and ingredients
  const products = await prisma.product.findMany({
    select: { id: true, name: true }
  });

  const ingredients = await prisma.ingredient.findMany({
    select: { id: true, name: true, unit: true }
  });

  // Create maps for easy lookup
  const productMap = new Map(products.map(p => [p.name, p.id]));
  const ingredientMap = new Map(ingredients.map(i => [i.name, i.id]));

  let createdCount = 0;
  let skippedCount = 0;
  let notFoundCount = 0;

  for (const recipe of sampleRecipes) {
    const productId = productMap.get(recipe.productName);
    
    if (!productId) {
      console.log(`⚠️  Product not found: ${recipe.productName}`);
      notFoundCount++;
      continue;
    }

    for (const ingredient of recipe.ingredients) {
      const ingredientId = ingredientMap.get(ingredient.ingredientName);
      
      if (!ingredientId) {
        console.log(`⚠️  Ingredient not found: ${ingredient.ingredientName}`);
        notFoundCount++;
        continue;
      }

      // Check if recipe already exists
      const existing = await prisma.recipe.findFirst({
        where: {
          menu_item_id: productId,
          ingredient_id: ingredientId
        }
      });

      if (existing) {
        console.log(`✓ Recipe exists: ${recipe.productName} -> ${ingredient.ingredientName}`);
        skippedCount++;
        continue;
      }

      // Create recipe
      await prisma.recipe.create({
        data: {
          menu_item_id: productId,
          ingredient_id: ingredientId,
          quantity_required: ingredient.quantity,
          unit: ingredient.unit
        }
      });

      console.log(`✅ Created: ${recipe.productName} -> ${ingredient.ingredientName} (${ingredient.quantity} ${ingredient.unit})`);
      createdCount++;
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Created: ${createdCount}`);
  console.log(`Skipped (already exists): ${skippedCount}`);
  console.log(`Not found: ${notFoundCount}`);
  console.log(`Total recipes in database: ${await prisma.recipe.count()}`);
}

async function main() {
  try {
    await createSampleRecipes();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
