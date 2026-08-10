'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
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
  ChevronRight,
  X,
  Boxes,
  CheckSquare,
  Tags,
  Sliders,
  ArrowRightLeft,
  Truck,
  Zap,
  Upload,
} from 'lucide-react';

import { OutletSelector } from '@/src/components/outlet/OutletSelector';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { db, Ingredient, StockAdjustment, StockAdjustmentType } from '@/src/lib/db';
import { recordStockAdjustment, getStockAdjustmentHistory, exportInventoryData, importInventoryData } from '@/src/features/inventory/inventoryService';

const INVENTORY_NAV_ITEMS = [
  { id: 'all', label: 'All Items', icon: Boxes, active: true },
  { id: 'approvals', label: 'Stock Approvals', icon: CheckSquare, active: false },
  { id: 'categories', label: 'Categories', icon: Tags, active: false },
  { id: 'adjustments', label: 'Stock Adjustments', icon: Sliders, active: false },
  { id: 'transfers', label: 'Stock Transfers', icon: ArrowRightLeft, active: false },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, active: false },
  { id: 'automation', label: 'Automation', icon: Zap, active: false },
];

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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailTab, setDetailTab] = useState<'details' | 'activity'>('details');
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [loading, setLoading] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentType>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustmentHistory, setAdjustmentHistory] = useState<StockAdjustment[]>([]);
  const [processing, setProcessing] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];

  // Load inventory data from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const ingredients = await db.ingredients.toArray();
        const suppliers = await db.suppliers.toArray();
        
        const inventoryItems: InventoryItem[] = ingredients.map(ing => {
          const supplier = suppliers.find((s: any) => s.id === ing.supplier_id);
          const status = ing.current_stock <= 0 ? 'Out of Stock' : 
                        ing.current_stock <= ing.min_stock ? 'Low Stock' : 'In Stock';
          
          return {
            id: ing.id!,
            name: ing.name,
            sku: ing.sku,
            category: ing.category,
            onHand: `${ing.current_stock} ${ing.unit}`,
            status,
            unitCost: `Rp ${ing.unit_price.toLocaleString()}`,
            unit: ing.unit,
            barcode: ing.sku,
            supplier: supplier?.name || 'Unknown',
            sellingPrice: `Rp ${(ing.unit_price * 1.5).toLocaleString()}`,
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
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const loadAdjustmentHistory = async (ingredientId: string) => {
    try {
      const history = await getStockAdjustmentHistory(ingredientId, 10);
      setAdjustmentHistory(history);
    } catch (error) {
      console.error('Failed to load adjustment history:', error);
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
    const typeSelect = document.getElementById('importType') as HTMLSelectElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      toast('error', 'Please select a CSV file');
      return;
    }

    setProcessing(true);
    try {
      const csvData = await file.text();
      const importType = typeSelect.value as 'ingredients' | 'suppliers' | 'all';
      const result = await importInventoryData(
        csvData,
        importType,
        user?.id || 'system',
        user?.username || 'System'
      );
      
      if (result.success) {
        toast('success', `Imported ${result.imported} records successfully`);
        window.location.reload();
        setImportModalOpen(false);
      } else {
        toast('error', result.message || 'Failed to import data');
      }
      
      if (result.errors.length > 0) {
        console.warn('Import errors:', result.errors);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast('error', 'Failed to import inventory data');
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
        window.location.reload();
        setAdjustmentModalOpen(false);
        setAdjustmentQuantity('');
        setAdjustmentReason('');
      } else {
        toast('error', result.message || 'Failed to record adjustment');
      }
    } catch (error) {
      console.error('Adjustment error:', error);
      toast('error', 'Failed to record stock adjustment');
    } finally {
      setProcessing(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Header Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-2 shadow-xs shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/apps" className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs hover:bg-violet-700">
            <LayoutGrid className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-400">Inventory</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="text-slate-900 font-medium">All Items</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OutletSelector />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="h-8 w-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-medium">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-slate-700">{user?.username || 'User'}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Rail */}
        <nav className="w-56 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3 space-y-1">
            {INVENTORY_NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

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
                <div className="text-2xl font-bold text-green-900">Rp 12.5M</div>
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
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
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
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                  <RotateCw className="h-4 w-4" />
                  Refresh
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700">
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">On-Hand</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Cost</th>
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

                    {/* Stock Adjustment Button */}
                    <button
                      onClick={() => setAdjustmentModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
                    >
                      <Sliders className="h-4 w-4" />
                      Adjust Stock
                    </button>
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
              <div>
                <label className="text-sm font-medium text-slate-700">Import Type</label>
                <select
                  id="importType"
                  className="w-full mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="ingredients">Ingredients Only</option>
                  <option value="suppliers">Suppliers Only</option>
                  <option value="all">All Data</option>
                </select>
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
    </div>
  );
}
