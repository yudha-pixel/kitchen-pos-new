// Copy and paste this script into the browser console after bulk import is complete
// This will verify the 3 random menus and provide import summary

(async function verifyImportResults() {
  try {
    console.log('🔍 Verifying Import Results...');
    console.log('='.repeat(60));
    
    // Connect to database
    const { db } = await import('/src/lib/db.ts');
    
    // Get all products
    const allProducts = await db.products.toArray();
    console.log(`📦 Total products in database: ${allProducts.length}`);
    
    // Get all ingredients
    const allIngredients = await db.ingredients.toArray();
    console.log(`📦 Total ingredients in database: ${allIngredients.length}`);
    
    // Get all recipes
    const allRecipes = await db.recipes.toArray();
    console.log(`📦 Total recipes (BOM) in database: ${allRecipes.length}`);
    
    // Verify 3 specific menus
    console.log('\n🔍 Verifying 3 Random Menus:');
    console.log('='.repeat(60));
    
    const menusToVerify = ['Nasi Goreng Spesial', 'Caffe Latte', 'Mie Goreng Jawa'];
    
    for (const menuName of menusToVerify) {
      console.log(`\n🍽️ Checking: "${menuName}"`);
      
      // Find product
      const product = await db.products.where('name').equals(menuName).first();
      if (!product) {
        console.warn(`   ⚠️ Menu NOT FOUND in database`);
        continue;
      }
      
      console.log(`   ✅ Menu found (ID: ${product.id})`);
      
      // Get recipes for this product
      const recipes = await db.recipes.where('menu_item_id').equals(product.id).toArray();
      
      if (recipes.length === 0) {
        console.warn(`   ⚠️ NO ingredients mapped`);
        continue;
      }
      
      console.log(`   ✅ ${recipes.length} ingredients mapped:`);
      
      // Get ingredient details
      for (const recipe of recipes) {
        const ingredient = await db.ingredients.where('id').equals(recipe.ingredient_id).first();
        if (ingredient) {
          console.log(`      - ${ingredient.name}: ${recipe.quantity_required} ${ingredient.unit}`);
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Total Products: ${allProducts.length}`);
    console.log(`✅ Total Ingredients: ${allIngredients.length}`);
    console.log(`✅ Total Recipes: ${allRecipes.length}`);
    console.log(`✅ Products with Recipes: ${[...new Set(allRecipes.map(r => r.menu_item_id))].length}`);
    console.log(`⚠️ Products without Recipes: ${allProducts.length - [...new Set(allRecipes.map(r => r.menu_item_id))].length}`);
    
    // List products without recipes
    const productsWithRecipes = new Set(allRecipes.map(r => r.menu_item_id));
    const productsWithoutRecipes = allProducts.filter(p => !productsWithRecipes.has(p.id));
    
    if (productsWithoutRecipes.length > 0) {
      console.log('\n⚠️ Products without recipes:');
      productsWithoutRecipes.forEach(p => console.log(`   - ${p.name}`));
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Verification completed!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    alert('Verification gagal. Cek console untuk detail error.');
  }
})();
