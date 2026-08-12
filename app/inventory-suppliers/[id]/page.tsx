'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/context/AuthContext';
import { Building2, Phone, Mail, MapPin, User, Tag, Package, Clock, CheckCircle, XCircle, ArrowLeft, FileText, Calendar, DollarSign } from 'lucide-react';

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  const [supplier, setSupplier] = useState<any>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      loadSupplierData();
    }
  }, [user, params.id]);

  const loadSupplierData = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');

      // Fetch supplier details
      const supplierResponse = await fetch(`${API_BASE_URL}/api/suppliers/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Fetch purchase orders for this supplier
      const ordersResponse = await fetch(`${API_BASE_URL}/api/suppliers/${params.id}/purchase-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (supplierResponse.ok) {
        const supplierData = await supplierResponse.json();
        setSupplier(supplierData);
      } else {
        console.error('Failed to fetch supplier:', supplierResponse.status);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log('Purchase orders data:', ordersData);
        setPurchaseOrders(ordersData);
      } else {
        console.error('Failed to fetch purchase orders:', ordersResponse.status);
        setPurchaseOrders([]);
      }
    } catch (error) {
      console.error('Failed to load supplier data:', error);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
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
      'Dairy & Cheese': 'Dairy & Cheese',
      'Meat': 'Meat',
      'Poultry': 'Poultry',
      'Seafood': 'Seafood',
      'Vegetables': 'Vegetables',
      'Fruits': 'Fruits',
      'Dry Goods': 'Dry Goods',
      'Beverages': 'Beverages',
      'Packaging': 'Packaging',
      'Other': 'Lainnya',
    };
    return labels[category] || category;
  };

  const getPaymentTermsLabel = (terms: string) => {
    const labels: Record<string, string> = {
      'cod': 'COD (Cash on Delivery)',
      'net 7': 'Tempo 7 Hari',
      'net 14': 'Tempo 14 Hari',
      'net 30': 'Tempo 30 Hari',
      'net 45': 'Tempo 45 Hari',
      'net 60': 'Tempo 60 Hari',
    };
    return labels[terms] || terms;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Memuat data supplier...</div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Supplier tidak ditemukan</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </button>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
                  <p className="text-gray-600 mt-1">Profil dan Riwayat Pembelian Supplier</p>
                </div>
                {supplier.is_active ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircle className="h-4 w-4 mr-1" />
                    Non-Aktif
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Supplier Profile */}
              <div className="lg:col-span-1 space-y-6">
                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Informasi Kontak
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Telepon Kantor</p>
                        <p className="text-sm font-medium text-gray-900">{supplier.phone}</p>
                      </div>
                    </div>
                    {supplier.email && (
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{supplier.email}</p>
                        </div>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Alamat</p>
                          <p className="text-sm font-medium text-gray-900">{supplier.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* PIC Information */}
                {(supplier.pic_name || supplier.pic_mobile) && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Kontak PIC
                    </h2>
                    <div className="space-y-4">
                      {supplier.pic_name && (
                        <div>
                          <p className="text-sm text-gray-500">Nama PIC</p>
                          <p className="text-sm font-medium text-gray-900">{supplier.pic_name}</p>
                        </div>
                      )}
                      {supplier.pic_mobile && (
                        <div>
                          <p className="text-sm text-gray-500">No. HP PIC</p>
                          <p className="text-sm font-medium text-gray-900">{supplier.pic_mobile}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Supply Terms */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Syarat Suplai
                  </h2>
                  <div className="space-y-4">
                    {supplier.category && (
                      <div>
                        <p className="text-sm text-gray-500">Kategori Suplai</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                          <Tag className="h-3 w-3 mr-1" />
                          {getCategoryLabel(supplier.category)}
                        </span>
                      </div>
                    )}
                    {supplier.moq_amount && (
                      <div>
                        <p className="text-sm text-gray-500">MOQ (Minimal Pembelian)</p>
                        <p className="text-sm font-medium text-gray-900">
                          {supplier.moq_amount} {supplier.moq_unit || ''}
                        </p>
                      </div>
                    )}
                    {supplier.payment_terms && (
                      <div>
                        <p className="text-sm text-gray-500">Termin Pembayaran</p>
                        <p className="text-sm font-medium text-gray-900">
                          {getPaymentTermsLabel(supplier.payment_terms)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Notes */}
                {supplier.performance_notes && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Catatan Kinerja
                    </h2>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{supplier.performance_notes}</p>
                  </div>
                )}
              </div>

              {/* Purchase History */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Riwayat Pembelian
                    </h2>
                  </div>
                  <div className="p-6">
                    {purchaseOrders.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p>Belum ada riwayat pembelian</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                No. PO
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {purchaseOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {order.po_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                    {formatDate(order.order_date)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    order.status === 'received' ? 'bg-green-100 text-green-800' :
                                    order.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                    order.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                                  <div className="flex items-center justify-end">
                                    <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                                    {formatCurrency(order.total)}
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
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
