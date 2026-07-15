'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/src/store/useCartStore';
import { ShoppingCart, Trash2, Plus, Minus, Ban } from 'lucide-react';
import { Receipt } from '@/src/components/pos/Receipt';
import { SplitBillModal } from './SplitBillModal';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { PromptDialog } from '@/src/components/ui/PromptDialog';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { formatRupiah } from '@/src/lib/format';

const paymentOptions = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'DEBIT', label: 'Debit' },
] as const;

export const CartPanel = () => {
  const { items, removeFromCart, updateQuantity, getSubtotal, getTax, clearCart, tableNumber, notes, setTableNumber, setNotes, processPayment, assignSplitGroup, getSplitGroupTotal, voidItem, calculateRoundedTotal, paymentMethod, setPaymentMethod } = useCartStore();
  const { user } = useAuth();
  const { toast } = useToast();

  const [splitMode, setSplitMode] = useState(false);
  const [currentSplitGroup, setCurrentSplitGroup] = useState<string | null>(null);
  const [roundTo, setRoundTo] = useState<number>(1000);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [paying, setPaying] = useState(false);

  // Dialog state
  const [confirmClear, setConfirmClear] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [voidTargetId, setVoidTargetId] = useState<string | null>(null);

  const userRole = user?.role ?? 'cashier';

  // Escape key cancels the current order (asks first)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && items.length > 0) setConfirmClear(true);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [items.length]);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) updateQuantity(id, newQuantity);
  };

  const handleVoidSubmit = async (reason: string) => {
    if (!voidTargetId) return;
    const result = await voidItem(voidTargetId, reason);
    setVoidTargetId(null);
    toast(result.success ? 'success' : 'error', result.message);
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      toast('warning', 'Keranjang kosong');
      return;
    }
    if (!tableNumber) {
      toast('warning', 'Mohon isi nomor meja terlebih dahulu');
      return;
    }

    if (paymentMethod === 'QRIS') {
      toast('info', 'Silakan scan QRIS toko');
    }

    if (paymentMethod === 'CASH') {
      const cashAmount = Number(cashReceived);
      const total = calculateRoundedTotal(roundTo).total;
      if (!cashReceived || cashAmount < total) {
        toast('error', `Uang tunai yang diterima kurang. Total: ${formatRupiah(total)}`);
        return;
      }
    }

    setPaying(true);
    try {
      const result = await processPayment(roundTo);
      if (result.success && result.receiptData) {
        setReceiptData(result.receiptData);
        setShowReceipt(true);
        toast('success', 'Pembayaran berhasil');
      } else {
        toast('error', result.message);
      }
    } finally {
      setPaying(false);
    }
  };

  const handleSplitComplete = (splitCart: any[]) => {
    toast('success', `Split bill berhasil! ${splitCart.length} item dipisah ke transaksi baru.`);
  };

  const handleSplitToggle = (itemId: string) => {
    if (currentSplitGroup) assignSplitGroup(itemId, currentSplitGroup);
  };

  const handleStartSplit = () => {
    setCurrentSplitGroup(crypto.randomUUID());
    setSplitMode(true);
  };

  const handleEndSplit = () => {
    setCurrentSplitGroup(null);
    setSplitMode(false);
  };

  const handlePaySplit = () => {
    if (!currentSplitGroup) return;
    const splitTotal = getSplitGroupTotal(currentSplitGroup);
    if (splitTotal === 0) {
      toast('warning', 'Tidak ada item dalam grup pembayaran ini');
      return;
    }
    // TODO: Implement split payment logic
    toast('info', `Pembayaran untuk grup: ${formatRupiah(splitTotal)}`);
  };

  const rounded = calculateRoundedTotal(roundTo);

  return (
    <div className="flex h-full flex-col border-l border-line bg-surface">
      {/* Header */}
      <div className="border-b border-line p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-ink">Keranjang</h2>
          {items.length > 0 && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-soft" onClick={() => setConfirmClear(true)}>
                Kosongkan
              </Button>
              <Button variant={splitMode ? 'secondary' : 'primary'} size="sm" onClick={splitMode ? handleEndSplit : handleStartSplit}>
                {splitMode ? 'Selesai Split' : 'Split Bill'}
              </Button>
            </div>
          )}
        </div>

        {/* Table Number Input */}
        <div className="mb-3">
          <label htmlFor="cart-table" className="mb-1 block text-sm font-medium text-ink">
            Nomor Meja <span aria-hidden="true" className="text-danger">*</span>
          </label>
          <input
            id="cart-table"
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Contoh: Meja 1"
            className="min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Notes Input */}
        <div>
          <label htmlFor="cart-notes" className="mb-1 block text-sm font-medium text-ink">
            Catatan Pesanan
          </label>
          <textarea
            id="cart-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan khusus untuk pesanan..."
            rows={2}
            className="w-full resize-none rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Keranjang kosong" message="Tambahkan produk untuk memulai pesanan" />
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const modifierTotal = item.modifiers.reduce((sum, m) => sum + m.price, 0);
              const itemTotal = (item.price + modifierTotal) * item.quantity;

              return (
                <div key={item.id} className="rounded-lg border border-line bg-surface-alt p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex flex-1 items-center gap-2">
                      {splitMode && (
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${item.name} untuk split`}
                          checked={item.splitGroupId === currentSplitGroup}
                          onChange={() => handleSplitToggle(item.id)}
                          className="h-5 w-5 rounded accent-[var(--primary)]"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-ink">{item.name}</h4>
                        {item.modifiers.length > 0 && (
                          <div className="mt-1 text-xs text-ink-secondary">
                            {item.modifiers.map((mod) => (
                              <span key={mod.id} className="mr-2">
                                + {mod.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 flex gap-1">
                      {userRole === 'admin' && (
                        <button
                          onClick={() => setVoidTargetId(item.id)}
                          aria-label={`Void ${item.name}`}
                          title="Void Item"
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-warning transition-colors hover:bg-warning-soft"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setRemoveTargetId(item.id)}
                        aria-label={`Hapus ${item.name}`}
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger-soft"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        aria-label="Kurangi jumlah"
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line-strong bg-surface transition-colors hover:bg-surface-alt active:scale-95"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="tnum w-8 text-center font-medium text-ink">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        aria-label="Tambah jumlah"
                        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line-strong bg-surface transition-colors hover:bg-surface-alt active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="tnum font-bold text-ink">{formatRupiah(itemTotal)}</p>
                      <p className="tnum text-xs text-ink-muted">{formatRupiah(item.price + modifierTotal)} / pcs</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer - Total and Payment */}
      <div className="border-t border-line bg-surface-alt p-4">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm text-ink-secondary">
            <span>Subtotal</span>
            <span className="tnum">{formatRupiah(getSubtotal())}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-secondary">
            <span>Pajak (10%)</span>
            <span className="tnum">{formatRupiah(getTax())}</span>
          </div>
          {splitMode && currentSplitGroup && (
            <div className="flex justify-between text-sm font-medium text-ink">
              <span>Split Total</span>
              <span className="tnum">{formatRupiah(getSplitGroupTotal(currentSplitGroup))}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-ink-secondary">
            <span>Pembulatan ({roundTo})</span>
            <span className="tnum">{formatRupiah(rounded.roundingAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-lg font-bold text-ink">
            <span>Total (dibulatkan)</span>
            <span className="tnum">{formatRupiah(rounded.total)}</span>
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="cart-rounding" className="sr-only">
            Pembulatan
          </label>
          <select
            id="cart-rounding"
            value={roundTo}
            onChange={(e) => setRoundTo(Number(e.target.value))}
            className="min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink focus:border-primary focus:outline-none"
          >
            <option value={500}>Pembulatan 500</option>
            <option value={1000}>Pembulatan 1000</option>
            <option value={0}>Tidak ada pembulatan</option>
          </select>
        </div>

        <fieldset className="mb-3">
          <legend className="sr-only">Metode pembayaran</legend>
          <div className="flex gap-2">
            {paymentOptions.map(({ value, label }) => (
              <label
                key={value}
                className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  paymentMethod === value
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-line-strong text-ink-secondary hover:bg-surface'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={value}
                  checked={paymentMethod === value}
                  onChange={() => setPaymentMethod(value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Cash Input - Only show for CASH payment */}
        {paymentMethod === 'CASH' && (
          <div className="mb-3">
            <label htmlFor="cart-cash" className="mb-1 block text-sm font-medium text-ink">
              Uang Diterima
            </label>
            <input
              id="cart-cash"
              type="number"
              inputMode="numeric"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="Masukkan jumlah uang tunai"
              className="tnum min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
            {cashReceived && (
              <p className="tnum mt-1 text-sm text-ink-secondary">
                Kembalian: {formatRupiah(Number(cashReceived) - rounded.total)}
              </p>
            )}
          </div>
        )}

        <div className="mb-3">
          <Button
            variant="secondary"
            className="w-full"
            disabled={items.length === 0}
            onClick={() => setShowSplitBillModal(true)}
          >
            Split Bill
          </Button>
        </div>

        <div className="flex gap-2">
          {splitMode && currentSplitGroup && (
            <Button variant="secondary" size="lg" className="flex-1" onClick={handlePaySplit}>
              Bayar Split
            </Button>
          )}
          <Button
            variant="ghost"
            size="lg"
            className="flex-1 text-danger hover:bg-danger-soft"
            disabled={items.length === 0}
            onClick={() => setConfirmClear(true)}
          >
            Batal
          </Button>
          <Button
            variant="success"
            size="lg"
            className="flex-[2]"
            disabled={items.length === 0}
            loading={paying}
            onClick={handlePayment}
          >
            Bayar Sekarang
          </Button>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="h-full w-full">
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

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={confirmClear}
        title="Batalkan pesanan?"
        message="Seluruh item di keranjang akan dihapus. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Ya, kosongkan"
        danger
        onConfirm={() => {
          clearCart();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
      <ConfirmDialog
        isOpen={removeTargetId !== null}
        title="Hapus item?"
        message="Item ini akan dihapus dari keranjang."
        confirmLabel="Hapus"
        danger
        onConfirm={() => {
          if (removeTargetId) removeFromCart(removeTargetId);
          setRemoveTargetId(null);
        }}
        onCancel={() => setRemoveTargetId(null)}
      />
      <PromptDialog
        isOpen={voidTargetId !== null}
        title="Void item"
        label="Alasan pembatalan"
        placeholder="Contoh: salah input"
        confirmLabel="Void"
        danger
        onSubmit={handleVoidSubmit}
        onCancel={() => setVoidTargetId(null)}
      />
    </div>
  );
};
