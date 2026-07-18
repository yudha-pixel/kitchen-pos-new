import { db, Recipe, Ingredient } from '@/src/lib/db';

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

/**
 * Reduce stock for ingredients based on order items
 * This function should be called when an order status changes to 'completed'
 * 
 * @param orderItems - Array of order items with product_id and quantity
 * @returns Promise with reduction result details
 */
export async function reduceStockForOrder(
  orderItems: Array<{ product_id: string; quantity: number }>
): Promise<StockReductionResult> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const reductionDetails: StockReductionResult['details'] = [];
    
    // Process each order item
    for (const orderItem of orderItems) {
      // Find all recipes (BOM) for this menu item
      const recipes = await db.recipes
        .where('menu_item_id')
        .equals(orderItem.product_id)
        .toArray();
      
      if (recipes.length === 0) {
        console.log(`No recipe found for product ${orderItem.product_id}`);
        continue;
      }
      
      // Reduce stock for each ingredient in the recipe
      for (const recipe of recipes) {
        const ingredient = await db.ingredients.get(recipe.ingredient_id);
        
        if (!ingredient) {
          console.error(`Ingredient ${recipe.ingredient_id} not found`);
          continue;
        }
        
        const previousStock = ingredient.current_stock;
        const quantityUsed = recipe.quantity_required * orderItem.quantity;
        const newStock = Math.max(0, previousStock - quantityUsed);
        
        // Update ingredient stock
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
 * Get all ingredients with their current stock status
 * Returns ingredients with color indicators based on min_stock threshold
 */
export async function getIngredientsWithStatus(): Promise<
  Array<Ingredient & { status: 'ok' | 'warning' | 'critical' }>
> {
  try {
    const { db } = await import('@/src/lib/db');
    
    const ingredients = await db.ingredients.toArray();
    
    return ingredients.map((ingredient) => {
      const ratio = ingredient.current_stock / ingredient.min_stock;
      let status: 'ok' | 'warning' | 'critical' = 'ok';
      
      if (ratio <= 0) {
        status = 'critical';
      } else if (ratio <= 1) {
        status = 'warning';
      }
      
      return {
        ...ingredient,
        status,
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
      .where('[menu_item_id+ingredient_id]')
      .equals([recipe.menu_item_id, recipe.ingredient_id])
      .first();
    
    if (existing) {
      // Update existing recipe
      await db.recipes.update(existing.id!, {
        quantity_required: recipe.quantity_required,
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
