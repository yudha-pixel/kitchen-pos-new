'use client';

import { useState, useEffect } from 'react';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { TrendingUp, TrendingDown, ArrowLeft, Download, Calendar } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  event_code: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  total_budget?: number;
  actual_revenue: number;
  actual_cost: number;
  created_at: string;
  _count: {
    orders: number;
  };
}

export default function EventProfitLossPage() {
  const { can } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/events?status=closed`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        if (data.length > 0) {
          setSelectedEvent(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast('error', 'Gagal memuat data event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const calculateProfitLoss = (event: Event) => {
    const profit = event.actual_revenue - event.actual_cost;
    const margin = event.actual_revenue > 0 ? (profit / event.actual_revenue) * 100 : 0;
    const budgetVariance = event.total_budget ? event.actual_cost - event.total_budget : null;
    return { profit, margin, budgetVariance };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const exportReport = () => {
    if (!selectedEvent) return;
    
    const { profit, margin, budgetVariance } = calculateProfitLoss(selectedEvent);
    
    const report = `
LAPORAN LABA RUGI EVENT
========================

Event: ${selectedEvent.name}
Kode: ${selectedEvent.event_code}
Lokasi: ${selectedEvent.location}
Periode: ${formatDate(selectedEvent.start_date)} - ${formatDate(selectedEvent.end_date)}

RINGKASAN KEUANGAN
------------------
Pendapatan: Rp ${selectedEvent.actual_revenue.toLocaleString('id-ID')}
Biaya Operasional: Rp ${selectedEvent.actual_cost.toLocaleString('id-ID')}
Laba/Rugi: Rp ${profit.toLocaleString('id-ID')}
Margin: ${margin.toFixed(2)}%

${selectedEvent.total_budget ? `Budget: Rp ${selectedEvent.total_budget.toLocaleString('id-ID')}
Selisih Budget: Rp ${budgetVariance?.toLocaleString('id-ID') || '-'}` : ''}

Jumlah Pesanan: ${selectedEvent._count.orders}

Status: ${selectedEvent.status}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${selectedEvent.event_code}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <ResponsiveShell title="Laporan Laba Rugi Event">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
      </ResponsiveShell>
    );
  }

  return (
    <ResponsiveShell title="Laporan Laba Rugi Event">
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
              <h1 className="text-2xl font-bold text-slate-900">Laporan Laba Rugi Event</h1>
              <p className="text-slate-600">Analisis keuangan dan performa event</p>
            </div>
          </div>
          {selectedEvent && (
            <Button onClick={exportReport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Laporan
            </Button>
          )}
        </div>

        {/* Event Selector */}
        {events.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Pilih Event:</label>
            <select
              value={selectedEvent?.id || ''}
              onChange={(e) => {
                const event = events.find((ev) => ev.id === e.target.value);
                setSelectedEvent(event || null);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.event_code} - {event.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedEvent ? (
          <>
            {/* Event Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedEvent.name}</h2>
                  <p className="text-slate-600">{selectedEvent.event_code}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {selectedEvent.status === 'closed' ? 'Ditutup' : selectedEvent.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Lokasi</p>
                  <p className="font-medium text-slate-900">{selectedEvent.location}</p>
                </div>
                <div>
                  <p className="text-slate-600">Tanggal Mulai</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedEvent.start_date)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Tanggal Selesai</p>
                  <p className="font-medium text-slate-900">{formatDate(selectedEvent.end_date)}</p>
                </div>
                <div>
                  <p className="text-slate-600">Jumlah Pesanan</p>
                  <p className="font-medium text-slate-900">{selectedEvent._count.orders}</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue Card */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Pendapatan</p>
                    <p className="text-2xl font-bold">Rp {selectedEvent.actual_revenue.toLocaleString('id-ID')}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 opacity-50" />
                </div>
              </div>

              {/* Cost Card */}
              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Biaya</p>
                    <p className="text-2xl font-bold">Rp {selectedEvent.actual_cost.toLocaleString('id-ID')}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 opacity-50" />
                </div>
              </div>

              {/* Profit/Loss Card */}
              {(() => {
                const { profit, margin } = calculateProfitLoss(selectedEvent);
                const isProfit = profit >= 0;
                return (
                  <div className={`bg-gradient-to-br ${isProfit ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-amber-600'} rounded-lg shadow-lg p-6 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">{isProfit ? 'Laba Bersih' : 'Rugi Bersih'}</p>
                        <p className="text-2xl font-bold">Rp {profit.toLocaleString('id-ID')}</p>
                        <p className="text-sm opacity-90">Margin: {margin.toFixed(2)}%</p>
                      </div>
                      {isProfit ? <TrendingUp className="h-8 w-8 opacity-50" /> : <TrendingDown className="h-8 w-8 opacity-50" />}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Rincian Keuangan</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Pendapatan dari Penjualan</span>
                  <span className="font-medium text-slate-900">Rp {selectedEvent.actual_revenue.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600">Biaya Operasional</span>
                  <span className="font-medium text-red-600">- Rp {selectedEvent.actual_cost.toLocaleString('id-ID')}</span>
                </div>
                {selectedEvent.total_budget && (() => {
                  const { budgetVariance } = calculateProfitLoss(selectedEvent);
                  return (
                    <div className="flex items-center justify-between py-3 border-b border-slate-200">
                      <span className="text-slate-600">Selisih Budget</span>
                      <span className={`font-medium ${budgetVariance && budgetVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {budgetVariance && budgetVariance > 0 ? '+' : ''}Rp {budgetVariance?.toLocaleString('id-ID') || '-'}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex items-center justify-between py-3">
                  <span className="text-lg font-bold text-slate-900">Laba/Rugi Bersih</span>
                  {(() => {
                    const { profit } = calculateProfitLoss(selectedEvent);
                    return (
                      <span className={`text-lg font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}Rp {profit.toLocaleString('id-ID')}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Metrik Performa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Rata-rata per Pesanan</p>
                  <p className="text-xl font-bold text-slate-900">
                    Rp {(selectedEvent.actual_revenue / Math.max(selectedEvent._count.orders, 1)).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">Profit Margin</p>
                  {(() => {
                    const { margin } = calculateProfitLoss(selectedEvent);
                    return (
                      <p className={`text-xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {margin.toFixed(2)}%
                      </p>
                    );
                  })()}
                </div>
                {selectedEvent.total_budget && (() => {
                  const { budgetVariance } = calculateProfitLoss(selectedEvent);
                  const budgetUtilization = (selectedEvent.actual_cost / selectedEvent.total_budget) * 100;
                  return (
                    <>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">Utilisasi Budget</p>
                        <p className="text-xl font-bold text-slate-900">{budgetUtilization.toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-600">Variance Budget</p>
                        <p className={`text-xl font-bold ${budgetVariance && budgetVariance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {budgetVariance && budgetVariance <= 0 ? 'Under' : 'Over'} Budget
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Calendar className="h-12 w-12 mb-4 text-slate-300" />
            <p className="text-lg font-medium">Tidak ada event yang ditutup</p>
            <p className="text-sm">Laporan laba rugi tersedia setelah event ditutup</p>
          </div>
        )}
      </div>
    </ResponsiveShell>
  );
}
