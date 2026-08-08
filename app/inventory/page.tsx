'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { getIngredientsWithStatus, addIngredient, createStockRequest, createStockWriteOff, getPurchaseDataByPeriod } from '@/src/features/inventory/recipeApiService';
import { getSalesDataByPeriod } from '@/src/features/reports/reportsService';
import { AlertTriangle, Package, TrendingUp, TrendingDown, Plus, X, DollarSign, Filter, ArrowDown, ShoppingCart, Upload, AlertCircle, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AVAILABLE_UNITS = ['kg', 'gram', 'pcs', 'liter', 'ml', 'lusin', 'box', 'pack'];

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockRequestModalOpen, setIsStockRequestModalOpen] = useState(false);
  const [isWriteOffModalOpen, setIsWriteOffModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    current_stock: 0,
    unit: 'kg',
    min_stock: 0,
    unit_price: 0,
  });
  const [stockRequestForm, setStockRequestForm] = useState({
    ingredient_id: '',
    ingredient_name: '',
    quantity_requested: 0,
    unit: 'kg',
    notes: '',
    supplier_name: '',
    proof_file: '',
    proof_file_name: '',
  });
  const [writeOffForm, setWriteOffForm] = useState({
    ingredient_id: '',
    ingredient_name: '',
    quantity_written_off: 0,
    unit: 'kg',
    reason: '',
    notes: '',
    proof_file: '',
    proof_file_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'warning' | 'ok'>('all');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [availableStock, setAvailableStock] = useState(0);
  const [chartPeriod, setChartPeriod] = useState<number>(7);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [purchaseData, setPurchaseData] = useState<any[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    loadIngredients();
    loadChartData();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [chartPeriod]);

  const loadChartData = async () => {
    setLoadingChart(true);
    try {
      const [sales, purchases] = await Promise.all([
        getSalesDataByPeriod(chartPeriod),
        getPurchaseDataByPeriod(chartPeriod),
      ]);
      setSalesData(sales);
      setPurchaseData(purchases);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoadingChart(false);
    }
  };

  const mergeChartData = () => {
    const allDates = new Set([
      ...salesData.map(d => d.date),
      ...purchaseData.map(d => d.date),
    ]);

    return Array.from(allDates).map(date => {
      const salesItem = salesData.find(d => d.date === date);
      const purchaseItem = purchaseData.find(d => d.date === date);
      return {
        date,
        sales: salesItem?.total || 0,
        purchase: purchaseItem?.total || 0,
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const loadIngredients = async () => {
    try {
      const data = await getIngredientsWithStatus();
      setIngredients(data);
    } catch (error) {
      console.error('Failed to load ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ok':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <TrendingDown className="h-4 w-4" />;
      case 'ok':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'critical':
        return 'Kritis';
      case 'warning':
        return 'Peringatan';
      case 'ok':
        return 'Aman';
      default:
        return 'Unknown';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'current_stock' || name === 'min_stock' || name === 'unit_price' 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addIngredient(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        current_stock: 0,
        unit: 'kg',
        min_stock: 0,
        unit_price: 0,
      });
      await loadIngredients();
    } catch (error) {
      console.error('Failed to add ingredient:', error);
      alert('Gagal menambahkan bahan baku');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStockRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createStockRequest({
        ingredient_id: stockRequestForm.ingredient_id,
        ingredient_name: stockRequestForm.ingredient_name,
        quantity_requested: stockRequestForm.quantity_requested,
        unit: stockRequestForm.unit,
        notes: stockRequestForm.notes,
        supplier_name: stockRequestForm.supplier_name,
        proof_file: stockRequestForm.proof_file,
        proof_file_name: stockRequestForm.proof_file_name,
        requested_by: 'current-user', // TODO: Get from auth context
        requested_by_name: 'Staff', // TODO: Get from auth context
      });
      setIsStockRequestModalOpen(false);
      setStockRequestForm({
        ingredient_id: '',
        ingredient_name: '',
        quantity_requested: 0,
        unit: 'kg',
        notes: '',
        supplier_name: '',
        proof_file: '',
        proof_file_name: '',
      });
      alert('Pengajuan penambahan stok berhasil dikirim. Menunggu persetujuan Admin/Manager.');
    } catch (error) {
      console.error('Failed to create stock request:', error);
      alert('Gagal mengirim pengajuan penambahan stok');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStockRequest = (ingredient: any) => {
    setStockRequestForm({
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity_requested: 0,
      unit: ingredient.unit,
      notes: '',
      supplier_name: '',
      proof_file: '',
      proof_file_name: '',
    });
    setIsStockRequestModalOpen(true);
  };

  const handleOpenWriteOff = (ingredient: any) => {
    setAvailableStock(ingredient.current_stock);
    setWriteOffForm({
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      quantity_written_off: 0,
      unit: ingredient.unit,
      reason: '',
      notes: '',
      proof_file: '',
      proof_file_name: '',
    });
    setIsWriteOffModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, formType: 'request' | 'writeOff') => {
    alert('File upload triggered!');
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, formType);
  };

  const processFile = (file: File, formType: 'request' | 'writeOff') => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Format file tidak valid. Gunakan JPG, PNG, atau PDF.');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      
      if (formType === 'request') {
        setStockRequestForm(prev => ({
          ...prev,
          proof_file: base64,
          proof_file_name: file.name,
        }));
      } else {
        setWriteOffForm(prev => ({
          ...prev,
          proof_file: base64,
          proof_file_name: file.name,
        }));
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      alert('Gagal membaca file. Silakan coba lagi.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, formType: 'request' | 'writeOff') => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, formType);
    }
  };

  const handleRemoveFile = (formType: 'request' | 'writeOff') => {
    if (formType === 'request') {
      setStockRequestForm({
        ...stockRequestForm,
        proof_file: '',
        proof_file_name: '',
      });
    } else {
      setWriteOffForm({
        ...writeOffForm,
        proof_file: '',
        proof_file_name: '',
      });
    }
  };

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseFloat(value);
    
    // Reject empty or invalid values
    if (value === '' || isNaN(numValue)) {
      setWriteOffForm({ ...writeOffForm, quantity_written_off: 0 });
      return;
    }
    
    // Reject negative values
    if (numValue < 0) {
      alert('Jumlah tidak boleh negatif');
      return;
    }
    
    // Reject values exceeding available stock
    if (numValue > availableStock) {
      alert(`Jumlah tidak boleh melebihi stok tersedia (${availableStock} ${writeOffForm.unit})`);
      return;
    }
    
    setWriteOffForm({ ...writeOffForm, quantity_written_off: numValue });
  };

  const handleWriteOffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!writeOffForm.proof_file) {
      alert('Wajib melampirkan foto bukti kerusakan/kehilangan');
      setIsSubmitting(false);
      return;
    }

    try {
      await createStockWriteOff({
        ingredient_id: writeOffForm.ingredient_id,
        ingredient_name: writeOffForm.ingredient_name,
        quantity_written_off: writeOffForm.quantity_written_off,
        unit: writeOffForm.unit,
        reason: writeOffForm.reason,
        notes: writeOffForm.notes,
        proof_file: writeOffForm.proof_file,
        proof_file_name: writeOffForm.proof_file_name,
        requested_by: 'current-user', // TODO: Get from auth context
        requested_by_name: 'Staff', // TODO: Get from auth context
      });
      setIsWriteOffModalOpen(false);
      setWriteOffForm({
        ingredient_id: '',
        ingredient_name: '',
        quantity_written_off: 0,
        unit: 'kg',
        reason: '',
        notes: '',
        proof_file: '',
        proof_file_name: '',
      });
      alert('Laporan barang rusak/hilang berhasil dikirim. Menunggu persetujuan Admin/Manager.');
    } catch (error) {
      console.error('Failed to create stock write-off:', error);
      alert('Gagal mengirim laporan barang rusak/hilang');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate restock cost for items that need restock
  const calculateRestockCost = () => {
    const itemsNeedingRestock = ingredients.filter(
      (i) => i.status === 'critical' || i.status === 'warning'
    );
    
    let totalCost = 0;
    const restockDetails = itemsNeedingRestock.map((item) => {
      const shortage = Math.max(0, item.min_stock - item.current_stock);
      const cost = shortage * item.unit_price;
      totalCost += cost;
      return {
        name: item.name,
        currentStock: item.current_stock,
        minStock: item.min_stock,
        shortage,
        unitPrice: item.unit_price,
        cost,
        unit: item.unit,
      };
    });

    return { totalCost, restockDetails };
  };

  // Get critical ingredients sorted by shortage (largest shortage first)
  const getCriticalIngredients = () => {
    return ingredients
      .filter((i) => i.status === 'critical' || i.status === 'warning')
      .map((item) => ({
        ...item,
        shortage: item.min_stock - item.current_stock,
      }))
      .sort((a, b) => b.shortage - a.shortage);
  };

  // Filter ingredients based on status
  const getFilteredIngredients = () => {
    if (filterStatus === 'all') return ingredients;
    return ingredients.filter((i) => i.status === filterStatus);
  };

  const { totalCost, restockDetails } = calculateRestockCost();
  const criticalIngredients = getCriticalIngredients();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventaris Bahan Baku</h1>
                <p className="text-gray-600 mt-1">Kelola dan pantau stok bahan baku restoran</p>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Tambah Bahan</span>
              </button>
            </div>

            {/* Sales vs Purchase Chart */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Analisis Penjualan vs Pengadaan
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Perbandingan tren penjualan dan pengadaan bahan baku
                    </p>
                  </div>
                  <select
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(Number(e.target.value))}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={7}>7 Hari Terakhir</option>
                    <option value={30}>30 Hari Terakhir</option>
                    <option value={90}>90 Hari Terakhir</option>
                  </select>
                </div>
              </div>
              <div className="p-6">
                {loadingChart ? (
                  <div className="text-center text-gray-500 py-8">Memuat data grafik...</div>
                ) : salesData.length === 0 && purchaseData.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">Tidak ada data untuk ditampilkan</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mergeChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `Rp ${value?.toLocaleString('id-ID') || 0}`} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="Penjualan" strokeWidth={2} />
                      <Line type="monotone" dataKey="purchase" stroke="#10b981" name="Pengadaan" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Bahan Baku</p>
                    <p className="text-2xl font-bold text-gray-900">{ingredients.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stok Kritis</p>
                    <p className="text-2xl font-bold text-red-600">
                      {ingredients.filter((i) => i.status === 'critical').length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Perlu Restock</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {ingredients.filter((i) => i.status === 'warning').length}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Estimasi Biaya Restock</p>
                    <p className="text-2xl font-bold text-green-600">
                      Rp {totalCost.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Ingredients Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Daftar Bahan Baku</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Semua Status</option>
                      <option value="critical">Kritis</option>
                      <option value="warning">Peringatan</option>
                      <option value="ok">Aman</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowAnalysis(!showAnalysis)}
                    className="flex items-center gap-2 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-md hover:bg-purple-200 hover:text-purple-800 transition-colors"
                  >
                    <DollarSign className="h-4 w-4" />
                    {showAnalysis ? 'Sembunyikan Analisis' : 'Tampilkan Analisis'}
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="p-6 text-center text-gray-500">Memuat data...</div>
              ) : ingredients.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Belum ada data bahan baku. Tambahkan bahan baku untuk memulai.
                </div>
              ) : (
                <>
                  {/* Stock Analysis Section */}
                  {showAnalysis && (
                    <div className="border-b border-gray-200 bg-purple-50 p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Analisis Stok & Estimasi Biaya Restock
                      </h3>
                      
                      {restockDetails.length === 0 ? (
                        <div className="text-center text-gray-600 py-4">
                          Semua stok dalam kondisi aman. Tidak ada item yang perlu restock.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="bg-white rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Rincian Restock yang Diperlukan</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Bahan</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stok Saat Ini</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Min. Stok</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kekurangan</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga Satuan</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Biaya Restock</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {restockDetails.map((detail, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{detail.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-600">{detail.currentStock} {detail.unit}</td>
                                      <td className="px-4 py-2 text-sm text-gray-600">{detail.minStock} {detail.unit}</td>
                                      <td className="px-4 py-2 text-sm font-medium text-red-600">{detail.shortage} {detail.unit}</td>
                                      <td className="px-4 py-2 text-sm text-gray-600">Rp {detail.unitPrice.toLocaleString('id-ID')}</td>
                                      <td className="px-4 py-2 text-sm font-medium text-green-600">Rp {detail.cost.toLocaleString('id-ID')}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          
                          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-green-900">Total Estimasi Biaya Restock</h4>
                                <p className="text-sm text-green-700">Untuk semua item yang memerlukan restock</p>
                              </div>
                              <div className="text-2xl font-bold text-green-900">
                                Rp {totalCost.toLocaleString('id-ID')}
                              </div>
                            </div>
                          </div>
                          
                          {criticalIngredients.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Bahan Baku Paling Kritis (Diurutkan berdasarkan kekurangan)
                              </h4>
                              <div className="space-y-2">
                                {criticalIngredients.slice(0, 5).map((item, index) => (
                                  <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium text-gray-900">{index + 1}. {item.name}</span>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
                                        {getStatusLabel(item.status)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-red-600 font-medium">
                                      Kekurangan: {item.shortage} {item.unit}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Bahan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stok Saat Ini
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Satuan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Min. Stok
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Harga Satuan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getFilteredIngredients().map((ingredient) => (
                          <tr key={ingredient.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{ingredient.current_stock}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{ingredient.unit}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{ingredient.min_stock}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                Rp {ingredient.unit_price.toLocaleString('id-ID')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  ingredient.status
                                )}`}
                              >
                                {getStatusIcon(ingredient.status)}
                                <span className="ml-1">{getStatusLabel(ingredient.status)}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleOpenStockRequest(ingredient)}
                                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                >
                                  + Restock
                                </button>
                                <button
                                  onClick={() => handleOpenWriteOff(ingredient)}
                                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                                >
                                  - Write-Off
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Keterangan Status</h3>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-300">
                    <TrendingUp className="h-4 w-4" />
                    <span className="ml-1">Aman</span>
                  </span>
                  <span className="text-sm text-gray-600">Stok di atas minimum</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-800 border-yellow-300">
                    <TrendingDown className="h-4 w-4" />
                    <span className="ml-1">Peringatan</span>
                  </span>
                  <span className="text-sm text-gray-600">Stok mendekati minimum</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="ml-1">Kritis</span>
                  </span>
                  <span className="text-sm text-gray-600">Stok di bawah minimum</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Tambah Bahan Baku</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 rounded-lg border border-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Beras"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Saat Ini</label>
                <input
                  type="number"
                  name="current_stock"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan (UoM)</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="kg">kg</option>
                  <option value="gram">gram</option>
                  <option value="ml">ml</option>
                  <option value="liter">liter</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum (Buffer)</label>
                <input
                  type="number"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Satuan</label>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 transition-colors font-bold text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Request Modal */}
      {isStockRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Pengajuan Penambahan Stok
              </h2>
              <button
                onClick={() => setIsStockRequestModalOpen(false)}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 rounded-lg border border-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleStockRequestSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  value={stockRequestForm.ingredient_name}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah yang Ditambahkan *</label>
                <input
                  type="number"
                  value={stockRequestForm.quantity_requested}
                  onChange={(e) => setStockRequestForm({ ...stockRequestForm, quantity_requested: parseFloat(e.target.value) || 0 })}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                <input
                  type="text"
                  value={stockRequestForm.unit}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Nomor Nota</label>
                <input
                  type="text"
                  value={stockRequestForm.notes}
                  onChange={(e) => setStockRequestForm({ ...stockRequestForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: INV-2024-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Supplier (Opsional)</label>
                <input
                  type="text"
                  value={stockRequestForm.supplier_name}
                  onChange={(e) => setStockRequestForm({ ...stockRequestForm, supplier_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: PT. Sumber Makmur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unggah Foto Nota / Surat Jalan</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="proof-file-request" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Pilih file</span>
                        <input
                          id="proof-file-request"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/jpg,application/pdf"
                          onChange={(e) => handleFileUpload(e, 'request')}
                        />
                      </label>
                      <p className="pl-1">atau drag & drop</p>
                    </div>
                    <p className="text-xs text-gray-500">JPG, PNG, atau PDF (maks. 5MB)</p>
                    {stockRequestForm.proof_file_name && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        ✓ {stockRequestForm.proof_file_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsStockRequestModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 transition-colors font-bold text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write-Off Modal */}
      {isWriteOffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Laporan Barang Rusak/Hilang
              </h2>
              <button
                onClick={() => setIsWriteOffModalOpen(false)}
                className="p-2 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 rounded-lg border border-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleWriteOffSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan</label>
                <input
                  type="text"
                  value={writeOffForm.ingredient_name}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah yang Berkurang *</label>
                <input
                  type="number"
                  value={writeOffForm.quantity_written_off || ''}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Stok tersedia: {availableStock} {writeOffForm.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                <select
                  value={writeOffForm.unit}
                  onChange={(e) => setWriteOffForm({ ...writeOffForm, unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {AVAILABLE_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan *</label>
                <select
                  value={writeOffForm.reason}
                  onChange={(e) => setWriteOffForm({ ...writeOffForm, reason: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Pilih alasan</option>
                  <option value="damaged">Rusak</option>
                  <option value="lost">Hilang</option>
                  <option value="expired">Kedaluwarsa</option>
                  <option value="spoiled">Basi/Membusuk</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Tambahan</label>
                <textarea
                  value={writeOffForm.notes}
                  onChange={(e) => setWriteOffForm({ ...writeOffForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Jelaskan detail kerusakan/kehilangan..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unggah Foto Bukti *</label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                    isDragging ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-red-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'writeOff')}
                >
                  {writeOffForm.proof_file ? (
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{writeOffForm.proof_file_name}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('writeOff')}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                      {isImageFile(writeOffForm.proof_file_name) ? (
                        <div className="mt-2 relative">
                          <img
                            src={writeOffForm.proof_file}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg border border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                          <FileText className="h-12 w-12 text-gray-400" />
                          <span className="ml-2 text-sm text-gray-600">File PDF</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="proof-file-writeoff" className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none">
                          <span>Pilih file</span>
                          <input
                            id="proof-file-writeoff"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            onChange={(e) => handleFileUpload(e, 'writeOff')}
                            required
                          />
                        </label>
                        <p className="pl-1">atau drag & drop</p>
                      </div>
                      <p className="text-xs text-gray-500">JPG, PNG, atau PDF (maks. 5MB) - Wajib</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWriteOffModalOpen(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100 transition-colors font-bold text-gray-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
