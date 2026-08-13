/**
 * Inventory Service - Advanced Inventory Management
 * 
 * Features:
 * - Stock status calculation (Feature 2)
 * - FIFO batch deduction (Feature 3)
 * - Unit conversion utilities (Feature 5)
 * - Stock logging (Feature 5)
 */

import { prisma } from './prisma';

// ---------------------------------------------------------------------------
// Feature 2: Stock Status Logic Handler
// ---------------------------------------------------------------------------

export type StockStatus = 'Out of Stock' | 'Low Stock' | 'In Stock';

export interface StockStatusResult {
  status: StockStatus;
  currentStock: number;
  minStock: number;
}

/**
 * Calculate stock status based on current stock and minimum stock threshold
 * 
 * Logic:
 * - If totalOnHand == 0 -> Status = "Out of Stock"
 * - If totalOnHand <= minStock -> Status = "Low Stock"
 * - Else -> Status = "In Stock"
 */
export function calculateStockStatus(currentStock: number, minStock: number): StockStatusResult {
  const status: StockStatus = 
    currentStock === 0 ? 'Out of Stock' :
    currentStock <= minStock ? 'Low Stock' :
    'In Stock';

  return {
    status,
    currentStock,
    minStock,
  };
}

/**
 * Calculate stock status for an ingredient by ID
 */
export async function getIngredientStockStatus(ingredientId: string): Promise<StockStatusResult | null> {
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: ingredientId },
    select: {
      current_stock: true,
      min_stock: true,
    },
  });

  if (!ingredient) return null;

  return calculateStockStatus(ingredient.current_stock, ingredient.min_stock);
}

/**
 * Get inventory KPI summary for dashboard
 */
export async function getInventoryKPI() {
  const ingredients = await prisma.ingredient.findMany({
    select: {
      id: true,
      current_stock: true,
      min_stock: true,
    },
  });

  const totalItems = ingredients.length;
  let outOfStock = 0;
  let lowStock = 0;
  let inStock = 0;

  for (const ingredient of ingredients) {
    const status = calculateStockStatus(ingredient.current_stock, ingredient.min_stock);
    switch (status.status) {
      case 'Out of Stock':
        outOfStock++;
        break;
      case 'Low Stock':
        lowStock++;
        break;
      case 'In Stock':
        inStock++;
        break;
    }
  }

  return {
    totalItems,
    outOfStock,
    lowStock,
    inStock,
  };
}

// ---------------------------------------------------------------------------
// Feature 3: FIFO Batch Deduction
// ---------------------------------------------------------------------------

export interface BatchDeductionResult {
  success: boolean;
  deductedQuantity: number;
  remainingQuantity: number;
  usedBatches: Array<{
    batchId: string;
    batchCode: string;
    deductedQuantity: number;
    remainingQuantity: number;
  }>;
  error?: string;
}

/**
 * Deduct stock from batches using FIFO (First-In-First-Out) logic
 * 
 * Algorithm:
 * 1. Query active batches sorted by oldest createdAt first
 * 2. Loop and deduct quantities sequentially until requirement is met
 * 3. Skip batches that are completely depleted (quantity == 0) or past expiryDate
 * 
 * @param ingredientId - The ingredient to deduct from
 * @param quantityToDeduct - The quantity to deduct
 * @returns BatchDeductionResult with details of deduction
 */
export async function deductStockFIFO(
  ingredientId: string,
  quantityToDeduct: number
): Promise<BatchDeductionResult> {
  if (quantityToDeduct <= 0) {
    return {
      success: false,
      deductedQuantity: 0,
      remainingQuantity: quantityToDeduct,
      usedBatches: [],
      error: 'Quantity to deduct must be positive',
    };
  }

  try {
    // Get active batches sorted by oldest first (FIFO)
    const batches = await prisma.stockBatch.findMany({
      where: {
        ingredient_id: ingredientId,
        quantity: { gt: 0 }, // Skip depleted batches
        OR: [
          { expiry_date: null },
          { expiry_date: { gt: new Date() } }, // Skip expired batches
        ],
      },
      orderBy: {
        created_at: 'asc', // Oldest first
      },
    });

    if (batches.length === 0) {
      return {
        success: false,
        deductedQuantity: 0,
        remainingQuantity: quantityToDeduct,
        usedBatches: [],
        error: 'No active batches available for this ingredient',
      };
    }

    const usedBatches: BatchDeductionResult['usedBatches'] = [];
    let remainingToDeduct = quantityToDeduct;
    let totalDeducted = 0;

    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;

      const availableQuantity = batch.quantity;
      const deductFromBatch = Math.min(availableQuantity, remainingToDeduct);

      // Update batch quantity
      await prisma.stockBatch.update({
        where: { id: batch.id },
        data: {
          quantity: availableQuantity - deductFromBatch,
          updated_at: new Date(),
        },
      });

      usedBatches.push({
        batchId: batch.id,
        batchCode: batch.batch_code,
        deductedQuantity: deductFromBatch,
        remainingQuantity: availableQuantity - deductFromBatch,
      });

      totalDeducted += deductFromBatch;
      remainingToDeduct -= deductFromBatch;
    }

    // Update ingredient current_stock
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        current_stock: {
          decrement: totalDeducted,
        },
        updated_at: new Date(),
      },
    });

    const success = remainingToDeduct === 0;

    return {
      success,
      deductedQuantity: totalDeducted,
      remainingQuantity: remainingToDeduct,
      usedBatches,
      error: success ? undefined : 'Insufficient stock across all batches',
    };
  } catch (error) {
    console.error('Error in FIFO deduction:', error);
    return {
      success: false,
      deductedQuantity: 0,
      remainingQuantity: quantityToDeduct,
      usedBatches: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// ---------------------------------------------------------------------------
// Feature 5: Unit Conversion Utilities
// ---------------------------------------------------------------------------

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
}

/**
 * Common unit conversion factors for inventory
 * Add more conversions as needed for your specific use case
 */
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  // Weight conversions
  kg: {
    g: 1000,
    mg: 1000000,
    lb: 2.20462,
    oz: 35.274,
  },
  g: {
    kg: 0.001,
    mg: 1000,
    lb: 0.00220462,
    oz: 0.035274,
  },
  mg: {
    kg: 0.000001,
    g: 0.001,
  },
  lb: {
    kg: 0.453592,
    g: 453.592,
    oz: 16,
  },
  oz: {
    kg: 0.0283495,
    g: 28.3495,
    lb: 0.0625,
  },
  
  // Volume conversions
  l: {
    ml: 1000,
    gal: 0.264172,
    qt: 1.05669,
    pt: 2.11338,
    cup: 4.22675,
    fl_oz: 33.814,
  },
  ml: {
    l: 0.001,
    gal: 0.000264172,
    qt: 0.00105669,
    pt: 0.00211338,
    cup: 0.00422675,
    fl_oz: 0.033814,
  },
  gal: {
    l: 3.78541,
    ml: 3785.41,
    qt: 4,
    pt: 8,
    cup: 16,
    fl_oz: 128,
  },
  
  // Count conversions
  pcs: {
    dozen: 0.0833333,
    pack: 0.1, // Assuming 10 pcs per pack
  },
  dozen: {
    pcs: 12,
  },
  pack: {
    pcs: 10,
  },
};

/**
 * Convert quantity from one unit to another
 * 
 * @param quantity - The quantity to convert
 * @param fromUnit - The source unit
 * @param toUnit - The target unit
 * @returns Converted quantity or null if conversion not available
 */
export function convertUnits(
  quantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  if (fromUnit === toUnit) return quantity;
  
  const fromUnitLower = fromUnit.toLowerCase();
  const toUnitLower = toUnit.toLowerCase();
  
  const conversions = UNIT_CONVERSIONS[fromUnitLower];
  if (!conversions) {
    console.warn(`No conversion available from ${fromUnit}`);
    return null;
  }
  
  const factor = conversions[toUnitLower];
  if (factor === undefined) {
    console.warn(`No conversion available from ${fromUnit} to ${toUnit}`);
    return null;
  }
  
  return quantity * factor;
}

/**
 * Get available conversion factors for a unit
 */
export function getAvailableConversions(unit: string): string[] {
  const unitLower = unit.toLowerCase();
  const conversions = UNIT_CONVERSIONS[unitLower];
  return conversions ? Object.keys(conversions) : [];
}

// ---------------------------------------------------------------------------
// Feature 5: Stock Logging
// ---------------------------------------------------------------------------

export type StockLogType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'WASTAGE';

export interface StockLogEntry {
  ingredientId: string;
  quantity: number;
  type: StockLogType;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
}

/**
 * Create a stock log entry
 */
export async function createStockLog(entry: StockLogEntry): Promise<void> {
  await prisma.stockLog.create({
    data: {
      ingredient_id: entry.ingredientId,
      quantity: entry.quantity,
      type: entry.type,
      reference_id: entry.referenceId,
      reference_type: entry.referenceType,
      notes: entry.notes,
    },
  });
}

/**
 * Get paginated stock logs for an ingredient
 */
export async function getStockLogs(
  ingredientId: string,
  page: number = 1,
  limit: number = 50
) {
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    prisma.stockLog.findMany({
      where: { ingredient_id: ingredientId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        ingredient: {
          select: {
            id: true,
            name: true,
            unit: true,
          },
        },
      },
    }),
    prisma.stockLog.count({
      where: { ingredient_id: ingredientId },
    }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get active batches for an ingredient
 */
export async function getActiveBatches(ingredientId: string) {
  return prisma.stockBatch.findMany({
    where: {
      ingredient_id: ingredientId,
      quantity: { gt: 0 },
      OR: [
        { expiry_date: null },
        { expiry_date: { gt: new Date() } },
      ],
    },
    orderBy: {
      created_at: 'asc',
    },
  });
}
