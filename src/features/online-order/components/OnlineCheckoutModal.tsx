'use client';

import { useState } from 'react';
import { useOnlineCartStore } from '@/src/store/useOnlineCartStore';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { formatRupiah } from '@/src/lib/format';
import { useToast } from '@/src/components/ui/Toast';
import { useRouter } from 'next/navigation';

interface OnlineCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  outletName: string;
}

const paymentMethods = [
  { value: 'QRIS', label: 'QRIS' },
  { value: 'TRANSFER', label: 'Transfer Bank' },
  { value: 'EWALLET', label: 'E-Wallet (GoPay/OVO/Dana)' },
] as const;

export const OnlineCheckoutModal = ({ isOpen, onClose, outletName }: OnlineCheckoutModalProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    items,
    fulfillmentType,
    customerName,
    customerPhone,
    customerAddress,
    paymentMethod,
    notes,
    setFulfillmentType,
    setCustomerName,
    setCustomerPhone,
    setCustomerAddress,
    setPaymentMethod,
    setNotes,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    clearCart,
  } = useOnlineCartStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentQR, setShowPaymentQR] = useState(false);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      // Create order via API
      const orderId = crypto.randomUUID();
      const orderData = {
        id: orderId,
        total_amount: total,
        payment_method: paymentMethod.toLowerCase(),
        status: 'pending',
        table_number: null,
        discount_amount: 0,
        rounding_amount: 0,
        notes: notes || null,
        created_at: new Date().toISOString(),
        customer_order_id: null,
        outlet_id: null,
      };

      const orderItems = items.map((item) => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: item.price,
        modifiers_applied: item.modifiers,
        discount_item: 0,
        split_group_id: null,
        status: 'pending',
      }));

      // Call API to create order
      const api = await import('@/src/lib/api');
      await api.createOrder(orderData, orderItems);

      toast('success', 'Pesanan berhasil dibuat');

      // Clear cart
      clearCart();

      // Redirect to order status page
      router.push(`/order-status/${orderId}`);
      onClose();
    } catch (error) {
      console.error('Checkout error:', error);
      toast('error', 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodSelect = (method: 'QRIS' | 'TRANSFER' | 'EWALLET') => {
    setPaymentMethod(method);
    if (method === 'QRIS') {
      setShowPaymentQR(true);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showPaymentQR}
        onClose={onClose}
        title={`Pemesanan Online - ${outletName}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Ringkasan Pesanan</h3>
            <div className="space-y-2 text-sm">
              {items.map((item) => {
                const modifierTotal = item.modifiers.reduce(
                  (sum, mod) => sum + (mod.selected ? mod.price : 0),
                  0
                );
                const itemTotal = (item.price + modifierTotal) * item.quantity;
                return (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatRupiah(itemTotal)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t mt-3 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              {fulfillmentType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span>Biaya Antar</span>
                  <span>{formatRupiah(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatRupiah(total)}</span>
              </div>
            </div>
          </div>

          {/* Fulfillment Type Display (Read-only) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Tipe Layanan
            </label>
            <div className={`p-4 rounded-lg border-2 ${
              fulfillmentType === 'pickup'
                ? 'border-primary bg-primary-soft'
                : 'border-primary bg-primary-soft'
            }`}>
              <div className="font-semibold">
                {fulfillmentType === 'pickup' ? 'Ambil Sendiri (Pickup)' : 'Pesan Antar (Delivery)'}
              </div>
            </div>
          </div>

          {/* Customer Information Display (Read-only) */}
          <div className="space-y-3">
            <h3 className="font-semibold">Informasi Pelanggan</h3>
            
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Nama:</span>
                <span className="font-medium">{customerName || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">WhatsApp/Telepon:</span>
                <span className="font-medium">{customerPhone || '-'}</span>
              </div>
              {fulfillmentType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Alamat:</span>
                  <span className="font-medium text-right max-w-xs">{customerAddress || '-'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Catatan (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan khusus untuk pesanan"
                rows={2}
                className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Metode Pembayaran
            </label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  onClick={() => handlePaymentMethodSelect(method.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                    paymentMethod === method.value
                      ? 'border-primary bg-primary-soft'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            size="lg"
            className="flex-1"
            onClick={onClose}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
          </Button>
        </div>
      </Modal>

      {/* QRIS Payment Modal */}
      {showPaymentQR && (
        <Modal
          isOpen={showPaymentQR}
          onClose={() => setShowPaymentQR(false)}
          title="Scan QRIS untuk Pembayaran"
          size="md"
        >
          <div className="text-center space-y-4">
            <div className="bg-white p-6 rounded-lg border-2 border-dashed">
              {/* Placeholder QR Code */}
              <div className="w-48 h-48 mx-auto bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm text-gray-500">QR Code akan ditampilkan di sini</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Scan QR code di atas menggunakan aplikasi e-wallet atau mobile banking Anda
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={() => setShowPaymentQR(false)}
              >
                Kembali
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? 'Memproses...' : 'Saya Sudah Bayar'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
