'use client';

import { useState, useEffect } from 'react';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { Receipt, Plus, Edit, Trash2, ArrowLeft, Search } from 'lucide-react';
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

interface OperationalCost {
  id: string;
  event_id: string;
  category: string;
  description: string;
  amount: number;
  receipt_url?: string;
  created_at: string;
  event?: Event;
}

export default function EventOperationalCostsPage() {
  const { can } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [selectedEvent, setSelectedEvent] = useState('');
  const [category, setCategory] = useState('booth_rent');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');

  // Filter state
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchEvents = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/events`, {
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

  const fetchCosts = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (filterEvent !== 'all') params.append('event_id', filterEvent);
      if (filterCategory !== 'all') params.append('category', filterCategory);

      const response = await fetch(`${API_BASE_URL}/api/event-operational-costs?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCosts(data);
      }
    } catch (error) {
      console.error('Error fetching costs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCosts();
  }, [filterEvent, filterCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !description || !amount) {
      toast('error', 'Mohon lengkapi semua field wajib');
      return;
    }

    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/event-operational-costs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          event_id: selectedEvent,
          category,
          description,
          amount: parseFloat(amount),
          receipt_url: receiptUrl || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create cost');

      toast('success', 'Biaya operasional berhasil dicatat');
      setModalOpen(false);
      setCategory('booth_rent');
      setDescription('');
      setAmount('');
      setReceiptUrl('');
      setSelectedEvent('');
      fetchCosts();
    } catch (error) {
      console.error('Error creating cost:', error);
      toast('error', 'Gagal mencatat biaya operasional');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus biaya ini?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/event-operational-costs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete cost');

      toast('success', 'Biaya berhasil dihapus');
      fetchCosts();
    } catch (error) {
      console.error('Error deleting cost:', error);
      toast('error', 'Gagal menghapus biaya');
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      booth_rent: 'Sewa Booth',
      transportation: 'Transportasi',
      labor: 'Tenaga Kerja',
      marketing: 'Marketing',
      other: 'Lainnya',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <ResponsiveShell title="Biaya Operasional Event">
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
              <h1 className="text-2xl font-bold text-slate-900">Biaya Operasional Event</h1>
              <p className="text-slate-600">Catat biaya operasional untuk setiap event</p>
            </div>
          </div>
          <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Catat Biaya Baru
          </Button>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Biaya Operasional</p>
              <p className="text-3xl font-bold">Rp {totalCosts.toLocaleString('id-ID')}</p>
            </div>
            <Receipt className="h-12 w-12 opacity-50" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">Semua Event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.event_code} - {event.name}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="booth_rent">Sewa Booth</option>
            <option value="transportation">Transportasi</option>
            <option value="labor">Tenaga Kerja</option>
            <option value="marketing">Marketing</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        {/* Costs List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : costs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Receipt className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Tidak ada biaya</p>
            <p className="text-sm">Belum ada biaya operasional yang dicatat</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Deskripsi
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {costs.map((cost) => (
                  <tr key={cost.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(cost.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {cost.event?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {getCategoryLabel(cost.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {cost.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                      Rp {cost.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDelete(cost.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Cost Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">Catat Biaya Operasional</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="booth_rent">Sewa Booth</option>
                  <option value="transportation">Transportasi</option>
                  <option value="labor">Tenaga Kerja</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah (Rp)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">URL Bukti (Opsional)</label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="https://..."
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
                  {processing ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResponsiveShell>
  );
}
