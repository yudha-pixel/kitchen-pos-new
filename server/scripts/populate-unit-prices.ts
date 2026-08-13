import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Reasonable unit price mapping based on typical market prices (in IDR)
const priceMapping: Record<string, number> = {
  // Dairy
  'Susu Segar': 18000,
  'Susu UHT': 22000,
  'Susu Evaporasi': 25000,
  'Susu Kental Manis': 18000,
  'Keju Cheddar': 85000,
  'Keju Mozzarella': 120000,
  'Keju Parmesan': 150000,
  'Cream Cheese': 90000,
  'Mentega Butter': 60000,
  'Whipped Cream': 65000,

  // Produce
  'Bawang Merah': 35000,
  'Bawang Putih': 40000,
  'Tomat': 15000,
  'Sayur Bayam': 12000,
  'Cabai': 45000,
  'Kol / Sayuran': 12000,
  'Selada Romaine': 25000,
  'Wortel': 14000,
  'Pisang': 15000,
  'Buah Jeruk Segar': 20000,
  'Blueberry': 35000,

  // Protein
  'Ayam Potong': 45000,
  'Dada Ayam': 55000,
  'Daging Sapi': 120000,
  'Telur': 2000,
  'Telur Ayam': 32000,
  'Fillet Ikan Dori': 55000,

  // Beverage
  'Kopi Bubuk': 95000,
  'Teh Earl Grey': 25000,
  'Teh Thailand': 35000,
  'Daun Teh Melati': 15000,
  'Bubuk Chai': 120000,
  'Bubuk Matcha': 150000,
  'Air Mineral': 5000,
  'Air Kelapa Murni': 15000,
  'Air Tonic': 12000,
  'Es Batu': 5000,
  'Perasan Lemon': 30000,
  'Sirup Karamel': 85000,
  'Gas Nitrogen': 150000,

  // Dry Goods
  'Tepung Terigu': 15000,
  'Gula Pasir': 18000,
  'Minyak Goreng': 25000,
  'Cokelat Bubuk': 75000,
  'Coklat Bubuk': 75000,
  'Kacang Almond': 140000,
  'Kacang Tanah': 30000,
  'Kayu Manis Bubuk': 15000,
  'Kecap Manis': 20000,
  'Pasta Spaghetti': 28000,
  'Pewarna Makanan Merah': 10000,
  'Ragi': 20000,
  'Biskuit Regal': 18000,

  // Bakery & Pastry
  'Adonan Croissant': 45000,
  'Roti Tawar': 15000,

  // Frozen Food
  'Kentang Beku': 32000,
  'Vanilla Ice Cream': 40000,

  // Sauces
  'Dressing Caesar': 45000,
};

async function populateUnitPrices() {
  console.log('=== POPULATING UNIT PRICES ===\n');

  const ingredients = await prisma.ingredient.findMany();

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const ingredient of ingredients) {
    const targetPrice = priceMapping[ingredient.name];

    if (!targetPrice) {
      console.log(`⚠️  No price mapping found for: ${ingredient.name} (current: ${ingredient.unit_price})`);
      notFound++;
      continue;
    }

    // Check if already has a price (> 0)
    if (ingredient.unit_price > 0) {
      console.log(`✓ Already has price: ${ingredient.name} -> ${ingredient.unit_price}`);
      skipped++;
      continue;
    }

    // Update the ingredient
    await prisma.ingredient.update({
      where: { id: ingredient.id },
      data: { unit_price: targetPrice }
    });

    console.log(`✅ Updated: ${ingredient.name} -> ${targetPrice} (was: ${ingredient.unit_price})`);
    updated++;
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (already has price): ${skipped}`);
  console.log(`No mapping found: ${notFound}`);
  console.log(`Total processed: ${ingredients.length}`);
}

async function verifyPrices() {
  console.log('\n=== VERIFYING UNIT PRICES ===\n');

  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' }
  });

  const zeroPrice = ingredients.filter(ing => ing.unit_price === 0);
  const withPrice = ingredients.filter(ing => ing.unit_price > 0);

  console.log(`Ingredients with price: ${withPrice.length}`);
  console.log(`Ingredients with zero price: ${zeroPrice.length}`);

  if (zeroPrice.length > 0) {
    console.log('\n⚠️  Ingredients still with zero price:');
    zeroPrice.forEach(ing => {
      console.log(`  - ${ing.name}`);
    });
  } else {
    console.log('\n✅ All ingredients have unit prices');
  }

  console.log('\n=== PRICE RANGE ===');
  const prices = withPrice.map(ing => ing.unit_price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  console.log(`Min: Rp ${minPrice.toLocaleString('id-ID')}`);
  console.log(`Max: Rp ${maxPrice.toLocaleString('id-ID')}`);
  console.log(`Avg: Rp ${avgPrice.toLocaleString('id-ID')}`);
}

async function main() {
  try {
    await populateUnitPrices();
    await verifyPrices();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
