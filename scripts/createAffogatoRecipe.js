/**
 * Script to create Affogato recipe in the database
 * Run this script with: node scripts/createAffogatoRecipe.js
 */

const { createAffogatoRecipe } = require('../src/features/inventory/inventoryService');

async function main() {
  console.log('Creating Affogato recipe...');
  
  try {
    const result = await createAffogatoRecipe();
    
    if (result.success) {
      console.log('✅', result.message);
      console.log('Affogato recipe has been created with the following components:');
      console.log('- Biji Kopi: 0.018 kg');
      console.log('- Es Krim Vanila: 0.05 kg');
      console.log('- Susu: 0.05 liter');
      console.log('- BoM Type: manufacture');
    } else {
      console.log('❌', result.message);
    }
  } catch (error) {
    console.error('Error creating Affogato recipe:', error);
  }
}

main();
