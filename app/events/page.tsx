'use client';

import { useState, useEffect } from 'react';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { Calendar, Plus, Edit, Trash2, Play, Lock, Search, Filter } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

interface Event {
  id: string;
  event_code: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'closed' | 'cancelled';
  description?: string;
  total_budget?: number;
  actual_revenue: number;
  actual_cost: number;
  created_at: string;
  _count: {
    orders: number;
  };
}

export default function EventsPage() {
  const { can } = useAuth();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    start_date: '',
    end_date: '',
    description: '',
    total_budget: '',
  });

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${API_BASE_URL}/api/events?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch events');

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast('error', 'Gagal memuat data event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, searchQuery]);

  const handleCreate = () => {
    setSelectedEvent(null);
    setFormData({
      name: '',
      location: '',
      start_date: '',
      end_date: '',
      description: '',
      total_budget: '',
    });
    setModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      name: event.name,
      location: event.location,
      start_date: event.start_date.split('T')[0],
      end_date: event.end_date.split('T')[0],
      description: event.description || '',
      total_budget: event.total_budget?.toString() || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const token = getToken();
      const url = selectedEvent
        ? `${API_BASE_URL}/api/events/${selectedEvent.id}`
        : `${API_BASE_URL}/api/events`;

      const response = await fetch(url, {
        method: selectedEvent ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save event');

      toast('success', selectedEvent ? 'Event berhasil diperbarui' : 'Event berhasil dibuat');
      setModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast('error', 'Gagal menyimpan event');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete event');

      toast('success', 'Event berhasil dihapus');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast('error', 'Gagal menghapus event');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/events/${id}/activate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to activate event');

      toast('success', 'Event berhasil diaktifkan');
      fetchEvents();
    } catch (error) {
      console.error('Error activating event:', error);
      toast('error', 'Gagal mengaktifkan event');
    }
  };

  const handleClose = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menutup event ini? Stok akan dikembalikan dan laporan akan difinalisasi.')) return;

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/events/${id}/close`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to close event');

      toast('success', 'Event berhasil ditutup');
      fetchEvents();
    } catch (error) {
      console.error('Error closing event:', error);
      toast('error', 'Gagal menutup event');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      planned: 'Direncanakan',
      active: 'Aktif',
      closed: 'Ditutup',
      cancelled: 'Dibatalkan',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <ResponsiveShell title="Manajemen Event">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Event</h1>
            <p className="text-slate-600">Kelola event, alokasi stok, dan laporan laba rugi</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Buat Event Baru
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">Semua Status</option>
            <option value="planned">Direncanakan</option>
            <option value="active">Aktif</option>
            <option value="closed">Ditutup</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Calendar className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Tidak ada event</p>
            <p className="text-sm">Belum ada event yang ditemukan</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">{event.name}</h3>
                    <p className="text-sm text-slate-600">{event.event_code}</p>
                  </div>
                  {getStatusBadge(event.status)}
                </div>

                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <p><strong>Lokasi:</strong> {event.location}</p>
                  <p><strong>Tanggal:</strong> {formatDate(event.start_date)} - {formatDate(event.end_date)}</p>
                  <p><strong>Pesanan:</strong> {event._count.orders}</p>
                  {event.total_budget && (
                    <p><strong>Budget:</strong> Rp {event.total_budget.toLocaleString('id-ID')}</p>
                  )}
                  {event.status === 'closed' && (
                    <>
                      <p><strong>Pendapatan:</strong> Rp {event.actual_revenue.toLocaleString('id-ID')}</p>
                      <p><strong>Biaya:</strong> Rp {event.actual_cost.toLocaleString('id-ID')}</p>
                      <p className={`font-medium ${event.actual_revenue - event.actual_cost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <strong>Laba/Rugi:</strong> Rp {(event.actual_revenue - event.actual_cost).toLocaleString('id-ID')}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                  {event.status === 'planned' && (
                    <button
                      onClick={() => handleActivate(event.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      Aktifkan
                    </button>
                  )}
                  {event.status === 'active' && (
                    <button
                      onClick={() => handleClose(event.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-600 text-white text-sm hover:bg-orange-700 transition-colors"
                    >
                      <Lock className="h-4 w-4" />
                      Tutup Event
                    </button>
                  )}
                  {event.status !== 'active' && event.status !== 'closed' && (
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                  {(event.status === 'planned' || event.status === 'cancelled') && (
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {selectedEvent ? 'Edit Event' : 'Buat Event Baru'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nama Event</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lokasi</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget Total (Rp)</label>
                <input
                  type="number"
                  value={formData.total_budget}
                  onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  {processing ? 'Menyimpan...' : selectedEvent ? 'Simpan' : 'Buat Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResponsiveShell>
  );
}
