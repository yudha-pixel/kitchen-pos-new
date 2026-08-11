/**
 * Unit Conversion Utility for Inventory and Recipe Mapping
 * 
 * This module provides functions to convert between bulk units (kg, L) 
 * and smallest base units (g, ml, pcs) for accurate cost calculations.
 */

export interface UnitConversionResult {
  price: number;
  unit: string;
  conversionFactor: number;
}

/**
 * Convert unit price to smallest base unit (per gram/ml/pcs)
 * 
 * @param price - The unit price in the original unit
 * @param unit - The original unit (e.g., 'kg', 'L', 'g', 'ml', 'pcs')
 * @returns Object with converted price, unit, and conversion factor
 */
export function convertToSmallestUnit(price: number, unit: string): UnitConversionResult {
  const lowerUnit = unit.toLowerCase().trim();
  
  // Weight conversions (kg → g)
  if (lowerUnit === 'kg' || lowerUnit === 'kgs' || lowerUnit === 'kilogram' || lowerUnit === 'kilograms') {
    return { price: price / 1000, unit: 'g', conversionFactor: 1000 };
  }
  
  // Volume conversions (L → ml)
  if (lowerUnit === 'l' || lowerUnit === 'liter' || lowerUnit === 'liters' || lowerUnit === 'litre' || lowerUnit === 'litres') {
    return { price: price / 1000, unit: 'ml', conversionFactor: 1000 };
  }
  
  // Units that are already in their smallest form (no conversion needed)
  const smallestUnits = [
    'g', 'gram', 'grams',
    'ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres',
    'pcs', 'pc', 'piece', 'pieces',
    'scoop', 'shot', 'sprig',
    'bottle', 'can', 'pack', 'packet'
  ];
  
  if (smallestUnits.includes(lowerUnit)) {
    return { price, unit: lowerUnit, conversionFactor: 1 };
  }
  
  // Unknown unit - return as-is with warning
  console.warn(`Unknown unit: "${unit}", using price as-is without conversion`);
  return { price, unit, conversionFactor: 1 };
}

/**
 * Convert from smallest unit back to original unit
 * 
 * @param price - The price in smallest unit
 * @param smallestUnit - The smallest unit (e.g., 'g', 'ml')
 * @param originalUnit - The target unit to convert to (e.g., 'kg', 'L')
 * @returns Object with converted price and unit
 */
export function convertFromSmallestUnit(price: number, smallestUnit: string, originalUnit: string): UnitConversionResult {
  const lowerOriginal = originalUnit.toLowerCase().trim();
  const lowerSmallest = smallestUnit.toLowerCase().trim();
  
  // g → kg
  if (lowerSmallest === 'g' && (lowerOriginal === 'kg' || lowerOriginal === 'kgs' || lowerOriginal === 'kilogram')) {
    return { price: price * 1000, unit: 'kg', conversionFactor: 1000 };
  }
  
  // ml → L
  if (lowerSmallest === 'ml' && (lowerOriginal === 'l' || lowerOriginal === 'liter' || lowerOriginal === 'litre')) {
    return { price: price * 1000, unit: 'L', conversionFactor: 1000 };
  }
  
  // No conversion needed
  return { price, unit: originalUnit, conversionFactor: 1 };
}

/**
 * Calculate unit cost per smallest base unit from package price and size
 * 
 * @param packagePrice - The price of the bulk package
 * @param packageSize - The size/quantity of the package (e.g., 1, 500, 1000)
 * @param packageUnit - The unit of the package (e.g., 'kg', 'L', 'g', 'ml')
 * @param baseUnit - The base usage unit (e.g., 'g', 'ml', 'pcs')
 * @returns Object with calculated unit cost per base unit
 */
export function calculateUnitCostFromPackage(
  packagePrice: number,
  packageSize: number,
  packageUnit: string,
  baseUnit: string
): UnitConversionResult {
  if (packagePrice <= 0 || packageSize <= 0) {
    return { price: 0, unit: baseUnit, conversionFactor: 1 };
  }
  
  // First convert package to smallest unit
  const packageInSmallest = convertToSmallestUnit(packageSize, packageUnit);
  
  // Calculate price per smallest unit
  const pricePerSmallest = packagePrice / packageInSmallest.price;
  
  // Convert to base unit if different
  const smallestUnit = packageInSmallest.unit;
  const baseInSmallest = convertToSmallestUnit(1, baseUnit);
  
  if (smallestUnit === baseInSmallest.unit) {
    return { price: pricePerSmallest, unit: baseUnit, conversionFactor: packageInSmallest.conversionFactor };
  }
  
  // If base unit is different, need conversion
  // For now, assume same type (weight to weight, volume to volume)
  console.warn(`Package unit (${packageUnit}) and base unit (${baseUnit}) type mismatch, using direct calculation`);
  return { price: pricePerSmallest, unit: baseUnit, conversionFactor: packageInSmallest.conversionFactor };
}

/**
 * Validate if a unit price is realistic for the given unit
 * 
 * @param price - The unit price to validate
 * @param unit - The unit of measurement
 * @returns Object with validation result and warning message if invalid
 */
export function validateUnitPrice(price: number, unit: string): { valid: boolean; warning?: string } {
  if (price <= 0) {
    return { valid: false, warning: 'Harga satuan harus lebih dari 0' };
  }
  
  const lowerUnit = unit.toLowerCase().trim();
  
  // Define realistic price ranges per smallest unit (per gram/ml/pcs)
  const realisticRanges: Record<string, { min: number; max: number }> = {
    'g': { min: 0.001, max: 100 },      // Rp 0.001 - Rp 100 per gram (Rp 1 - Rp 100.000 per kg)
    'ml': { min: 0.001, max: 50 },      // Rp 0.001 - Rp 50 per ml (Rp 1 - Rp 50.000 per L)
    'pcs': { min: 10, max: 100000 },    // Rp 10 - Rp 100.000 per pcs
    'scoop': { min: 100, max: 10000 },  // Rp 100 - Rp 10.000 per scoop
    'shot': { min: 50, max: 5000 },      // Rp 50 - Rp 5.000 per shot
    'sprig': { min: 50, max: 5000 },    // Rp 50 - Rp 5.000 per sprig
  };
  
  // Convert to smallest unit for validation
  const converted = convertToSmallestUnit(price, unit);
  const range = realisticRanges[converted.unit];
  
  if (!range) {
    // Unknown unit, allow but warn
    return { valid: true, warning: `Unit "${unit}" tidak dikenali, pastikan harga sudah benar` };
  }
  
  if (converted.price < range.min) {
    return { 
      valid: true, 
      warning: `Harga Rp ${price.toLocaleString('id-ID')}/${unit} sangat rendah (${converted.price.toFixed(4)} per ${converted.unit}). Pastikan ini benar.` 
    };
  }
  
  if (converted.price > range.max) {
    return { 
      valid: true, 
      warning: `Harga Rp ${price.toLocaleString('id-ID')}/${unit} sangat tinggi (${converted.price.toFixed(2)} per ${converted.unit}). Pastikan ini benar.` 
    };
  }
  
  return { valid: true };
}

/**
 * Get the smallest unit for a given unit type
 * 
 * @param unit - The unit to convert
 * @returns The smallest equivalent unit
 */
export function getSmallestUnit(unit: string): string {
  const lowerUnit = unit.toLowerCase().trim();
  
  if (lowerUnit === 'kg' || lowerUnit === 'kgs' || lowerUnit === 'kilogram' || lowerUnit === 'kilograms') {
    return 'g';
  }
  
  if (lowerUnit === 'l' || lowerUnit === 'liter' || lowerUnit === 'liters' || lowerUnit === 'litre' || lowerUnit === 'litres') {
    return 'ml';
  }
  
  // Already smallest unit
  return unit;
}

/**
 * Format unit price for display with proper unit
 * 
 * @param price - The unit price
 * @param unit - The unit
 * @returns Formatted string (e.g., "Rp 150.000/kg")
 */
export function formatUnitPrice(price: number, unit: string): string {
  return `Rp ${price.toLocaleString('id-ID')}/${unit}`;
}
