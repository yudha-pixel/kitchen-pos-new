'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/src/store/useCartStore';
import { useConfigStore } from '@/src/store/useConfigStore';
import { ShoppingCart, Trash2, Plus, Minus, Ban, X, User, ChevronDown, Utensils, Loader2, StickyNote } from 'lucide-react';
import { Receipt } from '@/src/components/pos/Receipt';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
import { useTables } from '@/src/hooks/useTables';
import { useSyncManager } from '@/src/hooks/useSyncManager';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { generateUUID } from '@/src/lib/utils';
import { useOutletStore } from '@/src/features/outlet/outletStore';
import { reduceStockForOrder } from '@/src/features/inventory/inventoryService';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { PromptDialog } from '@/src/components/ui/PromptDialog';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Modal } from '@/src/components/ui/Modal';
import { formatRupiah } from '@/src/lib/format';
import { createPaymentTransaction } from '@/src/features/payment/paymentService';
import { searchCustomers } from '@/src/features/crm/customerService';
import { validateVoucher, useVoucher } from '@/src/features/pos/voucherService';
import { usePaymentStore } from '@/src/features/payment/paymentStore';
import { SplitBillModal } from './SplitBillModal';
import { QRISModal } from '@/src/components/payment/QRISModal';
import { SplitBillModal as NewSplitBillModal } from '@/src/components/pos/SplitBillModal';
import { CartPaymentModal } from '@/src/components/pos/CartPaymentModal';
import { useGlobalHotkey } from '@/src/hooks/useGlobalHotkey';
import { PERMISSIONS } from '@/src/config/permissions';

interface CartPanelProps {
  orderCategory?: 'dine-in' | 'takeaway' | 'delivery';
  onOrderCategoryChange?: (category: 'dine-in' | 'takeaway' | 'delivery') => void;
  customerName?: string;
  deliveryAddress?: string;
  courierName?: string;
  courierType?: 'internal' | 'external';
  receiptNumber?: string;
}

export const CartPanel = ({ orderCategory = 'dine-in', onOrderCategoryChange, customerName, deliveryAddress, courierName, courierType, receiptNumber }: CartPanelProps) => {
  const { items, removeFromCart, updateQuantity, getSubtotal, getTax, getServiceCharge, clearCart, tableNumber: storeTableNumber, notes, setTableNumber, setNotes, processPayment, assignSplitGroup, getSplitGroupTotal, voidItem, calculateRoundedTotal, paymentMethod, setPaymentMethod, discountAmount, discountType, setDiscount, freeItems, clearFreeItems, getDiscount, globalDiscountAmount, globalDiscountType, setGlobalDiscount, clearGlobalDiscount, getGlobalDiscount, setVoucher, clearVoucher, voucherDiscountAmount, setMember, clearMember, member, sendToKitchen, kitchenSent } = useCartStore();
  const { user, can } = useAuth();
  const { toast } = useToast();
  const { setCurrentPayment, clearPayment } = usePaymentStore();
  const { tables, loading: tablesLoading } = useTables();
  const taxRatePercent = useConfigStore((state) => state.taxRate);
  const serviceChargeRatePercent = useConfigStore((state) => state.serviceChargeRate);
  const [showTableModal, setShowTableModal] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [currentSplitGroup, setCurrentSplitGroup] = useState<string | null>(null);
  const [roundTo] = useState<number>(1000);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState<string>('');
  const [localDiscountType, setLocalDiscountType] = useState<'nominal' | 'percentage'>('nominal');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountTab, setDiscountTab] = useState<'regular' | 'global' | 'voucher'>('regular');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [showGlobalDiscountInput, setShowGlobalDiscountInput] = useState(false);
  const [globalDiscountValue, setGlobalDiscountValue] = useState<string>('');
  const [localGlobalDiscountType, setLocalGlobalDiscountType] = useState<'nominal' | 'percentage'>('nominal');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinValue, setPinValue] = useState<string>('');
  const [discountReason, setDiscountReason] = useState<string>('');
  const [memberSearchTerm, setMemberSearchTerm] = useState<string>('');
  const [memberSearchResults, setMemberSearchResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showNewSplitBillModal, setShowNewSplitBillModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Search members when search term changes
  useEffect(() => {
    const searchMembers = async () => {
      if (memberSearchTerm.length >= 3) {
        try {
          const results = await searchCustomers(memberSearchTerm);
          setMemberSearchResults(results);
        } catch (error) {
          console.error('Failed to search members:', error);
        }
      } else {
        setMemberSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchMembers, 300);
    return () => clearTimeout(debounceTimer);
  }, [memberSearchTerm]);

  const handleApplyVoucher = async () => {
    try {
      const subtotal = getSubtotal();

      // Prevent double discount - check if other discounts are applied
      if (discountAmount > 0 || globalDiscountAmount > 0) {
        toast('error', 'Hanya boleh menggunakan satu jenis diskon per transaksi');
        return;
      }

      const result = await validateVoucher(voucherCode, subtotal);
      if (!result.valid || !result.voucher) {
        toast('error', result.error || 'Kode voucer tidak valid');
        return;
      }
      const voucher = result.voucher;

      // Calculate discount amount
      let calculatedDiscount = 0;
      if (voucher.discount_type === 'percentage') {
        calculatedDiscount = subtotal * (voucher.discount_value / 100);
        // Apply max discount if set
        if (voucher.max_discount && calculatedDiscount > voucher.max_discount) {
          calculatedDiscount = voucher.max_discount;
        }
      } else {
        calculatedDiscount = voucher.discount_value;
      }

      // Apply voucher
      setVoucher(voucher.code, voucher.id, voucher.discount_type, voucher.discount_value, calculatedDiscount);
      setAppliedVoucher(voucher);
      setVoucherCode('');
      setShowDiscountModal(false);

      // Increment voucher usage count
      await useVoucher(voucher.id);

      toast('success', `Voucer ${voucher.name} berhasil diterapkan`);
    } catch (error) {
      console.error('Failed to apply voucher:', error);
      toast('error', 'Gagal menerapkan voucer');
    }
  };

  const handleSelectMember = (member: any) => {
    setSelectedMember(member);
    setMember(member);
    setMemberSearchTerm('');
    setMemberSearchResults([]);
    toast('success', `Member ${member.name} (${member.tier}) dipilih - Diskon ${member.discount_percentage}%`);
  };

  const handleClearMember = () => {
    setSelectedMember(null);
    clearMember();
    toast('success', 'Member dihapus');
  };

  // Dialog state
  const [confirmClear, setConfirmClear] = useState(false);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);
  const [voidTargetId, setVoidTargetId] = useState<string | null>(null);


  // Escape key cancels the current order (asks first)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && items.length > 0) setConfirmClear(true);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [items.length]);

  // F1 opens the payment modal from anywhere on the POS screen
  useGlobalHotkey('F1', () => {
    if (items.length > 0) setShowPaymentModal(true);
  });

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) updateQuantity(id, newQuantity);
  };

  const handleVoidSubmit = async (reason: string) => {
    if (!voidTargetId) return;
    const result = await voidItem(voidTargetId, reason);
    setVoidTargetId(null);
    toast(result.success ? 'success' : 'error', result.message);
  };

  const handleApplyDiscount = () => {
    const value = Number(discountValue);
    if (isNaN(value) || value <= 0) {
      toast('error', 'Masukkan nilai diskon yang valid');
      return;
    }
    setDiscount(value, localDiscountType);
    setShowDiscountInput(false);
    setDiscountValue('');
    toast('success', `Diskon ${localDiscountType === 'percentage' ? value + '%' : formatRupiah(value)} diterapkan`);
  };

  const handleClearDiscount = () => {
    setDiscount(0, 'nominal');
    toast('success', 'Diskon dihapus');
  };

  const handleGlobalDiscountPinSubmit = () => {
    // Simple PIN validation - in production, this should verify against a secure system
    const validPin = '1234'; // Default PIN - should be configurable
    if (pinValue !== validPin) {
      toast('error', 'PIN salah. Akses ditolak.');
      setPinValue('');
      return;
    }

    if (!discountReason.trim()) {
      toast('error', 'Mohon isi alasan diskon.');
      return;
    }

    const value = Number(globalDiscountValue);
    if (isNaN(value) || value <= 0) {
      toast('error', 'Masukkan nilai diskon yang valid');
      return;
    }

    // Apply global discount with authorization
    setGlobalDiscount(value, localGlobalDiscountType, user?.username || 'Unknown', discountReason);
    setShowPinModal(false);
    setShowGlobalDiscountInput(false);
    setGlobalDiscountValue('');
    setPinValue('');
    setDiscountReason('');
    toast('success', `Global Diskon ${localGlobalDiscountType === 'percentage' ? value + '%' : formatRupiah(value)} diterapkan dengan otorisasi ${user?.username}`);
  };

  const handleClearGlobalDiscount = () => {
    clearGlobalDiscount();
    toast('success', 'Global Diskon dihapus');
  };

  const handlePayment = async (): Promise<boolean> => {
    if (items.length === 0) {
      toast('warning', 'Keranjang kosong');
      return false;
    }
    if (!storeTableNumber) {
      toast('warning', 'Mohon isi nomor meja terlebih dahulu');
      return false;
    }

    const total = calculateRoundedTotal(roundTo).total;

    if (paymentMethod === 'QRIS') {
      // Process the order first to get a valid order_id
      setPaying(true);
      try {
        const result = await processPayment(roundTo, orderCategory, receiptNumber, customerName, deliveryAddress, courierName, courierType);
        
        if (result.success) {
          const { orderId } = result;
          
          if (!orderId) {
            toast('error', 'Gagal mendapatkan order ID');
            return false;
          }
          
          console.log('Order created successfully, ID:', orderId);
          
          // Create payment transaction for QRIS with the actual order_id.
          // Amount is derived server-side from order.total_amount, not sent
          // from the client (see paymentService.ts).
          const payment = await createPaymentTransaction(
            orderId,
            'midtrans',
            'qris'
          );

          console.log('Payment creation result:', payment);

          if (payment) {
            setCurrentPayment(payment);
            setShowQRISModal(true);

            // processPayment() already clears the cart on success, so its own
            // returned receiptData (computed before the clear) is the only
            // reliable source of totals here — recomputing via getSubtotal()/
            // calculateRoundedTotal() now would read the post-clear (empty) cart.
            setReceiptData({
              ...(result.receiptData as Record<string, unknown>),
              cashierName: (user as any)?.name || 'Kasir',
            });
            return true;
          } else {
            toast('error', 'Gagal membuat pembayaran QRIS. Order ID: ' + orderId);
            // Order was created but payment failed - need to handle this
            return false;
          }
        } else {
          toast('error', result.message || 'Gagal memproses pesanan');
          return false;
        }
      } catch (error) {
        console.error('Error processing order for QRIS:', error);
        toast('error', 'Gagal memproses pesanan');
        return false;
      } finally {
        setPaying(false);
      }
    }

    if (paymentMethod === 'CASH') {
      const cashAmount = Number(cashReceived);
      if (!cashReceived || cashAmount < total) {
        toast('error', `Uang tunai yang diterima kurang. Total: ${formatRupiah(total)}`);
        return false;
      }
    }

    setPaying(true);
    try {
      const result = await processPayment(roundTo, orderCategory, receiptNumber, customerName, deliveryAddress, courierName, courierType);
      
      if (result.success) {
        // processPayment() already clears the cart on success, so its own
        // returned receiptData (computed before the clear) is the only
        // reliable source of totals here — recomputing via getSubtotal()/
        // calculateRoundedTotal() now would read the post-clear (empty) cart.
        setReceiptData({
          ...(result.receiptData as Record<string, unknown>),
          cashierName: (user as any)?.name || 'Kasir',
        });
        setShowReceipt(true);
        clearCart();
        setCashReceived('');
        clearGlobalDiscount();
        clearVoucher();
        clearMember();
        clearFreeItems();
        return true;
      } else {
        toast('error', result.message || 'Gagal memproses pembayaran');
        return false;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast('error', 'Terjadi kesalahan saat memproses pembayaran');
      return false;
    } finally {
      setPaying(false);
    }
  };

  const handleQRISPaymentSuccess = async () => {
    // Order was already processed before showing QRIS modal
    // Just show the receipt and clear the cart
    setShowReceipt(true);
    clearCart();
    setCashReceived('');
    clearGlobalDiscount();
    clearVoucher();
    clearMember();
    clearFreeItems();
    clearPayment();
  };

  const handleQRISPaymentFailed = () => {
    toast('error', 'Pembayaran QRIS gagal atau expired');
    clearPayment();
    // Order was already created, so we need to handle this case
    // In production, you might want to void the order or mark it as unpaid
  };  

  const handleSplitComplete = (selectedItems: any[], paymentMethod: string) => {
    toast('success', `Split bill berhasil! ${selectedItems.length} item dipisah ke transaksi baru.`);
  };

  const handleSplitToggle = (itemId: string) => {
    if (currentSplitGroup) assignSplitGroup(itemId, currentSplitGroup);
  };

  const handleStartSplit = () => {
    setCurrentSplitGroup(generateUUID());
    setSplitMode(true);
  };

  const handleEndSplit = () => {
    setCurrentSplitGroup(null);
    setSplitMode(false);
  };

  const handleSendToKitchen = async () => {
    const result = await sendToKitchen();
    if (result.success) {
      toast('success', result.message);
    } else {
      toast('error', result.message);
    }
  };

  const handlePaySplit = async () => {
    if (!currentSplitGroup) return;
    const splitTotal = getSplitGroupTotal(currentSplitGroup);
    if (splitTotal === 0) {
      toast('warning', 'Tidak ada item dalam grup pembayaran ini');
      return;
    }

    setPaying(true);
    try {
      // Get items in the current split group
      const splitItems = items.filter(item => item.splitGroupId === currentSplitGroup);
      
      if (splitItems.length === 0) {
        toast('warning', 'Tidak ada item dalam grup pembayaran ini');
        return;
      }

      // Calculate totals for split items
      const splitSubtotal = splitItems.reduce((sum, item) => {
        const modifierTotal = (item.modifiers || []).reduce((mSum, m) => mSum + (m.price || 0), 0);
        return sum + ((item.price + modifierTotal) * item.quantity);
      }, 0);

      const splitTax = splitSubtotal * 0.1; // Assuming 10% tax
      const splitDiscount = 0; // No discount for split items for now
      const splitFinalTotal = splitSubtotal + splitTax - splitDiscount;

      // Create order data for split payment
      const orderId = generateUUID();
      
      // Prepare receipt data for split items
      const splitReceiptData = {
        orderId,
        tableNumber: storeTableNumber,
        items: splitItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          modifiers: (item.modifiers || []).map(m => m.name || String(m)),
        })),
        freeItems: [],
        subtotal: splitSubtotal,
        tax: splitTax,
        discount: splitDiscount,
        discountType: 'nominal' as const,
        globalDiscount: 0,
        globalDiscountType: 'nominal' as const,
        roundingAmount: 0,
        total: splitFinalTotal,
        paymentMethod: paymentMethod,
        cashierName: (user as any)?.name || 'Kasir',
        notes: `Split Payment - Group: ${currentSplitGroup.slice(0, 8)}`,
      };

      // Remove split items from cart
      splitItems.forEach(item => {
        removeFromCart(item.id);
      });

      // Reduce stock for split items
      try {
        const stockResult = await reduceStockForOrder(
          splitItems.map(item => ({ product_id: item.productId, quantity: item.quantity }))
        );
        console.log('Stock reduction result (handlePaySplit):', stockResult);
        
        // Dispatch custom event to notify POS page to recalculate menu stock
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('inventoryStockChanged'));
          console.log('📡 Dispatched inventoryStockChanged event');
        }
      } catch (stockError) {
        console.error('Failed to reduce stock (handlePaySplit):', stockError);
        // Don't fail the payment if stock reduction fails
      }

      // Show receipt
      setReceiptData(splitReceiptData);
      setShowReceipt(true);

      // Auto-print receipt after a short delay to ensure DOM is ready
      setTimeout(() => {
        const receiptElement = document.getElementById('receipt-container');
        if (receiptElement) {
          // Create iframe for printing
          const oldIframe = document.getElementById('split-receipt-print-iframe');
          if (oldIframe) document.body.removeChild(oldIframe);

          const iframe = document.createElement('iframe');
          iframe.id = 'split-receipt-print-iframe';
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = 'none';
          document.body.appendChild(iframe);

          let stylesHtml = '';
          document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
            stylesHtml += node.outerHTML;
          });

          const iframeWindow = iframe.contentWindow;
          if (!iframeWindow) return;

          const iframeDoc = iframeWindow.document;
          iframeDoc.open();
          iframeDoc.write(`
            <html>
              <head>
                <title>Print Split Receipt</title>
                ${stylesHtml}
                <style>
                  @page {
                    margin: 0 !important;
                    size: 80mm auto !important;
                  }
                  html, body {
                    width: 80mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    min-width: 80mm !important;
                    max-width: 80mm !important;
                    height: auto !important;
                    overflow: hidden !important;
                    background-color: #ffffff !important;
                  }
                  body {
                    font-family: sans-serif;
                    display: flex;
                    justify-content: center;
                  }
                  button, .btn, [class*="CetakStruk"], button[onClick*="Print"] {
                    display: none !important;
                  }
                  * {
                    page-break-inside: avoid !important;
                  }
                </style>
              </head>
              <body>
                <div style="width: 80mm; margin: 0 auto;">
                  ${receiptElement.innerHTML}
                </div>
              </body>
            </html>
          `);
          iframeDoc.close();

          setTimeout(() => {
            iframeWindow.focus();
            iframeWindow.print();
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 1000);
          }, 500);
        }
      }, 1000);

      // Exit split mode
      setCurrentSplitGroup(null);
      setSplitMode(false);

      toast('success', `Pembayaran split berhasil: ${formatRupiah(splitFinalTotal)}`);
    } catch (error) {
      console.error('Error processing split payment:', error);
      toast('error', 'Gagal memproses pembayaran split');
    } finally {
      setPaying(false);
    }
  };

  const rounded = calculateRoundedTotal(roundTo);

  if (!mounted) {
    return (
      <div className="flex h-full w-full min-w-0 flex-col border-l border-line bg-surface">
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-ink-muted">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-w-0 flex-col border-l border-line bg-surface">
      {/* Header */}
      <div className="border-b border-line p-3">
        <div className="mb-2 flex items-center justify-between">
          {items.length > 0 && (
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" mnemonic="C" className="text-danger hover:bg-danger-soft text-xs px-2 py-1" onClick={() => setConfirmClear(true)}>
                Kosongkan
              </Button>
              <Button variant={splitMode ? 'secondary' : 'primary'} size="sm" className="text-xs px-2 py-1" onClick={splitMode ? handleEndSplit : handleStartSplit}>
                {splitMode ? 'Selesai Split' : 'Split Bill'}
              </Button>
            </div>
          )}
        </div>

        {/* Order Type Toggle */}
        <div className="mb-2">
          <label className="mb-0.5 block text-xs font-medium text-ink">Tipe Pesanan</label>
          <div className="flex gap-1">
            {([
              { value: 'dine-in', label: 'Dine-in' },
              { value: 'takeaway', label: 'Takeaway' },
              { value: 'delivery', label: 'Delivery' },
            ] as const).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onOrderCategoryChange?.(value)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                  orderCategory === value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-alt text-ink-secondary hover:bg-surface'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Selector (dine-in only) */}
        {orderCategory === 'dine-in' && (
          <div className="mb-2">
            <label className="mb-0.5 block text-xs font-medium text-ink">
              Nomor Meja <span aria-hidden="true" className="text-danger">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowTableModal(true)}
              className="flex min-h-9 w-full items-center justify-between rounded-lg border border-line-strong bg-surface px-2.5 text-sm text-ink hover:bg-surface-alt focus:border-primary focus:outline-none"
            >
              <span className={storeTableNumber ? 'text-ink' : 'text-ink-muted'}>
                {storeTableNumber || 'Pilih Meja'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Compact metadata triggers */}
        <div className="flex gap-1.5">
          {selectedMember ? (
            <button
              onClick={() => setShowMemberModal(true)}
              className="flex min-h-8 flex-1 items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-3 text-xs font-medium text-primary"
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{selectedMember.name}</span>
              <X
                className="ml-auto h-3.5 w-3.5 shrink-0 hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearMember();
                }}
              />
            </button>
          ) : (
            <button
              onClick={() => setShowMemberModal(true)}
              className="flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-dashed border-line-strong bg-surface-alt px-3 text-xs font-medium text-ink-secondary hover:bg-surface hover:text-ink"
            >
              <User className="h-3.5 w-3.5" /> + Member
            </button>
          )}

          {notes ? (
            <button
              onClick={() => {
                setNotesDraft(notes);
                setShowNotesModal(true);
              }}
              className="flex min-h-8 flex-1 items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-3 text-xs font-medium text-primary"
            >
              <StickyNote className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{notes}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setNotesDraft(notes);
                setShowNotesModal(true);
              }}
              className="flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-dashed border-line-strong bg-surface-alt px-3 text-xs font-medium text-ink-secondary hover:bg-surface hover:text-ink"
            >
              <StickyNote className="h-3.5 w-3.5" /> + Catatan
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Keranjang Kosong" message="Pilih menu di sebelah kiri" />
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
                      {can(PERMISSIONS.orders.void) && (
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
      <div className="sticky bottom-0 shrink-0 border-t border-line bg-surface-alt p-3">
        <div className="mb-3 space-y-2">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Subtotal</span>
            <span className="tnum">{formatRupiah(getSubtotal())}</span>
          </div>

          {/* Tax (PPN) */}
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Pajak (PPN {taxRatePercent}%)</span>
            <span className="tnum">{formatRupiah(getTax())}</span>
          </div>

          {/* Service Charge - only shown when a rate is configured */}
          {serviceChargeRatePercent > 0 && (
            <div className="flex justify-between text-xs text-ink-secondary">
              <span>Biaya Layanan ({serviceChargeRatePercent}%)</span>
              <span className="tnum">{formatRupiah(getServiceCharge())}</span>
            </div>
          )}

          {/* Combined Discount / utility links row */}
          <div className="flex items-center justify-between gap-3">
            {(globalDiscountAmount > 0 || discountAmount > 0) ? (
              <div className="space-y-0.5 flex-1">
                {globalDiscountAmount > 0 && (
                  <div className="flex justify-between text-xs text-warning">
                    <span>Global Diskon ({globalDiscountType === 'percentage' ? globalDiscountAmount + '%' : formatRupiah(globalDiscountAmount)})</span>
                    <span className="tnum">-{formatRupiah(getGlobalDiscount())}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-success">
                    <span>Diskon ({discountType === 'percentage' ? discountAmount + '%' : formatRupiah(discountAmount)})</span>
                    <span className="tnum">-{formatRupiah(getDiscount())}</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowDiscountModal(true)}
                className="text-xs text-primary hover:underline"
              >
                + Diskon
              </button>
            )}
            <button
              onClick={() => setShowNewSplitBillModal(true)}
              disabled={items.length === 0}
              className="text-xs text-ink-secondary hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Split Bill
            </button>
          </div>

          {/* Free Items Section */}
          {freeItems.length > 0 && (
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-ink">Item Gratis:</div>
              {freeItems.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-success">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="tnum">{formatRupiah(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}

          {splitMode && currentSplitGroup && (
            <div className="flex justify-between text-xs font-medium text-ink">
              <span>Split Total</span>
              <span className="tnum">{formatRupiah(getSplitGroupTotal(currentSplitGroup))}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-ink-secondary">
            <span>Pembulatan ({roundTo})</span>
            <span className="tnum">{formatRupiah(rounded.roundingAmount)}</span>
          </div>
          
          {/* Total with visual emphasis */}
          <div className="flex justify-between rounded-lg bg-primary-soft/30 border border-primary/20 px-3 py-2 text-base font-bold text-primary">
            <span>Total (dibulatkan)</span>
            <span className="tnum">{formatRupiah(rounded.total)}</span>
          </div>
        </div>

        <div className="flex gap-1.5">
          {splitMode && currentSplitGroup && (
            <Button variant="secondary" size="lg" className="flex-1 text-sm py-2.5" onClick={handlePaySplit}>
              Bayar Split
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            mnemonic="K"
            className="flex-1 text-sm py-2.5 font-bold"
            disabled={items.length === 0 || kitchenSent}
            onClick={handleSendToKitchen}
            title={kitchenSent ? 'Keranjang sudah dikirim ke dapur. Tambah atau ubah item untuk mengirim ulang.' : undefined}
          >
            {kitchenSent ? 'Sudah Dikirim' : 'KIRIM KE DAPUR'}
          </Button>
          <Button
            variant="success"
            size="lg"
            mnemonic="B"
            className="flex-[2] text-sm py-2.5 font-bold"
            disabled={items.length === 0}
            onClick={() => setShowPaymentModal(true)}
          >
            BAYAR (F1)
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
              freeItems={receiptData.freeItems}
              subtotal={receiptData.subtotal}
              tax={receiptData.tax}
              discount={receiptData.discount}
              discountType={receiptData.discountType}
              globalDiscount={receiptData.globalDiscount}
              globalDiscountType={receiptData.globalDiscountType}
              globalDiscountAuthorizedBy={receiptData.globalDiscountAuthorizedBy}
              globalDiscountReason={receiptData.globalDiscountReason}
              roundingAmount={receiptData.roundingAmount}
              total={receiptData.total}
              paymentMethod={receiptData.paymentMethod}
              notes={receiptData.notes}
              onClose={() => setShowReceipt(false)}
            />
          </div>
        </div>
      )}

      {/* QRIS Modal */}
      {showQRISModal && (
        <QRISModal
          onClose={() => setShowQRISModal(false)}
          onSuccess={handleQRISPaymentSuccess}
          onFailed={handleQRISPaymentFailed}
        />
      )}

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={showSplitBillModal}
        onClose={() => setShowSplitBillModal(false)}
        onSplitComplete={handleSplitComplete}
      />

      {/* Table Selector Modal */}
      <Modal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        title="Pilih Meja"
        size="md"
      >
        {tablesLoading ? (
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat meja...
          </div>
        ) : tables.length === 0 ? (
          <EmptyState icon={Utensils} title="Belum ada meja" message="Tambahkan meja di Manajemen Meja" />
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {tables.map((table) => {
              const effectiveStatus = table.hasActiveOrders ? 'occupied' : table.status;
              const statusConfig = {
                available: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700', label: 'Available' },
                occupied: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700', label: 'Terisi' },
                dirty: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', label: 'Kotor' },
                reserved: { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700', label: 'Reservasi' },
              } as const;
              const config = statusConfig[effectiveStatus];
              const isSelected = storeTableNumber === table.table_number;

              return (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => {
                    setTableNumber(table.table_number);
                    setShowTableModal(false);
                  }}
                  className={`relative rounded-lg border-2 p-3 transition-all hover:opacity-80 active:scale-95 ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                  } ${config.bg} ${config.border} ${config.text}`}
                  title={`${table.table_number} - ${config.label}`}
                >
                  <div className="text-sm font-bold">{table.table_number}</div>
                  <div className="mt-1 text-xs">{config.label}</div>
                  {table.hasActiveOrders && effectiveStatus !== 'occupied' && (
                    <div className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" title="Has active orders" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </Modal>

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
      
      {/* Member Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Member" size="sm">
        <div className="relative">
          <input
            type="text"
            value={selectedMember ? `${selectedMember.name} (${selectedMember.tier})` : memberSearchTerm}
            onChange={(e) => {
              if (!selectedMember) {
                setMemberSearchTerm(e.target.value);
              }
            }}
            placeholder="Cari nama atau nomor HP member..."
            className="min-h-10 w-full rounded-lg border border-line-strong bg-surface px-3 pr-9 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            autoFocus
          />
          {selectedMember && (
            <button
              onClick={handleClearMember}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-danger"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!selectedMember && memberSearchResults.length > 0 && (
          <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-line-strong">
            {memberSearchResults.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  handleSelectMember(m);
                  setShowMemberModal(false);
                }}
                className="w-full border-b border-line px-3 py-2 text-left text-sm last:border-b-0 hover:bg-surface-alt"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-ink">{m.name}</div>
                    <div className="text-xs text-ink-secondary">{m.phone}</div>
                  </div>
                  <div className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                    {m.tier.charAt(0).toUpperCase() + m.tier.slice(1)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Notes Modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="Catatan Pesanan"
        size="sm"
        footer={
          <div className="flex w-full gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowNotesModal(false)}>
              Batal
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setNotes(notesDraft);
                setShowNotesModal(false);
              }}
            >
              Simpan
            </Button>
          </div>
        }
      >
        <textarea
          value={notesDraft}
          onChange={(e) => setNotesDraft(e.target.value)}
          placeholder="Catatan khusus untuk pesanan..."
          rows={3}
          autoFocus
          className="w-full resize-none rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
        />
      </Modal>

      {/* Payment Modal (Step 2: Settlement) */}
      <CartPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        total={rounded.total}
        orderCategory={orderCategory}
        tableNumber={storeTableNumber}
        itemCount={items.reduce((sum, item) => sum + item.quantity, 0)}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cashReceived={cashReceived}
        onCashReceivedChange={setCashReceived}
        paying={paying}
        onConfirm={async () => {
          const success = await handlePayment();
          if (success) setShowPaymentModal(false);
        }}
      />

      {/* Unified Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-ink">Diskon</h3>
            
            {/* Tab Navigation */}
            <div className="mb-4 border-b border-line">
              <nav className="-mb-px flex space-x-4">
                <button
                  onClick={() => setDiscountTab('regular')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    discountTab === 'regular'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-ink-secondary hover:text-ink'
                  }`}
                >
                  Diskon Regular
                </button>
                <button
                  onClick={() => setDiscountTab('global')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    discountTab === 'global'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-ink-secondary hover:text-ink'
                  }`}
                >
                  Global Diskon (PIN)
                </button>
                <button
                  onClick={() => setDiscountTab('voucher')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    discountTab === 'voucher'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-ink-secondary hover:text-ink'
                  }`}
                >
                  Voucer
                </button>
              </nav>
            </div>

            {discountTab === 'regular' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Tipe Diskon</label>
                  <select
                    value={localDiscountType}
                    onChange={(e) => setLocalDiscountType(e.target.value as 'nominal' | 'percentage')}
                    className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="nominal">Nominal (Rp)</option>
                    <option value="percentage">Persentase (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Nilai Diskon</label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={localDiscountType === 'percentage' ? 'Masukkan persentase' : 'Masukkan nominal'}
                    className="tnum w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDiscountModal(false);
                      setDiscountValue('');
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={() => {
                      if (!discountValue) {
                        toast('error', 'Masukkan nilai diskon');
                        return;
                      }
                      handleApplyDiscount();
                      setShowDiscountModal(false);
                      setDiscountValue('');
                    }}
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            ) : discountTab === 'global' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Tipe Diskon</label>
                  <select
                    value={localGlobalDiscountType}
                    onChange={(e) => setLocalGlobalDiscountType(e.target.value as 'nominal' | 'percentage')}
                    className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
                  >
                    <option value="nominal">Nominal (Rp)</option>
                    <option value="percentage">Persentase (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Nilai Diskon</label>
                  <input
                    type="number"
                    value={globalDiscountValue}
                    onChange={(e) => setGlobalDiscountValue(e.target.value)}
                    placeholder={localGlobalDiscountType === 'percentage' ? 'Masukkan persentase' : 'Masukkan nominal'}
                    className="tnum w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Alasan Diskon</label>
                  <textarea
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    placeholder="Contoh: Pelanggan VIP, Promo Spesial, dll."
                    className="min-h-20 w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDiscountModal(false);
                      setGlobalDiscountValue('');
                      setDiscountReason('');
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={() => {
                      if (!globalDiscountValue) {
                        toast('error', 'Masukkan nilai diskon');
                        return;
                      }
                      if (!discountReason) {
                        toast('error', 'Masukkan alasan diskon');
                        return;
                      }
                      setShowPinModal(true);
                    }}
                  >
                    Lanjut ke PIN
                  </Button>
                </div>
              </div>
            ) : discountTab === 'voucher' ? (
              <div className="space-y-4">
                {appliedVoucher ? (
                  <div className="p-4 bg-success-soft rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-success">{appliedVoucher.name}</span>
                      <button
                        onClick={() => {
                          setAppliedVoucher(null);
                          setVoucherCode('');
                          clearVoucher();
                        }}
                        className="text-danger hover:text-danger-dark"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-ink-secondary mb-2">{appliedVoucher.description}</div>
                    <div className="text-sm font-medium text-ink">
                      Diskon: {appliedVoucher.discount_type === 'percentage' ? `${appliedVoucher.discount_value}%` : formatRupiah(appliedVoucher.discount_value)}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">Kode Voucer</label>
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="Masukkan kode voucer"
                        className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowDiscountModal(false);
                          setVoucherCode('');
                        }}
                      >
                        Batal
                      </Button>
                      <Button
                        onClick={async () => {
                          if (!voucherCode) {
                            toast('error', 'Masukkan kode voucer');
                            return;
                          }
                          await handleApplyVoucher();
                        }}
                      >
                        Terapkan
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* PIN Authorization Modal for Global Discount */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-ink">Otorisasi PIN</h3>
            <p className="mb-4 text-sm text-ink-secondary">
              Masukkan PIN untuk mengaktifkan Global Diskon.
            </p>
            <div className="mb-4">
              <label htmlFor="pin-input" className="mb-1 block text-sm font-medium text-ink">
                PIN
              </label>
              <input
                id="pin-input"
                type="password"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value)}
                placeholder="Masukkan PIN"
                className="min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
                maxLength={4}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="reason-input" className="mb-1 block text-sm font-medium text-ink">
                Alasan Diskon
              </label>
              <textarea
                id="reason-input"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                placeholder="Contoh: Pelanggan VIP, Promo Spesial, dll."
                className="min-h-20 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowPinModal(false);
                  setPinValue('');
                  setDiscountReason('');
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleGlobalDiscountPinSubmit}
              >
                Konfirmasi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Split Bill Modal */}
      <NewSplitBillModal
        isOpen={showNewSplitBillModal}
        onClose={() => setShowNewSplitBillModal(false)}
        onConfirm={(splits) => {
          console.log('Split bill confirmed:', splits);
          // Handle split bill logic here
          toast('success', 'Split bill berhasil dikonfirmasi');
        }}
      />
    </div>
  );
};
