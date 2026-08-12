'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { DollarSign, Calendar, Filter, Download, RefreshCw, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';

interface PettyCashExpense {
  id: string;
  amount: number;
  description: string;
  category: string;
  receipt_url: string | null;
  expense_date: string;
  created_at: string;
  created_by_user: {
    id: string;
    username: string;
    full_name: string;
  };
  ingredient?: {
    id: string;
    name: string;
  };
}

interface PettyCashSummary {
  total_amount: number;
  total_count: number;
  by_category: Record<string, number>;
}

export default function PettyCashPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState<PettyCashExpense[]>([]);
  const [summary, setSummary] = useState<PettyCashSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/finance/petty-cash');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    loadData();
  }, [startDate, endDate, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      // Build query params
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      // Fetch expenses
      const expensesResponse = await fetch(`${API_BASE_URL}/api/petty-cash?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch summary
      const summaryResponse = await fetch(`${API_BASE_URL}/api/petty-cash/summary?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        setExpenses(expensesData);
      }

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Failed to load petty cash data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setCategoryFilter('all');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'ad_hoc_purchase': 'Pembelian Ad-hoc',
      'operational': 'Operasional',
      'misc': 'Lainnya',
    };
    return labels[category] || category;
  };

  const categoryOptions = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'ad_hoc_purchase', label: 'Pembelian Ad-hoc' },
    { value: 'operational', label: 'Operasional' },
    { value: 'misc', label: 'Lainnya' },
  ];

  if (authLoading || loading) {
    return (
      <ResponsiveShell>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ResponsiveShell>
    );
  }

  return (
    <ResponsiveShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Riwayat Petty Cash</h1>
            <p className="text-sm text-slate-500">Pantau dan verifikasi pengeluaran kas kecil</p>
          </div>
          <Button onClick={loadData} variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.total_amount)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Jumlah Transaksi</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.total_count}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Kategori Terbanyak</p>
                  <p className="text-lg font-bold text-slate-900">
                    {Object.entries(summary.by_category).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {summary && Object.keys(summary.by_category).length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Ringkasan per Kategori</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(summary.by_category).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">{getCategoryLabel(category)}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900">Filter</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="startDate" className="mb-2 block text-sm font-medium text-slate-700">
                Tanggal Mulai
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-slate-700">
                Tanggal Akhir
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">
                Kategori
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleResetFilters} variant="secondary" className="w-full">
                Reset Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Daftar Pengeluaran</h3>
          </div>
          {expenses.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Tidak ada data pengeluaran</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Dibuat Oleh
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {formatDate(expense.expense_date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        <div className="font-medium">{expense.description}</div>
                        {expense.ingredient && (
                          <div className="text-xs text-slate-500">Item: {expense.ingredient.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                          {getCategoryLabel(expense.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {expense.created_by_user?.full_name || expense.created_by_user?.username || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ResponsiveShell>
  );
}
