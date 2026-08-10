import { db } from './db';
import { generateUUID } from './utils';

interface RecipeTemplateIngredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface RecipeTemplate {
  menu_name: string;
  ingredients: RecipeTemplateIngredient[];
}

export const importRecipesFromTemplate = async (templateData: RecipeTemplate[]) => {
  try {
    console.log('📋 Starting recipe import from template...');
    let createdIngredients = 0;
    let updatedRecipes = 0;
    let skippedMenus = 0;
    let skippedIngredients = 0;

    for (const template of templateData) {
      // Find product by name
      const product = await db.products.where('name').equals(template.menu_name).first();
      if (!product || !product.id) {
        console.warn(`⚠️ Menu "${template.menu_name}" tidak ditemukan, dilewati`);
        skippedMenus++;
        continue;
      }

      console.log(`🍽️ Processing menu: ${template.menu_name}`);

      // Delete existing recipes for this product
      const existingRecipes = await db.recipes.where('menu_item_id').equals(product.id).toArray();
      await db.recipes.bulkDelete(existingRecipes.map(r => r.id!));
      console.log(`   🗑️ Deleted ${existingRecipes.length} existing recipes`);

      // Process ingredients
      for (const ingredientTemplate of template.ingredients) {
        // Find or create ingredient
        let ingredient = await db.ingredients.where('name').equals(ingredientTemplate.ingredient_name).first();
        
        if (!ingredient) {
          // Create new ingredient with default values
          ingredient = {
            id: generateUUID(),
            name: ingredientTemplate.ingredient_name,
            current_stock: 0,
            unit: ingredientTemplate.unit,
            min_stock: 0,
            unit_price: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          await db.ingredients.add(ingredient);
          createdIngredients++;
          console.log(`   ✅ Created new ingredient: ${ingredientTemplate.ingredient_name}`);
        } else {
          console.log(`   ✓ Found existing ingredient: ${ingredientTemplate.ingredient_name}`);
        }

        if (!ingredient.id) {
          console.warn(`⚠️ Ingredient ID is undefined for ${ingredientTemplate.ingredient_name}, skipped`);
          skippedIngredients++;
          continue;
        }

        // Create recipe
        await db.recipes.add({
          id: generateUUID(),
          menu_item_id: product.id,
          ingredient_id: ingredient.id,
          quantity_required: ingredientTemplate.quantity,
          created_at: new Date().toISOString(),
        });
        updatedRecipes++;
        console.log(`   ➕ Added recipe: ${ingredientTemplate.ingredient_name} (${ingredientTemplate.quantity} ${ingredientTemplate.unit})`);
      }
    }

    console.log('🎉 Recipe import completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Created ingredients: ${createdIngredients}`);
    console.log(`   - Updated recipes: ${updatedRecipes}`);
    console.log(`   - Skipped menus (not found): ${skippedMenus}`);
    console.log(`   - Skipped ingredients (errors): ${skippedIngredients}`);

    return {
      success: true,
      createdIngredients,
      updatedRecipes,
      skippedMenus,
      skippedIngredients,
    };
  } catch (error) {
    console.error('❌ Error importing recipes from template:', error);
    throw error;
  }
};

// Function to import from file (for browser usage)
export const importRecipesFromFile = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as RecipeTemplate[];
    return await importRecipesFromTemplate(data);
  } catch (error) {
    console.error('❌ Error reading file:', error);
    throw new Error('Gagal membaca file. Pastikan format JSON valid.');
  }
};
