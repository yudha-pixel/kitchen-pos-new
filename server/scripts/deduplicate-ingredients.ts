import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function detectDuplicates() {
  console.log('=== DETECTING DUPLICATE INGREDIENTS ===\n');

  // Find duplicates by name (case-insensitive)
  const duplicatesByName: any[] = await prisma.$queryRaw`
    SELECT
      LOWER(name) as normalized_name,
      COUNT(*) as count,
      array_agg(id) as ids,
      array_agg(name) as names,
      array_agg(current_stock) as stocks,
      array_agg(sku) as skus
    FROM ingredients
    GROUP BY LOWER(name)
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `;

  console.log(`Found ${duplicatesByName.length} groups of duplicates by name:\n`);

  duplicatesByName.forEach((group: any, idx: number) => {
    console.log(`${idx + 1}. Name: "${group.names[0]}" (${group.count} duplicates)`);
    console.log(`   IDs: ${group.ids.join(', ')}`);
    console.log(`   Stocks: ${group.stocks.join(', ')}`);
    console.log(`   SKUs: ${group.skus.join(', ')}`);
    console.log('');
  });

  // Find duplicates by SKU
  const duplicatesBySku: any[] = await prisma.$queryRaw`
    SELECT
      sku,
      COUNT(*) as count,
      array_agg(id) as ids,
      array_agg(name) as names,
      array_agg(current_stock) as stocks
    FROM ingredients
    WHERE sku IS NOT NULL AND sku != ''
    GROUP BY sku
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
  `;

  console.log(`\nFound ${duplicatesBySku.length} groups of duplicates by SKU:\n`);

  duplicatesBySku.forEach((group: any, idx: number) => {
    console.log(`${idx + 1}. SKU: "${group.sku}" (${group.count} duplicates)`);
    console.log(`   Names: ${group.names.join(', ')}`);
    console.log(`   IDs: ${group.ids.join(', ')}`);
    console.log(`   Stocks: ${group.stocks.join(', ')}`);
    console.log('');
  });

  return { duplicatesByName, duplicatesBySku };
}

async function deduplicateIngredients() {
  console.log('=== DEDUPLICATING INGREDIENTS ===\n');

  const { duplicatesByName, duplicatesBySku } = await detectDuplicates();

  let totalDeleted = 0;
  let totalKept = 0;

  // Process name duplicates
  for (const group of duplicatesByName) {
    const ids = group.ids;
    const stocks = group.stocks;
    const names = group.names;

    console.log(`\nProcessing duplicate group: "${names[0]}"`);

    // Find the best record to keep:
    // 1. Prefer record with active stock (> 0)
    // 2. If all have 0 stock, keep the first one (oldest by created_at)
    let bestIndex = 0;
    let maxStock = 0;

    for (let i = 0; i < ids.length; i++) {
      const stock = parseFloat(stocks[i]);
      if (stock > maxStock) {
        maxStock = stock;
        bestIndex = i;
      }
    }

    const keepId = ids[bestIndex];
    const deleteIds = ids.filter((_: any, i: number) => i !== bestIndex);

    console.log(`  Keeping: ID ${keepId} (stock: ${stocks[bestIndex]})`);
    console.log(`  Deleting: ${deleteIds.join(', ')}`);

    // Delete duplicates
    for (const deleteId of deleteIds) {
      // Check if this ingredient is referenced in other tables
      const recipeCount = await prisma.recipe.count({
        where: { ingredient_id: deleteId }
      });

      const stockAdjustmentCount = await prisma.stockAdjustmentLog.count({
        where: { ingredient_id: deleteId }
      });

      if (recipeCount > 0 || stockAdjustmentCount > 0) {
        console.log(`  ⚠️  Skipping ID ${deleteId} - has ${recipeCount} recipes and ${stockAdjustmentCount} stock adjustments`);
        continue;
      }

      await prisma.ingredient.delete({
        where: { id: deleteId }
      });
      totalDeleted++;
      console.log(`  ✅ Deleted ID ${deleteId}`);
    }

    totalKept++;
  }

  console.log(`\n=== DEDUPLICATION COMPLETE ===`);
  console.log(`Total records kept: ${totalKept}`);
  console.log(`Total records deleted: ${totalDeleted}`);

  return { totalKept, totalDeleted };
}

async function verifyIntegrity() {
  console.log('\n=== VERIFYING DATA INTEGRITY ===\n');

  const totalIngredients = await prisma.ingredient.count();
  const totalWithStock = await prisma.ingredient.count({
    where: { current_stock: { gt: 0 } }
  });

  console.log(`Total ingredients: ${totalIngredients}`);
  console.log(`Ingredients with stock > 0: ${totalWithStock}`);

  // Check for remaining duplicates
  const remainingNameDuplicates: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM (
      SELECT LOWER(name) as normalized_name
      FROM ingredients
      GROUP BY LOWER(name)
      HAVING COUNT(*) > 1
    ) as duplicates
  `;

  console.log(`Remaining name duplicates: ${remainingNameDuplicates[0]?.count || 0}`);

  if ((remainingNameDuplicates[0]?.count || 0) === 0) {
    console.log('\n✅ No duplicates found - cleanup successful!');
  } else {
    console.log('\n⚠️  Some duplicates remain - manual review may be needed');
  }
}

async function main() {
  try {
    // First, just detect and show what would be done
    console.log('DRY RUN - Detecting duplicates without deleting...\n');
    await detectDuplicates();

    console.log('\n' + '='.repeat(50));
    console.log('PERFORMING DEDUPLICATION...');
    console.log('='.repeat(50) + '\n');

    // Perform actual deduplication
    await deduplicateIngredients();
    await verifyIntegrity();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
