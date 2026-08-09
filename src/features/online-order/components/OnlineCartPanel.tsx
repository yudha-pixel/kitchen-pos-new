'use client';

import { useState, useEffect } from 'react';
import { useOnlineCartStore } from '@/src/store/useOnlineCartStore';
import { ShoppingCart, Trash2, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { formatRupiah } from '@/src/lib/format';
import { CustomerFormModal } from './CustomerFormModal';

interface OnlineCartPanelProps {
  onCheckout: () => void;
}

export const OnlineCartPanel = ({ onCheckout }: OnlineCartPanelProps) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    updateModifiers,
    getSubtotal,
    getDeliveryFee,
    getTotal,
    fulfillmentType,
    setFulfillmentType,
    clearCart,
  } = useOnlineCartStore();

  const [mounted, setMounted] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-ink flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Keranjang
        </h2>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Kosongkan
          </button>
        )}
      </div>

      {/* Fulfillment Type Selection */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Tipe Layanan
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setFulfillmentType('pickup')}
            className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
              fulfillmentType === 'pickup'
                ? 'border-primary bg-primary-soft'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">Ambil Sendiri</div>
            <div className="text-xs text-gray-500">Pickup</div>
          </button>
          <button
            onClick={() => setFulfillmentType('delivery')}
            className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
              fulfillmentType === 'delivery'
                ? 'border-primary bg-primary-soft'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">Pesan Antar</div>
            <div className="text-xs text-gray-500">Delivery</div>
          </button>
        </div>
      </div>

      {/* Cart Items */}
      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Keranjang Kosong"
          message="Tambahkan produk ke keranjang untuk memesan"
        />
      ) : (
        <>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {items.map((item) => {
              const modifierTotal = item.modifiers.reduce(
                (sum, mod) => sum + (mod.selected ? mod.price : 0),
                0
              );
              const itemTotal = (item.price + modifierTotal) * item.quantity;

              return (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-ink text-sm">{item.name}</h4>
                      {item.modifiers.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.modifiers
                            .filter((mod) => mod.selected)
                            .map((mod) => (
                              <span key={mod.id} className="mr-2">
                                + {mod.name}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold text-ink text-sm">
                      {formatRupiah(itemTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatRupiah(subtotal)}</span>
            </div>
            {fulfillmentType === 'delivery' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Antar</span>
                <span className="font-medium">{formatRupiah(deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">{formatRupiah(total)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button
            size="lg"
            className="w-full mt-4"
            onClick={() => setIsCustomerFormOpen(true)}
            disabled={items.length === 0}
          >
            Lanjut ke Pembayaran
          </Button>

          {/* Customer Form Modal */}
          <CustomerFormModal
            isOpen={isCustomerFormOpen}
            onClose={() => setIsCustomerFormOpen(false)}
            onContinue={() => {
              setIsCustomerFormOpen(false);
              onCheckout();
            }}
          />
        </>
      )}
    </div>
  );
};
