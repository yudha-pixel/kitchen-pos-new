import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard category mapping based on ingredient names
const categoryMapping: Record<string, string> = {
  // Dairy
  'Susu Segar': 'Dairy',
  'Susu UHT': 'Dairy',
  'Susu Evaporasi': 'Dairy',
  'Susu Kental Manis': 'Dairy',
  'Keju Cheddar': 'Dairy',
  'Keju Mozzarella': 'Dairy',
  'Keju Parmesan': 'Dairy',
  'Cream Cheese': 'Dairy',
  'Mentega Butter': 'Dairy',
  'Whipped Cream': 'Dairy',

  // Produce
  'Bawang Merah': 'Produce',
  'Bawang Putih': 'Produce',
  'Tomat': 'Produce',
  'Sayur Bayam': 'Produce',
  'Cabai': 'Produce',
  'Kol / Sayuran': 'Produce',
  'Selada Romaine': 'Produce',
  'Wortel': 'Produce',
  'Pisang': 'Produce',
  'Buah Jeruk Segar': 'Produce',
  'Blueberry': 'Produce',

  // Protein
  'Ayam Potong': 'Protein',
  'Dada Ayam': 'Protein',
  'Daging Sapi': 'Protein',
  'Telur': 'Protein',
  'Telur Ayam': 'Protein',
  'Fillet Ikan Dori': 'Protein',

  // Beverage
  'Kopi Bubuk': 'Beverage',
  'Teh Earl Grey': 'Beverage',
  'Teh Thailand': 'Beverage',
  'Daun Teh Melati': 'Beverage',
  'Bubuk Chai': 'Beverage',
  'Bubuk Matcha': 'Beverage',
  'Air Mineral': 'Beverage',
  'Air Kelapa Murni': 'Beverage',
  'Air Tonic': 'Beverage',
  'Es Batu': 'Beverage',
  'Perasan Lemon': 'Beverage',
  'Sirup Karamel': 'Beverage',
  'Gas Nitrogen': 'Beverage',

  // Dry Goods
  'Tepung Terigu': 'Dry Goods',
  'Gula Pasir': 'Dry Goods',
  'Minyak Goreng': 'Dry Goods',
  'Cokelat Bubuk': 'Dry Goods',
  'Coklat Bubuk': 'Dry Goods',
  'Kacang Almond': 'Dry Goods',
  'Kacang Tanah': 'Dry Goods',
  'Kayu Manis Bubuk': 'Dry Goods',
  'Kecap Manis': 'Dry Goods',
  'Pasta Spaghetti': 'Dry Goods',
  'Pewarna Makanan Merah': 'Dry Goods',
  'Ragi': 'Dry Goods',
  'Biskuit Regal': 'Dry Goods',

  // Bakery & Pastry
  'Adonan Croissant': 'Bakery',
  'Roti Tawar': 'Bakery',

  // Frozen Food
  'Kentang Beku': 'Frozen',
  'Vanilla Ice Cream': 'Frozen',

  // Sauces
  'Dressing Caesar': 'Sauces',
};

async function standardizeCategories() {
  console.log('=== STANDARDIZING INGREDIENT CATEGORIES ===\n');

  // Get all categories
  const categories = await prisma.ingredientCategory.findMany();
  const categoryMap = new Map(categories.map(c => [c.name, c.id]));

  console.log('Available categories:');
  categories.forEach(c => console.log(`  - ${c.name} (ID: ${c.id})`));
  console.log('');

  // Get all ingredients
  const ingredients = await prisma.ingredient.findMany();

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const ingredient of ingredients) {
    const targetCategory = categoryMapping[ingredient.name];

    if (!targetCategory) {
      console.log(`⚠️  No mapping found for: ${ingredient.name}`);
      notFound++;
      continue;
    }

    const categoryId = categoryMap.get(targetCategory);

    if (!categoryId) {
      console.log(`❌ Category "${targetCategory}" not found in database for: ${ingredient.name}`);
      skipped++;
      continue;
    }

    // Check if already has the correct category
    if (ingredient.category_id === categoryId) {
      console.log(`✓ Already correct: ${ingredient.name} -> ${targetCategory}`);
      skipped++;
      continue;
    }

    // Update the ingredient
    await prisma.ingredient.update({
      where: { id: ingredient.id },
      data: { category_id: categoryId }
    });

    console.log(`✅ Updated: ${ingredient.name} -> ${targetCategory}`);
    updated++;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already correct): ${skipped}`);
  console.log(`No mapping found: ${notFound}`);
  console.log(`Total processed: ${ingredients.length}`);
}

async function verifyCategories() {
  console.log('\n=== VERIFYING CATEGORIES ===\n');

  const ingredients = await prisma.ingredient.findMany({
    include: {
      category: true
    },
    orderBy: { name: 'asc' }
  });

  const byCategory: Record<string, string[]> = {};

  ingredients.forEach(ing => {
    const catName = ing.category?.name || 'Uncategorized';
    if (!byCategory[catName]) {
      byCategory[catName] = [];
    }
    byCategory[catName].push(ing.name);
  });

  Object.keys(byCategory).sort().forEach(catName => {
    console.log(`${catName} (${byCategory[catName].length}):`);
    byCategory[catName].forEach(name => {
      console.log(`  - ${name}`);
    });
    console.log('');
  });

  const uncategorized = byCategory['Uncategorized'] || [];
  if (uncategorized.length > 0) {
    console.log(`⚠️  ${uncategorized.length} ingredients are still uncategorized`);
  } else {
    console.log('✅ All ingredients have been categorized');
  }
}

async function main() {
  try {
    await standardizeCategories();
    await verifyCategories();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
