'use client';

import { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah } from '@/src/lib/format';
import { CreditCard, QrCode, Banknote, Divide } from 'lucide-react';
import { QRISPaymentModal } from './QRISPaymentModal';
import { CardPaymentModal } from './CardPaymentModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onPaymentComplete: (paymentMethod: string, amount?: number) => void;
  onSplitBillComplete: (selectedItems: any[], paymentMethod: string) => void;
}

const paymentMethods = [
  { value: 'CASH', label: 'Tunai', icon: Banknote },
  { value: 'QRIS', label: 'QRIS', icon: QrCode },
  { value: 'DEBIT', label: 'Debit/Kartu', icon: CreditCard },
];

const splitPaymentMethods = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'DEBIT', label: 'Debit/Kartu' },
];

export const PaymentModal = ({ isOpen, onClose, order, onPaymentComplete, onSplitBillComplete }: PaymentModalProps) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [qrisModalOpen, setQrisModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [splitPaymentMethod, setSplitPaymentMethod] = useState<string>('');
  const [splitCashAmount, setSplitCashAmount] = useState<string>('');
  const [splitQrisModalOpen, setSplitQrisModalOpen] = useState(false);
  const [splitCardModalOpen, setSplitCardModalOpen] = useState(false);
  const [isProcessingSplit, setIsProcessingSplit] = useState(false);
  const { toast } = useToast();

  const calculateTotal = () => {
    return order.items?.reduce((sum: number, item: any) => {
      const price = Number(item.price_at_time) || 0;
      return sum + (price * item.quantity);
    }, 0) || 0;
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const cash = Number(cashAmount) || 0;
    return cash - total;
  };

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      toast('warning', 'Pilih metode pembayaran terlebih dahulu');
      return;
    }

    if (selectedPaymentMethod === 'CASH') {
      const cash = Number(cashAmount) || 0;
      const total = calculateTotal();
      if (cash < total) {
        toast('warning', 'Jumlah uang tunai kurang dari total pembayaran');
        return;
      }
      onPaymentComplete(selectedPaymentMethod, cash);
    } else if (selectedPaymentMethod === 'QRIS') {
      setQrisModalOpen(true);
    } else if (selectedPaymentMethod === 'DEBIT') {
      setCardModalOpen(true);
    }
  };

  const handleSplitBill = () => {
    setShowSplitBill(true);
    setSelectedPaymentMethod('');
  };

  const handleQuickCashAmount = (amount: number) => {
    const total = calculateTotal();
    const roundedAmount = Math.ceil(amount / 1000) * 1000;
    setCashAmount(roundedAmount.toString());
  };

  const handleQRISComplete = () => {
    onPaymentComplete('QRIS');
    setQrisModalOpen(false);
  };

  const handleQRISClose = () => {
    setQrisModalOpen(false);
  };

  const handleCardComplete = () => {
    onPaymentComplete('DEBIT');
    setCardModalOpen(false);
  };

  const handleCardClose = () => {
    setCardModalOpen(false);
  };

  // Split Bill handlers
  const handleToggleItem = (itemId: string) => {
    if (isProcessingSplit) return;
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (isProcessingSplit) return;
    const allItemIds = order.items?.map((item: any) => item.id) || [];
    if (selectedItemIds.length === allItemIds.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(allItemIds);
    }
  };

  const handleConfirmSplit = async () => {
    if (isProcessingSplit) return;
    
    if (selectedItemIds.length === 0) {
      toast('warning', 'Pilih minimal satu item untuk split bill');
      return;
    }
    if (!splitPaymentMethod) {
      toast('warning', 'Pilih metode pembayaran terlebih dahulu');
      return;
    }

    setIsProcessingSplit(true);

    try {
      const selectedItems = order.items?.filter((item: any) => selectedItemIds.includes(item.id)) || [];
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      onSplitBillComplete(selectedItems, splitPaymentMethod);
      setSelectedItemIds([]);
      setSplitPaymentMethod('');
      setShowSplitBill(false);
      onClose();
    } catch (error) {
      console.error('Split bill error:', error);
      toast('error', 'Gagal memproses split bill');
    } finally {
      setIsProcessingSplit(false);
    }
  };

  const handleCancelSplit = () => {
    if (isProcessingSplit) {
      toast('warning', 'Pembayaran sedang diproses');
      return;
    }
    setShowSplitBill(false);
    setSelectedItemIds([]);
    setSplitPaymentMethod('');
    setSplitCashAmount('');
    setSplitQrisModalOpen(false);
    setSplitCardModalOpen(false);
  };

  const handleSplitPaymentMethodSelect = (method: string) => {
    if (isProcessingSplit) return;
    setSplitPaymentMethod(method);
    if (method === 'QRIS') {
      setSplitQrisModalOpen(true);
    } else if (method === 'DEBIT') {
      setSplitCardModalOpen(true);
    }
  };

  const handleSplitQuickCashAmount = (amount: number) => {
    const roundedAmount = Math.ceil(amount / 1000) * 1000;
    setSplitCashAmount(roundedAmount.toString());
  };

  const handleSplitQrisComplete = () => {
    setSplitQrisModalOpen(false);
    handleConfirmSplit();
  };

  const handleSplitQrisClose = () => {
    setSplitQrisModalOpen(false);
    setSplitPaymentMethod('');
  };

  const handleSplitCardComplete = () => {
    setSplitCardModalOpen(false);
    handleConfirmSplit();
  };

  const handleSplitCardClose = () => {
    setSplitCardModalOpen(false);
    setSplitPaymentMethod('');
  };

  const calculateSplitChange = () => {
    const cash = Number(splitCashAmount) || 0;
    return cash - selectedTotal;
  };

  const calculateItemTotal = (item: any) => {
    const price = Number(item.price_at_time) || 0;
    const modifiers = item.modifiers_applied || item.modifiers || [];
    const modifierTotal = modifiers.reduce((sum: number, m: any) => sum + (m.price_extra || m.price || 0), 0) || 0;
    return (price + modifierTotal) * item.quantity;
  };

  const calculateSelectedTotal = () => {
    return order.items
      ?.filter((item: any) => selectedItemIds.includes(item.id))
      .reduce((sum: number, item: any) => sum + calculateItemTotal(item), 0) || 0;
  };

  const getItemName = (item: any) => {
    return item.product?.name || item.name || 'Unknown';
  };

  const getItemPrice = (item: any) => {
    return Number(item.price_at_time) || 0;
  };

  const getItemModifiers = (item: any) => {
    return item.modifiers_applied || item.modifiers || [];
  };

  const total = calculateTotal();
  const change = calculateChange();
  const selectedTotal = calculateSelectedTotal();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={showSplitBill ? 'Split Bill' : 'Pilih Metode Pembayaran'}
        size={showSplitBill ? 'lg' : 'md'}
        footer={
          showSplitBill ? (
            <div className="w-full">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-lg font-bold text-ink">Total yang Dipilih:</span>
                <span className="tnum text-2xl font-bold text-ink">{formatRupiah(selectedTotal)}</span>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="flex-1 text-danger hover:bg-danger-soft" 
                  onClick={handleCancelSplit}
                  disabled={isProcessingSplit}
                >
                  Batal
                </Button>
                <Button 
                  size="lg" 
                  className="flex-1" 
                  disabled={
                    selectedItemIds.length === 0 || 
                    !splitPaymentMethod || 
                    isProcessingSplit ||
                    (splitPaymentMethod === 'CASH' && (!splitCashAmount || Number(splitCashAmount) < selectedTotal))
                  } 
                  onClick={splitPaymentMethod === 'CASH' ? handleConfirmSplit : undefined}
                >
                  {isProcessingSplit ? 'Memproses...' : 'Bayar Split'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="w-full flex gap-3">
              <Button
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={onClose}
              >
                Batal
              </Button>
              <Button
                size="lg"
                className="flex-1"
                disabled={!selectedPaymentMethod || (selectedPaymentMethod === 'CASH' && (!cashAmount || Number(cashAmount) < total))}
                onClick={handlePayment}
              >
                {selectedPaymentMethod === 'QRIS' || selectedPaymentMethod === 'DEBIT' ? 'Lanjut' : 'Bayar'}
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Meja</span>
              <span className="font-medium">{order.table_number || 'Direct'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-xl font-bold">{formatRupiah(total)}</span>
            </div>
          </div>

          {!showSplitBill ? (
            <>
              {/* Split Bill Option */}
              <Button
                variant="secondary"
                size="lg"
                className="w-full flex items-center justify-center gap-2 border-dashed"
                onClick={handleSplitBill}
              >
                <Divide className="w-5 h-5" />
                Split Bill
              </Button>

              {/* Payment Methods */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Metode Pembayaran</p>
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.value}
                      onClick={() => setSelectedPaymentMethod(method.value)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                        selectedPaymentMethod === method.value
                          ? 'border-primary bg-primary-soft'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-gray-600" />
                      <span className="font-medium">{method.label}</span>
                      {selectedPaymentMethod === method.value && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Cash Input Section */}
              {selectedPaymentMethod === 'CASH' && (
                <div className="space-y-3 pt-2 border-t">
                  <p className="text-sm font-medium text-gray-700">Jumlah Uang Tunai</p>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Masukkan jumlah uang"
                    className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none"
                  />
                  
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[total, total * 2, total * 3].map((amount, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickCashAmount(amount)}
                        className="p-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {formatRupiah(amount)}
                      </button>
                    ))}
                  </div>

                  {/* Change Display */}
                  {cashAmount && Number(cashAmount) >= total && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-green-700">Kembalian:</span>
                        <span className="text-lg font-bold text-green-700">{formatRupiah(change)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Split Bill Inline Form */}
              <label className="mb-4 flex min-h-11 cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItemIds.length === (order.items?.length || 0)}
                  onChange={handleSelectAll}
                  disabled={isProcessingSplit}
                  className="h-5 w-5 rounded accent-[var(--primary)]"
                />
                <span className="font-medium text-ink">Pilih Semua</span>
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {order.items?.map((item: any) => {
                  const itemTotal = calculateItemTotal(item);
                  const isSelected = selectedItemIds.includes(item.id);
                  const modifiers = getItemModifiers(item);

                  return (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                        isSelected ? 'border-primary bg-primary-soft' : 'border-line hover:border-line-strong'
                      } ${isProcessingSplit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleItem(item.id)}
                        disabled={isProcessingSplit}
                        className="h-5 w-5 rounded accent-[var(--primary)]"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-ink">{getItemName(item)}</h4>
                            <p className="tnum text-sm text-ink-secondary">
                              {item.quantity} x {formatRupiah(getItemPrice(item))}
                            </p>
                            {modifiers && modifiers.length > 0 && (
                              <div className="mt-1 text-xs text-ink-muted">
                                {modifiers.map((mod: any) => (
                                  <span key={mod.id} className="mr-2">+ {mod.name}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="tnum font-bold text-ink">{formatRupiah(itemTotal)}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Metode Pembayaran</p>
                <div className="grid grid-cols-3 gap-2">
                  {splitPaymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => handleSplitPaymentMethodSelect(method.value)}
                      disabled={isProcessingSplit}
                      className={`p-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                        splitPaymentMethod === method.value
                          ? 'border-primary bg-primary-soft'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isProcessingSplit ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                {/* Cash Input Section for Split Bill */}
                {splitPaymentMethod === 'CASH' && (
                  <div className="space-y-3 pt-2 border-t">
                    <p className="text-sm font-medium text-gray-700">Jumlah Uang Tunai</p>
                    <input
                      type="number"
                      value={splitCashAmount}
                      onChange={(e) => setSplitCashAmount(e.target.value)}
                      placeholder="Masukkan jumlah uang"
                      className="w-full p-3 border-2 rounded-lg focus:border-primary focus:outline-none"
                      disabled={isProcessingSplit}
                    />
                    
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {[selectedTotal, selectedTotal * 2, selectedTotal * 3].map((amount, index) => (
                        <button
                          key={index}
                          onClick={() => handleSplitQuickCashAmount(amount)}
                          disabled={isProcessingSplit}
                          className="p-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {formatRupiah(amount)}
                        </button>
                      ))}
                    </div>

                    {/* Change Display */}
                    {splitCashAmount && Number(splitCashAmount) >= selectedTotal && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-700">Kembalian:</span>
                          <span className="text-lg font-bold text-green-700">{formatRupiah(calculateSplitChange())}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* QRIS Payment Modal */}
      <QRISPaymentModal
        isOpen={qrisModalOpen}
        onClose={handleQRISClose}
        order={order}
        onPaymentComplete={handleQRISComplete}
      />

      {/* Card Payment Modal */}
      <CardPaymentModal
        isOpen={cardModalOpen}
        onClose={handleCardClose}
        order={order}
        onPaymentComplete={handleCardComplete}
      />

      {/* Split Bill QRIS Payment Modal */}
      <QRISPaymentModal
        isOpen={splitQrisModalOpen}
        onClose={handleSplitQrisClose}
        order={order}
        onPaymentComplete={handleSplitQrisComplete}
      />

      {/* Split Bill Card Payment Modal */}
      <CardPaymentModal
        isOpen={splitCardModalOpen}
        onClose={handleSplitCardClose}
        order={order}
        onPaymentComplete={handleSplitCardComplete}
      />
    </>
  );
};
