// Simple debugging script to check recipe data in IndexedDB
// Run this in browser console on http://localhost:3000/inventory/mapping

(async function debugRecipes() {
  try {
    console.log('🔍 Debugging Recipe Data...');
    console.log('='.repeat(60));
    
    // Open IndexedDB directly
    const request = indexedDB.open('KitchenPOS', 1);
    
    request.onerror = () => {
      console.error('❌ Failed to open database');
    };
    
    request.onsuccess = async (event) => {
      const db = event.target.result;
      
      // Check products
      const products = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['products'], 'readonly');
        const store = transaction.objectStore('products');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      console.log(`📦 Total products: ${products.length}`);
      console.log('Products:', products.map(p => ({ id: p.id, name: p.name })));
      
      // Check ingredients
      const ingredients = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['ingredients'], 'readonly');
        const store = transaction.objectStore('ingredients');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      console.log(`📦 Total ingredients: ${ingredients.length}`);
      console.log('Ingredients:', ingredients.map(i => ({ id: i.id, name: i.name })));
      
      // Check recipes
      const recipes = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['recipes'], 'readonly');
        const store = transaction.objectStore('recipes');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      console.log(`📦 Total recipes: ${recipes.length}`);
      console.log('Recipes:', recipes);
      
      // Check specific menu recipes
      const menuName = 'Nasi Goreng Spesial';
      const product = products.find(p => p.name === menuName);
      
      if (product) {
        console.log(`\n🔍 Checking recipes for "${menuName}" (ID: ${product.id}):`);
        const menuRecipes = recipes.filter(r => r.menu_item_id === product.id);
        console.log(`Found ${menuRecipes.length} recipes:`, menuRecipes);
        
        if (menuRecipes.length > 0) {
          console.log('Recipe details:');
          for (const recipe of menuRecipes) {
            const ingredient = ingredients.find(i => i.id === recipe.ingredient_id);
            console.log(`  - ${ingredient?.name || 'Unknown'}: ${recipe.quantity_required}`);
          }
        }
      } else {
        console.log(`⚠️ Product "${menuName}" not found`);
      }
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ Debug completed');
      console.log('='.repeat(60));
    };
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
})();
