'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Columns,
  Download,
  RotateCw,
  Box,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  X,
  Sliders,
  Upload,
} from 'lucide-react';

import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { db, Ingredient, StockAdjustment, StockAdjustmentType } from '@/src/lib/db';
import { recordStockAdjustment, getStockAdjustmentHistory, exportInventoryData, importInventoryData } from '@/src/features/inventory/inventoryService';
import { getIngredientsWithStatus, syncRecipeIngredientsToInventory } from '@/src/features/inventory/recipeApiService';
import { validateUnitPrice, convertToSmallestUnit, calculateUnitCostFromPackage } from '@/src/features/inventory/unitConversion';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { createStockRequest } from '@/src/features/inventory/recipeApiService';
import { useRouter } from 'next/navigation';

interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  onHand: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  unitCost: string;
  unit: string;
  barcode?: string;
  supplier?: string;
  sellingPrice: string;
  reorderPoint: string;
  description?: string;
  committed: string;
  available: string;
  lastUpdated: string;
}

const MOCK_ITEMS: InventoryItem[] = [
  {
    id: '1',
    name: 'Chicken Breast',
    sku: 'CHB-001',
    category: 'Protein',
    onHand: '45 kg',
    status: 'In Stock',
    unitCost: 'Rp 45.000',
    unit: 'kg',
    barcode: '8991234567890',
    supplier: 'PT. Sentosa Food',
    sellingPrice: 'Rp 85.000',
    reorderPoint: '10 kg',
    description: 'Premium chicken breast, skinless.',
    committed: '8 kg',
    available: '37 kg',
    lastUpdated: '10 Aug 2024, 03:15 by admin',
  },
  {
    id: '2',
    name: 'Beef Tenderloin',
    sku: 'BFT-002',
    category: 'Protein',
    onHand: '12 kg',
    status: 'Low Stock',
    unitCost: 'Rp 120.000',
    unit: 'kg',
    barcode: '8991234567891',
    supplier: 'PT. Sentosa Food',
    sellingPrice: 'Rp 220.000',
    reorderPoint: '15 kg',
    description: 'Fresh Australian beef tenderloin.',
    committed: '2 kg',
    available: '10 kg',
    lastUpdated: '10 Aug 2024, 01:20 by admin',
  },
  {
    id: '3',
    name: 'Cheddar Cheese',
    sku: 'CHS-003',
    category: 'Dairy',
    onHand: '2 kg',
    status: 'Low Stock',
    unitCost: 'Rp 85.000',
    unit: 'kg',
    barcode: '8991234567892',
    supplier: 'Dairy Master Ltd',
    sellingPrice: 'Rp 130.000',
    reorderPoint: '5 kg',
    description: 'Aged cheddar cheese blocks.',
    committed: '0 kg',
    available: '2 kg',
    lastUpdated: '9 Aug 2024, 16:40 by admin',
  },
  {
    id: '4',
    name: 'Olive Oil',
    sku: 'OIL-004',
    category: 'Oil',
    onHand: '0 L',
    status: 'Out of Stock',
    unitCost: 'Rp 150.000',
    unit: 'L',
    barcode: '8991234567893',
    supplier: 'Mediterranean Imports',
    sellingPrice: 'Rp 250.000',
    reorderPoint: '10 L',
    description: 'Extra virgin olive oil.',
    committed: '0 L',
    available: '0 L',
    lastUpdated: '9 Aug 2024, 09:30 by admin',
  },
  {
    id: '5',
    name: 'Tomato Sauce',
    sku: 'TMS-005',
    category: 'Sauces',
    onHand: '18 pcs',
    status: 'In Stock',
    unitCost: 'Rp 28.000',
    unit: 'pcs',
    barcode: '8991234567894',
    supplier: 'Saus Nusantara',
    sellingPrice: 'Rp 40.000',
    reorderPoint: '5 pcs',
    description: 'Rich tomato pasta sauce pouch.',
    committed: '2 pcs',
    available: '16 pcs',
    lastUpdated: '9 Aug 2024, 14:20 by admin',
  },
];

export default function InventoryPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [detailTab, setDetailTab] = useState<'details' | 'activity'>('details');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editItemModalOpen, setEditItemModalOpen] = useState(false);
  const [bulkRequestModalOpen, setBulkRequestModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentType>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentHistory, setAdjustmentHistory] = useState<StockAdjustment[]>([]);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['name', 'sku', 'category', 'onHand', 'status', 'unitCost']);
  const [bulkRequestType, setBulkRequestType] = useState('restock');
  const [bulkDestination, setBulkDestination] = useState('');
  const [bulkRequesterRole, setBulkRequesterRole] = useState('Kitchen Staff');
  const [outlets, setOutlets] = useState<any[]>([]);
  const [customQuantities, setCustomQuantities] = useState<Record<string, string>>({});
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    categoryId: '',
    unit: '',
    unitPrice: '',
    minStock: '',
    supplierId: '',
    packagePrice: '',
    packageSize: '',
    packageUnit: '',
  });
  const [editItem, setEditItem] = useState({
    id: '',
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    unit: '',
    unitPrice: '',
    minStock: '',
    supplierId: '',
  });
  const [ingredientCategories, setIngredientCategories] = useState<{ id: string; name: string }[]>([]);

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];

  useEffect(() => {
    const handleAddItem = () => setAddItemModalOpen(true);
    window.addEventListener('inventory-add-item', handleAddItem);
    return () => window.removeEventListener('inventory-add-item', handleAddItem);
  }, []);

  const loadIngredientCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/ingredients/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to load ingredient categories: ${res.status}`);
      setIngredientCategories(await res.json());
    } catch (error) {
      console.error('Failed to load ingredient categories:', error);
    }
  };

  useEffect(() => {
    loadIngredientCategories();
  }, []);

  // Fetch outlets for bulk request modal
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/api/outlets`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setOutlets(data);
        }
      } catch (error) {
        console.error('Failed to fetch outlets:', error);
      }
    };
    fetchOutlets();
  }, []);

  // Load inventory data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch from API to ensure sync data is reflected
        const ingredients = await getIngredientsWithStatus();
        
        if (ingredients.length === 0) {
          console.warn('No ingredients returned from API');
          setItems([]);
          return;
        }
        
        const inventoryItems: InventoryItem[] = ingredients.map(ing => {
          const status = ing.current_stock <= 0 ? 'Out of Stock' :
                        ing.current_stock <= ing.min_stock ? 'Low Stock' : 'In Stock';

        // Use database price directly (already in correct unit)
        const displayPrice = ing.unit_price;

        return {
          id: ing.id,
          name: ing.name,
          sku: ing.sku || undefined,
          category: ing.category_name || undefined,
          onHand: `${ing.current_stock} ${ing.unit}`,
          status,
          unitCost: `Rp ${displayPrice.toLocaleString('id-ID')}`,
          unit: ing.unit,
          barcode: ing.barcode || undefined,
          supplier: ing.supplier_name || 'Unknown',
          sellingPrice: `Rp ${(displayPrice * 1.5).toLocaleString('id-ID')}`,
          reorderPoint: `${ing.min_stock} ${ing.unit}`,
          description: '',
          committed: '0',
          available: `${ing.current_stock} ${ing.unit}`,
          lastUpdated: new Date(ing.updated_at).toLocaleString('id-ID'),
        };
      });
        
        setItems(inventoryItems);
      } catch (error) {
        console.error('Failed to load inventory data:', error);
        toast('error', 'Gagal memuat data inventaris');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadAdjustmentHistory = async (ingredientId: string) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/ingredients/${ingredientId}/stock-logs?page=1&limit=10`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to load stock logs: ${res.status}`);
      const data = await res.json();
      // Transform StockLog data to match the expected format
      const history: StockAdjustment[] = data.logs.map((log: any) => ({
        id: log.id,
        adjustmentType: log.type,
        adjustmentQuantity: log.quantity,
        previousStock: 0, // StockLog doesn't track previous stock
        newStock: 0, // StockLog doesn't track new stock directly
        adjustedAt: log.created_at,
        reason: log.notes,
      }));
      setAdjustmentHistory(history);
    } catch (error) {
      console.error('Failed to load adjustment history:', error);
      // Fallback to old method if API fails
      try {
        const history = await getStockAdjustmentHistory(ingredientId, 10);
        setAdjustmentHistory(history);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportInventoryData();
      if (result.success && result.data) {
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast('success', 'Inventory data exported successfully');
      } else {
        toast('error', result.message || 'Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast('error', 'Failed to export inventory data');
    }
  };

  const handleImport = async () => {
    const fileInput = document.getElementById('csvFile') as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (!file) {
      toast('error', 'Please select a CSV file');
      return;
    }

    setProcessing(true);
    try {
      const csvData = await file.text();
      const token = getToken();

      const response = await fetch(`${API_BASE_URL}/api/ingredients/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ csvData }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Failed to import data');
      }

      const result = await response.json();

      if (result.success) {
        toast('success', result.message || `Imported ${result.imported} records successfully`);
        setImportModalOpen(false);

        // Log errors if any
        if (result.errors && result.errors.length > 0) {
          console.warn('Import errors:', result.errors);
          toast('warning', `${result.errors.length} rows had errors. Check console for details.`);
        }

        // Reload data from API
        const ingredients = await getIngredientsWithStatus();
        const inventoryItems: InventoryItem[] = ingredients.map(ing => {
          const status = ing.current_stock <= 0 ? 'Out of Stock' :
                        ing.current_stock <= ing.min_stock ? 'Low Stock' : 'In Stock';

          const displayPrice = ing.unit_price;

          return {
            id: ing.id,
            name: ing.name,
            sku: ing.sku || undefined,
            category: ing.category_name || undefined,
            onHand: `${ing.current_stock} ${ing.unit}`,
            status,
            unitCost: `Rp ${displayPrice.toLocaleString('id-ID')}`,
            unit: ing.unit,
            barcode: ing.barcode || undefined,
            supplier: ing.supplier_name || 'Unknown',
            sellingPrice: `Rp ${(displayPrice * 1.5).toLocaleString('id-ID')}`,
            reorderPoint: `${ing.min_stock} ${ing.unit}`,
            description: '',
            committed: '0',
            available: `${ing.current_stock} ${ing.unit}`,
            lastUpdated: new Date(ing.updated_at).toLocaleString('id-ID'),
          };
        });

        setItems(inventoryItems);
      } else {
        toast('error', result.message || 'Failed to import data');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast('error', error instanceof Error ? error.message : 'Failed to import inventory data');
    } finally {
      setProcessing(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedItem || !adjustmentQuantity) return;
    
    setProcessing(true);
    try {
      const quantity = parseFloat(adjustmentQuantity);
      const result = await recordStockAdjustment(
        selectedItem.id,
        selectedItem.name,
        adjustmentType,
        quantity,
        adjustmentReason || 'Manual adjustment',
        user?.id || 'system',
        user?.username || 'System'
      );
      
      if (result.success) {
        toast('success', 'Stock adjustment recorded successfully');
        setAdjustmentModalOpen(false);
        setAdjustmentQuantity('');
        setAdjustmentReason('');
        // Reload data
        const ingredients = await db.ingredients.toArray();
        const suppliers = await db.suppliers.toArray();
        
        const inventoryItems: InventoryItem[] = ingredients.map(ing => {
          const supplier = suppliers.find((s: any) => s.id === ing.supplier_id);
          const status = ing.current_stock <= 0 ? 'Out of Stock' : 
                        ing.current_stock <= ing.min_stock ? 'Low Stock' : 'In Stock';
          
          // Use database price directly (already in correct unit)
          const displayPrice = ing.unit_price;
          
          return {
            id: ing.id!,
            name: ing.name,
            sku: ing.sku,
            category: ing.category,
            onHand: `${ing.current_stock} ${ing.unit}`,
            status,
            unitCost: `Rp ${displayPrice.toLocaleString()}`,
            unit: ing.unit,
            barcode: ing.sku,
            supplier: supplier?.name || 'Unknown',
            sellingPrice: `Rp ${(displayPrice * 1.5).toLocaleString()}`,
            reorderPoint: `${ing.min_stock} ${ing.unit}`,
            description: '',
            committed: '0',
            available: `${ing.current_stock} ${ing.unit}`,
            lastUpdated: new Date(ing.updated_at).toLocaleString('id-ID'),
          };
        });
        
        setItems(inventoryItems);
        await loadAdjustmentHistory(selectedItem.id);
      } else {
        toast('error', result.message || 'Failed to record adjustment');
      }
    } catch (error) {
      console.error('Stock adjustment error:', error);
      toast('error', 'Failed to record stock adjustment');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditItem = async () => {
    if (!editItem.name || !editItem.unit) {
      toast('error', 'Name and Unit are required');
      return;
    }

    // Validate unit price
    const unitPrice = parseFloat(editItem.unitPrice);
    if (isNaN(unitPrice) || unitPrice < 0) {
      toast('error', 'Unit Cost must be a valid positive number');
      return;
    }

    // Validate min stock
    const minStock = parseFloat(editItem.minStock);
    if (isNaN(minStock) || minStock < 0) {
      toast('error', 'Reorder Point must be a valid positive number');
      return;
    }

    setProcessing(true);
    try {
      // Convert to smallest unit for storage consistency
      const converted = convertToSmallestUnit(unitPrice, editItem.unit);

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/ingredients/${editItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: editItem.name,
          sku: editItem.sku || null,
          barcode: editItem.barcode || null,
          unit: editItem.unit,
          min_stock: minStock,
          unit_price: converted.price,
          supplier_id: editItem.supplierId || null,
          category_id: editItem.categoryId || null,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Gagal mengupdate item');
      }

      toast('success', 'Item updated successfully');
      setEditItemModalOpen(false);

      // Reload data from API
      const ingredients = await getIngredientsWithStatus();
      const inventoryItems: InventoryItem[] = ingredients.map(ing => {
        const status = ing.current_stock <= 0 ? 'Out of Stock' :
                      ing.current_stock <= ing.min_stock ? 'Low Stock' : 'In Stock';

        const displayPrice = ing.unit_price;

        return {
          id: ing.id,
          name: ing.name,
          sku: ing.sku || undefined,
          category: ing.category_name || undefined,
          onHand: `${ing.current_stock} ${ing.unit}`,
          status,
          unitCost: `Rp ${displayPrice.toLocaleString('id-ID')}`,
          unit: ing.unit,
          barcode: ing.barcode || undefined,
          supplier: ing.supplier_name || 'Unknown',
          sellingPrice: `Rp ${(displayPrice * 1.5).toLocaleString('id-ID')}`,
          reorderPoint: `${ing.min_stock} ${ing.unit}`,
          description: '',
          committed: '0',
          available: `${ing.current_stock} ${ing.unit}`,
          lastUpdated: new Date(ing.updated_at).toLocaleString('id-ID'),
        };
      });

      setItems(inventoryItems);
    } catch (error) {
      console.error('Edit item error:', error);
      toast('error', 'Failed to update item');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // First sync recipe ingredients to inventory
      const syncResult = await syncRecipeIngredientsToInventory();
      if (syncResult.success && syncResult.added > 0) {
        toast('success', `Sinkronisasi: ${syncResult.message}`);
      }
      
      // Then reload inventory data from API
      const ingredients = await getIngredientsWithStatus();
      
      const inventoryItems: InventoryItem[] = ingredients.map(ing => {
        const status = ing.current_stock <= 0 ? 'Out of Stock' :
                      ing.current_stock <= ing.min_stock ? 'Low Stock' : 'In Stock';

        const displayPrice = ing.unit_price;

        return {
          id: ing.id,
          name: ing.name,
          sku: undefined,
          category: undefined,
          onHand: `${ing.current_stock} ${ing.unit}`,
          status,
          unitCost: `Rp ${displayPrice.toLocaleString('id-ID')}`,
          unit: ing.unit,
          barcode: undefined,
          supplier: ing.supplier_name || 'Unknown',
          sellingPrice: `Rp ${(displayPrice * 1.5).toLocaleString('id-ID')}`,
          reorderPoint: `${ing.min_stock} ${ing.unit}`,
          description: '',
          committed: '0',
          available: `${ing.current_stock} ${ing.unit}`,
          lastUpdated: new Date(ing.updated_at).toLocaleString('id-ID'),
        };
      });
      
      setItems(inventoryItems);
      toast('success', 'Inventory data refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
      toast('error', 'Failed to refresh inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    setAddItemModalOpen(true);
  };

  const handleToggleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItemIds);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItemIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItemIds.size === filteredItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filteredItems.map(item => item.id)));
    }
  };

  const handleBulkRequest = async () => {
    if (selectedItemIds.size === 0) {
      toast('error', 'Pilih minimal satu item untuk diajukan');
      return;
    }
    // Initialize custom quantities with auto-calculated values
    const initialQuantities: Record<string, string> = {};
    items.filter(item => selectedItemIds.has(item.id)).forEach(item => {
      const currentStock = parseFloat(item.onHand.split(' ')[0]) || 0;
      const minStock = parseFloat(item.reorderPoint.split(' ')[0]) || 0;
      const autoQuantity = Math.max(minStock * 2 - currentStock, minStock);
      initialQuantities[item.id] = autoQuantity.toString();
    });
    setCustomQuantities(initialQuantities);
    // Set default role based on user role if available
    if (user?.role) {
      const roleMapping: Record<string, string> = {
        'admin': 'System Administrator',
        'manager': 'Operations Manager',
        'kitchen_staff': 'Kitchen Staff',
        'bar_staff': 'Bar / Front of House',
        'inventory_manager': 'Inventory/Store Manager',
      };
      setBulkRequesterRole(roleMapping[user.role] || 'Kitchen Staff');
    }
    setBulkRequestModalOpen(true);
  };

  const handleAutoRestock = async () => {
    const outOfStockItems = items.filter(item => item.status === 'Out of Stock' || item.status === 'Low Stock');
    if (outOfStockItems.length === 0) {
      toast('info', 'Tidak ada item yang perlu di-restock');
      return;
    }
    setSelectedItemIds(new Set(outOfStockItems.map(item => item.id)));
    
    // Initialize custom quantities with auto-calculated values
    const initialQuantities: Record<string, string> = {};
    outOfStockItems.forEach(item => {
      const currentStock = parseFloat(item.onHand.split(' ')[0]) || 0;
      const minStock = parseFloat(item.reorderPoint.split(' ')[0]) || 0;
      const autoQuantity = Math.max(minStock * 2 - currentStock, minStock);
      initialQuantities[item.id] = autoQuantity.toString();
    });
    setCustomQuantities(initialQuantities);
    
    // Set default role based on user role if available
    if (user?.role) {
      const roleMapping: Record<string, string> = {
        'admin': 'System Administrator',
        'manager': 'Operations Manager',
        'kitchen_staff': 'Kitchen Staff',
        'bar_staff': 'Bar / Front of House',
        'inventory_manager': 'Inventory/Store Manager',
      };
      setBulkRequesterRole(roleMapping[user.role] || 'Kitchen Staff');
    }
    
    setBulkRequestModalOpen(true);
  };

  const handleBulkRequestSubmit = async () => {
    if (selectedItemIds.size === 0) {
      toast('error', 'Pilih minimal satu item');
      return;
    }

    if (!bulkDestination) {
      toast('error', 'Mohon pilih lokasi tujuan / cabang');
      return;
    }

    setProcessing(true);
    try {
      const selectedItems = items.filter(item => selectedItemIds.has(item.id));
      let successCount = 0;
      let failCount = 0;

      for (const item of selectedItems) {
        try {
          // Use custom quantity if provided, otherwise calculate auto quantity
          const quantityToRequest = customQuantities[item.id] 
            ? parseFloat(customQuantities[item.id])
            : (() => {
                const currentStock = parseFloat(item.onHand.split(' ')[0]) || 0;
                const minStock = parseFloat(item.reorderPoint.split(' ')[0]) || 0;
                return Math.max(minStock * 2 - currentStock, minStock);
              })();

          if (quantityToRequest <= 0) {
            console.warn(`Skipping ${item.name} - invalid quantity`);
            continue;
          }

          let combinedNotes = '';
          if (bulkRequestType || bulkDestination || bulkRequesterRole) {
            const additionalInfo = [];
            if (bulkRequestType) {
              const typeLabels = {
                restock: 'Restock',
                transfer: 'Transfer Antar Gudang',
                production: 'Keperluan Produksi',
              };
              additionalInfo.push(`Tipe: ${typeLabels[bulkRequestType as keyof typeof typeLabels] || bulkRequestType}`);
            }
            if (bulkDestination) {
              const outlet = outlets.find((o: any) => o.id === bulkDestination);
              additionalInfo.push(`Tujuan: ${outlet?.name || bulkDestination}`);
            }
            if (bulkRequesterRole) {
              additionalInfo.push(`Pengaju: ${bulkRequesterRole}`);
            }
            if (additionalInfo.length > 0) {
              combinedNotes = additionalInfo.join(' | ');
            }
          }

          await createStockRequest({
            ingredient_id: item.id,
            ingredient_name: item.name,
            quantity_requested: quantityToRequest,
            unit: item.unit,
            notes: combinedNotes || undefined,
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to create request for ${item.name}:`, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast('success', `${successCount} permintaan stok berhasil dibuat${failCount > 0 ? `, ${failCount} gagal` : ''}`);
        setBulkRequestModalOpen(false);
        setSelectedItemIds(new Set());
        setBulkRequestType('restock');
        setBulkDestination('');
        setBulkRequesterRole('Kitchen Staff');
        setCustomQuantities({});
        
        // Navigate to stock approvals page
        router.push('/inventory/stock-approvals');
      } else {
        toast('error', 'Semua permintaan gagal dibuat');
      }
    } catch (error) {
      console.error('Bulk request error:', error);
      toast('error', 'Gagal membuat permintaan massal');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveNewItem = async () => {
    if (!newItem.name || !newItem.unit) {
      toast('error', 'Please fill in required fields');
      return;
    }

    let unitPrice = 0;
    
    // Calculate unit cost from package pricing if provided
    if (newItem.packagePrice && newItem.packageSize && newItem.packageUnit) {
      const packagePrice = parseFloat(newItem.packagePrice);
      const packageSize = parseFloat(newItem.packageSize);
      
      const calculated = calculateUnitCostFromPackage(packagePrice, packageSize, newItem.packageUnit, newItem.unit);
      unitPrice = calculated.price;
      
      console.log(`Calculated unit cost: Rp ${unitPrice.toFixed(4)}/${newItem.unit} from package: Rp ${packagePrice.toLocaleString('id-ID')}/${packageSize} ${newItem.packageUnit}`);
    } else if (newItem.unitPrice) {
      // Use direct unit price input
      unitPrice = parseFloat(newItem.unitPrice);
    } else {
      toast('error', 'Please provide either package pricing or direct unit price');
      return;
    }
    
    // Validate unit price for realistic values
    const validation = validateUnitPrice(unitPrice, newItem.unit);
    if (validation.warning) {
      toast('warning', validation.warning);
      // Allow proceeding but warn user
    }

    setProcessing(true);
    try {
      // Convert to smallest unit for storage consistency
      const converted = convertToSmallestUnit(unitPrice, newItem.unit);

      // Persist to the server first — this is the shared source of truth other
      // devices read from. A local-only write here would never appear in the
      // database and would be lost on the next server refetch.
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newItem.name,
          current_stock: 0,
          unit: newItem.unit,
          min_stock: parseFloat(newItem.minStock) || 0,
          unit_price: converted.price,
          supplier_id: newItem.supplierId || null,
          category_id: newItem.categoryId || null,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || 'Gagal menyimpan item baru ke server');
      }

      const created: { id: string; name: string; sku?: string; category?: { name: string } | null; unit: string; unit_price: number; current_stock: number; min_stock: number; supplier_id: string | null; created_at: string; updated_at: string } = await response.json();

      // Mirror the server's write into the local cache so this device's UI
      // reflects it immediately without waiting for the next background refetch.
      const ingredient: Ingredient = {
        id: created.id,
        name: created.name,
        sku: newItem.sku || undefined,
        category: created.category?.name,
        unit: created.unit,
        unit_price: created.unit_price,
        current_stock: created.current_stock,
        min_stock: created.min_stock,
        supplier_id: created.supplier_id || undefined,
        created_at: created.created_at,
        updated_at: created.updated_at,
      };

      await db.ingredients.add(ingredient);
      toast('success', 'Item added successfully');
      setAddItemModalOpen(false);
      setNewItem({
        name: '',
        sku: '',
        barcode: '',
        category: '',
        categoryId: '',
        unit: '',
        unitPrice: '',
        minStock: '',
        supplierId: '',
        packagePrice: '',
        packageSize: '',
        packageUnit: '',
      });
      
      // Reload data
      const ingredients = await db.ingredients.toArray();
      const suppliers = await db.suppliers.toArray();
      
      const inventoryItems: InventoryItem[] = ingredients.map(ing => {
        const supplier = suppliers.find((s: any) => s.id === ing.supplier_id);
        const status = ing.current_stock <= 0 ? 'Out of Stock' :
                      ing.current_stock <= ing.min_stock ? 'Low Stock' : 'In Stock';

        const displayPrice = ing.unit_price;

        return {
          id: ing.id!,
          name: ing.name,
          sku: ing.sku,
          category: ing.category,
          onHand: `${ing.current_stock} ${ing.unit}`,
          status,
          unitCost: `Rp ${displayPrice.toLocaleString()}`,
          unit: ing.unit,
          barcode: ing.sku,
          supplier: supplier?.name || 'Unknown',
          sellingPrice: `Rp ${(displayPrice * 1.5).toLocaleString()}`,
          reorderPoint: `${ing.min_stock} ${ing.unit}`,
          description: '',
          committed: '0',
          available: `${ing.current_stock} ${ing.unit}`,
          lastUpdated: new Date(ing.updated_at).toLocaleString('id-ID'),
        };
      });
      
      setItems(inventoryItems);
    } catch (error) {
      console.error('Add item error:', error);
      toast('error', 'Failed to add item');
    } finally {
      setProcessing(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <ResponsiveShell title="Ringkasan Stok">
    <div className="flex h-full w-full flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden -m-4 sm:-m-6">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* KPI Header Stats */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Box className="h-4 w-4 text-slate-500" />
                  <span className="text-xs font-medium text-slate-500">Total Items</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{items.length}</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">Low Stock</span>
                </div>
                <div className="text-2xl font-bold text-amber-900">
                  {items.filter((i) => i.status === 'Low Stock').length}
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-medium text-red-700">Out of Stock</span>
                </div>
                <div className="text-2xl font-bold text-red-900">
                  {items.filter((i) => i.status === 'Out of Stock').length}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-green-700">Total Value</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  Rp {(() => {
                    const totalValue = items.reduce((sum, item) => {
                      const price = parseFloat(item.unitCost.replace(/[^0-9]/g, '')) || 0;
                      const stock = parseFloat(item.onHand.split(' ')[0]) || 0;
                      return sum + (price * stock);
                    }, 0);
                    if (totalValue >= 1000000) {
                      return `${(totalValue / 1000000).toFixed(1)}M`;
                    } else if (totalValue >= 1000) {
                      return `${(totalValue / 1000).toFixed(1)}K`;
                    }
                    return totalValue.toLocaleString('id-ID');
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filter, and Action Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3 shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search items by name or SKU..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setFilterModalOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
                <button onClick={() => setColumnsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Columns className="h-4 w-4" />
                  Columns
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button onClick={() => setImportModalOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Upload className="h-4 w-4" />
                  Import
                </button>
                <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                  <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {selectedItemIds.size > 0 && (
                  <button onClick={handleBulkRequest} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    Ajukan Permintaan ({selectedItemIds.size})
                  </button>
                )}
                <button onClick={handleAutoRestock} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700">
                  <RotateCw className="h-4 w-4" />
                  Auto-Restock Kritis
                </button>
                <button onClick={handleAddItem} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700">
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
            </div>
          </div>

          {/* Items Data Table */}
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.size === filteredItems.length && filteredItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">On-Hand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Cost</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reorder Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`cursor-pointer hover:bg-slate-50 ${
                        selectedItemId === item.id ? 'bg-violet-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedItemIds.has(item.id)}
                          onChange={() => handleToggleSelectItem(item.id)}
                          className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.sku}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium">{item.onHand}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'In Stock'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status === 'In Stock' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {item.status === 'Low Stock' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {item.status === 'Out of Stock' && <XCircle className="h-3 w-3 mr-1" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.unitCost}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.reorderPoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Right Details Panel */}
        {selectedItem && (
          <aside className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto hidden lg:block">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Item Details</h2>
                <button
                  onClick={() => setSelectedItemId(null)}
                  className="p-1 rounded hover:bg-slate-100"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">Item Name</label>
                  <div className="text-sm font-medium text-slate-900">{selectedItem.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500">SKU</label>
                    <div className="text-sm text-slate-600">{selectedItem.sku}</div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500">Category</label>
                    <div className="text-sm text-slate-600">{selectedItem.category}</div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Status</label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedItem.status === 'In Stock'
                          ? 'bg-green-100 text-green-700'
                          : selectedItem.status === 'Low Stock'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Tabs */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setDetailTab('details')}
                  className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
                    detailTab === 'details'
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => {
                    setDetailTab('activity');
                    if (selectedItem) loadAdjustmentHistory(selectedItem.id);
                  }}
                  className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
                    detailTab === 'activity'
                      ? 'border-violet-600 text-violet-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Activity
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto">
                {detailTab === 'details' ? (
                  <>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Unit</label>
                      <div className="text-sm text-slate-600">{selectedItem.unit}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Barcode</label>
                      <div className="text-sm text-slate-600">{selectedItem.barcode}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Supplier</label>
                      <div className="text-sm text-slate-600">{selectedItem.supplier}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500">Unit Cost</label>
                        <div className="text-sm text-slate-600">{selectedItem.unitCost}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500">Selling Price</label>
                        <div className="text-sm text-slate-600">{selectedItem.sellingPrice}</div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Reorder Point</label>
                      <div className="text-sm text-slate-600">{selectedItem.reorderPoint}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500">Description</label>
                      <div className="text-sm text-slate-600">{selectedItem.description}</div>
                    </div>

                    {/* Stock Information */}
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <h3 className="text-sm font-medium text-slate-900 mb-3">Stock Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">On-Hand</span>
                          <span className="text-sm font-medium text-slate-900">{selectedItem.onHand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Committed</span>
                          <span className="text-sm text-slate-600">{selectedItem.committed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Available</span>
                          <span className="text-sm font-medium text-slate-900">{selectedItem.available}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-500">Last Updated</span>
                          <span className="text-xs text-slate-600">{selectedItem.lastUpdated}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (selectedItem) {
                            // Find the category ID from the category name
                            const category = ingredientCategories.find(c => c.name === selectedItem.category);
                            const categoryId = category?.id || '';

                            // Extract numeric value from unit cost (format: "Rp 15000")
                            const unitCostValue = selectedItem.unitCost.replace(/[^0-9]/g, '');

                            // Extract numeric value from reorder point (format: "10 kg")
                            const minStockValue = selectedItem.reorderPoint.split(' ')[0] || '0';

                            setEditItem({
                              id: selectedItem.id,
                              name: selectedItem.name,
                              sku: selectedItem.sku || '',
                              barcode: selectedItem.barcode || '',
                              categoryId: categoryId,
                              unit: selectedItem.unit,
                              unitPrice: unitCostValue,
                              minStock: minStockValue,
                              supplierId: '',
                            });
                            setEditItemModalOpen(true);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-700"
                      >
                        Edit Item
                      </button>
                      <button
                        onClick={() => setAdjustmentModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
                      >
                        <Sliders className="h-4 w-4" />
                        Adjust Stock
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-900">Audit Timeline</h3>
                    {adjustmentHistory.length === 0 ? (
                      <p className="text-xs text-slate-500">No adjustment history found.</p>
                    ) : (
                      adjustmentHistory.map((adj) => (
                        <div key={adj.id} className="border-l-2 border-slate-200 pl-3">
                          <div className="text-xs font-medium text-slate-900">{adj.adjustmentType}</div>
                          <div className="text-xs text-slate-600">
                            {adj.adjustmentQuantity > 0 ? '+' : ''}{adj.adjustmentQuantity} {adj.previousStock} → {adj.newStock}
                          </div>
                          <div className="text-xs text-slate-400">{new Date(adj.adjustedAt).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {adjustmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Adjust Stock</h2>
              <button
                onClick={() => setAdjustmentModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Adjustment Type</label>
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as StockAdjustmentType)}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="add">Add Stock</option>
                  <option value="subtract">Subtract Stock</option>
                  <option value="audit">Audit</option>
                  <option value="damage">Damage</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Quantity</label>
                <input
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Reason</label>
                <textarea
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Enter reason for adjustment"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setAdjustmentModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockAdjustment}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Save Adjustment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Import Inventory Data</h2>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-slate-600 mb-2">
                <p className="font-medium mb-1">CSV Format:</p>
                <p className="text-xs">Item Name, SKU, Category, Unit, Unit Cost, Selling Price, Reorder Point</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">CSV File</label>
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {processing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {filterModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Filter Items</h2>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="all">All Categories</option>
                  {Array.from(new Set(items.map(i => i.category).filter(Boolean))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterCategory('all');
                    setFilterModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => setFilterModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Columns Modal */}
      {columnsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Select Columns</h2>
              <button
                onClick={() => setColumnsModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { key: 'name', label: 'Item Name' },
                { key: 'sku', label: 'SKU' },
                { key: 'category', label: 'Category' },
                { key: 'onHand', label: 'On-Hand' },
                { key: 'status', label: 'Status' },
                { key: 'unitCost', label: 'Unit Cost' },
              ].map(col => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setVisibleColumns([...visibleColumns, col.key]);
                      } else {
                        setVisibleColumns(visibleColumns.filter(c => c !== col.key));
                      }
                    }}
                    className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-slate-700">{col.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setColumnsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add New Item</h2>
              <button
                onClick={() => setAddItemModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">SKU</label>
                <input
                  type="text"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Enter SKU"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Barcode</label>
                <input
                  type="text"
                  value={newItem.barcode}
                  onChange={(e) => setNewItem({ ...newItem, barcode: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Enter Barcode"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Tanpa kategori</option>
                  {ingredientCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">Unit *</label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Pilih satuan</option>
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="pack">pack</option>
                    <option value="botol">botol</option>
                    <option value="kaleng">kaleng</option>
                    <option value="sisir">sisir</option>
                    <option value="tabung">tabung</option>
                    <option value="box">box</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Unit Price (Direct)</label>
                  <input
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="border-t border-slate-200 pt-4">
                <p className="text-xs font-medium text-slate-500 mb-3">OR Calculate from Package Pricing</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Package Price</label>
                    <input
                      type="number"
                      value={newItem.packagePrice}
                      onChange={(e) => setNewItem({ ...newItem, packagePrice: e.target.value })}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="e.g., 150000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Package Size</label>
                    <input
                      type="number"
                      value={newItem.packageSize}
                      onChange={(e) => setNewItem({ ...newItem, packageSize: e.target.value })}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="e.g., 1, 500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Package Unit</label>
                    <input
                      type="text"
                      value={newItem.packageUnit}
                      onChange={(e) => setNewItem({ ...newItem, packageUnit: e.target.value })}
                      className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="e.g., kg, L"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Min Stock</label>
                <input
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewItem}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {processing ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Edit Item</h2>
              <button
                onClick={() => setEditItemModalOpen(false)}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Name *</label>
                <input
                  type="text"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Enter item name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">SKU</label>
                <input
                  type="text"
                  value={editItem.sku}
                  onChange={(e) => setEditItem({ ...editItem, sku: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Enter SKU"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Barcode</label>
                <input
                  type="text"
                  value={editItem.barcode}
                  onChange={(e) => setEditItem({ ...editItem, barcode: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Enter Barcode"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select
                  value={editItem.categoryId}
                  onChange={(e) => setEditItem({ ...editItem, categoryId: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Tanpa kategori</option>
                  {ingredientCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Unit *</label>
                <select
                  value={editItem.unit}
                  onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Pilih satuan</option>
                  <option value="kg">kg</option>
                  <option value="liter">liter</option>
                  <option value="pack">pack</option>
                  <option value="botol">botol</option>
                  <option value="kaleng">kaleng</option>
                  <option value="sisir">sisir</option>
                  <option value="tabung">tabung</option>
                  <option value="box">box</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Unit Cost *</label>
                <input
                  type="number"
                  value={editItem.unitPrice}
                  onChange={(e) => setEditItem({ ...editItem, unitPrice: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Reorder Point *</label>
                <input
                  type="number"
                  value={editItem.minStock}
                  onChange={(e) => setEditItem({ ...editItem, minStock: e.target.value })}
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditItem}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Bulk Request Modal */}
    {bulkRequestModalOpen && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Ajukan Permintaan Massal</h2>
              <p className="text-xs text-slate-500 mt-1">Permintaan Pembelian/Restock ke Manajemen & Supplier</p>
            </div>
            <button
              onClick={() => setBulkRequestModalOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                  Purchase Request
                </span>
                <span className="text-xs text-blue-600">Permintaan Pembelian Baru (Bukan Transfer Internal)</span>
              </div>
              <p className="text-sm text-blue-800">
                <span className="font-medium">{selectedItemIds.size} item terpilih</span> akan diajukan untuk restock.
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Jumlah dapat disesuaikan di bawah ini. Default dihitung otomatis (2x min_stock - stok saat ini).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipe Permintaan
              </label>
              <select
                value={bulkRequestType}
                onChange={(e) => setBulkRequestType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="restock">Restock</option>
                <option value="transfer">Transfer Antar Gudang</option>
                <option value="production">Keperluan Produksi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pengaju / Requester
              </label>
              <select
                value={bulkRequesterRole}
                onChange={(e) => setBulkRequesterRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="Kitchen Staff">Staf Dapur (Kitchen Staff)</option>
                <option value="Bar / Front of House">Staf Bar / Front of House</option>
                <option value="Operations Manager">Manajer Operasional (Operations Manager)</option>
                <option value="Inventory/Store Manager">Kepala Gudang (Inventory/Store Manager)</option>
                <option value="System Administrator">System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lokasi Tujuan / Cabang <span className="text-red-500">*</span>
              </label>
              <select
                value={bulkDestination}
                onChange={(e) => setBulkDestination(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
                  !bulkDestination ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              >
                <option value="">Pilih lokasi tujuan...</option>
                {outlets.map((outlet: any) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name} ({outlet.code})
                  </option>
                ))}
              </select>
              {!bulkDestination && (
                <p className="text-xs text-red-600 mt-1">Lokasi tujuan wajib dipilih</p>
              )}
            </div>

            {/* Selected Items with Custom Quantities */}
            <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-xs font-medium text-slate-500 mb-3">Item yang akan diajukan (sesuaikan jumlah jika perlu):</p>
              <div className="space-y-3">
                {items.filter(item => selectedItemIds.has(item.id)).map((item) => {
                  const currentStock = parseFloat(item.onHand.split(' ')[0]) || 0;
                  const minStock = parseFloat(item.reorderPoint.split(' ')[0]) || 0;
                  const autoQuantity = Math.max(minStock * 2 - currentStock, minStock);
                  const customQuantity = customQuantities[item.id] || autoQuantity.toString();
                  const unitPrice = parseFloat(item.unitCost.replace(/[^0-9]/g, '')) || 0;
                  const itemCost = parseFloat(customQuantity) * unitPrice;

                  return (
                    <div key={item.id} className="flex items-center gap-3 text-xs">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.name}</p>
                        <p className="text-slate-500">Stok: {item.onHand} | Min: {item.reorderPoint}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={customQuantity}
                          onChange={(e) => setCustomQuantities(prev => ({
                            ...prev,
                            [item.id]: e.target.value
                          }))}
                          min="0.01"
                          step="0.01"
                          className="w-20 px-2 py-1 rounded border border-slate-200 text-right focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                        <span className="text-slate-500 w-8">{item.unit}</span>
                      </div>
                      <div className="text-right w-24">
                        <p className="font-medium text-slate-900">Rp {itemCost.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Total Cost */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Estimasi Total Biaya</p>
                  <p className="text-xs text-green-600">Berdasarkan harga satuan saat ini</p>
                </div>
                <p className="text-lg font-bold text-green-900">
                  Rp {(() => {
                    const total = items
                      .filter(item => selectedItemIds.has(item.id))
                      .reduce((sum, item) => {
                        const customQuantity = customQuantities[item.id] || '0';
                        const unitPrice = parseFloat(item.unitCost.replace(/[^0-9]/g, '')) || 0;
                        return sum + (parseFloat(customQuantity) * unitPrice);
                      }, 0);
                    return total.toLocaleString('id-ID');
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
            <button
              onClick={() => {
                setBulkRequestModalOpen(false);
                setSelectedItemIds(new Set());
                setBulkRequestType('restock');
                setBulkDestination('');
                setCustomQuantities({});
              }}
              disabled={processing}
              className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleBulkRequestSubmit}
              disabled={processing || !bulkDestination}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Memproses...' : 'Ajukan Permintaan'}
            </button>
          </div>
        </div>
      </div>
    )}
    </ResponsiveShell>
  );
}
