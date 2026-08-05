// Copy and paste this script into the browser console on any page of the Kitchen POS app
// This will import recipes from the recipes_template.json file

(async function importRecipesFromConsole() {
  try {
    console.log('📋 Starting recipe import from template...');
    
    // Read the template file
    const response = await fetch('/recipes_template.json');
    const templateData = await response.json();
    
    console.log('📄 Template data loaded:', templateData);
    
    // Import the database and import function
    const { db } = await import('/src/lib/db.ts');
    const { importRecipesFromTemplate } = await import('/src/lib/importRecipesFromTemplate.ts');
    
    // Execute import
    const result = await importRecipesFromTemplate(templateData);
    
    console.log('✅ Import completed successfully!');
    console.log('📊 Summary:', result);
    
    // Refresh the page to see updated data
    setTimeout(() => {
      console.log('🔄 Refreshing page in 2 seconds...');
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    alert('Import gagal. Cek console untuk detail error.');
  }
})();
