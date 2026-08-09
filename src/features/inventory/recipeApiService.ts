import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

export interface Ingredient {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
  min_stock: number;
  unit_price: number;
  supplier_id?: string;
  supplier?: {
    id: string;
    name: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  quantity_required: number;
  unit?: string;
  created_at: string;
  ingredient?: Ingredient;
}

export interface RecipeMapping {
  ingredient_id: string;
  quantity_required: number;
  unit: string;
}

// Get all ingredients with their current stock status
export async function getIngredientsWithStatus(): Promise<
  Array<Ingredient & { status: 'ok' | 'warning' | 'critical'; supplier_name?: string }>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredients`);
    if (!response.ok) throw new Error('Failed to fetch ingredients');
    
    const ingredients: Ingredient[] = await response.json();
    
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
        supplier_name: ingredient.supplier?.name,
      };
    });
  } catch (error) {
    console.error('Failed to get ingredients:', error);
    return [];
  }
}

// Get all recipes for a specific menu item
export async function getRecipesForMenuItem(
  menuItemId: string
): Promise<Array<Recipe & { ingredientName?: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/menu/${menuItemId}`);
    if (!response.ok) throw new Error('Failed to fetch recipes');
    
    const recipes: Recipe[] = await response.json();
    
    // The API already includes ingredient data, so we can map ingredient names
    return recipes.map((recipe) => ({
      ...recipe,
      ingredientName: recipe.ingredient?.name || 'Unknown',
    }));
  } catch (error) {
    console.error('Failed to get recipes:', error);
    return [];
  }
}

// Add or update a recipe (BOM) for a menu item
export async function upsertRecipe(
  recipe: Omit<Recipe, 'id' | 'created_at'>
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    
    if (!response.ok) throw new Error('Failed to upsert recipe');
    
    const createdRecipe: Recipe = await response.json();
    return createdRecipe.id;
  } catch (error) {
    console.error('Failed to upsert recipe:', error);
    throw error;
  }
}

// Delete all recipes for a menu item
export async function deleteRecipesForMenuItem(menuItemId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes/menu/${menuItemId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete recipes');
  } catch (error) {
    console.error('Failed to delete recipes:', error);
    throw error;
  }
}

// Calculate recipe cost for a product
export async function calculateRecipeCost(productId: string): Promise<number> {
  try {
    const recipes = await getRecipesForMenuItem(productId);
    let totalCost = 0;
    
    for (const recipe of recipes) {
      if (recipe.ingredient) {
        totalCost += recipe.ingredient.unit_price * recipe.quantity_required;
      }
    }
    
    return totalCost;
  } catch (error) {
    console.error('Failed to calculate recipe cost:', error);
    return 0;
  }
}

// Calculate product profitability
export async function calculateProductProfitability(
  productId: string,
  productPrice: number,
  taxRate: number = 0.1,
  serviceChargeRate: number = 0.05
): Promise<any> {
  try {
    const recipeCost = await calculateRecipeCost(productId);
    
    const taxAmount = productPrice * taxRate;
    const serviceChargeAmount = productPrice * serviceChargeRate;
    const totalPrice = productPrice + taxAmount + serviceChargeAmount;
    
    const grossProfit = totalPrice - recipeCost;
    const profitMargin = totalPrice > 0 ? (grossProfit / totalPrice) * 100 : 0;
    const netProfit = grossProfit - (taxAmount + serviceChargeAmount);
    const netMargin = productPrice > 0 ? (netProfit / productPrice) * 100 : 0;
    
    return {
      hpp: recipeCost,
      netSales: productPrice,
      taxAmount,
      serviceChargeAmount,
      totalPrice,
      grossProfit,
      netProfit,
      profitMargin,
      netMargin,
    };
  } catch (error) {
    console.error('Failed to calculate profitability:', error);
    return null;
  }
}

// Add a new ingredient
export async function addIngredient(
  ingredient: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>
): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/ingredients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(ingredient),
    });
    
    if (!response.ok) throw new Error('Failed to add ingredient');
    
    const createdIngredient: Ingredient = await response.json();
    return createdIngredient.id;
  } catch (error) {
    console.error('Failed to add ingredient:', error);
    throw error;
  }
}

// Create stock request
export async function createStockRequest(params: any): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/stock-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) throw new Error('Failed to create stock request');
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create stock request:', error);
    throw error;
  }
}

// Create stock write-off
export async function createStockWriteOff(params: any): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/stock-write-offs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) throw new Error('Failed to create stock write-off');
    
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create stock write-off:', error);
    throw error;
  }
}

// Get purchase data by period
export async function getPurchaseDataByPeriod(days: number): Promise<any[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/reports/purchases?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.warn('Purchase data endpoint not available, returning empty array');
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Failed to get purchase data (endpoint may not exist), returning empty array:', error);
    return [];
  }
}
