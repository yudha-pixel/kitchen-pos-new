// Copy and paste this script into the browser console on http://localhost:3000/pos
// This will export all menu data from the live application database

(async function exportMenuFromLiveApp() {
  try {
    console.log('🚀 Starting menu export from live application...');
    console.log('='.repeat(60));
    
    // Connect to database
    console.log('📦 Connecting to database...');
    const { db } = await import('/src/lib/db.ts');
    console.log('✅ Database connected');
    
    // Fetch all products
    console.log('\n🍽️ Fetching all products from database...');
    const allProducts = await db.products.toArray();
    console.log(`✅ Found ${allProducts.length} products`);
    
    // Fetch categories for category names
    const allCategories = await db.categories.toArray();
    const categoryMap = new Map(allCategories.map(cat => [cat.id, cat.name]));
    
    // Build complete menu data
    console.log('\n📋 Building complete menu data...');
    const completeMenuData = allProducts.map(product => ({
      id: product.id,
      nama_menu: product.name,
      kategori: categoryMap.get(product.category_id) || 'Unknown',
      deskripsi: product.description || 'No description',
      harga: product.price,
      sku: product.sku || 'No SKU',
      stock_quantity: product.stock_quantity || 0,
      image_url: product.image_url || null,
      status: 'complete'
    }));
    
    // Display in console
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPLETE MENU DATA FROM LIVE APPLICATION');
    console.log('='.repeat(60));
    console.log(JSON.stringify(completeMenuData, null, 2));
    console.log('='.repeat(60));
    
    // Display as table
    console.log('\n📊 MENU TABLE:');
    console.table(completeMenuData);
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Total Menu: ${completeMenuData.length}`);
    console.log(`   Categories: ${[...new Set(completeMenuData.map(m => m.kategori))].join(', ')}`);
    console.log(`   Price Range: Rp ${Math.min(...completeMenuData.map(m => m.harga)).toLocaleString()} - Rp ${Math.max(...completeMenuData.map(m => m.harga)).toLocaleString()}`);
    
    // Copy to clipboard
    const jsonString = JSON.stringify(completeMenuData, null, 2);
    await navigator.clipboard.writeText(jsonString);
    console.log('\n✅ Data copied to clipboard!');
    
    // Download as JSON file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu-live-export.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ File downloaded: menu-live-export.json');
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Export completed successfully!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Export failed:', error);
    console.error('Error details:', error.message);
    alert('Export gagal. Cek console untuk detail error.');
  }
})();
