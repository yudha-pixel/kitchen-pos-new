'use client';

import { useState } from 'react';
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
  Edit,
  X,
  Boxes,
  CheckSquare,
  Tags,
  Sliders,
  ArrowRightLeft,
  Truck,
  Zap,
  ChevronLeft,
} from 'lucide-react';

import { OutletSelector } from '@/src/components/outlet/OutletSelector';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';

const INVENTORY_NAV_ITEMS = [
  { id: 'all', label: 'All Items', icon: Boxes, active: true },
  { id: 'approvals', label: 'Stock Approvals', icon: CheckSquare, active: false },
  { id: 'categories', label: 'Categories', icon: Tags, active: false },
  { id: 'adjustments', label: 'Stock Adjustments', icon: Sliders, active: false },
  { id: 'transfers', label: 'Stock Transfers', icon: ArrowRightLeft, active: false },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, active: false },
  { id: 'automation', label: 'Automation', icon: Zap, active: false },
];

const MOCK_ITEMS = [
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
    name: 'Cooking Oil 1L',
    sku: 'COL-004',
    category: 'Pantry',
    onHand: '0 pcs',
    status: 'Out of Stock',
    unitCost: 'Rp 22.000',
    unit: 'pcs',
    barcode: '8991234567893',
    supplier: 'Minyak Utama PT',
    sellingPrice: 'Rp 28.000',
    reorderPoint: '20 pcs',
    description: 'Refined palm cooking oil 1 liter bottle.',
    committed: '0 pcs',
    available: '0 pcs',
    lastUpdated: '9 Aug 2024, 12:00 by kasir_01',
  },
  {
    id: '5',
    name: 'Tomato Sauce 1kg',
    sku: 'TSA-005',
    category: 'Pantry',
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
    lastUpdated: '9 Aug 2024, 09:30 by admin',
  },
];

export default function InventoryPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedItemId, setSelectedItemId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailTab, setDetailTab] = useState<'details' | 'activity'>('details');

  const selectedItem = MOCK_ITEMS.find((i) => i.id === selectedItemId) || MOCK_ITEMS[0];

  const filteredItems = MOCK_ITEMS.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-semibold text-slate-900">All Items</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <OutletSelector />
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-700 text-xs font-bold text-white uppercase">
              {user?.username?.charAt(0) || 'A'}
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden sm:block">{user?.username || 'admin'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area: Left Rail + Table Workspace + Right Detail Panel */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* Scoped Inventory Sub-Nav Rail */}
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 hidden lg:flex">
          <div className="p-3">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-violet-700">
              <Boxes className="h-5 w-5" />
              <span>Inventory</span>
            </div>
            <nav className="mt-2 space-y-1">
              {INVENTORY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors cursor-pointer ${
                      item.active
                        ? 'bg-violet-50 text-violet-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${item.active ? 'text-violet-600' : 'text-slate-400'}`} />
                    <span className="text-xs">{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800">
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </button>
          </div>
        </aside>

        {/* Central Workspace: KPIs + Search/Filter + Table */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 bg-slate-50/70">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Items</h1>
          </div>

          {/* KPI Header Stats Row (Matching Wireframe 02) */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs text-slate-500 block">Total Items</span>
              <span className="text-2xl font-bold text-slate-900 block mt-1">1,248</span>
              <span className="text-[11px] text-emerald-600 font-medium block mt-1">Active</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs text-slate-500 block">Low Stock</span>
              <span className="text-2xl font-bold text-slate-900 block mt-1">28</span>
              <span className="text-[11px] text-amber-600 font-medium block mt-1">Warning</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs text-slate-500 block">Out of Stock</span>
              <span className="text-2xl font-bold text-slate-900 block mt-1">9</span>
              <span className="text-[11px] text-red-600 font-medium block mt-1">Danger</span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-xs text-slate-500 block">Total Value</span>
              <span className="text-xl font-bold text-slate-900 block mt-1">Rp 125.450.000</span>
              <span className="text-[11px] text-blue-600 font-medium block mt-1">On Hand</span>
            </div>
          </div>

          {/* Search, Filter, and Action Bar */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs text-slate-800 focus:border-violet-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>Filters</span>
              </button>
              <button className="flex items-center gap-1.5 rounded-xl bg-violet-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-800 shadow-2xs">
                <Plus className="h-4 w-4" />
                <span>New Item</span>
              </button>
            </div>
          </div>

          {/* Dense Items Data Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden flex-1">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-8">
                    <input type="checkbox" className="rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                  </th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">On Hand</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isSelected = item.id === selectedItemId;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-violet-50/70 font-medium' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{item.sku}</td>
                      <td className="py-3 px-4 text-slate-600">{item.category}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{item.onHand}</td>
                      <td className="py-3 px-4">
                        {item.status === 'In Stock' && (
                          <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            In Stock
                          </span>
                        )}
                        {item.status === 'Low Stock' && (
                          <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            Low Stock
                          </span>
                        )}
                        {item.status === 'Out of Stock' && (
                          <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-800">
                            Out of Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">{item.unitCost}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>

        {/* Right Details Panel (Matching Wireframe 02) */}
        <aside className="w-96 border-l border-slate-200 bg-white p-6 overflow-y-auto hidden xl:flex xl:flex-col justify-between shrink-0">
          {selectedItem && (
            <div className="space-y-6">
              {/* Thumbnail + Title Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <Box className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900">{selectedItem.name}</h2>
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                        {selectedItem.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono block">SKU: {selectedItem.sku}</span>
                    <span className="text-xs text-slate-500 block">Category: {selectedItem.category}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs */}
              <div className="border-b border-slate-100 flex gap-6 text-xs font-medium text-slate-500">
                <button
                  onClick={() => setDetailTab('details')}
                  className={`pb-2 transition-colors border-b-2 ${
                    detailTab === 'details' ? 'border-violet-600 text-violet-700 font-bold' : 'border-transparent'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setDetailTab('activity')}
                  className={`pb-2 transition-colors border-b-2 ${
                    detailTab === 'activity' ? 'border-violet-600 text-violet-700 font-bold' : 'border-transparent'
                  }`}
                >
                  Activity
                </button>
              </div>

              {/* Item Information Grid */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Item Information</span>
                  <button className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800">
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-slate-600">
                  <span>Unit:</span>
                  <span className="font-semibold text-slate-900 text-right">{selectedItem.unit}</span>
                  <span>Barcode:</span>
                  <span className="font-mono text-slate-900 text-right">{selectedItem.barcode}</span>
                  <span>Supplier:</span>
                  <span className="font-semibold text-slate-900 text-right">{selectedItem.supplier}</span>
                  <span>Unit Cost:</span>
                  <span className="font-semibold text-slate-900 text-right">{selectedItem.unitCost}</span>
                  <span>Selling Price:</span>
                  <span className="font-semibold text-slate-900 text-right">{selectedItem.sellingPrice}</span>
                  <span>Reorder Point:</span>
                  <span className="font-semibold text-slate-900 text-right">{selectedItem.reorderPoint}</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">{selectedItem.description}</p>
              </div>

              {/* Stock Information */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block">Stock Information</span>
                <div className="grid grid-cols-2 gap-y-1.5 text-slate-600">
                  <span>On Hand:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedItem.onHand}</span>
                  <span>Committed:</span>
                  <span className="font-semibold text-slate-700 text-right">{selectedItem.committed}</span>
                  <span>Available:</span>
                  <span className="font-bold text-emerald-700 text-right">{selectedItem.available}</span>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Last Updated: {selectedItem.lastUpdated}
                </span>
              </div>

              {/* Audit Timeline */}
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Audit Timeline</span>
                <div className="space-y-2 border-l-2 border-slate-200 pl-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px]">Stock In</span>
                      <span className="text-[10px] text-slate-400">10 Aug 2024, 02.10 by admin</span>
                    </div>
                    <span className="font-bold text-emerald-600 text-xs">+50 kg</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px]">Stock Out</span>
                      <span className="text-[10px] text-slate-400">9 Aug 2024, 18.45 by kasir_01</span>
                    </div>
                    <span className="font-bold text-amber-600 text-xs">-5 kg</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-800 block text-[11px]">Adjustment</span>
                      <span className="text-[10px] text-slate-400">9 Aug 2024, 11.30 by admin</span>
                    </div>
                    <span className="font-bold text-blue-600 text-xs">+2 kg</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
