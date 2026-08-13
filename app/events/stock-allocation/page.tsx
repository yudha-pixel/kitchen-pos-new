'use client';

import { useState, useEffect } from 'react';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { Package, Plus, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  event_code: string;
  name: string;
  status: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
}

interface Ingredient {
  id: string;
  name: string;
  current_stock: number;
  unit: string;
}

interface TransferItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface StockTransfer {
  id: string;
  transfer_number: string;
  event_id: string;
  from_warehouse_id: string;
  status: string;
  created_at: string;
  items: TransferItem[];
  event?: Event;
}

export default function EventStockAllocationPage() {
  const { can } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [notes, setNotes] = useState('');

  const fetchEvents = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/events?status=active,planned`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/warehouses`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWarehouses(data);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIngredients(data);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/event-stock-transfers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTransfers(data);
      }
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchWarehouses();
    fetchIngredients();
    fetchTransfers();
  }, []);

  const handleAddItem = () => {
    if (ingredients.length > 0) {
      setTransferItems([
        ...transferItems,
        {
          ingredient_id: ingredients[0].id,
          ingredient_name: ingredients[0].name,
          quantity: 0,
          unit: ingredients[0].unit,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setTransferItems(transferItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof TransferItem, value: any) => {
    const updated = [...transferItems];
    if (field === 'ingredient_id') {
      const ingredient = ingredients.find((ing) => ing.id === value);
      if (ingredient) {
        updated[index] = {
          ...updated[index],
          ingredient_id: value,
          ingredient_name: ingredient.name,
          unit: ingredient.unit,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setTransferItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !selectedWarehouse || transferItems.length === 0) {
      toast('error', 'Mohon lengkapi semua field');
      return;
    }

    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/event-stock-transfers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: selectedEvent,
          from_warehouse_id: selectedWarehouse,
          items: transferItems,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to create transfer');

      toast('success', 'Transfer stok berhasil dibuat');
      setModalOpen(false);
      setTransferItems([]);
      setNotes('');
      setSelectedEvent('');
      setSelectedWarehouse('');
      fetchTransfers();
    } catch (error) {
      console.error('Error creating transfer:', error);
      toast('error', 'Gagal membuat transfer stok');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/event-stock-transfers/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to approve transfer');

      toast('success', 'Transfer berhasil disetujui');
      fetchTransfers();
    } catch (error) {
      console.error('Error approving transfer:', error);
      toast('error', 'Gagal menyetujui transfer');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/event-stock-transfers/${id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to complete transfer');

      toast('success', 'Transfer berhasil diselesaikan');
      fetchTransfers();
    } catch (error) {
      console.error('Error completing transfer:', error);
      toast('error', 'Gagal menyelesaikan transfer');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan transfer ini?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/event-stock-transfers/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to cancel transfer');

      toast('success', 'Transfer berhasil dibatalkan');
      fetchTransfers();
    } catch (error) {
      console.error('Error cancelling transfer:', error);
      toast('error', 'Gagal membatalkan transfer');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      pending: 'Pending',
      approved: 'Disetujui',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    };
    const icons = {
      pending: <Clock className="h-3 w-3" />,
      approved: <CheckCircle className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <ResponsiveShell title="Alokasi Stok Event">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/events')}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Alokasi Stok Event</h1>
              <p className="text-slate-600">Transfer stok dari gudang pusat ke gudang virtual event</p>
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Transfer Baru
          </Button>
        </div>

        {/* Transfers List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Package className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Tidak ada transfer</p>
            <p className="text-sm">Belum ada transfer stok event yang ditemukan</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Nomor Transfer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Gudang Asal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Jumlah Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {transfer.transfer_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {transfer.event?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {warehouses.find((w) => w.id === transfer.from_warehouse_id)?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {transfer.items.length} item
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transfer.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {transfer.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(transfer.id)}
                            className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => handleCancel(transfer.id)}
                            className="px-3 py-1 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors"
                          >
                            Batalkan
                          </button>
                        </div>
                      )}
                      {transfer.status === 'approved' && (
                        <button
                          onClick={() => handleComplete(transfer.id)}
                          className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition-colors"
                        >
                          Selesaikan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Transfer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-slate-900">Buat Transfer Stok Event</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Event</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  >
                    <option value="">Pilih Event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.event_code} - {event.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Gudang Asal</label>
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  >
                    <option value="">Pilih Gudang</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.code} - {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Item Stok</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-sm text-violet-600 hover:text-violet-700"
                  >
                    + Tambah Item
                  </button>
                </div>
                {transferItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <select
                      value={item.ingredient_id}
                      onChange={(e) => handleItemChange(index, 'ingredient_id', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} (Stok: {ing.current_stock} {ing.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                      className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      min="0"
                      step="0.01"
                      required
                    />
                    <span className="text-sm text-slate-600 w-16">{item.unit}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Catatan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Menyimpan...' : 'Buat Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResponsiveShell>
  );
}
