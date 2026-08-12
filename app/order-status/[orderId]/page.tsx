'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, CheckCircle, Truck, Package, XCircle, Loader2 } from 'lucide-react';
import { formatRupiah } from '@/src/lib/format';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'on_the_way' | 'completed' | 'cancelled';

interface OrderStatusInfo {
  label: string;
  description: string;
  icon: any;
  color: string;
}

const statusMap: Record<OrderStatus, OrderStatusInfo> = {
  pending: {
    label: 'Menunggu verifikasi pembayaran',
    description: 'Staf akan memeriksa referensi pembayaran sebelum pesanan dikirim ke dapur.',
    icon: Clock,
    color: 'text-yellow-600',
  },
  confirmed: {
    label: 'Pesanan Dikonfirmasi',
    description: 'Pesanan Anda telah diterima dan sedang diproses',
    icon: CheckCircle,
    color: 'text-blue-600',
  },
  preparing: {
    label: 'Sedang Disiapkan',
    description: 'Pesanan Anda sedang disiapkan oleh dapur',
    icon: Package,
    color: 'text-orange-600',
  },
  ready: {
    label: 'Siap Diambil',
    description: 'Pesanan Anda sudah siap dan dapat diambil',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  on_the_way: {
    label: 'Sedang Diantar',
    description: 'Pesanan Anda sedang dalam perjalanan',
    icon: Truck,
    color: 'text-blue-600',
  },
  completed: {
    label: 'Selesai',
    description: 'Pesanan Anda telah selesai',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  cancelled: {
    label: 'Dibatalkan',
    description: 'Pesanan Anda telah dibatalkan',
    icon: XCircle,
    color: 'text-red-600',
  },
};

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    fetchOrderStatus();
    // Poll for status updates every 10 seconds
    const interval = setInterval(fetchOrderStatus, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrderStatus = async () => {
    try {
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

      if (isOnline) {
        try {
          const { getCustomerOrder } = await import('@/src/features/self-order/selfOrderService');
          const customerOrder = await getCustomerOrder(orderId) as any;
          const order = customerOrder ?? await (await import('@/src/lib/api')).fetchOrder(orderId) as any;
          setOrderData(order);
          setOrderStatus(customerOrder && order.status === 'accepted' ? 'confirmed' : order.status as OrderStatus);
          setLoading(false);
          return;
        } catch (apiErr) {
          console.warn('Failed to fetch order from API, falling back to local cache:', apiErr);
        }
      }

      const { db } = await import('@/src/lib/db');
      const order = await db.orders.where('id').equals(orderId).first();

      if (!order) {
        setError('Pesanan tidak ditemukan');
        setLoading(false);
        return;
      }

      setOrderData(order);
      setOrderStatus(order.status as OrderStatus);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching order status:', err);
      setError('Gagal memuat status pesanan');
      setLoading(false);
    }
  };

  const closeCancelConfirm = () => {
    if (isCancelling) return;
    setCancelConfirmOpen(false);
    setCancelError('');
  };

  const handleCancelConfirm = async () => {
    setIsCancelling(true);
    setCancelError('');
    try {
      const api = await import('@/src/lib/api');
      await api.updateOrderStatus(orderId, 'cancelled');

      const { db } = await import('@/src/lib/db');
      await db.orders.update(orderId, { status: 'cancelled' });

      setOrderStatus('cancelled');
      setOrderData((prev: any) => (prev ? { ...prev, status: 'cancelled' } : prev));
      setCancelConfirmOpen(false);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setCancelError('Gagal membatalkan pesanan. Silakan coba lagi.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Memuat status pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/online-order')}
            className="text-primary hover:underline"
          >
            Kembali ke Pemesanan
          </button>
        </div>
      </div>
    );
  }

  const statusInfo = orderStatus === 'pending' && orderData?.payment_status === 'unpaid'
    ? { ...statusMap.pending, label: 'Menunggu konfirmasi kasir', description: 'Pesanan akan diproses sesuai routing Bayar di Kasir restoran.' }
    : statusMap[orderStatus];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface border-line border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/online-order')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Kembali ke Pemesanan
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center ${statusInfo.color}`}>
              <StatusIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2">{statusInfo.label}</h1>
            <p className="text-gray-600">{statusInfo.description}</p>
          </div>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-ink mb-4">Detail Pesanan</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID Pesanan</span>
                <span className="font-medium">{orderId.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-primary">{formatRupiah(orderData.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Metode Pembayaran</span>
                <span className="font-medium capitalize">{orderData.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Waktu Pemesanan</span>
                <span className="font-medium">
                  {new Date(orderData.created_at).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Item Pesanan</h3>
              <div className="space-y-2">
                {orderData.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product?.name || 'Unknown'} x{item.quantity}</span>
                    <span>{formatRupiah(item.price_at_time * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-ink mb-4">Timeline Status</h2>
          <div className="space-y-4">
            {Object.entries(statusMap).map(([key, info], index) => {
              const isActive = key === orderStatus;
              const isPast = Object.keys(statusMap).indexOf(key) < Object.keys(statusMap).indexOf(orderStatus);
              const Icon = info.icon;

              return (
                <div key={key} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-primary text-white' : isPast ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isActive ? 'text-ink' : isPast ? 'text-green-600' : 'text-gray-400'}`}>
                      {info.label}
                    </p>
                    <p className="text-sm text-gray-500">{info.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {orderStatus === 'pending' && (
            <button
              onClick={() => {
                setCancelError('');
                setCancelConfirmOpen(true);
              }}
              className="w-full py-3 px-4 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              Batalkan Pesanan
            </button>
          )}
          
          {(orderStatus === 'ready' || orderStatus === 'completed') && (
            <button
              onClick={() => router.push('/online-order')}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Pesan Lagi
            </button>
          )}
        </div>
      </div>

      <Modal
        isOpen={cancelConfirmOpen}
        onClose={closeCancelConfirm}
        title="Batalkan pesanan?"
        role="alertdialog"
        descriptionId="cancel-order-description"
        closeOnBackdrop={false}
        showCloseButton={false}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeCancelConfirm} disabled={isCancelling}>
              Batal
            </Button>
            <Button type="button" variant="danger" loading={isCancelling} onClick={handleCancelConfirm}>
              Ya, Batalkan
            </Button>
          </>
        }
      >
        <p id="cancel-order-description" className="text-pretty text-sm text-ink-secondary">
          Pesanan ini akan dibatalkan dan tidak dapat dikembalikan.
        </p>
        {cancelError && (
          <p role="alert" className="mt-3 text-sm text-danger">{cancelError}</p>
        )}
      </Modal>
    </div>
  );
}
