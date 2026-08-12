import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { convertToSmallestUnit } from '@/src/features/inventory/unitConversion';

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
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/ingredients`, { headers });
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
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/recipes/menu/${menuItemId}`, { headers });
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
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers,
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
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/api/recipes/menu/${menuItemId}`, {
      method: 'DELETE',
      headers,
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
        // Use the unit from the recipe and price from the ingredient
        // The unit_price is stored in smallest unit (g, ml, pcs)
        // The quantity_required is in the recipe's unit
        // We need to convert quantity to smallest unit for accurate calculation
        const unit = recipe.unit || recipe.ingredient.unit;
        const pricePerSmallestUnit = recipe.ingredient.unit_price;
        
        // Convert quantity to smallest unit
        const converted = convertToSmallestUnit(recipe.quantity_required, unit);
        totalCost += converted.price * pricePerSmallestUnit;
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
    const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
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

// Sync recipe ingredients to inventory
export async function syncRecipeIngredientsToInventory(): Promise<{
  success: boolean;
  added: number;
  failed: number;
  message: string;
}> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // Get all inventory ingredients
    const ingredientsResponse = await fetch(`${API_BASE_URL}/api/ingredients`, { headers });
    if (!ingredientsResponse.ok) throw new Error('Failed to fetch ingredients');
    const inventoryIngredients = await ingredientsResponse.json();
    
    // Create a map of existing ingredient names (case-insensitive) for quick lookup
    const existingIngredientNames = new Set(
      inventoryIngredients.map((ing: any) => ing.name.toLowerCase())
    );
    
    // Get all recipes to identify unique ingredients used
    const recipesResponse = await fetch(`${API_BASE_URL}/api/recipes`, { headers });
    if (!recipesResponse.ok) throw new Error('Failed to fetch recipes');
    const allRecipes = await recipesResponse.json();
    
    // Collect unique ingredient names from recipes
    const recipeIngredientNames = new Set<string>();
    for (const recipe of allRecipes) {
      if (recipe.ingredient?.name) {
        recipeIngredientNames.add(recipe.ingredient.name.toLowerCase());
      }
    }
    
    // Also check for ingredients referenced by name in recipe data
    for (const recipe of allRecipes) {
      if (recipe.ingredient_name) {
        recipeIngredientNames.add(recipe.ingredient_name.toLowerCase());
      }
    }
    
    // Find ingredients in recipes that are missing from inventory (by name)
    const missingIngredientNames = [...recipeIngredientNames].filter(
      name => !existingIngredientNames.has(name)
    );
    
    if (missingIngredientNames.length === 0) {
      return {
        success: true,
        added: 0,
        failed: 0,
        message: 'Semua bahan resep sudah terdaftar di inventory',
      };
    }
    
    // Get details of missing ingredients from recipes to determine units and prices
    const missingIngredientsMap = new Map<string, { unit: string; unit_price: number }>();
    
    for (const recipe of allRecipes) {
      const ingredientName = recipe.ingredient?.name || recipe.ingredient_name;
      if (!ingredientName) continue;
      
      const normalizedName = ingredientName.toLowerCase();
      if (missingIngredientNames.includes(normalizedName) && !missingIngredientsMap.has(normalizedName)) {
        missingIngredientsMap.set(normalizedName, {
          unit: recipe.unit || recipe.ingredient?.unit || 'g',
          unit_price: recipe.ingredient?.unit_price || 0,
        });
      }
    }
    
    const missingIngredients = missingIngredientNames.map(name => {
      const details = missingIngredientsMap.get(name) || { unit: 'g', unit_price: 0 };
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        unit: details.unit,
        unit_price: details.unit_price,
      };
    });
    
    let successCount = 0;
    let failCount = 0;
    
    for (const ingredient of missingIngredients) {
      try {
        await addIngredient({
          name: ingredient.name,
          current_stock: 0,
          unit: ingredient.unit,
          min_stock: 100,
          unit_price: ingredient.unit_price,
        });
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to register ${ingredient.name}:`, error);
        failCount++;
      }
    }
    
    return {
      success: true,
      added: successCount,
      failed: failCount,
      message: `${successCount} bahan ditambahkan, ${failCount} gagal`,
    };
    
  } catch (error) {
    console.error('Sync failed:', error);
    return {
      success: false,
      added: 0,
      failed: 0,
      message: 'Gagal melakukan sinkronisasi',
    };
  }
}

// Check if sufficient stock is available for a product
export async function checkStockAvailability(productId: string, quantity: number = 1): Promise<{
  available: boolean;
  insufficientIngredients: Array<{ name: string; required: number; available: number; unit: string }>;
}> {
  try {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // Get recipes for the product
    const recipesResponse = await fetch(`${API_BASE_URL}/api/recipes/menu/${productId}`, { headers });
    if (!recipesResponse.ok) throw new Error('Failed to fetch recipes');
    const recipes: Recipe[] = await recipesResponse.json();
    
    // Get current inventory
    const ingredientsResponse = await fetch(`${API_BASE_URL}/api/ingredients`, { headers });
    if (!ingredientsResponse.ok) throw new Error('Failed to fetch ingredients');
    const ingredients: Ingredient[] = await ingredientsResponse.json();
    
    // Create a map of ingredient ID to current stock
    const stockMap = new Map<string, Ingredient>(ingredients.map((ingredient) => [ingredient.id, ingredient]));
    
    const insufficientIngredients: Array<{ name: string; required: number; available: number; unit: string }> = [];
    
    for (const recipe of recipes) {
      const ingredient = stockMap.get(recipe.ingredient_id);
      if (!ingredient) {
        insufficientIngredients.push({
          name: recipe.ingredient?.name || 'Unknown',
          required: recipe.quantity_required * quantity,
          available: 0,
          unit: recipe.unit || 'g',
        });
        continue;
      }
      
      const required = recipe.quantity_required * quantity;
      const available = ingredient.current_stock;
      
      if (available < required) {
        insufficientIngredients.push({
          name: ingredient.name,
          required,
          available,
          unit: recipe.unit || ingredient.unit,
        });
      }
    }
    
    return {
      available: insufficientIngredients.length === 0,
      insufficientIngredients,
    };
  } catch (error) {
    console.error('Failed to check stock availability:', error);
    return {
      available: false,
      insufficientIngredients: [],
    };
  }
}

// Deduct stock based on product recipe
export async function deductStockForSale(productId: string, quantity: number = 1): Promise<{
  success: boolean;
  deductedIngredients: Array<{ name: string; quantity: number; unit: string }>;
  failedIngredients: Array<{ name: string; error: string }>;
  message: string;
}> {
  console.log(`Deducting stock for product ${productId}, quantity: ${quantity}`);
  
  try {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // Get recipes for the product
    const recipesResponse = await fetch(`${API_BASE_URL}/api/recipes/menu/${productId}`, { headers });
    if (!recipesResponse.ok) throw new Error('Failed to fetch recipes');
    const recipes: Recipe[] = await recipesResponse.json();
    
    // Get current inventory
    const ingredientsResponse = await fetch(`${API_BASE_URL}/api/ingredients`, { headers });
    if (!ingredientsResponse.ok) throw new Error('Failed to fetch ingredients');
    const ingredients: Ingredient[] = await ingredientsResponse.json();
    
    // Create a map of ingredient ID to current stock
    const stockMap = new Map<string, Ingredient>(ingredients.map((ingredient) => [ingredient.id, ingredient]));
    
    const deductedIngredients: Array<{ name: string; quantity: number; unit: string }> = [];
    const failedIngredients: Array<{ name: string; error: string }> = [];
    
    for (const recipe of recipes) {
      const ingredient = stockMap.get(recipe.ingredient_id);
      if (!ingredient) {
        console.error(`Ingredient ${recipe.ingredient_id} not found in inventory`);
        failedIngredients.push({
          name: recipe.ingredient?.name || 'Unknown',
          error: 'Ingredient not found in inventory',
        });
        continue;
      }
      
      const required = recipe.quantity_required * quantity;
      const newStock = ingredient.current_stock - required;
      
      if (newStock < 0) {
        console.error(`Insufficient stock for ${ingredient.name}: required ${required}, available ${ingredient.current_stock}`);
        failedIngredients.push({
          name: ingredient.name,
          error: `Insufficient stock: required ${required}, available ${ingredient.current_stock}`,
        });
        continue;
      }
      
      try {
        // Update ingredient stock via API
        const updateResponse = await fetch(`${API_BASE_URL}/api/ingredients/${ingredient.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name: ingredient.name,
            current_stock: newStock,
            unit: ingredient.unit,
            min_stock: ingredient.min_stock,
            unit_price: ingredient.unit_price,
            supplier_id: ingredient.supplier_id,
          }),
        });
        
        if (!updateResponse.ok) {
          throw new Error('Failed to update ingredient stock');
        }
        
        console.log(`✅ Deducted ${required} ${ingredient.unit} from ${ingredient.name} (new stock: ${newStock})`);
        deductedIngredients.push({
          name: ingredient.name,
          quantity: required,
          unit: ingredient.unit,
        });
      } catch (error) {
        console.error(`Failed to deduct stock for ${ingredient.name}:`, error);
        failedIngredients.push({
          name: ingredient.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
    
    const message = `Stock deducted: ${deductedIngredients.length} ingredients${failedIngredients.length > 0 ? `, ${failedIngredients.length} failed` : ''}`;
    
    return {
      success: failedIngredients.length === 0,
      deductedIngredients,
      failedIngredients,
      message,
    };
  } catch (error) {
    console.error('Failed to deduct stock:', error);
    return {
      success: false,
      deductedIngredients: [],
      failedIngredients: [],
      message: 'Failed to deduct stock',
    };
  }
}

export interface StockRequest {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity_requested: number;
  unit: string;
  notes?: string;
  supplier_id?: string;
  supplier_name?: string;
  proof_file?: string;
  proof_file_name?: string;
  status: 'pending_supervisor' | 'pending_manager' | 'pending_finance' | 'approved' | 'rejected' | 'cancelled';
  approval_level: number;
  // Supervisor approval
  supervisor_id?: string;
  supervisor_name?: string;
  supervisor_approved_at?: string;
  supervisor_notes?: string;
  // Manager approval
  manager_id?: string;
  manager_name?: string;
  manager_approved_at?: string;
  manager_notes?: string;
  // Finance approval
  finance_id?: string;
  finance_name?: string;
  finance_approved_at?: string;
  finance_notes?: string;
  // Rejection
  rejected_by?: string;
  rejected_by_name?: string;
  rejected_at?: string;
  rejection_reason?: string;
  rejection_level?: number;
  // Original fields
  requested_by: string;
  requested_by_name: string;
  requested_at: string;
  // Relations
  ingredient?: {
    id: string;
    name: string;
    current_stock: number;
    unit: string;
  };
  supplier?: {
    id: string;
    name: string;
    phone: string;
  };
}

// Create stock request
export async function createStockRequest(params: any): Promise<string> {
  try {
    const token = getToken();
    const payload = params.supplier_id == null
      ? { ...params, supplier_id: undefined }
      : params;
    const response = await fetch(`${API_BASE_URL}/api/stock-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Failed to create stock request');

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create stock request:', error);
    throw error;
  }
}

// Get all stock requests
export async function getStockRequests(): Promise<StockRequest[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get stock requests');
    return await response.json();
  } catch (error) {
    console.error('Failed to get stock requests:', error);
    return [];
  }
}

// Get stock requests filtered by status
export async function getStockRequestsByStatus(
  status: 'pending_supervisor' | 'pending_manager' | 'pending_finance' | 'approved' | 'rejected' | 'cancelled'
): Promise<StockRequest[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get stock requests');
    return await response.json();
  } catch (error) {
    console.error('Failed to get stock requests by status:', error);
    return [];
  }
}

// Supervisor approval
export async function approveStockRequestSupervisor(
  requestId: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests/${requestId}/approve-supervisor`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to approve stock request' };
    }
    return { success: true, message: 'Stock request approved by supervisor' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to approve stock request' };
  }
}

// Manager approval
export async function approveStockRequestManager(
  requestId: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests/${requestId}/approve-manager`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to approve stock request' };
    }
    return { success: true, message: 'Stock request approved by manager' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to approve stock request' };
  }
}

// Finance director approval
export async function approveStockRequestFinance(
  requestId: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests/${requestId}/approve-finance`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to approve stock request' };
    }
    return { success: true, message: 'Stock request approved by finance director' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to approve stock request' };
  }
}

// Reject a stock request (at any level)
export async function rejectStockRequest(
  requestId: string,
  rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests/${requestId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to reject stock request' };
    }
    return { success: true, message: 'Stock request rejected successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to reject stock request' };
  }
}

// Recall a stock request (by requester)
export async function recallStockRequest(
  requestId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests/${requestId}/recall`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to recall stock request' };
    }
    return { success: true, message: 'Stock request recalled successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to recall stock request' };
  }
}

// Cancel a stock request (by requester)
export async function cancelStockRequest(
  requestId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests/${requestId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to cancel stock request' };
    }
    return { success: true, message: 'Stock request cancelled successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to cancel stock request' };
  }
}

// Legacy approve function (for backward compatibility)
export async function approveStockRequest(
  requestId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-requests/${requestId}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to approve stock request' };
    }
    return { success: true, message: 'Stock request approved successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to approve stock request' };
  }
}

// Quotation Request interfaces
export interface QuotationRequest {
  id: string;
  stock_request_id: string;
  status: 'open' | 'closed' | 'cancelled';
  sent_at: string;
  closed_at?: string;
  notes?: string;
  stock_request?: {
    id: string;
    ingredient_name: string;
    quantity_requested: number;
    unit: string;
  };
  quotations?: Quotation[];
}

export interface Quotation {
  id: string;
  quotation_request_id: string;
  supplier_id: string;
  status: 'received' | 'selected' | 'rejected';
  quoted_price: number;
  quoted_unit: string;
  delivery_date?: string;
  payment_terms?: string;
  valid_until?: string;
  notes?: string;
  received_at: string;
  selected_at?: string;
  selected_by?: string;
  selected_by_name?: string;
  supplier?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

// Get all quotation requests
export async function getQuotationRequests(): Promise<QuotationRequest[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotation-requests`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get quotation requests');
    return await response.json();
  } catch (error) {
    console.error('Failed to get quotation requests:', error);
    return [];
  }
}

// Get quotation requests by status
export async function getQuotationRequestsByStatus(
  status: 'open' | 'closed' | 'cancelled'
): Promise<QuotationRequest[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotation-requests?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get quotation requests');
    return await response.json();
  } catch (error) {
    console.error('Failed to get quotation requests by status:', error);
    return [];
  }
}

// Create quotation request from stock request
export async function createQuotationRequest(
  stockRequestId: string,
  notes?: string
): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotation-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ stock_request_id: stockRequestId, notes }),
    });
    if (!response.ok) throw new Error('Failed to create quotation request');
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create quotation request:', error);
    throw error;
  }
}

// Close quotation request
export async function closeQuotationRequest(
  requestId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotation-requests/${requestId}/close`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to close quotation request' };
    }
    return { success: true, message: 'Quotation request closed successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to close quotation request' };
  }
}

// Cancel quotation request
export async function cancelQuotationRequest(
  requestId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotation-requests/${requestId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to cancel quotation request' };
    }
    return { success: true, message: 'Quotation request cancelled successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to cancel quotation request' };
  }
}

// Get quotations for a quotation request
export async function getQuotations(quotationRequestId: string): Promise<Quotation[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotation-requests/${quotationRequestId}/quotations`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get quotations');
    return await response.json();
  } catch (error) {
    console.error('Failed to get quotations:', error);
    return [];
  }
}

// Get all quotations
export async function getAllQuotations(): Promise<Quotation[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotations`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get quotations');
    return await response.json();
  } catch (error) {
    console.error('Failed to get quotations:', error);
    return [];
  }
}

// Select quotation
export async function selectQuotation(
  quotationId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotations/${quotationId}/select`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to select quotation' };
    }
    return { success: true, message: 'Quotation selected successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to select quotation' };
  }
}

// Reject quotation
export async function rejectQuotation(
  quotationId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/quotations/${quotationId}/reject`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to reject quotation' };
    }
    return { success: true, message: 'Quotation rejected successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to reject quotation' };
  }
}

// Purchase Order interfaces
export interface PurchaseOrder {
  id: string;
  po_number: string;
  quotation_id?: string;
  supplier_id: string;
  status: 'draft' | 'reviewed' | 'sent' | 'acknowledged' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewed_by_name?: string;
  sent_at?: string;
  acknowledged_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  quotation?: {
    id: string;
    supplier_id: string;
    quoted_price: number;
  };
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  ingredient?: {
    id: string;
    name: string;
    current_stock: number;
    unit: string;
  };
}

// Get all purchase orders
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get purchase orders');
    return await response.json();
  } catch (error) {
    console.error('Failed to get purchase orders:', error);
    return [];
  }
}

// Get purchase orders by status
export async function getPurchaseOrdersByStatus(
  status: 'draft' | 'reviewed' | 'sent' | 'acknowledged' | 'cancelled'
): Promise<PurchaseOrder[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get purchase orders');
    return await response.json();
  } catch (error) {
    console.error('Failed to get purchase orders by status:', error);
    return [];
  }
}

// Create purchase order from quotation
export async function createPurchaseOrder(
  quotationId: string,
  notes?: string
): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quotation_id: quotationId, notes }),
    });
    if (!response.ok) throw new Error('Failed to create purchase order');
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create purchase order:', error);
    throw error;
  }
}

// Review purchase order
export async function reviewPurchaseOrder(
  orderId: string,
  notes?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${orderId}/review`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to review purchase order' };
    }
    return { success: true, message: 'Purchase order reviewed successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to review purchase order' };
  }
}

// Send purchase order to supplier
export async function sendPurchaseOrder(
  orderId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${orderId}/send`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to send purchase order' };
    }
    return { success: true, message: 'Purchase order sent successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to send purchase order' };
  }
}

// Cancel purchase order
export async function cancelPurchaseOrder(
  orderId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to cancel purchase order' };
    }
    return { success: true, message: 'Purchase order cancelled successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to cancel purchase order' };
  }
}

// Goods Received Note interfaces
export interface GoodsReceivedNote {
  id: string;
  purchase_order_id: string;
  grn_number: string;
  status: 'pending' | 'completed' | 'cancelled';
  received_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  purchase_order?: {
    id: string;
    po_number: string;
    supplier_id: string;
    supplier?: {
      id: string;
      name: string;
      phone: string;
    };
  };
  items?: GoodsReceivedNoteItem[];
}

export interface GoodsReceivedNoteItem {
  id: string;
  grn_id: string;
  purchase_order_item_id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity_ordered: number;
  quantity_received: number;
  unit: string;
  unit_price: number;
  total_price: number;
  quality_status: 'accepted' | 'rejected' | 'partial';
  quality_notes?: string;
  ingredient?: {
    id: string;
    name: string;
    current_stock: number;
    unit: string;
  };
}

// Get all goods received notes
export async function getGoodsReceivedNotes(): Promise<GoodsReceivedNote[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/goods-received-notes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get goods received notes');
    return await response.json();
  } catch (error) {
    console.error('Failed to get goods received notes:', error);
    return [];
  }
}

// Get goods received notes by status
export async function getGoodsReceivedNotesByStatus(
  status: 'pending' | 'completed' | 'cancelled'
): Promise<GoodsReceivedNote[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/goods-received-notes?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get goods received notes');
    return await response.json();
  } catch (error) {
    console.error('Failed to get goods received notes by status:', error);
    return [];
  }
}

// Create goods received note from purchase order
export async function createGoodsReceivedNote(
  purchaseOrderId: string,
  notes?: string
): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/goods-received-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ purchase_order_id: purchaseOrderId, notes }),
    });
    if (!response.ok) throw new Error('Failed to create goods received note');
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create goods received note:', error);
    throw error;
  }
}

// Complete goods received note (update stock)
export async function completeGoodsReceivedNote(
  grnId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/goods-received-notes/${grnId}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to complete goods received note' };
    }
    return { success: true, message: 'Goods received note completed successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to complete goods received note' };
  }
}

// Cancel goods received note
export async function cancelGoodsReceivedNote(
  grnId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/goods-received-notes/${grnId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to cancel goods received note' };
    }
    return { success: true, message: 'Goods received note cancelled successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to cancel goods received note' };
  }
}

// Invoice interfaces
export interface Invoice {
  id: string;
  grn_id: string;
  invoice_number: string;
  status: 'pending' | 'verified' | 'paid' | 'cancelled';
  invoice_date: string;
  due_date?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  verified_at?: string;
  verified_by?: string;
  verified_by_name?: string;
  paid_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  grn?: {
    id: string;
    grn_number: string;
    purchase_order?: {
      id: string;
      po_number: string;
      supplier?: {
        id: string;
        name: string;
        phone: string;
      };
    };
  };
}

// Get all invoices
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get invoices');
    return await response.json();
  } catch (error) {
    console.error('Failed to get invoices:', error);
    return [];
  }
}

// Get invoices by status
export async function getInvoicesByStatus(
  status: 'pending' | 'verified' | 'paid' | 'cancelled'
): Promise<Invoice[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/invoices?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get invoices');
    return await response.json();
  } catch (error) {
    console.error('Failed to get invoices by status:', error);
    return [];
  }
}

// Create invoice from GRN
export async function createInvoice(
  grnId: string,
  dueDate?: string,
  notes?: string
): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ grn_id: grnId, due_date: dueDate, notes }),
    });
    if (!response.ok) throw new Error('Failed to create invoice');
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create invoice:', error);
    throw error;
  }
}

// Verify invoice
export async function verifyInvoice(
  invoiceId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/verify`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to verify invoice' };
    }
    return { success: true, message: 'Invoice verified successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to verify invoice' };
  }
}

// Cancel invoice
export async function cancelInvoice(
  invoiceId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to cancel invoice' };
    }
    return { success: true, message: 'Invoice cancelled successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to cancel invoice' };
  }
}

// Supplier Payment interfaces
export interface SupplierPayment {
  id: string;
  invoice_id: string;
  payment_number: string;
  status: 'pending' | 'completed' | 'cancelled';
  payment_date: string;
  amount: number;
  payment_method: 'cash' | 'transfer' | 'check' | 'other';
  reference_number?: string;
  notes?: string;
  processed_at?: string;
  processed_by?: string;
  processed_by_name?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total: number;
    grn?: {
      purchase_order?: {
        supplier?: {
          id: string;
          name: string;
          phone: string;
        };
      };
    };
  };
}

// Get all supplier payments
export async function getSupplierPayments(): Promise<SupplierPayment[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/supplier-payments`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get supplier payments');
    return await response.json();
  } catch (error) {
    console.error('Failed to get supplier payments:', error);
    return [];
  }
}

// Get supplier payments by status
export async function getSupplierPaymentsByStatus(
  status: 'pending' | 'completed' | 'cancelled'
): Promise<SupplierPayment[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/supplier-payments?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get supplier payments');
    return await response.json();
  } catch (error) {
    console.error('Failed to get supplier payments by status:', error);
    return [];
  }
}

// Create supplier payment from invoice
export async function createSupplierPayment(
  invoiceId: string,
  paymentMethod: 'cash' | 'transfer' | 'check' | 'other',
  amount: number,
  referenceNumber?: string,
  notes?: string
): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/supplier-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        invoice_id: invoiceId, 
        payment_method: paymentMethod,
        amount,
        reference_number: referenceNumber,
        notes 
      }),
    });
    if (!response.ok) throw new Error('Failed to create supplier payment');
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create supplier payment:', error);
    throw error;
  }
}

// Process supplier payment
export async function processSupplierPayment(
  paymentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/supplier-payments/${paymentId}/process`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to process supplier payment' };
    }
    return { success: true, message: 'Supplier payment processed successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to process supplier payment' };
  }
}

// Cancel supplier payment
export async function cancelSupplierPayment(
  paymentId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/supplier-payments/${paymentId}/cancel`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to cancel supplier payment' };
    }
    return { success: true, message: 'Supplier payment cancelled successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to cancel supplier payment' };
  }
}

export interface StockWriteOff {
  id: string;
  ingredient_id: string;
  ingredient_name: string;
  quantity_written_off: number;
  unit: string;
  reason: string;
  notes?: string;
  proof_file: string;
  proof_file_name: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_by: string;
  requested_by_name: string;
  approved_by?: string;
  approved_by_name?: string;
  rejected_by?: string;
  rejected_by_name?: string;
  rejection_reason?: string;
  requested_at: string;
  approved_at?: string;
  rejected_at?: string;
}

// Create stock write-off
export async function createStockWriteOff(params: any): Promise<string> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-write-offs`, {
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

// Get all stock write-offs
export async function getStockWriteOffs(): Promise<StockWriteOff[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-write-offs`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get stock write-offs');
    return await response.json();
  } catch (error) {
    console.error('Failed to get stock write-offs:', error);
    return [];
  }
}

// Get stock write-offs filtered by status
export async function getStockWriteOffsByStatus(
  status: 'pending' | 'approved' | 'rejected'
): Promise<StockWriteOff[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-write-offs?status=${status}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get stock write-offs');
    return await response.json();
  } catch (error) {
    console.error('Failed to get stock write-offs by status:', error);
    return [];
  }
}

// Approve a stock write-off (admin only); server removes the quantity from ingredient stock
export async function approveStockWriteOff(
  writeOffId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-write-offs/${writeOffId}/approve`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to approve stock write-off' };
    }
    return { success: true, message: 'Stock write-off approved successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to approve stock write-off' };
  }
}

// Reject a stock write-off (admin only)
export async function rejectStockWriteOff(
  writeOffId: string,
  rejectionReason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/stock-write-offs/${writeOffId}/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to reject stock write-off' };
    }
    return { success: true, message: 'Stock write-off rejected successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to reject stock write-off' };
  }
}

// Get purchase data by period
export async function getPurchaseDataByPeriod(days: number): Promise<any[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/reports/purchases?days=${days}`, {
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

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// Get all suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to get suppliers');
    return await response.json();
  } catch (error) {
    console.error('Failed to get suppliers:', error);
    return [];
  }
}

// Create a supplier (admin only)
export async function addSupplier(
  supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>
): Promise<string | null> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(supplier),
    });
    if (!response.ok) throw new Error('Failed to create supplier');
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to create supplier:', error);
    return null;
  }
}

// Update a supplier (admin only)
export async function updateSupplier(
  supplierId: string,
  data: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/suppliers/${supplierId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to update supplier' };
    }
    return { success: true, message: 'Supplier updated successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to update supplier' };
  }
}

// Delete a supplier (admin only)
export async function deleteSupplier(
  supplierId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/suppliers/${supplierId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { success: false, message: body.error || 'Failed to delete supplier' };
    }
    return { success: true, message: 'Supplier deleted successfully' };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Failed to delete supplier' };
  }
}
