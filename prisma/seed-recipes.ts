import { PrismaClient } from '@prisma/client';
import { comprehensiveIngredients, createRecipesForProduct } from '../src/features/inventory/recipeData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting recipe data seed...');

  // Get all products from database
  const products = await prisma.product.findMany();
  console.log(`📦 Found ${products.length} products in database`);

  if (products.length === 0) {
    console.log('⚠️ No products found. Please seed products first.');
    return;
  }

  // Create ingredients
  console.log('📝 Creating ingredients...');
  const ingredients = [];
  for (const ing of comprehensiveIngredients) {
    const ingredient = await prisma.ingredient.create({
      data: {
        name: ing.name,
        current_stock: ing.current_stock,
        unit: ing.unit,
        min_stock: ing.min_stock,
        unit_price: ing.unit_price,
      },
    });
    ingredients.push(ingredient);
    console.log(`✅ Created ingredient: ${ingredient.name}`);
  }

  // Create ingredient map for easy lookup
  const ingredientMap = new Map(ingredients.map(i => [i.name, i.id]));

  // Create recipes for all products
  console.log('📋 Creating recipes...');
  let recipeCount = 0;
  for (const product of products) {
    const productRecipes = createRecipesForProduct(product, ingredientMap);
    
    for (const recipe of productRecipes) {
      try {
        await prisma.recipe.create({
          data: {
            menu_item_id: product.id,
            ingredient_id: recipe.ingredient_id,
            quantity_required: recipe.quantity_required,
          },
        });
        recipeCount++;
      } catch (error) {
        // Recipe might already exist, skip it
        console.log(`⚠️ Recipe already exists for ${product.name} with ingredient ${recipe.ingredient_id}, skipping`);
      }
    }
    
    console.log(`✅ Created recipes for ${product.name}`);
  }

  console.log('🎉 Recipe data seed completed!');
  console.log('📊 Summary:');
  console.log(`   - Ingredients: ${ingredients.length}`);
  console.log(`   - Recipes: ${recipeCount}`);
  console.log(`   - Products with recipes: ${products.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding recipe data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
