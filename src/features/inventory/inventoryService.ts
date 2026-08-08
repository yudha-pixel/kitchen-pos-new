import { db, Recipe, Ingredient, StockRequest, StockWriteOff } from '@/src/lib/db';
import { comprehensiveIngredients, createRecipesForProduct } from './recipeData';

/**
 * Inventory Service for managing stock levels
 * This service handles stock reduction when orders are completed
 */

export interface StockReductionResult {
  success: boolean;
  message: string;
  details?: {
    ingredientId: string;
    ingredientName: string;
    previousStock: number;
    quantityUsed: number;
    newStock: number;
  }[];
}

export interface StockRestorationResult {
  success: boolean;
  message: string;
  details?: {
    ingredientId: string;
    ingredientName: string;
    previousStock: number;
    quantityRestored: number;
    newStock: number;
  }[];
}

/**
 * Reduce stock for an order based on recipe mapping
 * This function is called when an order is placed
 */
export async function reduceStockForOrder(
  orderItems: Array<{ product_id: string; quantity: number }>
): Promise<StockReductionResult> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const reductionDetails: Array<{
      ingredientId: string;
      ingredientName: string;
      previousStock: number;
      quantityUsed: number;
      newStock: number;
    }> = [];
    
    await db.transaction('rw', db.ingredients, db.recipes, db.products, async () => {
      for (const orderItem of orderItems) {
        // Get recipes for this product
        const recipes = await db.recipes
          .where('menu_item_id')
          .equals(orderItem.product_id)
          .toArray();
        
        for (const recipe of recipes) {
          const ingredient = await db.ingredients.get(recipe.ingredient_id);
          
          if (!ingredient) {
            console.warn(`Ingredient ${recipe.ingredient_id} not found for recipe`);
            continue;
          }
          
          const previousStock = ingredient.current_stock;
          const quantityUsed = recipe.quantity_required * orderItem.quantity;
          const newStock = Math.max(0, previousStock - quantityUsed);
          
          // Update ingredient stock within transaction
          await db.ingredients.update(recipe.ingredient_id, {
            current_stock: newStock,
            updated_at: new Date().toISOString(),
          });
          
          reductionDetails.push({
            ingredientId: ingredient.id || '',
            ingredientName: ingredient.name,
            previousStock,
            quantityUsed,
            newStock,
          });
          
          console.log(`Reduced ${ingredient.name} from ${previousStock} to ${newStock} (${quantityUsed} used)`);
        }
      }
    });
    
    return {
      success: true,
      message: `Stock reduced for ${reductionDetails.length} ingredients`,
      details: reductionDetails,
    };
  } catch (error) {
    console.error('Failed to reduce stock:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reduce stock',
    };
  }
}

/**
 * Restore stock for cancelled order items
 * This function is called when an order item is voided/cancelled
 */
export async function restoreStockForOrder(
  orderItems: Array<{ product_id: string; quantity: number }>
): Promise<StockRestorationResult> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const restorationDetails: Array<{
      ingredientId: string;
      ingredientName: string;
      previousStock: number;
      quantityRestored: number;
      newStock: number;
    }> = [];
    
    await db.transaction('rw', db.ingredients, db.recipes, db.products, async () => {
      for (const orderItem of orderItems) {
        // Get recipes for this product
        const recipes = await db.recipes
          .where('menu_item_id')
          .equals(orderItem.product_id)
          .toArray();
        
        for (const recipe of recipes) {
          const ingredient = await db.ingredients.get(recipe.ingredient_id);
          
          if (!ingredient) {
            console.warn(`Ingredient ${recipe.ingredient_id} not found for recipe`);
            continue;
          }
          
          const previousStock = ingredient.current_stock;
          const quantityRestored = recipe.quantity_required * orderItem.quantity;
          const newStock = previousStock + quantityRestored;
          
          // Update ingredient stock within transaction
          await db.ingredients.update(recipe.ingredient_id, {
            current_stock: newStock,
            updated_at: new Date().toISOString(),
          });
          
          restorationDetails.push({
            ingredientId: ingredient.id || '',
            ingredientName: ingredient.name,
            previousStock,
            quantityRestored,
            newStock,
          });
          
          console.log(`Restored ${ingredient.name} from ${previousStock} to ${newStock} (${quantityRestored} restored)`);
        }
      }
    });
    
    return {
      success: true,
      message: `Stock restored for ${restorationDetails.length} ingredients`,
      details: restorationDetails,
    };
  } catch (error) {
    console.error('Failed to restore stock:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to restore stock',
    };
  }
}

/**
 * Get all ingredients with their current stock status
 * Returns ingredients with color indicators based on min_stock threshold
 */
export async function getIngredientsWithStatus(): Promise<
  Array<Ingredient & { status: 'ok' | 'warning' | 'critical'; supplier_name?: string }>
> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const ingredients = await db.ingredients.toArray();
    const suppliers = await db.suppliers.toArray();
    
    return ingredients.map((ingredient) => {
      const ratio = ingredient.current_stock / ingredient.min_stock;
      let status: 'ok' | 'warning' | 'critical' = 'ok';
      
      if (ratio <= 0) {
        status = 'critical';
      } else if (ratio <= 1) {
        status = 'warning';
      }
      
      const supplier = suppliers.find(s => s.id === ingredient.supplier_id);
      
      return {
        ...ingredient,
        status,
        supplier_name: supplier?.name,
      };
    });
  } catch (error) {
    console.error('Failed to get ingredients:', error);
    return [];
  }
}

/**
 * Add a new ingredient to the inventory
 */
export async function addIngredient(
  ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db.ingredients.add({
      ...ingredient,
      id,
      created_at: now,
      updated_at: now,
    });
    
    return id;
  } catch (error) {
    console.error('Failed to add ingredient:', error);
    throw error;
  }
}

/**
 * Update an ingredient's stock
 */
export async function updateIngredientStock(
  ingredientId: string,
  newStock: number
): Promise<void> {
  try {
    const { db } = await import('@/src/lib/db');
    
    await db.ingredients.update(ingredientId, {
      current_stock: newStock,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update ingredient stock:', error);
    throw error;
  }
}

/**
 * Add or update a recipe (BOM) for a menu item
 */
export async function upsertRecipe(
  recipe: Omit<Recipe, 'id' | 'created_at'>
): Promise<string> {
  try {
    const { db } = await import('@/src/lib/db');
    
    // Check if recipe already exists for this menu item and ingredient
    const existing = await db.recipes
      .where('menu_item_id')
      .equals(recipe.menu_item_id)
      .and(r => r.ingredient_id === recipe.ingredient_id)
      .first();
    
    if (existing) {
      // Update existing recipe
      await db.recipes.update(existing.id!, {
        quantity_required: recipe.quantity_required,
        unit: recipe.unit,
      });
      return existing.id!;
    } else {
      // Add new recipe
      const id = crypto.randomUUID();
      await db.recipes.add({
        ...recipe,
        id,
        created_at: new Date().toISOString(),
      });
      return id;
    }
  } catch (error) {
    console.error('Failed to upsert recipe:', error);
    throw error;
  }
}

/**
 * Get all recipes for a specific menu item
 */
export async function getRecipesForMenuItem(
  menuItemId: string
): Promise<Array<Recipe & { ingredientName?: string }>> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const recipes = await db.recipes
      .where('menu_item_id')
      .equals(menuItemId)
      .toArray();
    
    // Fetch ingredient names
    const recipesWithNames = await Promise.all(
      recipes.map(async (recipe) => {
        const ingredient = await db.ingredients.get(recipe.ingredient_id);
        return {
          ...recipe,
          ingredientName: ingredient?.name || 'Unknown',
        };
      })
    );
    
    return recipesWithNames;
  } catch (error) {
    console.error('Failed to get recipes:', error);
    return [];
  }
}

/**
 * Calculate available stock for a menu item based on recipe mapping
 * Returns the limiting ingredient's stock (minimum of all ingredient stocks divided by required quantity)
 * Returns null if no recipe exists (unlimited stock)
 * 
 * @param productId - The menu item/product ID
 * @returns Promise with stock count (number) or null (unlimited)
 */
export async function calculateMenuStock(productId: string): Promise<number | null> {
  try {
    const { db } = await import('@/src/lib/db');
    
    // Get all recipes for this menu item
    const recipes = await db.recipes
      .where('menu_item_id')
      .equals(productId)
      .toArray();
    
    // If no recipe exists, stock is unlimited
    if (recipes.length === 0) {
      return null;
    }
    
    let minStock = Infinity;
    
    // Calculate stock based on each ingredient
    for (const recipe of recipes) {
      const ingredient = await db.ingredients.get(recipe.ingredient_id);
      
      if (!ingredient) {
        console.error(`Ingredient ${recipe.ingredient_id} not found`);
        continue;
      }
      
      // Calculate how many portions can be made from this ingredient
      const portionsFromIngredient = Math.floor(
        ingredient.current_stock / recipe.quantity_required
      );
      
      // Track the limiting ingredient
      if (portionsFromIngredient < minStock) {
        minStock = portionsFromIngredient;
      }
    }
    
    // If all ingredients were missing, return 0
    if (minStock === Infinity) {
      return 0;
    }
    
    return minStock;
  } catch (error) {
    console.error('Failed to calculate menu stock:', error);
    return null;
  }
}

/**
 * Calculate stock for multiple menu items at once
 * More efficient than calling calculateMenuStock for each item individually
 * 
 * @param productIds - Array of product IDs
 * @returns Promise with map of productId -> stock count (number) or null (unlimited)
 */
export async function calculateMenuStocks(
  productIds: string[]
): Promise<Map<string, number | null>> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const stockMap = new Map<string, number | null>();
    
    console.log('🔍 [calculateMenuStocks] Calculating stocks for products:', productIds);
    
    // Get all recipes for all products at once
    const allRecipes = await db.recipes
      .where('menu_item_id')
      .anyOf(productIds)
      .toArray();
    
    console.log('🔍 [calculateMenuStocks] Found recipes:', allRecipes.length, 'total recipes');
    
    // Group recipes by menu_item_id
    const recipesByProduct = new Map<string, typeof allRecipes>();
    for (const recipe of allRecipes) {
      if (!recipesByProduct.has(recipe.menu_item_id)) {
        recipesByProduct.set(recipe.menu_item_id, []);
      }
      recipesByProduct.get(recipe.menu_item_id)!.push(recipe);
    }
    
    console.log('🔍 [calculateMenuStocks] Recipes grouped by product:', 
      Array.from(recipesByProduct.entries()).map(([pid, recipes]) => ({
        productId: pid,
        recipeCount: recipes.length
      }))
    );
    
    // Calculate stock for each product
    for (const productId of productIds) {
      const recipes = recipesByProduct.get(productId) || [];

      console.log(`🔍 [calculateMenuStocks] Product ${productId}: ${recipes.length} recipes`);

      // Get product stock_quantity as well
      const product = await db.products.get(productId);
      const productStock = (product && product.stock_quantity !== null && product.stock_quantity !== undefined) ? product.stock_quantity : null;

      // If no recipe exists, use product stock_quantity
      if (recipes.length === 0) {
        if (productStock !== null) {
          stockMap.set(productId, productStock);
          console.log(`🔍 [calculateMenuStocks] Product ${productId}: No recipes -> using product stock_quantity = ${productStock}`);
        } else {
          stockMap.set(productId, null);
          console.log(`🔍 [calculateMenuStocks] Product ${productId}: No recipes and no stock_quantity -> unlimited`);
        }
        continue;
      }

      let minStock = Infinity;
      let validIngredientsCount = 0;

      for (const recipe of recipes) {
        const ingredient = await db.ingredients.get(recipe.ingredient_id);

        if (!ingredient) {
          console.warn(`⚠️ Ingredient ${recipe.ingredient_id} not found for product ${productId}, skipping`);
          continue;
        }

        // Check if ingredient has valid stock data
        if (ingredient.current_stock === null || ingredient.current_stock === undefined) {
          console.warn(`⚠️ Ingredient ${ingredient.name} has invalid stock data for product ${productId}, skipping`);
          continue;
        }

        validIngredientsCount++;

        // Calculate how many portions can be made from this ingredient
        const portionsFromIngredient = Math.floor(ingredient.current_stock / recipe.quantity_required);

        console.log(`🔍 [calculateMenuStocks] Product ${productId}, Ingredient ${ingredient.name}: ` +
          `stock=${ingredient.current_stock}, required=${recipe.quantity_required}, portions=${portionsFromIngredient}`);

        if (portionsFromIngredient < minStock) {
          minStock = portionsFromIngredient;
        }
      }

      // If no valid ingredients found, treat as unlimited (not out of stock)
      if (validIngredientsCount === 0) {
        stockMap.set(productId, null);
        console.log(`🔍 [calculateMenuStocks] Product ${productId}: No valid ingredients -> unlimited`);
      } else if (minStock === Infinity) {
        stockMap.set(productId, null);
        console.log(`🔍 [calculateMenuStocks] Product ${productId}: Calculation error -> unlimited`);
      } else {
        // Take the minimum of ingredient-based stock and product stock_quantity
        // This ensures both constraints are respected
        const finalStock = productStock !== null ? Math.min(minStock, productStock) : minStock;
        stockMap.set(productId, finalStock);
        console.log(`🔍 [calculateMenuStocks] Product ${productId}: Ingredient stock = ${minStock}, Product stock = ${productStock}, Final = ${finalStock}`);
      }
    }
    
    console.log('🔍 [calculateMenuStocks] Final stock map:', Array.from(stockMap.entries()));
    return stockMap;
  } catch (error) {
    console.error('❌ Failed to calculate menu stocks:', error);
    // Return unlimited for all on error (safer than showing everything as out of stock)
    const stockMap = new Map<string, number | null>();
    for (const productId of productIds) {
      stockMap.set(productId, null);
    }
    return stockMap;
  }
}

/**
 * Debug helper function to check database state
 * Can be called from browser console to diagnose stock calculation issues
 * Usage: await debugStockDatabase()
 */
export async function debugStockDatabase() {
  try {
    const { db } = await import('@/src/lib/db');
    
    console.log('=== STOCK DATABASE DEBUG ===');
    
    // Check ingredients
    const ingredients = await db.ingredients.toArray();
    console.log(`📦 Ingredients count: ${ingredients.length}`);
    console.log('Ingredients:', ingredients.map(i => ({
      id: i.id,
      name: i.name,
      current_stock: i.current_stock,
      unit: i.unit,
      min_stock: i.min_stock
    })));
    
    // Check recipes
    const recipes = await db.recipes.toArray();
    console.log(`📋 Recipes count: ${recipes.length}`);
    console.log('Recipes:', recipes.map(r => ({
      id: r.id,
      menu_item_id: r.menu_item_id,
      ingredient_id: r.ingredient_id,
      quantity_required: r.quantity_required
    })));
    
    // Check products
    const products = await db.products.toArray();
    console.log(`🍔 Products count: ${products.length}`);
    console.log('Products:', products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price
    })));
    
    // Check recipe-ingredient relationships
    console.log('\n=== RECIPE-INGREDIENT RELATIONSHIPS ===');
    for (const recipe of recipes) {
      const ingredient = await db.ingredients.get(recipe.ingredient_id);
      const product = await db.products.get(recipe.menu_item_id);
      console.log(`Recipe: ${product?.name || 'Unknown'} requires ${ingredient?.name || 'Unknown'}: ${recipe.quantity_required} ${ingredient?.unit || ''}`);
    }
    
    return {
      ingredientsCount: ingredients.length,
      recipesCount: recipes.length,
      productsCount: products.length,
      ingredients: ingredients,
      recipes: recipes,
      products: products
    };
  } catch (error) {
    console.error('❌ Debug function failed:', error);
    throw error;
  }
}

/**
 * Seed sample ingredients and recipes for testing stock calculation
 * This function creates sample data if the database is empty
 */
export async function seedSampleInventoryData() {
  try {
    const { db } = await import('@/src/lib/db');
    
    console.log('🌱 Seeding sample inventory data...');
    
    // Check if data already exists
    const existingIngredients = await db.ingredients.count();
    const existingRecipes = await db.recipes.count();
    
    if (existingIngredients > 0 && existingRecipes > 0) {
      console.log('✅ Inventory data already exists, skipping seeding');
      return;
    }
    
    // Get existing products
    const products = await db.products.toArray();
    console.log(`🔍 Found ${products.length} products in database`);
    
    if (products.length === 0) {
      console.log('⚠️ No products found. Please seed products first.');
      return;
    }
    
    // Log product IDs for debugging
    console.log('🔍 Product IDs:', products.map(p => ({ id: p.id, name: p.name })));
    
    // Seed comprehensive ingredients for all 51 menu items from recipeData.ts
    const ingredients = comprehensiveIngredients.map(ing => ({
      id: crypto.randomUUID(),
      ...ing,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    console.log('🔍 Ingredient IDs:', ingredients.map(i => ({ id: i.id, name: i.name })));
    
    if (existingIngredients === 0) {
      await db.ingredients.bulkAdd(ingredients);
      console.log(`✅ Added ${ingredients.length} ingredients`);
    }
    
    // Create ingredient map for easy lookup
    const ingredientMap = new Map(ingredients.map(i => [i.name, i.id]));
    
    // Seed Recipes for ALL products with appropriate ingredients using recipeData.ts function
    const recipes = [];
    const productsToSeed = products; // ALL products
    
    console.log(`🔍 Seeding recipes for ${productsToSeed.length} products`);
    
    for (const product of productsToSeed) {
      if (!product.id) {
        console.warn('⚠️ Product missing ID, skipping recipe creation');
        continue;
      }
      
      const productName = product.name.toLowerCase();
      console.log(`🔍 Creating recipes for product: ${product.name} (ID: ${product.id})`);
      
      // Use recipeData.ts function to create recipes based on product name
      const productRecipes = createRecipesForProduct(product, ingredientMap);
      
      // Add complete recipe objects with IDs and timestamps
      for (const recipe of productRecipes) {
        recipes.push({
          id: crypto.randomUUID(),
          menu_item_id: product.id,
          ingredient_id: recipe.ingredient_id,
          quantity_required: recipe.quantity_required,
          created_at: new Date().toISOString(),
        });
      }
    }
    
    console.log(`🔍 Created ${recipes.length} recipe records`);
    console.log('🔍 Recipe mappings:', recipes.map(r => ({
      menu_item_id: r.menu_item_id,
      ingredient_id: r.ingredient_id,
      quantity_required: r.quantity_required
    })));
    
    if (existingRecipes === 0) {
      await db.recipes.bulkAdd(recipes);
      console.log(`✅ Added ${recipes.length} recipes for ${productsToSeed.length} products`);
    }
    
    console.log('🎉 Sample inventory data seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - Ingredients: ${ingredients.length}`);
    console.log(`   - Recipes: ${recipes.length}`);
    console.log(`   - Products with recipes: ${productsToSeed.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding sample inventory data:', error);
    throw error;
  }
}

/**
 * Get all product names from database
 * Useful for debugging and inventory management
 */
export async function getAllProductNames(): Promise<string[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const products = await db.products.toArray();
    const productNames = products.map(p => p.name);
    console.log('📋 All Product Names in Database:');
    console.log('=================================');
    productNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name}`);
    });
    console.log('=================================');
    console.log(`Total: ${productNames.length} products`);
    return productNames;
  } catch (error) {
    console.error('❌ Error getting product names:', error);
    return [];
  }
}

/**
 * Force re-seed inventory data - clears existing data and recreates it
 * Use this for debugging when data exists but is incorrect
 */
export async function forceReseedInventoryData() {
  try {
    const { db } = await import('@/src/lib/db');
    
    console.log('🔄 Force re-seeding inventory data...');
    
    // Clear existing inventory data
    await db.ingredients.clear();
    await db.recipes.clear();
    console.log('✅ Cleared existing ingredients and recipes');
    
    // Get existing products
    const products = await db.products.toArray();
    console.log(`🔍 Found ${products.length} products in database`);
    
    if (products.length === 0) {
      console.log('⚠️ No products found. Please seed products first.');
      return;
    }
    
    // Log product IDs for debugging
    console.log('🔍 Product IDs:', products.map(p => ({ id: p.id, name: p.name })));
    
    // Seed comprehensive ingredients for all 51 menu items from recipeData.ts
    const ingredients = comprehensiveIngredients.map(ing => ({
      id: crypto.randomUUID(),
      ...ing,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    
    console.log('🔍 Ingredient IDs:', ingredients.map(i => ({ id: i.id, name: i.name })));
    
    await db.ingredients.bulkAdd(ingredients);
    console.log(`✅ Added ${ingredients.length} ingredients`);
    
    // Create ingredient map for easy lookup
    const ingredientMap = new Map(ingredients.map(i => [i.name, i.id]));
    
    // Seed Recipes for ALL products with appropriate ingredients using recipeData.ts function
    const recipes = [];
    const productsToSeed = products; // ALL products
    
    console.log(`🔍 Seeding recipes for ${productsToSeed.length} products`);
    
    for (const product of productsToSeed) {
      if (!product.id) {
        console.warn('⚠️ Product missing ID, skipping recipe creation');
        continue;
      }
      
      const productName = product.name.toLowerCase();
      console.log(`🔍 Creating recipes for product: ${product.name} (ID: ${product.id})`);
      
      // Use recipeData.ts function to create recipes based on product name
      const productRecipes = createRecipesForProduct(product, ingredientMap);
      
      // Add complete recipe objects with IDs and timestamps
      for (const recipe of productRecipes) {
        recipes.push({
          id: crypto.randomUUID(),
          menu_item_id: product.id,
          ingredient_id: recipe.ingredient_id,
          quantity_required: recipe.quantity_required,
          created_at: new Date().toISOString(),
        });
      }
    }
    
    console.log(`🔍 Created ${recipes.length} recipe records`);
    console.log('🔍 Recipe mappings:', recipes.map(r => ({
      menu_item_id: r.menu_item_id,
      ingredient_id: r.ingredient_id,
      quantity_required: r.quantity_required
    })));
    
    await db.recipes.bulkAdd(recipes);
    console.log(`✅ Added ${recipes.length} recipes for ${productsToSeed.length} products`);
    
    console.log('🎉 Force re-seed completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Ingredients: ${ingredients.length}`);
    console.log(`   - Recipes: ${recipes.length}`);
    console.log(`   - Products with recipes: ${productsToSeed.length}`);
    
    return { success: true, message: 'Inventory data re-seeded successfully' };
    
  } catch (error) {
    console.error('❌ Error force re-seeding inventory data:', error);
    throw error;
  }
}

/**
 * Stock Request Service for managing stock addition approvals
 */

export interface CreateStockRequestParams {
  ingredient_id: string;
  ingredient_name: string;
  quantity_requested: number;
  unit: string;
  notes?: string;
  supplier_name?: string;
  proof_file?: string;
  proof_file_name?: string;
  requested_by: string;
  requested_by_name: string;
}

/**
 * Create a new stock request (pending approval)
 */
export async function createStockRequest(
  params: CreateStockRequestParams
): Promise<string> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db.stock_requests.add({
      id,
      ingredient_id: params.ingredient_id,
      ingredient_name: params.ingredient_name,
      quantity_requested: params.quantity_requested,
      unit: params.unit,
      notes: params.notes,
      supplier_name: params.supplier_name,
      proof_file: params.proof_file,
      proof_file_name: params.proof_file_name,
      status: 'pending',
      requested_by: params.requested_by,
      requested_by_name: params.requested_by_name,
      requested_at: now,
    });
    
    console.log(`✅ Stock request created: ${id} for ${params.ingredient_name}`);
    return id;
  } catch (error) {
    console.error('Failed to create stock request:', error);
    throw error;
  }
}

/**
 * Get all stock requests
 */
export async function getStockRequests(): Promise<StockRequest[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const requests = await db.stock_requests
      .orderBy('requested_at')
      .reverse()
      .toArray();
    return requests;
  } catch (error) {
    console.error('Failed to get stock requests:', error);
    return [];
  }
}

/**
 * Get stock requests by status
 */
export async function getStockRequestsByStatus(
  status: 'pending' | 'approved' | 'rejected'
): Promise<StockRequest[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const requests = await db.stock_requests
      .where('status')
      .equals(status)
      .toArray();
    // Sort by requested_at in descending order (newest first)
    return requests.sort((a, b) => 
      new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    );
  } catch (error) {
    console.error('Failed to get stock requests by status:', error);
    return [];
  }
}

/**
 * Approve a stock request and update ingredient stock
 */
export async function approveStockRequest(
  requestId: string,
  approvedBy: string,
  approvedByName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const request = await db.stock_requests.get(requestId);
    if (!request) {
      return { success: false, message: 'Stock request not found' };
    }
    
    if (request.status !== 'pending') {
      return { success: false, message: 'Stock request is not pending' };
    }
    
    const now = new Date().toISOString();
    
    // Use transaction to ensure atomicity
    await db.transaction('readwrite', [db.stock_requests, db.ingredients], async () => {
      // Update stock request status
      await db.stock_requests.update(requestId, {
        status: 'approved',
        approved_by: approvedBy,
        approved_by_name: approvedByName,
        approved_at: now,
      });
      
      // Update ingredient stock
      const ingredient = await db.ingredients.get(request.ingredient_id);
      if (ingredient) {
        const newStock = ingredient.current_stock + request.quantity_requested;
        await db.ingredients.update(request.ingredient_id, {
          current_stock: newStock,
          updated_at: now,
        });
        console.log(`✅ Updated ${ingredient.name} stock from ${ingredient.current_stock} to ${newStock}`);
      }
    });
    
    console.log(`✅ Stock request ${requestId} approved by ${approvedByName}`);
    return { success: true, message: 'Stock request approved successfully' };
  } catch (error) {
    console.error('Failed to approve stock request:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to approve stock request' };
  }
}

/**
 * Reject a stock request
 */
export async function rejectStockRequest(
  requestId: string,
  rejectedBy: string,
  rejectedByName: string,
  rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const request = await db.stock_requests.get(requestId);
    if (!request) {
      return { success: false, message: 'Stock request not found' };
    }
    
    if (request.status !== 'pending') {
      return { success: false, message: 'Stock request is not pending' };
    }
    
    const now = new Date().toISOString();
    
    await db.stock_requests.update(requestId, {
      status: 'rejected',
      rejected_by: rejectedBy,
      rejected_by_name: rejectedByName,
      rejection_reason: rejectionReason,
      rejected_at: now,
    });
    
    console.log(`✅ Stock request ${requestId} rejected by ${rejectedByName}`);
    return { success: true, message: 'Stock request rejected successfully' };
  } catch (error) {
    console.error('Failed to reject stock request:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to reject stock request' };
  }
}

/**
 * Stock Write-Off Service for managing damaged/lost stock
 */

export interface CreateStockWriteOffParams {
  ingredient_id: string;
  ingredient_name: string;
  quantity_written_off: number;
  unit: string;
  reason: string;
  notes?: string;
  proof_file: string;
  proof_file_name: string;
  requested_by: string;
  requested_by_name: string;
}

/**
 * Create a new stock write-off request (pending approval)
 */
export async function createStockWriteOff(
  params: CreateStockWriteOffParams
): Promise<string> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db.stock_write_offs.add({
      id,
      ingredient_id: params.ingredient_id,
      ingredient_name: params.ingredient_name,
      quantity_written_off: params.quantity_written_off,
      unit: params.unit,
      reason: params.reason,
      notes: params.notes,
      proof_file: params.proof_file,
      proof_file_name: params.proof_file_name,
      status: 'pending',
      requested_by: params.requested_by,
      requested_by_name: params.requested_by_name,
      requested_at: now,
    });
    
    console.log(`✅ Stock write-off created: ${id} for ${params.ingredient_name}`);
    return id;
  } catch (error) {
    console.error('Failed to create stock write-off:', error);
    throw error;
  }
}

/**
 * Get all stock write-offs
 */
export async function getStockWriteOffs(): Promise<StockWriteOff[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const writeOffs = await db.stock_write_offs.toArray();
    // Sort by requested_at in descending order (newest first)
    return writeOffs.sort((a, b) => 
      new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    );
  } catch (error) {
    console.error('Failed to get stock write-offs:', error);
    return [];
  }
}

/**
 * Get stock write-offs by status
 */
export async function getStockWriteOffsByStatus(
  status: 'pending' | 'approved' | 'rejected'
): Promise<StockWriteOff[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const writeOffs = await db.stock_write_offs
      .where('status')
      .equals(status)
      .toArray();
    // Sort by requested_at in descending order (newest first)
    return writeOffs.sort((a, b) => 
      new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    );
  } catch (error) {
    console.error('Failed to get stock write-offs by status:', error);
    return [];
  }
}

/**
 * Approve a stock write-off and reduce ingredient stock
 */
export async function approveStockWriteOff(
  writeOffId: string,
  approvedBy: string,
  approvedByName: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const writeOff = await db.stock_write_offs.get(writeOffId);
    if (!writeOff) {
      return { success: false, message: 'Stock write-off not found' };
    }
    
    if (writeOff.status !== 'pending') {
      return { success: false, message: 'Stock write-off is not pending' };
    }
    
    const now = new Date().toISOString();
    
    // Use transaction to ensure atomicity
    await db.transaction('readwrite', [db.stock_write_offs, db.ingredients], async () => {
      // Update write-off status
      await db.stock_write_offs.update(writeOffId, {
        status: 'approved',
        approved_by: approvedBy,
        approved_by_name: approvedByName,
        approved_at: now,
      });
      
      // Update ingredient stock (reduce it)
      const ingredient = await db.ingredients.get(writeOff.ingredient_id);
      if (ingredient) {
        const newStock = Math.max(0, ingredient.current_stock - writeOff.quantity_written_off);
        await db.ingredients.update(writeOff.ingredient_id, {
          current_stock: newStock,
          updated_at: now,
        });
        console.log(`✅ Updated ${ingredient.name} stock from ${ingredient.current_stock} to ${newStock} (write-off)`);
      }
    });
    
    console.log(`✅ Stock write-off ${writeOffId} approved by ${approvedByName}`);
    return { success: true, message: 'Stock write-off approved successfully' };
  } catch (error) {
    console.error('Failed to approve stock write-off:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to approve stock write-off' };
  }
}

/**
 * Reject a stock write-off
 */
export async function rejectStockWriteOff(
  writeOffId: string,
  rejectedBy: string,
  rejectedByName: string,
  rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const writeOff = await db.stock_write_offs.get(writeOffId);
    if (!writeOff) {
      return { success: false, message: 'Stock write-off not found' };
    }
    
    if (writeOff.status !== 'pending') {
      return { success: false, message: 'Stock write-off is not pending' };
    }
    
    const now = new Date().toISOString();
    
    await db.stock_write_offs.update(writeOffId, {
      status: 'rejected',
      rejected_by: rejectedBy,
      rejected_by_name: rejectedByName,
      rejection_reason: rejectionReason,
      rejected_at: now,
    });
    
    console.log(`✅ Stock write-off ${writeOffId} rejected by ${rejectedByName}`);
    return { success: true, message: 'Stock write-off rejected successfully' };
  } catch (error) {
    console.error('Failed to reject stock write-off:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to reject stock write-off' };
  }
}

/**
 * Inventory Automation Service for managing minimum stock rules and auto-restock
 */

/**
 * Update minimum stock threshold for an ingredient
 */
export async function updateIngredientMinStock(
  ingredientId: string,
  minStock: number
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    await db.ingredients.update(ingredientId, {
      min_stock: minStock,
      updated_at: new Date().toISOString(),
    });
    
    console.log(`✅ Updated min stock for ingredient ${ingredientId} to ${minStock}`);
    return { success: true, message: 'Minimum stock updated successfully' };
  } catch (error) {
    console.error('Failed to update minimum stock:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to update minimum stock' };
  }
}

/**
 * Update supplier for an ingredient
 */
export async function updateIngredientSupplier(
  ingredientId: string,
  supplierId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    await db.ingredients.update(ingredientId, {
      supplier_id: supplierId,
      updated_at: new Date().toISOString(),
    });
    
    console.log(`✅ Updated supplier for ingredient ${ingredientId} to ${supplierId}`);
    return { success: true, message: 'Supplier updated successfully' };
  } catch (error) {
    console.error('Failed to update supplier:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to update supplier' };
  }
}

/**
 * Get ingredients below minimum stock threshold
 */
export async function getIngredientsBelowMinStock(): Promise<
  Array<Ingredient & { shortage: number }>
> {
  try {
    const { db } = await import('@/src/lib/db');
    const ingredients = await db.ingredients.toArray();
    
    return ingredients
      .filter(ing => ing.current_stock < ing.min_stock)
      .map(ing => ({
        ...ing,
        shortage: ing.min_stock - ing.current_stock,
      }));
  } catch (error) {
    console.error('Failed to get ingredients below min stock:', error);
    return [];
  }
}

/**
 * Get purchase data aggregated by period (daily)
 */
export async function getPurchaseDataByPeriod(days: number): Promise<
  Array<{ date: string; total: number }>
> {
  try {
    const { db } = await import('@/src/lib/db');
    const stockRequests = await db.stock_requests
      .where('status')
      .equals('approved')
      .toArray();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const filteredRequests = stockRequests.filter((request: any) => 
      new Date(request.requested_at) >= cutoffDate
    );
    
    const groupedData = new Map<string, number>();
    
    filteredRequests.forEach((request: any) => {
      const date = new Date(request.requested_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const currentTotal = groupedData.get(date) || 0;
      // Estimate purchase cost: quantity * unit_price (if available)
      // For now, we'll use quantity as a proxy since unit_price isn't in StockRequest
      groupedData.set(date, currentTotal + request.quantity_requested);
    });
    
    return Array.from(groupedData.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Failed to get purchase data:', error);
    return [];
  }
}


/**
 * Calculate recipe cost (HPP - Harga Pokok Penjualan) for a product
 * Based on ingredient quantities and unit prices
 * 
 * @param productId - The menu item/product ID
 * @returns Promise with recipe cost (number) or 0 if no recipe exists
 */
export async function calculateRecipeCost(productId: string): Promise<number> {
  try {
    const { db } = await import('@/src/lib/db');
    
    // Get all recipes for this menu item
    const recipes = await db.recipes
      .where('menu_item_id')
      .equals(productId)
      .toArray();
    
    // If no recipe exists, cost is 0
    if (recipes.length === 0) {
      return 0;
    }
    
    let totalCost = 0;
    
    // Calculate cost based on each ingredient
    for (const recipe of recipes) {
      const ingredient = await db.ingredients.get(recipe.ingredient_id);
      
      if (!ingredient) {
        console.error(`Ingredient ${recipe.ingredient_id} not found`);
        continue;
      }
      
      // Cost = quantity_required * unit_price
      const ingredientCost = recipe.quantity_required * (ingredient.unit_price || 0);
      totalCost += ingredientCost;
    }
    
    return totalCost;
  } catch (error) {
    console.error('Failed to calculate recipe cost:', error);
    return 0;
  }
}

/**
 * Calculate product profitability analysis
 * Returns HPP, tax, service charge, and net profit margin
 * 
 * @param productId - The menu item/product ID
 * @param sellingPrice - The selling price of the product
 * @param taxRate - Tax rate percentage (e.g., 10 for 10%)
 * @param serviceChargeRate - Service charge rate percentage (e.g., 5 for 5%)
 * @returns Promise with profitability analysis
 */
export async function calculateProductProfitability(
  productId: string,
  sellingPrice: number,
  taxRate: number,
  serviceChargeRate: number
): Promise<{
  hpp: number;
  taxAmount: number;
  serviceChargeAmount: number;
  netSales: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
}> {
  try {
    const hpp = await calculateRecipeCost(productId);
    
    // Using reverse calculation for tax-included system
    // finalPrice = netSales + tax + serviceCharge
    // where tax = netSales * taxRate and serviceCharge = netSales * serviceChargeRate
    // netSales = finalPrice / (1 + taxRate + serviceChargeRate)
    
    const taxRateDecimal = taxRate / 100;
    const serviceChargeRateDecimal = serviceChargeRate / 100;
    const divisor = 1 + taxRateDecimal + serviceChargeRateDecimal;
    
    const netSales = sellingPrice / divisor;
    const taxAmount = netSales * taxRateDecimal;
    const serviceChargeAmount = netSales * serviceChargeRateDecimal;
    
    // Gross profit = netSales - HPP
    const grossProfit = netSales - hpp;
    
    // Net profit = grossProfit - tax - serviceCharge
    const netProfit = grossProfit - taxAmount - serviceChargeAmount;
    
    // Margins
    const grossMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;
    const netMargin = netSales > 0 ? (netProfit / netSales) * 100 : 0;
    
    return {
      hpp,
      taxAmount,
      serviceChargeAmount,
      netSales,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
    };
  } catch (error) {
    console.error('Failed to calculate product profitability:', error);
    return {
      hpp: 0,
      taxAmount: 0,
      serviceChargeAmount: 0,
      netSales: 0,
      grossProfit: 0,
      netProfit: 0,
      grossMargin: 0,
      netMargin: 0,
    };
  }
}


/**
 * Deduct ingredient stock for a manufactured product
 * Called when a product with bom_type='manufacture' is ordered
 * 
 * @param productId - The menu item/product ID
 * @param quantity - The quantity ordered
 * @returns Promise with success status
 */
export async function deductManufactureStock(productId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    // Get all recipes for this product
    const recipes = await db.recipes
      .where('menu_item_id')
      .equals(productId)
      .toArray();
    
    if (recipes.length === 0) {
      return { success: true, message: 'No recipe found, skipping stock deduction' };
    }
    
    // Check if all ingredients have sufficient stock
    for (const recipe of recipes) {
      const ingredient = await db.ingredients.get(recipe.ingredient_id);
      if (!ingredient) {
        return { success: false, message: `Ingredient ${recipe.ingredient_id} not found` };
      }
      
      const requiredQuantity = recipe.quantity_required * quantity;
      if (ingredient.current_stock < requiredQuantity) {
        return { 
          success: false, 
          message: `Insufficient stock for ${ingredient.name}: need ${requiredQuantity} ${recipe.unit}, have ${ingredient.current_stock} ${ingredient.unit}` 
        };
      }
    }
    
    // Deduct stock from all ingredients
    for (const recipe of recipes) {
      const ingredient = await db.ingredients.get(recipe.ingredient_id);
      if (!ingredient) continue;
      
      const requiredQuantity = recipe.quantity_required * quantity;
      await db.ingredients.update(recipe.ingredient_id, {
        current_stock: ingredient.current_stock - requiredQuantity,
        updated_at: new Date().toISOString(),
      });
    }
    
    return { success: true, message: 'Stock deducted successfully' };
  } catch (error) {
    console.error('Failed to deduct manufacture stock:', error);
    return { success: false, message: 'Failed to deduct stock' };
  }
}

/**
 * Deduct product stock for a kit product
 * Called when a product with bom_type='kit' is ordered
 * 
 * @param productId - The menu item/product ID (the kit)
 * @param quantity - The quantity ordered
 * @returns Promise with success status
 */
export async function deductKitStock(productId: string, quantity: number): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    // Get all kit components for this product
    const kitComponents = await db.kit_components
      .where('menu_item_id')
      .equals(productId)
      .toArray();
    
    if (kitComponents.length === 0) {
      return { success: true, message: 'No kit components found, skipping stock deduction' };
    }
    
    // Check if all component products have sufficient stock
    for (const component of kitComponents) {
      const product = await db.products.get(component.component_product_id);
      if (!product) {
        return { success: false, message: `Component product ${component.component_product_id} not found` };
      }
      
      const requiredQuantity = component.quantity_required * quantity;
      if (product.stock_quantity < requiredQuantity) {
        return { 
          success: false, 
          message: `Insufficient stock for ${product.name}: need ${requiredQuantity}, have ${product.stock_quantity}` 
        };
      }
    }
    
    // Deduct stock from all component products
    for (const component of kitComponents) {
      const product = await db.products.get(component.component_product_id);
      if (!product) continue;
      
      const requiredQuantity = component.quantity_required * quantity;
      await db.products.update(component.component_product_id, {
        stock_quantity: product.stock_quantity - requiredQuantity,
      });
    }
    
    return { success: true, message: 'Kit stock deducted successfully' };
  } catch (error) {
    console.error('Failed to deduct kit stock:', error);
    return { success: false, message: 'Failed to deduct kit stock' };
  }
}

/**
 * Check if a product can be ordered based on stock availability
 * Returns true if stock is sufficient, false otherwise
 * 
 * @param productId - The menu item/product ID
 * @param quantity - The quantity to check
 * @returns Promise with canOrder status and message
 */
export async function canOrderProduct(productId: string, quantity: number): Promise<{ canOrder: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const product = await db.products.get(productId);
    if (!product) {
      return { canOrder: false, message: 'Product not found' };
    }
    
    // Check based on bom_type
    if (product.bom_type === 'manufacture') {
      const recipes = await db.recipes
        .where('menu_item_id')
        .equals(productId)
        .toArray();
      
      for (const recipe of recipes) {
        const ingredient = await db.ingredients.get(recipe.ingredient_id);
        if (!ingredient) continue;
        
        const requiredQuantity = recipe.quantity_required * quantity;
        if (ingredient.current_stock < requiredQuantity) {
          return { 
            canOrder: false, 
            message: `Insufficient stock for ${ingredient.name}: need ${requiredQuantity} ${recipe.unit}, have ${ingredient.current_stock} ${ingredient.unit}` 
          };
        }
      }
    } else if (product.bom_type === 'kit') {
      const kitComponents = await db.kit_components
        .where('menu_item_id')
        .equals(productId)
        .toArray();
      
      for (const component of kitComponents) {
        const componentProduct = await db.products.get(component.component_product_id);
        if (!componentProduct) continue;
        
        const requiredQuantity = component.quantity_required * quantity;
        if (componentProduct.stock_quantity < requiredQuantity) {
          return { 
            canOrder: false, 
            message: `Insufficient stock for ${componentProduct.name}: need ${requiredQuantity}, have ${componentProduct.stock_quantity}` 
          };
        }
      }
    } else {
      // Default: check product stock_quantity
      if (product.stock_quantity < quantity) {
        return { 
          canOrder: false, 
          message: `Insufficient stock: need ${quantity}, have ${product.stock_quantity}` 
        };
      }
    }
    
    return { canOrder: true, message: 'Stock available' };
  } catch (error) {
    console.error('Failed to check product stock:', error);
    return { canOrder: false, message: 'Failed to check stock' };
  }
}


/**
 * Save recipe history before making changes
 * This creates an audit trail for rollback functionality
 * 
 * @param menuItemId - The product ID
 * @param changedBy - User ID making the change
 * @param changedByName - User name for display
 * @param changeReason - Optional reason for the change
 */
export async function saveRecipeHistory(
  menuItemId: string,
  menuItemName: string,
  changedBy: string,
  changedByName: string,
  changeReason?: string
): Promise<void> {
  try {
    const { db } = await import('@/src/lib/db');
    
    // Get current product data
    const product = await db.products.get(menuItemId);
    if (!product) return;
    
    // Get current recipes
    const recipes = await db.recipes
      .where('menu_item_id')
      .equals(menuItemId)
      .toArray();
    
    // Get current kit components
    const kitComponents = await db.kit_components
      .where('menu_item_id')
      .equals(menuItemId)
      .toArray();
    
    // Create history record
    const historyId = crypto.randomUUID();
    await db.recipe_history.add({
      id: historyId,
      menu_item_id: menuItemId,
      menu_item_name: menuItemName,
      bom_type: product.bom_type || 'manufacture',
      recipes: recipes,
      kit_components: kitComponents,
      subcontracting_info: product.subcontracting_info,
      changed_by: changedBy,
      changed_by_name: changedByName,
      change_reason: changeReason,
      created_at: new Date().toISOString(),
    });
    
    console.log(`✅ Recipe history saved for ${menuItemName}`);
  } catch (error) {
    console.error('Failed to save recipe history:', error);
  }
}

/**
 * Get recipe history for a specific menu item
 * 
 * @param menuItemId - The product ID
 * @returns Array of history records sorted by date (newest first)
 */
export async function getRecipeHistory(menuItemId: string): Promise<any[]> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const history = await db.recipe_history
      .where('menu_item_id')
      .equals(menuItemId)
      .reverse()
      .sortBy('created_at');
    
    return history;
  } catch (error) {
    console.error('Failed to get recipe history:', error);
    return [];
  }
}

/**
 * Restore recipe from a specific history record
 * This rolls back the recipe to a previous state
 * 
 * @param historyId - The history record ID to restore from
 * @returns Promise with success status
 */
export async function restoreRecipeFromHistory(historyId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    // Get the history record
    const history = await db.recipe_history.get(historyId);
    if (!history) {
      return { success: false, message: 'History record not found' };
    }
    
    // Get the product
    const product = await db.products.get(history.menu_item_id);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }
    
    // Save current state as history before restoring (for undo capability)
    await saveRecipeHistory(
      history.menu_item_id,
      history.menu_item_name,
      'system',
      'System',
      `Auto-saved before restore from ${new Date(history.created_at).toLocaleString()}`
    );
    
    // Delete existing recipes
    await db.recipes
      .where('menu_item_id')
      .equals(history.menu_item_id)
      .delete();
    
    // Delete existing kit components
    await db.kit_components
      .where('menu_item_id')
      .equals(history.menu_item_id)
      .delete();
    
    // Restore recipes
    for (const recipe of history.recipes) {
      const id = crypto.randomUUID();
      await db.recipes.add({
        id,
        menu_item_id: history.menu_item_id,
        ingredient_id: recipe.ingredient_id,
        quantity_required: recipe.quantity_required,
        unit: recipe.unit,
        created_at: new Date().toISOString(),
      });
    }
    
    // Restore kit components
    for (const component of history.kit_components) {
      const id = crypto.randomUUID();
      await db.kit_components.add({
        id,
        menu_item_id: history.menu_item_id,
        component_product_id: component.component_product_id,
        quantity_required: component.quantity_required,
        created_at: new Date().toISOString(),
      });
    }
    
    // Restore bom_type and subcontracting_info
    await db.products.update(history.menu_item_id, {
      bom_type: history.bom_type,
      subcontracting_info: history.subcontracting_info,
    });
    
    console.log(`✅ Recipe restored from history for ${history.menu_item_name}`);
    return { success: true, message: `Recipe restored from ${new Date(history.created_at).toLocaleString()}` };
  } catch (error) {
    console.error('Failed to restore recipe from history:', error);
    return { success: false, message: 'Failed to restore recipe' };
  }
}

/**
 * Get the latest history record for a menu item
 * 
 * @param menuItemId - The product ID
 * @returns The latest history record or null
 */
export async function getLatestRecipeHistory(menuItemId: string): Promise<any | null> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const history = await db.recipe_history
      .where('menu_item_id')
      .equals(menuItemId)
      .reverse()
      .sortBy('created_at');
    
    return history.length > 0 ? history[0] : null;
  } catch (error) {
    console.error('Failed to get latest recipe history:', error);
    return null;
  }
}


/**
 * Create Affogato product with recipe
 * This function creates the Affogato product and adds its recipe components
 */
export async function createAffogatoRecipe(): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    // Check if Affogato product already exists
    const existingProduct = await db.products
      .where('name')
      .equals('Affogato')
      .first();
    
    let productId: string;
    
    if (existingProduct) {
      productId = existingProduct.id!;
      console.log('Affogato product already exists, updating recipe...');
    } else {
      // Create Affogato product
      productId = crypto.randomUUID();
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
      console.log('Affogato product created');
    }
    
    // Get ingredient IDs
    const bijiKopi = await db.ingredients.where('name').equals('Biji Kopi').first();
    const susu = await db.ingredients.where('name').equals('Susu').first();
    const esKrim = await db.ingredients.where('name').equals('Es Krim Vanila').first();
    
    if (!bijiKopi || !susu || !esKrim) {
      return { success: false, message: 'Required ingredients not found (Biji Kopi, Susu, Es Krim Vanila)' };
    }
    
    // Delete existing recipes for this product
    await db.recipes
      .where('menu_item_id')
      .equals(productId)
      .delete();
    
    // Add recipe components
    // Affogato: Biji Kopi (18 g), Susu (50 ml), Es Krim Vanila (50 g)
    await db.recipes.add({
      id: crypto.randomUUID(),
      menu_item_id: productId,
      ingredient_id: bijiKopi.id!,
      quantity_required: 0.018, // 18g
      unit: 'kg',
      created_at: new Date().toISOString(),
    });
    
    await db.recipes.add({
      id: crypto.randomUUID(),
      menu_item_id: productId,
      ingredient_id: susu.id!,
      quantity_required: 0.05, // 50ml
      unit: 'liter',
      created_at: new Date().toISOString(),
    });
    
    await db.recipes.add({
      id: crypto.randomUUID(),
      menu_item_id: productId,
      ingredient_id: esKrim.id!,
      quantity_required: 0.05, // 50g
      unit: 'kg',
      created_at: new Date().toISOString(),
    });
    
    // Update bom_type to manufacture
    await db.products.update(productId, { bom_type: 'manufacture' });
    
    console.log('✅ Affogato recipe created successfully');
    return { success: true, message: 'Affogato recipe created successfully' };
  } catch (error) {
    console.error('Failed to create Affogato recipe:', error);
    return { success: false, message: 'Failed to create Affogato recipe' };
  }
}


/**
 * Supplier Management Service
 */

/**
 * Add a new supplier
 */
export async function addSupplier(
  supplier: Omit<import('@/src/lib/db').Supplier, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db.suppliers.add({
      ...supplier,
      id,
      created_at: now,
      updated_at: now,
    });
    
    console.log(`✅ Supplier added: ${id} for ${supplier.name}`);
    return id;
  } catch (error) {
    console.error('Failed to add supplier:', error);
    throw error;
  }
}

/**
 * Get all suppliers
 */
export async function getSuppliers(): Promise<import('@/src/lib/db').Supplier[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const suppliers = await db.suppliers.toArray();
    return suppliers;
  } catch (error) {
    console.error('Failed to get suppliers:', error);
    return [];
  }
}

/**
 * Update a supplier
 */
export async function updateSupplier(
  supplierId: string,
  data: Partial<import('@/src/lib/db').Supplier>
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    await db.suppliers.update(supplierId, {
      ...data,
      updated_at: new Date().toISOString(),
    });
    
    console.log(`✅ Supplier updated: ${supplierId}`);
    return { success: true, message: 'Supplier updated successfully' };
  } catch (error) {
    console.error('Failed to update supplier:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to update supplier' };
  }
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(
  supplierId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { db } = await import('@/src/lib/db');
    
    await db.suppliers.delete(supplierId);
    
    console.log(`✅ Supplier deleted: ${supplierId}`);
    return { success: true, message: 'Supplier deleted successfully' };
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Failed to delete supplier' };
  }
}
