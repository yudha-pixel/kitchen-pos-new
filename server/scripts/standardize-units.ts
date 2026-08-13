import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard unit mapping based on ingredient names
const unitMapping: Record<string, string> = {
  // Dairy
  'Susu Segar': 'liter',
  'Susu UHT': 'liter',
  'Susu Evaporasi': 'liter',
  'Susu Kental Manis': 'kaleng',
  'Keju Cheddar': 'kg',
  'Keju Mozzarella': 'kg',
  'Keju Parmesan': 'kg',
  'Cream Cheese': 'kg',
  'Mentega Butter': 'kg',
  'Whipped Cream': 'liter',

  // Produce
  'Bawang Merah': 'kg',
  'Bawang Putih': 'kg',
  'Tomat': 'kg',
  'Sayur Bayam': 'kg',
  'Cabai': 'kg',
  'Kol / Sayuran': 'kg',
  'Selada Romaine': 'kg',
  'Wortel': 'kg',
  'Pisang': 'sisir',
  'Buah Jeruk Segar': 'kg',
  'Blueberry': 'kg',

  // Protein
  'Ayam Potong': 'kg',
  'Dada Ayam': 'kg',
  'Daging Sapi': 'kg',
  'Telur': 'butir',
  'Telur Ayam': 'kg',
  'Fillet Ikan Dori': 'kg',

  // Beverage
  'Kopi Bubuk': 'kg',
  'Teh Earl Grey': 'kg',
  'Teh Thailand': 'liter',
  'Daun Teh Melati': 'kg',
  'Bubuk Chai': 'kg',
  'Bubuk Matcha': 'kg',
  'Air Mineral': 'botol',
  'Air Kelapa Murni': 'liter',
  'Air Tonic': 'liter',
  'Es Batu': 'kg',
  'Perasan Lemon': 'liter',
  'Sirup Karamel': 'liter',
  'Gas Nitrogen': 'tabung',

  // Dry Goods
  'Tepung Terigu': 'kg',
  'Gula Pasir': 'kg',
  'Minyak Goreng': 'liter',
  'Cokelat Bubuk': 'kg',
  'Coklat Bubuk': 'kg',
  'Kacang Almond': 'kg',
  'Kacang Tanah': 'kg',
  'Kayu Manis Bubuk': 'kg',
  'Kecap Manis': 'liter',
  'Pasta Spaghetti': 'kg',
  'Pewarna Makanan Merah': 'liter',
  'Ragi': 'kg',
  'Biskuit Regal': 'pack',

  // Bakery & Pastry
  'Adonan Croissant': 'kg',
  'Roti Tawar': 'pack',

  // Frozen Food
  'Kentang Beku': 'kg',
  'Vanilla Ice Cream': 'liter',

  // Sauces
  'Dressing Caesar': 'liter',
};

async function standardizeUnits() {
  console.log('=== STANDARDIZING INGREDIENT UNITS ===\n');

  const ingredients = await prisma.ingredient.findMany();

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const ingredient of ingredients) {
    const targetUnit = unitMapping[ingredient.name];

    if (!targetUnit) {
      console.log(`⚠️  No mapping found for: ${ingredient.name} (current: ${ingredient.unit})`);
      notFound++;
      continue;
    }

    // Check if already has the correct unit
    if (ingredient.unit === targetUnit) {
      console.log(`✓ Already correct: ${ingredient.name} -> ${targetUnit}`);
      skipped++;
      continue;
    }

    // Update the ingredient
    await prisma.ingredient.update({
      where: { id: ingredient.id },
      data: { unit: targetUnit }
    });

    console.log(`✅ Updated: ${ingredient.name} -> ${targetUnit} (was: ${ingredient.unit})`);
    updated++;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already correct): ${skipped}`);
  console.log(`No mapping found: ${notFound}`);
  console.log(`Total processed: ${ingredients.length}`);
}

async function verifyUnits() {
  console.log('\n=== VERIFYING UNITS ===\n');

  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' }
  });

  const byUnit: Record<string, string[]> = {};

  ingredients.forEach(ing => {
    if (!byUnit[ing.unit]) {
      byUnit[ing.unit] = [];
    }
    byUnit[ing.unit].push(ing.name);
  });

  Object.keys(byUnit).sort().forEach(unit => {
    console.log(`${unit} (${byUnit[unit].length}):`);
    byUnit[unit].forEach(name => {
      console.log(`  - ${name}`);
    });
    console.log('');
  });

  // Check for numeric units (incorrect)
  const numericUnits = ingredients.filter(ing => !isNaN(parseFloat(ing.unit)));
  if (numericUnits.length > 0) {
    console.log(`⚠️  ${numericUnits.length} ingredients still have numeric units:`);
    numericUnits.forEach(ing => {
      console.log(`  - ${ing.name}: ${ing.unit}`);
    });
  } else {
    console.log('✅ All ingredients have proper text units');
  }
}

async function main() {
  try {
    await standardizeUnits();
    await verifyUnits();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
