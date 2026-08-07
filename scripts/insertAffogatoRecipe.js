/**
 * Browser Console Script to Insert Affogato Recipe
 * 
 * CRITICAL: Run this script to insert Affogato recipe data permanently to database
 * 
 * Instructions:
 * 1. Open the Kitchen POS application in browser
 * 2. Navigate to: http://localhost:3000/inventory/mapping
 * 3. Open Developer Console (F12)
 * 4. Copy and paste this ENTIRE script into the console
 * 5. Press Enter to execute
 * 6. Wait for success message
 * 7. Refresh the page (F5)
 * 8. Select "Affogato" from the product list to verify
 */

(async function insertAffogatoRecipe() {
  console.log('🔄 STARTING AFFOGATO RECIPE INSERTION...');
  console.log('⚠️  Please wait for completion message before refreshing...');
  
  try {
    // Access the database from window (exposed by the app)
    const db = window.db;
    
    if (!db) {
      console.error('❌ ERROR: Database not found.');
      console.error('   Make sure you are on the Mapping Resep page: /inventory/mapping');
      console.error('   If db is not exposed, reload the page first.');
      return;
    }
    
    console.log('✅ Database connected');
    
    // Check if Affogato product exists
    let affogatoProduct = await db.products.where('name').equals('Affogato').first();
    
    if (!affogatoProduct) {
      console.log('📝 Creating Affogato product...');
      // Create Affogato product
      const productId = crypto.randomUUID();
      await db.products.add({
        id: productId,
        name: 'Affogato',
        sku: 'AF-010',
        price: 38000,
        stock_quantity: 100,
        category_id: null,
        image_url: 'https://picsum.photos/seed/affogato/500/500',
        bom_type: 'manufacture',
      });
      affogatoProduct = await db.products.get(productId);
      console.log('✅ Affogato product created');
    } else {
      console.log('✅ Affogato product already exists (ID:', affogatoProduct.id, ')');
    }
    
    const productId = affogatoProduct.id;
    
    // Get ingredient IDs
    console.log('🔍 Looking up ingredients...');
    const bijiKopi = await db.ingredients.where('name').equals('Biji Kopi').first();
    const susu = await db.ingredients.where('name').equals('Susu').first();
    const esKrim = await db.ingredients.where('name').equals('Es Krim Vanila').first();
    
    if (!bijiKopi) {
      console.error('❌ ERROR: Biji Kopi ingredient not found in database');
      console.error('   Please ensure ingredients are imported first');
      return;
    }
    if (!susu) {
      console.error('❌ ERROR: Susu ingredient not found in database');
      console.error('   Please ensure ingredients are imported first');
      return;
    }
    if (!esKrim) {
      console.error('❌ ERROR: Es Krim Vanila ingredient not found in database');
      console.error('   Please ensure ingredients are imported first');
      return;
    }
    
    console.log('✅ All ingredients found:');
    console.log('   - Biji Kopi (ID:', bijiKopi.id, ')');
    console.log('   - Susu (ID:', susu.id, ')');
    console.log('   - Es Krim Vanila (ID:', esKrim.id, ')');
    
    // Delete existing recipes for Affogato
    console.log('🗑️  Deleting existing recipes for Affogato...');
    await db.recipes.where('menu_item_id').equals(productId).delete();
    console.log('✅ Existing recipes deleted');
    
    // Insert recipe components
    console.log('➕ Inserting recipe components...');
    
    await db.recipes.add({
      id: crypto.randomUUID(),
      menu_item_id: productId,
      ingredient_id: bijiKopi.id,
      quantity_required: 0.018, // 18g
      unit: 'kg',
      created_at: new Date().toISOString(),
    });
    console.log('   ✅ Biji Kopi: 0.018 kg');
    
    await db.recipes.add({
      id: crypto.randomUUID(),
      menu_item_id: productId,
      ingredient_id: esKrim.id,
      quantity_required: 0.05, // 50g
      unit: 'kg',
      created_at: new Date().toISOString(),
    });
    console.log('   ✅ Es Krim Vanila: 0.05 kg');
    
    await db.recipes.add({
      id: crypto.randomUUID(),
      menu_item_id: productId,
      ingredient_id: susu.id,
      quantity_required: 0.05, // 50ml
      unit: 'liter',
      created_at: new Date().toISOString(),
    });
    console.log('   ✅ Susu: 0.05 liter');
    
    // Update bom_type to manufacture
    console.log('⚙️  Setting BoM Type to manufacture...');
    await db.products.update(productId, { bom_type: 'manufacture' });
    console.log('✅ BoM Type set to manufacture');
    
    // Verify insertion
    console.log('🔍 Verifying insertion...');
    const recipes = await db.recipes.where('menu_item_id').equals(productId).toArray();
    console.log('✅ Total recipes in database:', recipes.length);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 AFFOGATO RECIPE INSERTED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📋 RECIPE SUMMARY:');
    console.log('   Product: Affogato');
    console.log('   BoM Type: manufacture');
    console.log('   Components:');
    console.log('   • Biji Kopi: 0.018 kg');
    console.log('   • Es Krim Vanila: 0.05 kg');
    console.log('   • Susu: 0.05 liter');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 NEXT STEPS:');
    console.log('   1. Refresh this page (F5)');
    console.log('   2. Select "Affogato" from the product list (left side)');
    console.log('   3. Verify the 3 components appear in the table');
    console.log('   4. Verify HPP is calculated automatically');
    console.log('   5. Click "Simpan Resep" to save permanently');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error);
    console.error('   Stack trace:', error.stack);
  }
})();
