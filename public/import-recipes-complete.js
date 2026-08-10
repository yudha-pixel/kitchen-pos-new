// Copy and paste this script into the browser console on any page of the Kitchen POS app
// This will import recipes from recipes_template.json and provide complete verification

// UUID generator for browser console
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

(async function importRecipesWithVerification() {
  try {
    console.log('🚀 Starting complete recipe import with verification...');
    console.log('='.repeat(60));

    // Step 1: Read the template file
    console.log('📄 Step 1: Reading recipes_template.json...');
    const response = await fetch('/recipes_template.json');
    if (!response.ok) {
      throw new Error('Failed to read recipes_template.json');
    }
    const templateData = await response.json();
    console.log(`✅ Template loaded with ${templateData.length} menu entries`);
    console.log('Template data:', templateData);

    // Step 2: Get database
    console.log('\n📦 Step 2: Connecting to database...');
    const { db } = await import('/src/lib/db.ts');
    console.log('✅ Database connected');
    
    // Step 3: Get all products for verification
    console.log('\n🍽️ Step 3: Scanning all products in database...');
    const allProducts = await db.products.toArray();
    console.log(`✅ Found ${allProducts.length} products in database`);
    allProducts.forEach(p => console.log(`   - ${p.name} (ID: ${p.id})`));
    
    // Step 4: Import process
    console.log('\n⚙️ Step 4: Starting import process...');
    console.log('='.repeat(60));
    
    let createdIngredients = 0;
    let updatedRecipes = 0;
    let skippedMenus = 0;
    let skippedIngredients = 0;
    const importResults = [];
    
    for (const template of templateData) {
      console.log(`\n🍽️ Processing menu: "${template.menu_name}"`);
      
      // Find product by name
      const product = await db.products.where('name').equals(template.menu_name).first();
      if (!product || !product.id) {
        console.warn(`   ⚠️ Menu "${template.menu_name}" NOT FOUND in database - SKIPPED`);
        skippedMenus++;
        importResults.push({
          menu_name: template.menu_name,
          status: 'skipped',
          reason: 'Menu not found in database'
        });
        continue;
      }
      
      console.log(`   ✅ Menu found (ID: ${product.id})`);
      
      // Delete existing recipes for this product
      const existingRecipes = await db.recipes.where('menu_item_id').equals(product.id).toArray();
      await db.recipes.bulkDelete(existingRecipes.map(r => r.id).filter(id => id !== undefined));
      console.log(`   🗑️ Deleted ${existingRecipes.length} existing recipes`);
      
      // Process ingredients
      const ingredientResults = [];
      for (const ing of template.ingredients) {
        console.log(`   📝 Processing ingredient: "${ing.ingredient_name}" (${ing.quantity} ${ing.unit})`);
        
        // Find or create ingredient
        let ingredient = await db.ingredients.where('name').equals(ing.ingredient_name).first();
        
        if (!ingredient) {
          // Create new ingredient
          ingredient = {
            id: crypto.randomUUID(),
            name: ing.ingredient_name,
            current_stock: 0,
            unit: ing.unit,
            min_stock: 0,
            unit_price: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await db.ingredients.add(ingredient);
          createdIngredients++;
          console.log(`      ✅ Created NEW ingredient`);
        } else {
          console.log(`      ✓ Found existing ingredient (ID: ${ingredient.id})`);
        }
        
        if (!ingredient.id) {
          console.warn(`      ⚠️ Ingredient ID is undefined - SKIPPED`);
          skippedIngredients++;
          ingredientResults.push({
            ingredient_name: ing.ingredient_name,
            status: 'skipped',
            reason: 'Ingredient ID undefined'
          });
          continue;
        }
        
        // Create recipe
        await db.recipes.add({
          id: crypto.randomUUID(),
          menu_item_id: product.id,
          ingredient_id: ingredient.id,
          quantity_required: ing.quantity,
          created_at: new Date().toISOString(),
        });
        updatedRecipes++;
        console.log(`      ➕ Recipe created successfully`);
        
        ingredientResults.push({
          ingredient_name: ing.ingredient_name,
          quantity: ing.quantity,
          unit: ing.unit,
          status: 'success'
        });
      }
      
      importResults.push({
        menu_name: template.menu_name,
        status: 'success',
        ingredients_count: template.ingredients.length,
        ingredients: ingredientResults
      });
    }
    
    // Step 5: Verification
    console.log('\n✅ Step 5: Import completed!');
    console.log('='.repeat(60));
    console.log('📊 IMPORT SUMMARY:');
    console.log(`   ✅ Created ingredients: ${createdIngredients}`);
    console.log(`   ✅ Updated recipes: ${updatedRecipes}`);
    console.log(`   ⚠️ Skipped menus (not found): ${skippedMenus}`);
    console.log(`   ⚠️ Skipped ingredients (errors): ${skippedIngredients}`);
    
    // Step 6: Check for menus without ingredients
    console.log('\n🔍 Step 6: Checking for menus without ingredients...');
    const productsWithoutRecipes = [];
    for (const product of allProducts) {
      const recipes = await db.recipes.where('menu_item_id').equals(product.id).toArray();
      if (recipes.length === 0) {
        productsWithoutRecipes.push(product.name);
        console.warn(`   ⚠️ Menu "${product.name}" has NO ingredients defined`);
      }
    }
    
    if (productsWithoutRecipes.length === 0) {
      console.log('   ✅ All menus have ingredients defined!');
    } else {
      console.log(`   ⚠️ Found ${productsWithoutRecipes.length} menus without ingredients`);
    }
    
    // Step 7: System readiness check
    console.log('\n🎯 Step 7: System Readiness Check');
    console.log('='.repeat(60));
    
    const allIngredients = await db.ingredients.toArray();
    const allRecipes = await db.recipes.toArray();
    
    console.log(`📦 Database State:`);
    console.log(`   - Total products: ${allProducts.length}`);
    console.log(`   - Total ingredients: ${allIngredients.length}`);
    console.log(`   - Total recipes (BOM): ${allRecipes.length}`);
    console.log(`   - Products with recipes: ${allProducts.length - productsWithoutRecipes.length}`);
    console.log(`   - Products without recipes: ${productsWithoutRecipes.length}`);
    
    if (productsWithoutRecipes.length === 0 && allRecipes.length > 0) {
      console.log('\n🎉 SYSTEM READY FOR AUTOMATIC STOCK REDUCTION!');
      console.log('✅ All menus have ingredient mappings');
      console.log('✅ Stock will be automatically reduced when orders are completed');
    } else {
      console.log('\n⚠️ SYSTEM NOT FULLY READY');
      if (productsWithoutRecipes.length > 0) {
        console.log('⚠️ Some menus lack ingredient definitions');
        console.log('⚠️ Please complete ingredient mappings for these menus:');
        productsWithoutRecipes.forEach(name => console.log(`   - ${name}`));
      }
    }
    
    // Final report
    console.log('\n📋 DETAILED IMPORT RESULTS:');
    console.log('='.repeat(60));
    importResults.forEach(result => {
      if (result.status === 'success') {
        console.log(`✅ ${result.menu_name}: ${result.ingredients_count} ingredients mapped`);
      } else {
        console.log(`⚠️ ${result.menu_name}: ${result.reason}`);
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🔄 Auto-refreshing page in 3 seconds to view updated data...');
    console.log('='.repeat(60));
    
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ IMPORT FAILED:', error);
    console.error('Error details:', error.message);
    alert('Import gagal. Cek console untuk detail error.');
  }
})();
