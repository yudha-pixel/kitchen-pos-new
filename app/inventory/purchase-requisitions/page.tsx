'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  X,
  Plus,
  Send
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

interface PRItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
  estimated_price: number;
}

interface PurchaseRequisition {
  id: string;
  pr_number: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to PO';
  requested_by: string;
  items: PRItem[];
  total_estimated: number;
  notes?: string;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  min_stock: number;
  restock_quantity: number;
  unit_price: number;
  supplier_id: string | null;
  supplier?: {
    id: string;
    name: string;
  };
}

interface Supplier {
  id: string;
  name: string;
}

type PRStatus = 'all' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to PO';

export default function PurchaseRequisitionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPR, setSelectedPR] = useState<PurchaseRequisition | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Create form state
  const [prItems, setPrItems] = useState<PRItem[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('all');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<PRStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRequisitions = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequisitions(data);
      }
    } catch (error) {
      console.error('Failed to fetch purchase requisitions:', error);
      toast('error', 'Gagal memuat data purchase requisition');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchIngredients = useCallback(async () => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  }, []);

  useEffect(() => {
    fetchRequisitions();
    fetchIngredients();
    fetchSuppliers();
  }, [fetchRequisitions, fetchIngredients, fetchSuppliers]);

  const handleAddItem = () => {
    if (!selectedIngredient || !quantity) {
      toast('error', 'Pilih ingredient dan quantity');
      return;
    }

    const ingredient = ingredients.find(ing => ing.id === selectedIngredient);
    if (!ingredient) return;

    const newItem: PRItem = {
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity: parseFloat(quantity),
      unit: ingredient.unit,
      estimated_price: ingredient.unit_price * parseFloat(quantity)
    };

    setPrItems([...prItems, newItem]);
    setSelectedIngredient('');
    setQuantity('');
  };

  const handleRemoveItem = (index: number) => {
    setPrItems(prItems.filter((_, i) => i !== index));
  };

  const handleLoadAutoRestock = async () => {
    setProcessing(true);
    try {
      const token = getToken();
      
      const supplierParam = selectedSupplierFilter === 'all' ? '' : selectedSupplierFilter;
      const response = await fetch(`${API_BASE_URL}/api/ingredients/low-stock?supplier_id=${supplierParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.length === 0) {
          toast('info', 'Tidak ada item yang perlu di-restock atau otomatisasi restok belum diaktifkan');
          return;
        }
        
        // Convert to PR items
        const newItems: PRItem[] = data.map((ing: Ingredient) => ({
          ingredient_id: ing.id,
          ingredient_name: ing.name,
          quantity: ing.restock_quantity,
          unit: ing.unit,
          estimated_price: ing.unit_price * ing.restock_quantity,
        }));
        
        setPrItems(newItems);
        toast('success', `${newItems.length} item berhasil dimuat dari konfigurasi restok`);
      } else {
        toast('error', 'Gagal memuat item restok otomatis');
      }
    } catch (error) {
      console.error('Failed to load auto restock items:', error);
      toast('error', 'Gagal memuat item restok otomatis');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreatePR = async () => {
    if (prItems.length === 0) {
      toast('error', 'Tambahkan minimal 1 item');
      return;
    }

    setProcessing(true);
    try {
      const token = getToken();
      
      const totalEstimated = prItems.reduce((sum, item) => sum + item.estimated_price, 0);
      
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requested_by: user?.username || 'Unknown',
          items: prItems,
          total_estimated: totalEstimated,
          notes
        })
      });
      
      if (response.ok) {
        toast('success', 'Purchase Requisition berhasil dibuat');
        setCreateModalOpen(false);
        setPrItems([]);
        setNotes('');
        fetchRequisitions();
      } else {
        toast('error', 'Gagal membuat purchase requisition');
      }
    } catch (error) {
      console.error('Failed to create PR:', error);
      toast('error', 'Gagal membuat purchase requisition');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (prId: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${prId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved_by: user?.username || 'Admin'
        })
      });
      
      if (response.ok) {
        toast('success', 'PR berhasil di-approve');
        fetchRequisitions();
      } else {
        toast('error', 'Gagal approve PR');
      }
    } catch (error) {
      console.error('Failed to approve PR:', error);
      toast('error', 'Gagal approve PR');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (prId: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${prId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        toast('success', 'PR berhasil di-reject');
        fetchRequisitions();
      } else {
        toast('error', 'Gagal reject PR');
      }
    } catch (error) {
      console.error('Failed to reject PR:', error);
      toast('error', 'Gagal reject PR');
    } finally {
      setProcessing(false);
    }
  };

  const handleConvertToPO = async (prId: string) => {
    setProcessing(true);
    try {
      const token = getToken();
      
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${prId}/convert-to-po`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        toast('success', 'PR berhasil dikonversi ke PO');
        fetchRequisitions();
      } else {
        toast('error', 'Gagal konversi ke PO');
      }
    } catch (error) {
      console.error('Failed to convert to PO:', error);
      toast('error', 'Gagal konversi ke PO');
    } finally {
      setProcessing(false);
    }
  };

  // Filter requisitions
  const filteredRequisitions = requisitions.filter(pr => {
    const matchesStatus = statusFilter === 'all' || pr.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (pr.pr_number || '').toLowerCase().includes(q) ||
      (pr.requested_by || '').toLowerCase().includes(q);
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any; label: string }> = {
      'Pending Approval': { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock, label: 'Pending' },
      'Approved': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Approved' },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Rejected' },
      'Converted to PO': { bg: 'bg-blue-100', text: 'text-blue-700', icon: FileText, label: 'Converted' },
    };
    const { bg, text, icon: Icon, label } = config[status] || config['Pending Approval'];
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}>
        <Icon className="h-3 w-3" />
        {label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ResponsiveShell title="Purchase Requisitions">
      <div className="min-h-full bg-background -m-4 sm:-m-6">
        {/* Header */}
        <div className="bg-surface border-b border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div>
                <h1 className="text-xl font-bold text-ink">Purchase Requisitions</h1>
                <p className="text-sm text-ink-muted">Kelola permintaan pembelian barang</p>
              </div>
              <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Buat PR Baru
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface border-b border-line">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Cari PR number atau requester..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PRStatus)}
                className="px-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Semua Status</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Converted to PO">Converted to PO</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="text-center py-12 text-ink-muted">Memuat data...</div>
          ) : filteredRequisitions.length === 0 ? (
            <div className="text-center py-12 text-ink-muted">
              Tidak ada purchase requisition ditemukan
            </div>
          ) : (
            <div className="bg-surface rounded-lg shadow-sm border border-line overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-alt border-b border-line">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">PR Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Total Est.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">Tanggal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredRequisitions.map((pr) => (
                    <tr key={pr.id} className="hover:bg-surface-alt">
                      <td className="px-6 py-4 text-sm font-medium text-ink">{pr.pr_number}</td>
                      <td className="px-6 py-4 text-sm text-ink-secondary">{pr.requested_by}</td>
                      <td className="px-6 py-4 text-sm text-ink-secondary">{(pr.items || []).length} item(s)</td>
                      <td className="px-6 py-4 text-sm text-ink-secondary">{formatCurrency(pr.total_estimated)}</td>
                      <td className="px-6 py-4">{getStatusBadge(pr.status)}</td>
                      <td className="px-6 py-4 text-sm text-ink-secondary">
                        {new Date(pr.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {pr.status === 'Pending Approval' && user?.role === 'admin' && (
                            <>
                              <button
                                onClick={() => handleApprove(pr.id)}
                                disabled={processing}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(pr.id)}
                                disabled={processing}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {pr.status === 'Approved' && (
                            <button
                              onClick={() => handleConvertToPO(pr.id)}
                              disabled={processing}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Convert to PO"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedPR(pr);
                              setModalOpen(true);
                            }}
                            className="p-2 text-ink-secondary hover:bg-surface-alt rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create PR Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-line">
            <div className="p-6 border-b border-line">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Buat Purchase Requisition Baru</h2>
                <button
                  onClick={() => {
                    setCreateModalOpen(false);
                    setPrItems([]);
                    setNotes('');
                  }}
                  className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-ink-muted" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Auto Restock Section */}
              <div className="bg-primary-soft border border-primary/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-ink mb-4">Tarik Item Restok Otomatis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-secondary mb-2">Filter Supplier</label>
                    <select
                      value={selectedSupplierFilter}
                      onChange={(e) => setSelectedSupplierFilter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="all">Semua Supplier</option>
                      {suppliers.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleLoadAutoRestock}
                      disabled={processing}
                      className="w-full"
                    >
                      {processing ? 'Memuat...' : 'Tarik Item Restok Otomatis'}
                    </Button>
                  </div>
                  <div className="flex items-end">
                    <p className="text-xs text-ink-muted">
                      Memuat item dengan stok &le; min_stock dan jumlah restok &gt; 0 dari konfigurasi Otomatisasi Restok
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Item */}
              <div className="border border-line rounded-lg p-4">
                <h3 className="text-sm font-medium text-ink mb-4">Tambah Item Manual</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-ink-secondary mb-2">Ingredient</label>
                    <select
                      value={selectedIngredient}
                      onChange={(e) => setSelectedIngredient(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">-- Pilih Ingredient --</option>
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({ing.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-secondary mb-2">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddItem} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items List */}
              {prItems.length > 0 && (
                <div className="border border-line rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-alt border-b border-line">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Ingredient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Est. Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {prItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-ink">{item.ingredient_name}</td>
                          <td className="px-4 py-3 text-sm text-ink-secondary">{item.quantity} {item.unit}</td>
                          <td className="px-4 py-3 text-sm text-ink-secondary">{formatCurrency(item.estimated_price)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-surface-alt px-4 py-3 border-t border-line">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-ink-secondary">Total Estimated:</span>
                      <span className="text-ink">
                        {formatCurrency(prItems.reduce((sum, item) => sum + item.estimated_price, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-ink-secondary mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-line flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setCreateModalOpen(false);
                  setPrItems([]);
                  setNotes('');
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleCreatePR}
                disabled={processing || prItems.length === 0}
              >
                {processing ? 'Mengirim...' : 'Kirim PR'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {modalOpen && selectedPR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-line">
            <div className="p-6 border-b border-line">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-ink">Detail PR: {selectedPR.pr_number}</h2>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedPR(null);
                  }}
                  className="p-2 hover:bg-surface-alt rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-ink-muted" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-1">Requester</label>
                  <p className="text-sm text-ink">{selectedPR.requested_by}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-1">Status</label>
                  {getStatusBadge(selectedPR.status)}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-1">Tanggal</label>
                  <p className="text-sm text-ink">{new Date(selectedPR.created_at).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-1">Total Estimated</label>
                  <p className="text-sm text-ink font-medium">{formatCurrency(selectedPR.total_estimated)}</p>
                </div>
              </div>

              {selectedPR.notes && (
                <div>
                  <label className="block text-sm font-medium text-ink-muted mb-1">Notes</label>
                  <p className="text-sm text-ink">{selectedPR.notes}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-ink-secondary mb-3">Items</h3>
                <div className="border border-line rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface-alt border-b border-line">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Ingredient</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-ink-muted uppercase">Est. Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {selectedPR.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-ink">{item.ingredient_name}</td>
                          <td className="px-4 py-3 text-sm text-ink-secondary">{item.quantity} {item.unit}</td>
                          <td className="px-4 py-3 text-sm text-ink-secondary">{formatCurrency(item.estimated_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResponsiveShell>
  );
}
