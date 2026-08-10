'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/src/store/useCartStore';
import { ShoppingCart, Trash2, Plus, Minus, Ban, Gift, X, User } from 'lucide-react';
import { Receipt } from '@/src/components/pos/Receipt';
import { useProducts, useCategories } from '@/src/hooks/useProducts';
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
import { formatRupiah } from '@/src/lib/format';
import { createPaymentTransaction } from '@/src/features/payment/paymentService';
import { searchCustomers } from '@/src/features/crm/customerService';
import { validateVoucher, useVoucher } from '@/src/features/pos/voucherService';
import { usePaymentStore } from '@/src/features/payment/paymentStore';
import { SplitBillModal } from './SplitBillModal';
import { QRISModal } from '@/src/components/payment/QRISModal';
import { SplitBillModal as NewSplitBillModal } from '@/src/components/pos/SplitBillModal';

const paymentOptions = [
  { value: 'CASH', label: 'Tunai' },
  { value: 'QRIS', label: 'QRIS' },
  { value: 'DEBIT', label: 'Debit' },
] as const;

interface CartPanelProps {
  orderCategory?: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: string;
  customerName?: string;
  deliveryAddress?: string;
  courierName?: string;
  courierType?: 'internal' | 'external';
  receiptNumber?: string;
}

export const CartPanel = ({ orderCategory = 'dine-in', tableNumber: propTableNumber, customerName, deliveryAddress, courierName, courierType, receiptNumber }: CartPanelProps) => {
  const { items, removeFromCart, updateQuantity, getSubtotal, getTax, clearCart, tableNumber: storeTableNumber, notes, setTableNumber, setNotes, processPayment, assignSplitGroup, getSplitGroupTotal, voidItem, calculateRoundedTotal, paymentMethod, setPaymentMethod, discountAmount, discountType, setDiscount, freeItems, addFreeItem, removeFreeItem, clearFreeItems, getDiscount, globalDiscountAmount, globalDiscountType, setGlobalDiscount, clearGlobalDiscount, getGlobalDiscount, setVoucher, clearVoucher, voucherDiscountAmount, setMember, clearMember, member, sendToKitchen, kitchenSent } = useCartStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const { setCurrentPayment, clearPayment } = usePaymentStore();

  const [mounted, setMounted] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [currentSplitGroup, setCurrentSplitGroup] = useState<string | null>(null);
  const [roundTo, setRoundTo] = useState<number>(1000);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountValue, setDiscountValue] = useState<string>('');
  const [localDiscountType, setLocalDiscountType] = useState<'nominal' | 'percentage'>('nominal');
  const [showFreeItemModal, setShowFreeItemModal] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedFreeProduct, setSelectedFreeProduct] = useState<any>(null);
  const [freeItemQuantity, setFreeItemQuantity] = useState<number>(1);
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
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [showNewSplitBillModal, setShowNewSplitBillModal] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load available products when free item modal opens
  useEffect(() => {
    if (showFreeItemModal) {
      loadAvailableProducts();
    }
  }, [showFreeItemModal]);

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

  const loadAvailableProducts = async () => {
    try {
      const { db } = await import('@/src/lib/db');
      const products = await db.products.toArray();
      setAvailableProducts(products);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast('error', 'Gagal memuat daftar produk');
    }
  };

  const handleAddFreeItem = () => {
    if (!selectedFreeProduct) {
      toast('error', 'Pilih produk terlebih dahulu');
      return;
    }
    if (freeItemQuantity < 1) {
      toast('error', 'Jumlah minimal 1');
      return;
    }

    // Add free item with price 0
    addFreeItem({
      productId: selectedFreeProduct.id,
      name: selectedFreeProduct.name,
      price: 0, // Free items have price 0
      quantity: freeItemQuantity,
      modifiers: [],
    });

    toast('success', `${selectedFreeProduct.name} x${freeItemQuantity} ditambahkan sebagai item gratis`);
    setShowFreeItemModal(false);
    setSelectedFreeProduct(null);
    setFreeItemQuantity(1);
  };

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
    setShowMemberSearch(false);
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

  const handlePayment = async () => {
    if (items.length === 0) {
      toast('warning', 'Keranjang kosong');
      return;
    }
    if (!storeTableNumber) {
      toast('warning', 'Mohon isi nomor meja terlebih dahulu');
      return;
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
            return;
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
            
            // Store receipt data for after payment success
            setReceiptData({
              orderId,
              tableNumber: storeTableNumber,
              items: items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                modifiers: (item.modifiers || []).map(m => m.name || String(m)),
              })),
              freeItems: freeItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                modifiers: (item.modifiers || []).map(m => m.name || String(m)),
              })),
              subtotal: getSubtotal(),
              tax: getTax(),
              discount: getDiscount() + getGlobalDiscount(),
              discountType: discountType,
              globalDiscount: globalDiscountAmount,
              globalDiscountType: globalDiscountType,
              roundingAmount: calculateRoundedTotal(roundTo).roundingAmount,
              total: calculateRoundedTotal(roundTo).total,
              paymentMethod: paymentMethod,
              cashierName: (user as any)?.name || 'Kasir',
              notes: notes,
            });
          } else {
            toast('error', 'Gagal membuat pembayaran QRIS. Order ID: ' + orderId);
            // Order was created but payment failed - need to handle this
          }
        } else {
          toast('error', result.message || 'Gagal memproses pesanan');
        }
      } catch (error) {
        console.error('Error processing order for QRIS:', error);
        toast('error', 'Gagal memproses pesanan');
      } finally {
        setPaying(false);
      }
      return;
    }

    if (paymentMethod === 'CASH') {
      const cashAmount = Number(cashReceived);
      if (!cashReceived || cashAmount < total) {
        toast('error', `Uang tunai yang diterima kurang. Total: ${formatRupiah(total)}`);
        return;
      }
    }

    setPaying(true);
    try {
      const result = await processPayment(roundTo, orderCategory, receiptNumber, customerName, deliveryAddress, courierName, courierType);
      
      if (result.success) {
        const { orderId, receiptData } = result;
        setReceiptData({
          orderId,
          tableNumber: storeTableNumber,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            modifiers: (item.modifiers || []).map(m => m.name || String(m)),
          })),
          freeItems: freeItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            modifiers: (item.modifiers || []).map(m => m.name || String(m)),
          })),
          subtotal: getSubtotal(),
          tax: getTax(),
          discount: getDiscount() + getGlobalDiscount(),
          discountType: discountType,
          globalDiscount: globalDiscountAmount,
          globalDiscountType: globalDiscountType,
          roundingAmount: calculateRoundedTotal(roundTo).roundingAmount,
          total: calculateRoundedTotal(roundTo).total,
          paymentMethod: paymentMethod,
          cashierName: (user as any)?.name || 'Kasir',
          notes: notes,
        });
        setShowReceipt(true);
        clearCart();
        setCashReceived('');
        clearGlobalDiscount();
        clearVoucher();
        clearMember();
        clearFreeItems();
      } else {
        toast('error', result.message || 'Gagal memproses pembayaran');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast('error', 'Terjadi kesalahan saat memproses pembayaran');
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
      <div className="flex h-full flex-col border-l border-line bg-surface">
        <div className="border-b border-line p-4">
          <h2 className="text-xl font-bold text-ink">Keranjang</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-ink-muted">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col border-l border-line bg-surface">
      {/* Header */}
      <div className="border-b border-line p-3">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Keranjang</h2>
          {items.length > 0 && (
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" className="text-danger hover:bg-danger-soft text-xs px-2 py-1" onClick={() => setConfirmClear(true)}>
                Kosongkan
              </Button>
              <Button variant={splitMode ? 'secondary' : 'primary'} size="sm" className="text-xs px-2 py-1" onClick={splitMode ? handleEndSplit : handleStartSplit}>
                {splitMode ? 'Selesai Split' : 'Split Bill'}
              </Button>
            </div>
          )}
        </div>

        {/* Table Number Input */}
        <div className="mb-2">
          <label htmlFor="cart-table" className="mb-0.5 block text-xs font-medium text-ink">
            Nomor Meja <span aria-hidden="true" className="text-danger">*</span>
          </label>
          <input
            id="cart-table"
            type="text"
            value={storeTableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Contoh: Meja 1"
            className="min-h-9 w-full rounded-lg border border-line-strong bg-surface px-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Member Search */}
        <div className="mb-2 relative">
          <label htmlFor="member-search" className="mb-0.5 block text-xs font-medium text-ink">
            Member (Opsional)
          </label>
          <div className="relative">
            <input
              id="member-search"
              type="text"
              value={selectedMember ? `${selectedMember.name} (${selectedMember.tier})` : memberSearchTerm}
              onChange={(e) => {
                if (!selectedMember) {
                  setMemberSearchTerm(e.target.value);
                  setShowMemberSearch(true);
                }
              }}
              onFocus={() => setShowMemberSearch(true)}
              placeholder="Cari nama atau nomor HP member..."
              className="min-h-9 w-full rounded-lg border border-line-strong bg-surface px-2.5 pr-8 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
            {selectedMember && (
              <button
                onClick={handleClearMember}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-ink-muted hover:text-danger"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <User className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-muted" />
          </div>

          {/* Member Search Results Dropdown */}
          {showMemberSearch && memberSearchResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-line-strong bg-surface shadow-lg max-h-60 overflow-y-auto">
              {memberSearchResults.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="w-full px-2.5 py-2 text-left hover:bg-surface-alt border-b border-line last:border-b-0 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-ink">{member.name}</div>
                      <div className="text-xs text-ink-secondary">{member.phone}</div>
                    </div>
                    <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                      {member.tier.charAt(0).toUpperCase() + member.tier.slice(1)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Free Item Button */}
        <div className="mb-2">
          <button
            onClick={() => setShowFreeItemModal(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line-strong bg-surface-alt px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:bg-surface hover:text-ink"
          >
            <Gift className="h-3.5 w-3.5" />
            <span>+ Tambah Item Gratis</span>
          </button>
        </div>

        {/* Notes Input */}
        <div>
          <label htmlFor="cart-notes" className="mb-0.5 block text-xs font-medium text-ink">
            Catatan Pesanan
          </label>
          <textarea
            id="cart-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan khusus untuk pesanan..."
            rows={2}
            className="w-full resize-none rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
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
      <div className="border-t border-line bg-surface-alt p-3">
        <div className="mb-3 space-y-2">
          {/* Subtotal hidden from customer view - tax and service are included in final price */}
          
          {/* Combined Discount Button */}
          <div className="flex items-center justify-between">
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
          </div>
          
          {/* Tax hidden from customer view - included in final price */}
          
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

        <div className="mb-2">
          <label htmlFor="cart-rounding" className="sr-only">
            Pembulatan
          </label>
          <select
            id="cart-rounding"
            value={roundTo}
            onChange={(e) => setRoundTo(Number(e.target.value))}
            className="min-h-9 w-full rounded-lg border border-line-strong bg-surface px-2.5 text-xs text-ink focus:border-primary focus:outline-none"
          >
            <option value={500}>Pembulatan 500</option>
            <option value={1000}>Pembulatan 1000</option>
            <option value={0}>Tidak ada pembulatan</option>
          </select>
        </div>

        <fieldset className="mb-2">
          <legend className="sr-only">Metode pembayaran</legend>
          <div className="flex gap-1.5">
            {paymentOptions.map(({ value, label }) => (
              <label
                key={value}
                className={`flex min-h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 transition-colors ${
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
                <span className="text-xs font-medium">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Cash Input - Only show for CASH payment */}
        {paymentMethod === 'CASH' && (
          <div className="mb-2">
            <label htmlFor="cart-cash" className="mb-0.5 block text-xs font-medium text-ink">
              Uang Diterima
            </label>
            <input
              id="cart-cash"
              type="number"
              inputMode="numeric"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              placeholder="Masukkan jumlah uang tunai"
              className="tnum min-h-9 w-full rounded-lg border border-line-strong bg-surface px-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
            {cashReceived && (
              <p className="tnum mt-0.5 text-xs text-ink-secondary">
                Kembalian: {formatRupiah(Number(cashReceived) - rounded.total)}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-1.5">
          {splitMode && currentSplitGroup && (
            <Button variant="secondary" size="lg" className="flex-1 text-sm py-2.5" onClick={handlePaySplit}>
              Bayar Split
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            className="flex-1 text-sm py-2.5 font-bold"
            disabled={items.length === 0}
            onClick={() => setShowNewSplitBillModal(true)}
          >
            Split Bill
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1 text-sm py-2.5 font-bold !text-gray-900 disabled:!text-gray-700"
            disabled={items.length === 0 || kitchenSent}
            onClick={handleSendToKitchen}
            title={kitchenSent ? 'Keranjang sudah dikirim ke dapur. Tambah atau ubah item untuk mengirim ulang.' : undefined}
          >
            {kitchenSent ? 'Sudah Dikirim' : 'Kirim ke Dapur'}
          </Button>
          <Button
            variant="success"
            size="lg"
            className="flex-[2] text-sm py-2.5 font-bold"
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
      
      {/* Free Item Modal */}
      {showFreeItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl max-h-[80vh] rounded-lg bg-surface p-6 shadow-lg overflow-y-auto">
            <h3 className="mb-4 text-lg font-bold text-ink">Tambah Item Gratis</h3>
            <p className="mb-4 text-sm text-ink-secondary">
              Pilih produk dari menu untuk ditambahkan sebagai item gratis. Item gratis tidak dikenakan pajak dan akan mengurangi stok inventori sesuai resep.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-2">Pilih Produk</label>
              <div className="max-h-48 overflow-y-auto border border-line-strong rounded-lg">
                {availableProducts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-ink-secondary">
                    Memuat produk...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {availableProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => setSelectedFreeProduct(product)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedFreeProduct?.id === product.id
                            ? 'border-primary bg-primary/10'
                            : 'border-line-strong hover:bg-surface-alt'
                        }`}
                      >
                        <div className="font-medium text-sm text-ink">{product.name}</div>
                        <div className="text-xs text-ink-secondary">{formatRupiah(product.price)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-2">Jumlah</label>
              <input
                type="number"
                min="1"
                value={freeItemQuantity}
                onChange={(e) => setFreeItemQuantity(Number(e.target.value))}
                className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink focus:border-primary focus:outline-none"
              />
            </div>

            {selectedFreeProduct && (
              <div className="mb-4 p-3 bg-surface-alt rounded-lg">
                <div className="text-sm text-ink-secondary">Produk Terpilih:</div>
                <div className="font-medium text-ink">{selectedFreeProduct.name}</div>
                <div className="text-sm text-ink-secondary">Harga Asli: {formatRupiah(selectedFreeProduct.price)}</div>
                <div className="text-sm text-success font-medium">Harga Gratis: Rp 0</div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowFreeItemModal(false);
                  setSelectedFreeProduct(null);
                  setFreeItemQuantity(1);
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleAddFreeItem}
                disabled={!selectedFreeProduct}
              >
                Tambah Gratis
              </Button>
            </div>
          </div>
        </div>
      )}

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
