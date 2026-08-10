'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { formatRupiah } from '@/src/lib/format';
import { Search, Calendar, User, Download, Filter, Gift, Tag } from 'lucide-react';

interface DiscountOrder {
  id?: string;
  created_at?: string;
  total_amount?: number;
  global_discount_amount?: number;
  global_discount_type?: 'nominal' | 'percentage';
  global_discount_authorized_by?: string;
  global_discount_reason?: string;
  table_number?: string | null;
  payment_method?: string;
  order_category?: string;
}

interface VoucherOrder {
  id?: string;
  created_at?: string;
  total_amount?: number;
  voucher_code?: string | null;
  voucher_id?: string | null;
  voucher_discount_type?: 'nominal' | 'percentage' | null;
  voucher_discount_value?: number;
  voucher_discount_amount?: number;
  table_number?: string | null;
  payment_method?: string;
  order_category?: string;
}

interface FreeOrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  quantity?: number;
  price_at_time?: number;
  is_free?: boolean;
  created_at?: string;
}

export default function DiscountReportsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [orders, setOrders] = useState<DiscountOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DiscountOrder[]>([]);
  const [voucherOrders, setVoucherOrders] = useState<VoucherOrder[]>([]);
  const [filteredVoucherOrders, setFilteredVoucherOrders] = useState<VoucherOrder[]>([]);
  const [freeItems, setFreeItems] = useState<FreeOrderItem[]>([]);
  const [filteredFreeItems, setFilteredFreeItems] = useState<FreeOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discount' | 'voucher' | 'free'>('discount');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthorizedBy, setFilterAuthorizedBy] = useState('');
  const [filterDiscountType, setFilterDiscountType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      loadDiscountOrders();
      loadVoucherOrders();
      loadFreeItems();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [orders, voucherOrders, freeItems, searchTerm, filterAuthorizedBy, filterDiscountType, dateFrom, dateTo]);

  const loadDiscountOrders = async () => {
    try {
      const { db } = await import('@/src/lib/db');
      const allOrders = await db.orders
        .where('global_discount_amount')
        .above(0)
        .reverse()
        .sortBy('created_at');
      
      setOrders(allOrders as DiscountOrder[]);
      setFilteredOrders(allOrders as DiscountOrder[]);
    } catch (error) {
      console.error('Failed to load discount orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVoucherOrders = async () => {
    try {
      const { db } = await import('@/src/lib/db');
      const allOrders = await db.orders
        .where('voucher_discount_amount')
        .above(0)
        .reverse()
        .sortBy('created_at');
      
      setVoucherOrders(allOrders as VoucherOrder[]);
      setFilteredVoucherOrders(allOrders as VoucherOrder[]);
    } catch (error) {
      console.error('Failed to load voucher orders:', error);
    }
  };

  const loadFreeItems = async () => {
    try {
      const { db } = await import('@/src/lib/db');
      const allOrderItems = await db.order_items.toArray();
      const allFreeItems = allOrderItems.filter(item => item.is_free === true);
      
      setFreeItems(allFreeItems as FreeOrderItem[]);
      setFilteredFreeItems(allFreeItems as FreeOrderItem[]);
    } catch (error) {
      console.error('Failed to load free items:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search term
    if (searchTerm) {
      filtered = filtered.filter(order =>
        (order.global_discount_reason?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (order.global_discount_authorized_by?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (order.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Filter by authorized by
    if (filterAuthorizedBy) {
      filtered = filtered.filter(order =>
        order.global_discount_authorized_by === filterAuthorizedBy
      );
    }

    // Filter by discount type
    if (filterDiscountType) {
      filtered = filtered.filter(order =>
        order.global_discount_type === filterDiscountType
      );
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(order =>
        order.created_at && new Date(order.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filtered = filtered.filter(order =>
        order.created_at && new Date(order.created_at) <= new Date(dateTo + 'T23:59:59')
      );
    }

    setFilteredOrders(filtered);

    // Filter voucher orders
    let filteredVouchers = [...voucherOrders];
    if (searchTerm) {
      filteredVouchers = filteredVouchers.filter(order =>
        (order.voucher_code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (order.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    if (dateFrom) {
      filteredVouchers = filteredVouchers.filter(order =>
        order.created_at && new Date(order.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filteredVouchers = filteredVouchers.filter(order =>
        order.created_at && new Date(order.created_at) <= new Date(dateTo + 'T23:59:59')
      );
    }
    setFilteredVoucherOrders(filteredVouchers);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAuthorizedBy('');
    setFilterDiscountType('');
    setDateFrom('');
    setDateTo('');
  };

  const exportToCSV = () => {
    const headers = ['Order ID', 'Tanggal', 'Otorisasi', 'Alasan', 'Tipe Diskon', 'Nilai Diskon', 'Total Transaksi', 'Metode Pembayaran', 'Kategori'];
    const rows = filteredOrders.map(order => [
      order.id || '',
      order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : '',
      order.global_discount_authorized_by || '',
      order.global_discount_reason || '',
      order.global_discount_type || '',
      order.global_discount_amount || 0,
      order.total_amount || 0,
      order.payment_method || '',
      order.order_category || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `discount-reports-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Calculate statistics
  const totalDiscountAmount = filteredOrders.reduce((sum, order) => sum + (order.global_discount_amount || 0), 0);
  const totalTransactions = filteredOrders.length;
  const totalTransactionValue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const averageDiscount = totalTransactions > 0 ? totalDiscountAmount / totalTransactions : 0;
  
  // Voucher statistics
  const totalVoucherAmount = filteredVoucherOrders.reduce((sum, order) => sum + (order.voucher_discount_amount || 0), 0);
  const totalVoucherTransactions = filteredVoucherOrders.length;
  const totalVoucherTransactionValue = filteredVoucherOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const averageVoucherDiscount = totalVoucherTransactions > 0 ? totalVoucherAmount / totalVoucherTransactions : 0;
  
  // Free items statistics
  const totalFreeItems = filteredFreeItems.length;
  const totalFreeItemValue = filteredFreeItems.reduce((sum, item) => sum + (item.price_at_time || 0), 0);
  const totalFreeItemQuantity = filteredFreeItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Get unique authorized users for filter
  const authorizedUsers = Array.from(new Set(orders.map(o => o.global_discount_authorized_by).filter(Boolean)));

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Laporan Diskon & Item Gratis</h1>
              <p className="text-gray-600 mt-1">Audit trail dan statistik penggunaan diskon dan item gratis</p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('discount')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'discount'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Global Diskon
                </button>
                <button
                  onClick={() => setActiveTab('voucher')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'voucher'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Voucer
                </button>
                <button
                  onClick={() => setActiveTab('free')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'free'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Item Gratis
                </button>
              </nav>
            </div>

            {/* Statistics Cards */}
            {activeTab === 'discount' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Transaksi</div>
                  <div className="text-2xl font-bold text-gray-900">{totalTransactions}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Diskon</div>
                  <div className="text-2xl font-bold text-orange-600">{formatRupiah(totalDiscountAmount)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Rata-rata Diskon</div>
                  <div className="text-2xl font-bold text-gray-900">{formatRupiah(averageDiscount)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Nilai Transaksi</div>
                  <div className="text-2xl font-bold text-gray-900">{formatRupiah(totalTransactionValue)}</div>
                </div>
              </div>
            ) : activeTab === 'voucher' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Transaksi Voucer</div>
                  <div className="text-2xl font-bold text-gray-900">{totalVoucherTransactions}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Diskon Voucer</div>
                  <div className="text-2xl font-bold text-purple-600">{formatRupiah(totalVoucherAmount)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Rata-rata Diskon</div>
                  <div className="text-2xl font-bold text-gray-900">{formatRupiah(averageVoucherDiscount)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Nilai Transaksi</div>
                  <div className="text-2xl font-bold text-gray-900">{formatRupiah(totalVoucherTransactionValue)}</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Item Gratis</div>
                  <div className="text-2xl font-bold text-green-600">{totalFreeItems}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Nilai Gratis</div>
                  <div className="text-2xl font-bold text-green-600">{formatRupiah(totalFreeItemValue)}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Total Kuantitas</div>
                  <div className="text-2xl font-bold text-gray-900">{totalFreeItemQuantity}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="text-sm text-gray-600">Rata-rata Nilai</div>
                  <div className="text-2xl font-bold text-gray-900">{totalFreeItems > 0 ? formatRupiah(totalFreeItemValue / totalFreeItems) : 'Rp 0'}</div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filter</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ID, alasan, otorisasi..."
                      className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Otorisasi</label>
                  <select
                    value={filterAuthorizedBy}
                    onChange={(e) => setFilterAuthorizedBy(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Semua</option>
                    {authorizedUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Diskon</label>
                  <select
                    value={filterDiscountType}
                    onChange={(e) => setFilterDiscountType(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Semua</option>
                    <option value="nominal">Nominal</option>
                    <option value="percentage">Persentase</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-gray-900"
                >
                  Reset Filter
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 hover:text-white flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {activeTab === 'discount' ? (
                loading ? (
                  <div className="p-8 text-center text-gray-500">Memuat data...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Tidak ada data penggunaan global diskon
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Otorisasi</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alasan</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                          <tr key={order.id || Math.random()} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.id ? order.id.slice(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                {order.global_discount_authorized_by || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {order.global_discount_reason || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.global_discount_type === 'percentage' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {order.global_discount_type === 'percentage' ? order.global_discount_amount + '%' : 'Nominal'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                              {formatRupiah(order.global_discount_amount || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatRupiah(order.total_amount || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.payment_method || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : activeTab === 'voucher' ? (
                loading ? (
                  <div className="p-8 text-center text-gray-500">Memuat data...</div>
                ) : filteredVoucherOrders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Tidak ada data penggunaan voucer
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Voucer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredVoucherOrders.map((order) => (
                          <tr key={order.id || Math.random()} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.id ? order.id.slice(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.created_at ? new Date(order.created_at).toLocaleString('id-ID') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-purple-400" />
                                {order.voucher_code || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.voucher_discount_type === 'percentage' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {order.voucher_discount_type === 'percentage' ? order.voucher_discount_value + '%' : 'Nominal'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.voucher_discount_type === 'percentage' ? order.voucher_discount_value + '%' : formatRupiah(order.voucher_discount_value || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                              {formatRupiah(order.voucher_discount_amount || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatRupiah(order.total_amount || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.payment_method || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : activeTab === 'free' ? (
                loading ? (
                  <div className="p-8 text-center text-gray-500">Memuat data...</div>
                ) : filteredFreeItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    Tidak ada data item gratis
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Item ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kuantitas</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredFreeItems.map((item) => (
                          <tr key={item.id || Math.random()} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.id ? item.id.slice(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.order_id ? item.order_id.slice(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.product_id ? item.product_id.slice(0, 8) + '...' : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {formatRupiah(item.price_at_time || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
