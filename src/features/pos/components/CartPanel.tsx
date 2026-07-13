'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/src/store/useCartStore';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Receipt } from '@/src/components/pos/Receipt';
import { SplitBillModal } from './SplitBillModal';

export const CartPanel = () => {
  const { items, removeFromCart, updateQuantity, getSubtotal, getTax, getTotal, clearCart, tableNumber, notes, setTableNumber, setNotes, processPayment, assignSplitGroup, removeSplitGroup, getSplitGroupTotal, voidItem, calculateRoundedTotal, paymentMethod, setPaymentMethod } = useCartStore();
  const [splitMode, setSplitMode] = useState(false);
  const [currentSplitGroup, setCurrentSplitGroup] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'cashier' | 'manager' | 'admin'>('cashier'); // TODO: Get from auth
  const [roundTo, setRoundTo] = useState<number>(1000); // Default rounding to 1000
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);

  // Escape key shortcut
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && items.length > 0) {
        const confirmed = window.confirm('Yakin ingin membatalkan pesanan ini?');
        if (confirmed) {
          clearCart();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [items.length, clearCart]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemove = (id: string) => {
    if (confirm('Hapus item ini dari keranjang?')) {
      removeFromCart(id);
    }
  };

  const handleVoid = async (id: string) => {
    const reason = prompt('Masukkan alasan pembatalan:');
    if (reason) {
      const result = await voidItem(id, reason);
      alert(result.message);
    }
  };

  const handleClearCart = () => {
    if (confirm('Kosongkan seluruh keranjang?')) {
      clearCart();
    }
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      alert('Keranjang kosong');
      return;
    }
    if (!tableNumber) {
      alert('Mohon isi nomor meja terlebih dahulu');
      return;
    }

    // Show QRIS message if QRIS is selected
    if (paymentMethod === 'QRIS') {
      alert('Silakan scan QRIS toko');
    }

    // Validate cash input for CASH payment
    if (paymentMethod === 'CASH') {
      const cashAmount = Number(cashReceived);
      const total = calculateRoundedTotal(roundTo).total;
      if (!cashReceived || cashAmount < total) {
        alert(`Uang tunai yang diterima kurang. Total: Rp ${total.toLocaleString()}`);
        return;
      }
    }

    const result = await processPayment(roundTo);

    if (result.success && result.receiptData) {
      setReceiptData(result.receiptData);
      setShowReceipt(true);
    } else {
      alert(result.message);
    }
  };

  const handleCancel = () => {
    if (items.length === 0) {
      return;
    }

    const confirmed = window.confirm('Yakin ingin membatalkan pesanan ini?');
    if (confirmed) {
      clearCart();
    }
  };

  const handleSplitComplete = (splitCart: any[]) => {
    // Add split items to a new cart (in a real app, this would create a new order)
    // For now, we'll just alert the user
    alert(`Split bill berhasil! ${splitCart.length} item dipisah ke transaksi baru.`);
  };

  const handleSplitToggle = (itemId: string) => {
    if (currentSplitGroup) {
      assignSplitGroup(itemId, currentSplitGroup);
    }
  };

  const handleStartSplit = () => {
    const newGroupId = crypto.randomUUID();
    setCurrentSplitGroup(newGroupId);
    setSplitMode(true);
  };

  const handleEndSplit = () => {
    setCurrentSplitGroup(null);
    setSplitMode(false);
  };

  const handlePaySplit = async () => {
    if (!currentSplitGroup) return;
    
    const splitTotal = getSplitGroupTotal(currentSplitGroup);
    if (splitTotal === 0) {
      alert('Tidak ada item dalam grup pembayaran ini');
      return;
    }

    // TODO: Implement split payment logic
    alert(`Pembayaran untuk grup: Rp ${splitTotal.toLocaleString()}`);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">Keranjang</h2>
          <div className="flex gap-2">
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Kosongkan
              </button>
            )}
            {items.length > 0 && (
              <button
                onClick={splitMode ? handleEndSplit : handleStartSplit}
                className={`text-sm px-3 py-1 rounded ${
                  splitMode 
                    ? 'bg-orange-500 text-white hover:bg-orange-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {splitMode ? 'Selesai Split' : 'Split Bill'}
              </button>
            )}
          </div>
        </div>
        
        {/* Table Number Input */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nomor Meja *
          </label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Contoh: Meja 1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Notes Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catatan Pesanan
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan khusus untuk pesanan..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ShoppingCart className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Keranjang kosong</p>
            <p className="text-sm text-black">Tambahkan produk untuk memulai pesanan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const modifierTotal = item.modifiers.reduce((sum, m) => sum + m.price, 0);
              const itemTotal = (item.price + modifierTotal) * item.quantity;
              
              return (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-1">
                      {splitMode && (
                        <input
                          type="checkbox"
                          checked={item.splitGroupId === currentSplitGroup}
                          onChange={() => handleSplitToggle(item.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-black">{item.name}</h4>
                        {item.modifiers.length > 0 && (
                          <div className="text-xs text-black mt-1">
                            {item.modifiers.map((mod) => (
                              <span key={mod.id} className="mr-2">
                                + {mod.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {(userRole === 'admin' || userRole === 'manager') && (
                        <button
                          onClick={() => handleVoid(item.id)}
                          className="text-orange-500 hover:text-orange-700"
                          title="Void Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-medium"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-black">
                        Rp {itemTotal.toLocaleString()}
                      </p>
                      <p className="text-xs text-black">
                        Rp {(item.price + modifierTotal).toLocaleString()} / pcs
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer - Total and Payment */}
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-black">
            <span>Subtotal</span>
            <span>Rp {getSubtotal().toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-black">
            <span>Pajak (10%)</span>
            <span>Rp {getTax().toLocaleString()}</span>
          </div>
          {splitMode && currentSplitGroup && (
            <div className="flex justify-between text-sm text-black font-medium">
              <span>Split Total</span>
              <span>Rp {getSplitGroupTotal(currentSplitGroup).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-black">
            <span>Pembulatan ({roundTo})</span>
            <span>Rp {calculateRoundedTotal(roundTo).roundingAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-black pt-2 border-t">
            <span>Total (dibulatkan)</span>
            <span>Rp {calculateRoundedTotal(roundTo).total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2 mb-2">
          <select
            value={roundTo}
            onChange={(e) => setRoundTo(Number(e.target.value))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value={500}>Pembulatan 500</option>
            <option value={1000}>Pembulatan 1000</option>
            <option value={0}>Tidak ada pembulatan</option>
          </select>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowSplitBillModal(true)}
            disabled={items.length === 0}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Split Bill
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <label className="flex-1 flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer transition-colors ${
            paymentMethod === 'CASH' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }">
            <input
              type="radio"
              name="paymentMethod"
              value="CASH"
              checked={paymentMethod === 'CASH'}
              onChange={() => setPaymentMethod('CASH')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Tunai</span>
          </label>
          <label className="flex-1 flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer transition-colors ${
            paymentMethod === 'QRIS' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }">
            <input
              type="radio"
              name="paymentMethod"
              value="QRIS"
              checked={paymentMethod === 'QRIS'}
              onChange={() => setPaymentMethod('QRIS')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">QRIS</span>
          </label>
          <label className="flex-1 flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer transition-colors ${
            paymentMethod === 'DEBIT' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }">
            <input
              type="radio"
              name="paymentMethod"
              value="DEBIT"
              checked={paymentMethod === 'DEBIT'}
              onChange={() => setPaymentMethod('DEBIT')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm font-medium">Debit</span>
          </label>
        </div>

        {/* Cash Input - Only show for CASH payment */}
        {paymentMethod === 'CASH' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-black mb-1">
              Uang Diterima
            </label>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="Masukkan jumlah uang tunai"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {cashReceived && (
              <p className="text-sm text-black mt-1">
                Kembalian: Rp {(Number(cashReceived) - calculateRoundedTotal(roundTo).total).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {splitMode && currentSplitGroup && (
            <button
              onClick={handlePaySplit}
              className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Bayar Split
            </button>
          )}
          <button
            onClick={handleCancel}
            disabled={items.length === 0}
            className={`${
              splitMode && currentSplitGroup ? 'flex-1' : 'w-full'
            } bg-red-100 text-red-600 py-3 rounded-lg font-bold hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors`}
          >
            Batal
          </button>
          <button
            onClick={handlePayment}
            disabled={items.length === 0}
            className={`${
              splitMode && currentSplitGroup ? 'flex-1' : 'w-full'
            } bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors`}
          >
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-full h-full">
            <Receipt
              orderId={receiptData.orderId}
              tableNumber={receiptData.tableNumber}
              items={receiptData.items}
              subtotal={receiptData.subtotal}
              tax={receiptData.tax}
              discount={receiptData.discount}
              roundingAmount={receiptData.roundingAmount}
              total={receiptData.total}
              paymentMethod={receiptData.paymentMethod}
              notes={receiptData.notes}
            />
          </div>
        </div>
      )}

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={showSplitBillModal}
        onClose={() => setShowSplitBillModal(false)}
        onSplitComplete={handleSplitComplete}
      />
    </div>
  );
};
