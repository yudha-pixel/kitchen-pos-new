'use client';

import { useState, useEffect } from 'react';
import { useConfigStore } from '@/src/store/useConfigStore';
import { getSalesDataByPeriod, getExpensesDataByPeriod, getPaymentMethodSummary, getBestSellingProducts } from '@/src/features/reports/reportsService';
import { getPayrollSummaryByPeriod, PayrollSummary } from '@/src/features/hr/hrService';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Download, Filter, CreditCard, Wallet, IdCard } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const taxRate = useConfigStore((state) => state.taxRate);
  const serviceChargeRate = useConfigStore((state) => state.serviceChargeRate);
  const [chartPeriod, setChartPeriod] = useState<number>(7);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [paymentMethodSummary, setPaymentMethodSummary] = useState<any[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'days' | 'week' | 'month' | 'custom'>('days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary>({
    totalPermanentSalary: 0,
    totalFreelanceWages: 0,
    totalOvertime: 0,
    totalHRExpenses: 0
  });

  useEffect(() => {
    loadChartData();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [chartPeriod]);

  const loadChartData = async () => {
    setLoadingChart(true);
    try {
      const [sales, expenses, paymentSummary, bestProducts, payroll] = await Promise.all([
        getSalesDataByPeriod(chartPeriod),
        getExpensesDataByPeriod(chartPeriod),
        getPaymentMethodSummary(chartPeriod),
        getBestSellingProducts(chartPeriod, 10),
        getPayrollSummaryByPeriod(chartPeriod),
      ]);
      setSalesData(sales);
      setExpensesData(expenses);
      setPaymentMethodSummary(paymentSummary);
      setBestSellingProducts(bestProducts);
      setPayrollSummary(payroll);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoadingChart(false);
    }
  };

  const mergeChartData = () => {
    const allDates = new Set([
      ...salesData.map(d => d.date),
      ...expensesData.map(d => d.date),
    ]);

    return Array.from(allDates).map(date => {
      const salesItem = salesData.find(d => d.date === date);
      const expenseItem = expensesData.find(d => d.date === date);
      return {
        date,
        sales: salesItem?.total || 0,
        expenses: expenseItem?.total || 0,
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const calculateFinancialSummary = () => {
    const totalRevenue = salesData.reduce((sum, d) => sum + d.total, 0);
    const totalNetSales = salesData.reduce((sum, d) => sum + (d.netSales || 0), 0);
    const totalTax = salesData.reduce((sum, d) => sum + (d.taxAmount || 0), 0);
    const totalServiceCharge = salesData.reduce((sum, d) => sum + (d.serviceChargeAmount || 0), 0);
    const totalOperationalExpenses = expensesData.reduce((sum, d) => sum + d.total, 0);
    const totalHRExpenses = payrollSummary.totalHRExpenses;
    const totalExpenses = totalOperationalExpenses + totalHRExpenses;
    const netProfit = totalRevenue - totalExpenses;
    return { totalRevenue, totalNetSales, totalTax, totalServiceCharge, totalOperationalExpenses, totalHRExpenses, totalExpenses, netProfit };
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const exportToCSV = () => {
    const financial = calculateFinancialSummary();
    
    // Create CSV content
    let csvContent = 'Laporan Keuangan\n';
    csvContent += `Total Pendapatan (Final),Rp${financial.totalRevenue.toLocaleString('id-ID')}\n`;
    csvContent += `Penjualan Bersih (Net Sales),Rp${financial.totalNetSales.toLocaleString('id-ID')}\n`;
    csvContent += `Pajak (${taxRate}%),Rp${financial.totalTax.toLocaleString('id-ID')}\n`;
    csvContent += `Biaya Layanan (${serviceChargeRate}%),Rp${financial.totalServiceCharge.toLocaleString('id-ID')}\n`;
    csvContent += `Total Pengeluaran Operasional,Rp${financial.totalOperationalExpenses.toLocaleString('id-ID')}\n`;
    csvContent += `Total Pengeluaran HR & Payroll,Rp${financial.totalHRExpenses.toLocaleString('id-ID')}\n`;
    csvContent += `Total Pengeluaran,Rp${financial.totalExpenses.toLocaleString('id-ID')}\n`;
    csvContent += `Laba Bersih,Rp${financial.netProfit.toLocaleString('id-ID')}\n\n`;
    
    csvContent += 'Breakdown Pengeluaran HR\n';
    csvContent += `Gaji Karyawan Tetap,Rp${payrollSummary.totalPermanentSalary.toLocaleString('id-ID')}\n`;
    csvContent += `Upah Pekerja Lepas,Rp${payrollSummary.totalFreelanceWages.toLocaleString('id-ID')}\n`;
    csvContent += `Upah Lembur,Rp${payrollSummary.totalOvertime.toLocaleString('id-ID')}\n\n`;
    
    csvContent += 'Ringkasan Metode Pembayaran\n';
    csvContent += 'Metode,Jumlah Transaksi,Total,Persentase\n';
    paymentMethodSummary.forEach(item => {
      csvContent += `${item.method},${item.count},Rp${item.total.toLocaleString('id-ID')},${item.percentage.toFixed(1)}%\n`;
    });
    
    csvContent += '\nProduk Terlaris\n';
    csvContent += 'Rank,Nama Produk,Jumlah Terjual,Pendapatan\n';
    bestSellingProducts.forEach((product, index) => {
      csvContent += `${index + 1},${product.product_name},${product.quantity},Rp${product.revenue.toLocaleString('id-ID')}\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan_keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-3">
              <h1 className="text-xl font-bold text-gray-900">Laporan Keseluruhan</h1>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total Pendapatan (Final)</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatRupiah(calculateFinancialSummary().totalRevenue)}
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total Pengeluaran</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatRupiah(calculateFinancialSummary().totalExpenses)}
                    </p>
                  </div>
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Laba Bersih</p>
                    <p className={`text-lg font-bold ${calculateFinancialSummary().netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatRupiah(calculateFinancialSummary().netProfit)}
                    </p>
                  </div>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Internal Breakdown Card */}
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <IdCard className="h-4 w-4 text-blue-600" />
                Breakdown Pendapatan (Internal)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Penjualan Bersih (Net Sales)</p>
                  <p className="text-base font-bold text-gray-900">
                    {formatRupiah(calculateFinancialSummary().totalNetSales)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Pajak ({taxRate}%)</p>
                  <p className="text-base font-bold text-orange-600">
                    {formatRupiah(calculateFinancialSummary().totalTax)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">Biaya Layanan ({serviceChargeRate}%)</p>
                  <p className="text-base font-bold text-purple-600">
                    {formatRupiah(calculateFinancialSummary().totalServiceCharge)}
                  </p>
                </div>
              </div>
            </div>

            {/* Revenue vs Expenses Chart */}
            <div className="bg-white rounded-lg shadow mb-4">
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Analisis Pendapatan vs Pengeluaran
                  </h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="days">Harian</option>
                      <option value="week">Mingguan</option>
                      <option value="month">Bulanan</option>
                      <option value="custom">Custom</option>
                    </select>
                    {filterType === 'days' && (
                      <select
                        value={chartPeriod}
                        onChange={(e) => setChartPeriod(Number(e.target.value))}
                        className="px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>Hari Ini</option>
                        <option value={7}>7 Hari</option>
                        <option value={30}>30 Hari</option>
                        <option value={90}>90 Hari</option>
                      </select>
                    )}
                    {filterType === 'custom' && (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="px-2 py-1 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:text-white transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Export
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                {loadingChart ? (
                  <div className="text-center text-gray-500 py-6">Memuat data grafik...</div>
                ) : salesData.length === 0 && expensesData.length === 0 ? (
                  <div className="text-center text-gray-500 py-6">Tidak ada data untuk ditampilkan</div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mergeChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
                      <YAxis stroke="#6b7280" fontSize={10} tickFormatter={(value) => formatRupiah(value)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6 -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                        formatter={(value: any) => formatRupiah(value || 0)}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="Pendapatan" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Pengeluaran" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payment Method Summary */}
            <div className="bg-white rounded-lg shadow mb-3">
              <div className="p-3 border-b">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  Ringkasan Metode Pembayaran
                </h2>
              </div>
              <div className="p-3">
                {paymentMethodSummary.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">Tidak ada data pembayaran</div>
                ) : (
                  <div className="space-y-2">
                    {paymentMethodSummary.map((item) => {
                      const getIcon = (method: string) => {
                        if (method === 'cash') return <Wallet className="h-3 w-3 text-green-600" />;
                        if (method === 'card') return <CreditCard className="h-3 w-3 text-blue-600" />;
                        return <ShoppingCart className="h-3 w-3 text-purple-600" />;
                      };
                      const getMethodName = (method: string) => {
                        if (method === 'cash') return 'Tunai';
                        if (method === 'card') return 'Kartu/Debit';
                        if (method === 'transfer') return 'Transfer/QRIS';
                        return method;
                      };
                      return (
                        <div key={item.method} className="bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {getIcon(item.method)}
                              <span className="text-xs font-medium text-gray-900">{getMethodName(item.method)}</span>
                            </div>
                            <span className="text-xs text-gray-600">{item.count} transaksi</span>
                          </div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-bold text-blue-600">
                              {formatRupiah(item.total)}
                            </div>
                            <div className="text-xs font-semibold text-gray-700">{item.percentage.toFixed(1)}%</div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* HR Expenses Breakdown */}
            <div className="bg-white rounded-lg shadow mb-3">
              <div className="p-3 border-b">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-purple-600" />
                  Breakdown Pengeluaran HR & Payroll
                </h2>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Gaji Karyawan Tetap</span>
                    </div>
                    <p className="text-sm font-bold text-green-700">
                      {formatRupiah(payrollSummary.totalPermanentSalary)}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Upah Pekerja Lepas</span>
                    </div>
                    <p className="text-sm font-bold text-blue-700">
                      {formatRupiah(payrollSummary.totalFreelanceWages)}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Upah Lembur</span>
                    </div>
                    <p className="text-sm font-bold text-orange-700">
                      {formatRupiah(payrollSummary.totalOvertime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Selling Products */}
            <div className="bg-white rounded-lg shadow mb-3">
              <div className="p-3 border-b">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Produk Terlaris
                </h2>
              </div>
              <div className="p-3">
                {bestSellingProducts.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">Tidak ada data penjualan</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bestSellingProducts.map((product, index) => {
                          const isTop3 = index < 3;
                          return (
                            <tr key={product.product_id} className={`hover:bg-gray-50 ${isTop3 ? 'bg-blue-50' : ''}`}>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isTop3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  {index + 1}
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <div className="text-xs font-medium text-gray-900">{product.product_name}</div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-xs text-gray-900">
                                {product.quantity}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-bold text-green-600">
                                {formatRupiah(product.revenue)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
