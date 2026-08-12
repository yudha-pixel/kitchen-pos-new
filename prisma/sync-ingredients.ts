import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking current ingredient and warehouse data...');

  // Check warehouses
  let warehouses = await prisma.warehouse.findMany();
  console.log(`📦 Found ${warehouses.length} warehouses:`);
  warehouses.forEach((w: any) => console.log(`   - ${w.name} (${w.id})`));

  // Create default warehouse if none exists
  if (warehouses.length === 0) {
    console.log('\n⚠️ No warehouses found. Creating default warehouse...');
    
    // Get or create default outlet
    let outlet = await prisma.outlet.findFirst();
    if (!outlet) {
      console.log('   No outlet found, creating default outlet...');
      const company = await prisma.company.upsert({
        where: { id: '00000000-0000-4000-8000-000000000001' },
        update: {},
        create: { id: '00000000-0000-4000-8000-000000000001', name: 'Kitchen POS' },
      });
      outlet = await prisma.outlet.create({
        data: {
          name: 'Main Outlet',
          code: 'MAIN',
          address: 'Main Location',
          is_active: true,
          company_id: company.id,
        },
      });
      console.log(`   Created outlet: ${outlet.name} (${outlet.id})`);
    }
    
    const defaultWarehouse = await prisma.warehouse.create({
      data: {
        name: 'Main Warehouse',
        code: 'MAIN',
        address: 'Main Storage',
        is_active: true,
        outlet_id: outlet.id,
      },
    });
    console.log(`✅ Created default warehouse: ${defaultWarehouse.name} (${defaultWarehouse.id})`);
    warehouses = [defaultWarehouse];
  }

  const mainWarehouse = warehouses[0];

  // Check ingredients
  const ingredients = await prisma.ingredient.findMany();
  console.log(`\n📝 Found ${ingredients.length} ingredients:`);
  
  let ingredientsWithoutWarehouse = 0;
  ingredients.forEach((ing: any) => {
    if (!ing.warehouse_id) {
      ingredientsWithoutWarehouse++;
    }
  });
  console.log(`   - ${ingredientsWithoutWarehouse} ingredients without warehouse assignment`);

  // Check products
  const products = await prisma.product.findMany({ where: { is_active: true } });
  console.log(`\n🍽️ Found ${products.length} active products`);

  // Check recipes
  const recipes = await prisma.recipe.findMany();
  console.log(`📋 Found ${recipes.length} recipe entries`);

  // Update ingredients: assign to warehouse and increase stock for 57 products
  console.log('\n🔄 Updating ingredients...');
  let updatedCount = 0;
  
  for (const ingredient of ingredients) {
    // Calculate realistic stock based on product count (57 products vs original 4)
    // Multiply by ~14x to account for 57 products
    const scaleFactor = 14;
    const newStock = Math.max(ingredient.current_stock * scaleFactor, ingredient.min_stock * 2);
    const newMinStock = ingredient.min_stock * scaleFactor;
    
    await prisma.ingredient.update({
      where: { id: ingredient.id },
      data: {
        warehouse_id: mainWarehouse.id,
        current_stock: newStock,
        min_stock: newMinStock,
      },
    });
    updatedCount++;
    
    if (updatedCount % 20 === 0) {
      console.log(`   Updated ${updatedCount}/${ingredients.length} ingredients...`);
    }
  }

  console.log(`✅ Updated ${updatedCount} ingredients with warehouse assignment and realistic stock values`);

  console.log('\n✅ Data synchronization completed');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
