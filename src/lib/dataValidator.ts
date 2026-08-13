import { db } from './db';

export interface ValidationResult {
  isValid: boolean;
  missingData: string[];
  staleData: string[];
  warnings: string[];
  dataCounts: {
    products: number;
    categories: number;
    modifiers: number;
    tables: number;
    outlets: number;
    ingredients: number;
  };
}

export interface ValidationConfig {
  requireProducts: boolean;
  requireCategories: boolean;
  requireTables: boolean;
  requireOutlets: boolean;
  requireIngredients: boolean;
  minProductCount: number;
  maxDataAgeHours: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  requireProducts: true,
  requireCategories: true,
  requireTables: false, // Tables are optional for some POS workflows
  requireOutlets: false, // Outlets are optional for single-location setups
  requireIngredients: false, // Ingredients are optional for basic POS
  minProductCount: 1,
  maxDataAgeHours: 24, // Data is considered stale after 24 hours
};

/**
 * Data validator for offline POS operations
 * Ensures that cached data is sufficient for offline functionality
 */
export class DataValidator {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate that all required data is available for offline operations
   */
  async validateForOfflinePOS(): Promise<ValidationResult> {
    const missingData: string[] = [];
    const staleData: string[] = [];
    const warnings: string[] = [];

    // Get data counts
    const dataCounts = await this.getDataCounts();

    // Check required data types
    if (this.config.requireProducts && dataCounts.products === 0) {
      missingData.push('products');
    } else if (this.config.requireProducts && dataCounts.products < this.config.minProductCount) {
      warnings.push(`Insufficient products (${dataCounts.products} < ${this.config.minProductCount})`);
    }

    if (this.config.requireCategories && dataCounts.categories === 0) {
      missingData.push('categories');
    }

    if (this.config.requireTables && dataCounts.tables === 0) {
      missingData.push('tables');
    }

    if (this.config.requireOutlets && dataCounts.outlets === 0) {
      missingData.push('outlets');
    }

    if (this.config.requireIngredients && dataCounts.ingredients === 0) {
      missingData.push('ingredients');
    }

    // Check data freshness
    const syncStatus = await this.getSyncStatus();
    if (syncStatus.lastSyncTime) {
      const dataAge = this.getDataAgeHours(syncStatus.lastSyncTime);
      if (dataAge > this.config.maxDataAgeHours) {
        staleData.push(`Data is ${Math.round(dataAge)} hours old (max: ${this.config.maxDataAgeHours}h)`);
      }
    } else {
      staleData.push('No sync timestamp available');
    }

    // Check for orphaned data (products without categories, etc.)
    await this.checkForOrphanedData(warnings, dataCounts);

    const isValid = missingData.length === 0;

    return {
      isValid,
      missingData,
      staleData,
      warnings,
      dataCounts,
    };
  }

  /**
   * Get current data counts from IndexedDB
   */
  private async getDataCounts() {
    return {
      products: await db.products.count(),
      categories: await db.categories.count(),
      modifiers: await db.modifiers.count(),
      tables: await db.restaurant_tables.count(),
      outlets: await db.outlets.count(),
      ingredients: await db.ingredients.count(),
    } as const;
  }

  /**
   * Get sync status from IndexedDB
   */
  private async getSyncStatus() {
    try {
      const status = await db.sync_status.get('global-sync-status');
      return {
        lastSyncTime: status?.lastSyncTime || null,
        initialSyncCompleted: status?.initialSyncCompleted || false,
      };
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return {
        lastSyncTime: null,
        initialSyncCompleted: false,
      };
    }
  }

  /**
   * Calculate data age in hours
   */
  private getDataAgeHours(timestamp: string): number {
    const syncTime = new Date(timestamp).getTime();
    const now = Date.now();
    return (now - syncTime) / (1000 * 60 * 60);
  }

  /**
   * Check for orphaned or inconsistent data
   */
  private async checkForOrphanedData(warnings: string[], dataCounts: any) {
    try {
      // Check for products without categories
      if (dataCounts.products > 0 && dataCounts.categories > 0) {
        const productsWithoutCategories = await db.products
          .where('category_id')
          .equals('')
          .or('category_id')
          .equals(null as any)
          .count();

        if (productsWithoutCategories > 0) {
          warnings.push(`${productsWithoutCategories} products without categories`);
        }
      }

      // Check for modifiers without products
      if (dataCounts.modifiers > 0 && dataCounts.products > 0) {
        const allProducts = await db.products.toArray();
        const productIds = new Set(allProducts.map(p => p.id).filter((id): id is string => id !== undefined));
        
        const modifiersWithoutProducts = await db.modifiers
          .filter(mod => !productIds.has(mod.product_id))
          .count();

        if (modifiersWithoutProducts > 0) {
          warnings.push(`${modifiersWithoutProducts} modifiers without valid products`);
        }
      }
    } catch (error) {
      console.error('Failed to check for orphaned data:', error);
    }
  }

  /**
   * Validate specific data type
   */
  async validateDataType(dataType: keyof ValidationResult['dataCounts']): Promise<{
    valid: boolean;
    count: number;
    message: string;
  }> {
    const counts = await this.getDataCounts();
    const count = counts[dataType as keyof typeof counts];
    
    switch (dataType) {
      case 'products':
        return {
          valid: count >= this.config.minProductCount,
          count,
          message: count >= this.config.minProductCount 
            ? `Sufficient products (${count})`
            : `Insufficient products (${count} < ${this.config.minProductCount})`,
        };
      case 'categories':
        return {
          valid: count > 0,
          count,
          message: count > 0 ? `Categories available (${count})` : 'No categories',
        };
      default:
        return {
          valid: true,
          count,
          message: `${dataType}: ${count} records`,
        };
    }
  }

  /**
   * Get detailed validation report
   */
  async getDetailedReport(): Promise<{
    summary: ValidationResult;
    details: {
      products: { count: number; valid: boolean; message: string };
      categories: { count: number; valid: boolean; message: string };
      modifiers: { count: number; valid: boolean; message: string };
      tables: { count: number; valid: boolean; message: string };
      outlets: { count: number; valid: boolean; message: string };
      ingredients: { count: number; valid: boolean; message: string };
    };
    syncStatus: { lastSyncTime: string | null; initialSyncCompleted: boolean };
  }> {
    const summary = await this.validateForOfflinePOS();
    
    const details = {
      products: await this.validateDataType('products'),
      categories: await this.validateDataType('categories'),
      modifiers: await this.validateDataType('modifiers'),
      tables: await this.validateDataType('tables'),
      outlets: await this.validateDataType('outlets'),
      ingredients: await this.validateDataType('ingredients'),
    } as const;

    const syncStatus = await this.getSyncStatus();

    return {
      summary,
      details,
      syncStatus,
    };
  }
}

/**
 * Convenience function to validate data for offline POS
 */
export async function validateOfflinePOSData(
  config?: Partial<ValidationConfig>
): Promise<ValidationResult> {
  const validator = new DataValidator(config);
  return validator.validateForOfflinePOS();
}

/**
 * Get detailed validation report
 */
export async function getDataValidationReport(
  config?: Partial<ValidationConfig>
) {
  const validator = new DataValidator(config);
  return validator.getDetailedReport();
}