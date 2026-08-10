import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { deductManufactureStock, deductKitStock, canOrderProduct } from '@/src/features/inventory/inventoryService';
import { useConfigStore } from './useConfigStore';
import * as api from '@/src/lib/api';
import { NetworkError } from '@/src/lib/api';
import { db } from '@/src/lib/db';
import { useOfflineStore } from '@/src/store/useOfflineStore';
import { reduceStockForOrder, restoreStockForOrder } from '@/src/features/inventory/inventoryService';
import { addCustomerPoints } from '@/src/features/crm/customerService';
import { generateUUID } from '@/src/lib/utils';

export interface ModifierOption {
  id: string; // UUID
  name: string;
  price: number;
  selected: boolean;
}

export interface CartItem {
  id: string; // UUID
  productId: string; // UUID
  name: string;
  price: number;
  quantity: number;
  modifiers: ModifierOption[];
  splitGroupId?: string;
}

interface CartState {
  items: CartItem[];
  tableNumber: string;
  notes: string;
  paymentMethod: 'CASH' | 'QRIS' | 'DEBIT';
  cashierId: string | null;
  discountAmount: number;
  discountType: 'nominal' | 'percentage';
  freeItems: CartItem[];
  globalDiscountAmount: number;
  globalDiscountType: 'nominal' | 'percentage';
  globalDiscountAuthorizedBy: string | null;
  globalDiscountReason: string;
  voucherCode: string | null;
  voucherId: string | null;
  voucherDiscountType: 'nominal' | 'percentage' | null;
  voucherDiscountValue: number;
  voucherDiscountAmount: number;
  member: any | null;
  memberDiscountAmount: number;
  appliedPromotion: any | null;
  promotionDiscountAmount: number;
  kitchenSent: boolean;
  setCashierId: (id: string | null) => void;
  setTableNumber: (tableNumber: string) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: 'CASH' | 'QRIS' | 'DEBIT') => void;
  setDiscount: (amount: number, type: 'nominal' | 'percentage') => void;
  setGlobalDiscount: (amount: number, type: 'nominal' | 'percentage', authorizedBy: string, reason: string) => void;
  clearGlobalDiscount: () => void;
  setVoucher: (code: string, id: string, discountType: 'nominal' | 'percentage', discountValue: number, discountAmount: number) => void;
  clearVoucher: () => void;
  setMember: (member: any) => void;
  clearMember: () => void;
  checkPromotions: () => Promise<void>;
  clearPromotion: () => void;
  addFreeItem: (item: Omit<CartItem, 'id'>) => void;
  removeFreeItem: (id: string) => void;
  clearFreeItems: () => void;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  updateModifiers: (id: string, modifiers: ModifierOption[]) => void;
  clearCart: () => void;
  processPayment: (roundTo?: number, orderCategory?: 'dine-in' | 'takeaway' | 'delivery', receiptNumber?: string, customerName?: string, deliveryAddress?: string, courierName?: string, courierType?: 'internal' | 'external') => Promise<{ success: boolean; message: string; orderId?: string; receiptData?: unknown }>;
  sendToKitchen: () => Promise<{ success: boolean; message: string; orderId?: string }>;
  voidItem: (itemId: string, reason: string) => Promise<{ success: boolean; message: string }>;
  voidOrderItem: (orderId: string, orderItemId: string, productId: string, quantity: number, reason: string) => Promise<{ success: boolean; message: string }>;
  calculateTotal: () => number;
  calculateRoundedTotal: (roundTo: number) => { total: number; roundingAmount: number };
  assignSplitGroup: (itemId: string, groupId: string) => void;
  removeSplitGroup: (itemId: string) => void;
  getSplitGroupTotal: (groupId: string) => number;
  getTotal: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getDiscount: () => number;
  // Reverse calculation for internal reporting (extracts tax/service from final price)
  getInternalBreakdown: (finalPrice: number) => { netSales: number; taxAmount: number; serviceChargeAmount: number };
  getGlobalDiscount: () => number;
  getItemCount: () => number;
  splitBill: (selectedItemIds: string[]) => { success: boolean; message: string; splitCart?: CartItem[] };
  mergeTable: (targetTable: string, sourceTable: string) => Promise<{ success: boolean; message: string }>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableNumber: '',
      notes: '',
      paymentMethod: 'CASH',
      cashierId: null,
      discountAmount: 0,
      discountType: 'nominal',
      freeItems: [],
      globalDiscountAmount: 0,
      globalDiscountType: 'nominal',
      globalDiscountAuthorizedBy: null,
      globalDiscountReason: '',
      voucherCode: null,
      voucherId: null,
      voucherDiscountType: null,
      voucherDiscountValue: 0,
      voucherDiscountAmount: 0,
      member: null,
      memberDiscountAmount: 0,
      appliedPromotion: null,
      promotionDiscountAmount: 0,
      kitchenSent: false,

      setCashierId: (id) => set({ cashierId: id }),
      setTableNumber: (tableNumber) => set({ tableNumber }),
      setNotes: (notes) => set({ notes }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setDiscount: (amount, type) => set({ discountAmount: amount, discountType: type }),
      setGlobalDiscount: (amount, type, authorizedBy, reason) => set({
        globalDiscountAmount: amount,
        globalDiscountType: type,
        globalDiscountAuthorizedBy: authorizedBy,
        globalDiscountReason: reason
      }),
      clearGlobalDiscount: () => set({
        globalDiscountAmount: 0,
        globalDiscountType: 'nominal',
        globalDiscountAuthorizedBy: null,
        globalDiscountReason: ''
      }),
      setVoucher: (code, id, discountType, discountValue, discountAmount) => set({
        voucherCode: code,
        voucherId: id,
        voucherDiscountType: discountType,
        voucherDiscountValue: discountValue,
        voucherDiscountAmount: discountAmount
      }),
      clearVoucher: () => set({
        voucherCode: null,
        voucherId: null,
        voucherDiscountType: null,
        voucherDiscountValue: 0,
        voucherDiscountAmount: 0
      }),
      setMember: (member) => {
        const subtotal = get().getSubtotal();
        const memberDiscount = member ? subtotal * (member.discount_percentage / 100) : 0;
        set({
          member,
          memberDiscountAmount: memberDiscount
        });
      },
      clearMember: () => set({
        member: null,
        memberDiscountAmount: 0
      }),
      checkPromotions: async () => {
        try {
          const { db } = await import('@/src/lib/db');
          const state = get();
          
          // Get all active promotions
          const now = new Date();
          const allPromotions = await db.promotions.toArray();
          const activePromotions = allPromotions.filter(promotion => {
            const validFrom = new Date(promotion.valid_from);
            const validUntil = new Date(promotion.valid_until);
            return promotion.is_active && now >= validFrom && now <= validUntil;
          });

          const subtotal = state.getSubtotal();
          const totalQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);

          // Find applicable promotion
          let applicablePromotion = null;
          let promotionDiscount = 0;

          for (const promotion of activePromotions) {
            if (promotion.type === 'quantity' && promotion.min_quantity) {
              if (totalQuantity >= promotion.min_quantity) {
                let discount = 0;
                if (promotion.discount_type === 'percentage') {
                  discount = subtotal * (promotion.discount_value / 100);
                  if (promotion.max_discount && discount > promotion.max_discount) {
                    discount = promotion.max_discount;
                  }
                } else {
                  discount = promotion.discount_value;
                }
                
                if (discount > promotionDiscount) {
                  promotionDiscount = discount;
                  applicablePromotion = promotion;
                }
              }
            } else if (promotion.type === 'amount' && promotion.min_amount) {
              if (subtotal >= promotion.min_amount) {
                let discount = 0;
                if (promotion.discount_type === 'percentage') {
                  discount = subtotal * (promotion.discount_value / 100);
                  if (promotion.max_discount && discount > promotion.max_discount) {
                    discount = promotion.max_discount;
                  }
                } else {
                  discount = promotion.discount_value;
                }
                
                if (discount > promotionDiscount) {
                  promotionDiscount = discount;
                  applicablePromotion = promotion;
                }
              }
            }
          }

          set({
            appliedPromotion: applicablePromotion,
            promotionDiscountAmount: promotionDiscount
          });

          if (applicablePromotion) {
            console.log(`✅ Promotion applied: ${applicablePromotion.name} - Rp${promotionDiscount.toLocaleString('id-ID')} discount`);
          }
        } catch (error) {
          console.error('Failed to check promotions:', error);
        }
      },
      clearPromotion: () => set({
        appliedPromotion: null,
        promotionDiscountAmount: 0
      }),
      addFreeItem: (item) => set((state) => ({
        freeItems: [...state.freeItems, { ...item, id: generateUUID() }]
      })),
      removeFreeItem: (id) => set((state) => ({
        freeItems: state.freeItems.filter((item) => item.id !== id)
      })),
      clearFreeItems: () => set({ freeItems: [] }),
      
      addToCart: async (item) => {
        // Reset kitchenSent when cart changes
        set({ kitchenSent: false });

        set((state) => {
          // Check if item with same product and modifiers exists
          const existingIndex = state.items.findIndex(
            (i) => 
              i.productId === item.productId &&
              JSON.stringify(i.modifiers.map(m => m.id).sort()) === 
              JSON.stringify(item.modifiers.map(m => m.id).sort())
          );

          if (existingIndex >= 0) {
            // Update quantity of existing item
            const updatedItems = [...state.items];
            const oldQuantity = updatedItems[existingIndex].quantity;
            const newQuantity = oldQuantity + item.quantity;
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: newQuantity,
            };

            return { items: updatedItems };
          }

          // Add new item with UUID
          return { 
            items: [...state.items, { ...item, id: generateUUID() }] 
          };
        });
      },

      removeFromCart: async (id) => {
        // Reset kitchenSent when cart changes
        set({ kitchenSent: false });

        const state = get();
        const item = state.items.find((i) => i.id === id);

        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: async (id, quantity) => {
        // Reset kitchenSent when cart changes
        set({ kitchenSent: false });

        const state = get();
        const item = state.items.find((i) => i.id === id);

        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        });
      },

      updateModifiers: (id, modifiers) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, modifiers } : item
        ),
      })),

      clearCart: () => set({ items: [], tableNumber: '', notes: '', discountAmount: 0, discountType: 'nominal', freeItems: [], globalDiscountAmount: 0, globalDiscountType: 'nominal', globalDiscountAuthorizedBy: null, globalDiscountReason: '', voucherCode: null, voucherId: null, voucherDiscountType: null, voucherDiscountValue: 0, voucherDiscountAmount: 0, member: null, memberDiscountAmount: 0, appliedPromotion: null, promotionDiscountAmount: 0, kitchenSent: false }),

      processPayment: async (roundTo = 0, orderCategory = 'dine-in', receiptNumber, customerName, deliveryAddress, courierName, courierType) => {
        const state = get();

        if (state.items.length === 0) {
          return { success: false, message: 'Keranjang kosong' };
        }

        // Prevent duplicate payment: check if cart is already being processed
        if (state.kitchenSent) {
          return { success: false, message: 'Pesanan ini sedang diproses atau sudah dikirim ke dapur' };
        }

        // Validate required fields based on category
        if (orderCategory === 'dine-in' && !state.tableNumber) {
          return { success: false, message: 'Mohon isi nomor meja terlebih dahulu' };
        }
        if (orderCategory === 'takeaway' && !customerName) {
          return { success: false, message: 'Mohon isi nama pelanggan terlebih dahulu' };
        }
        if (orderCategory === 'delivery' && (!deliveryAddress || !courierName)) {
          return { success: false, message: 'Mohon isi alamat pengiriman dan nama kurir terlebih dahulu' };
        }

        // Check stock availability for all items based on their bom_type
        for (const item of state.items) {
          const stockCheck = await canOrderProduct(item.productId, item.quantity);
          if (!stockCheck.canOrder) {
            return { success: false, message: stockCheck.message };
          }
        }

        const subtotal = state.getSubtotal();
        const tax = state.getTax();
        const discount = state.getDiscount();
        const globalDiscount = state.getGlobalDiscount();
        const total = state.getTotal();
        const orderId = generateUUID();
        const paymentMethod = state.paymentMethod;

        // Calculate rounding
        let roundingAmount = 0;
        let finalTotal = total;

        if (roundTo > 0) {
          const rounded = state.calculateRoundedTotal(roundTo);
          roundingAmount = rounded.roundingAmount;
          finalTotal = rounded.total;
        }

        // Create order data
        const orderData = {
          id: orderId,
          cashier_id: state.cashierId,
          total_amount: finalTotal,
          payment_method: paymentMethod.toLowerCase() as 'cash' | 'card' | 'qr' | 'transfer',
          // Paid up front, but the kitchen still has to prepare it: the order
          // enters the lifecycle at 'pending' so it shows up on the KDS.
          status: 'pending' as const,
          table_number: orderCategory === 'dine-in' ? state.tableNumber : null,
          discount_amount: discount,
          discount_type: state.discountType,
          global_discount_amount: globalDiscount,
          global_discount_type: state.globalDiscountType,
          global_discount_authorized_by: state.globalDiscountAuthorizedBy,
          global_discount_reason: state.globalDiscountReason,
          voucher_code: state.voucherCode,
          voucher_id: state.voucherId,
          voucher_discount_type: state.voucherDiscountType,
          voucher_discount_value: state.voucherDiscountValue,
          voucher_discount_amount: state.voucherDiscountAmount,
          member_id: state.member?.id || null,
          member_name: state.member?.name || null,
          member_phone: state.member?.phone || null,
          member_tier: state.member?.tier || null,
          member_discount_percentage: state.member?.discount_percentage || 0,
          member_discount_amount: state.memberDiscountAmount,
          member_points_earned: Math.floor(finalTotal / 1000), // 1 point per 1000 spent
          promotion_id: state.appliedPromotion?.id || null,
          promotion_name: state.appliedPromotion?.name || null,
          promotion_type: state.appliedPromotion?.type || null,
          promotion_discount_amount: state.promotionDiscountAmount,
          rounding_amount: roundingAmount,
          notes: state.notes,
          created_at: new Date().toISOString(),
          order_category: orderCategory,
          receipt_number: receiptNumber,
          customer_name: orderCategory === 'takeaway' ? customerName : null,
          delivery_address: orderCategory === 'delivery' ? deliveryAddress : null,
          courier_name: orderCategory === 'delivery' ? courierName : null,
          courier_type: orderCategory === 'delivery' ? courierType : null,
        };

        // Create order items (regular items)
        const orderItems = state.items.map((item) => ({
          id: generateUUID(),
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          price_at_time: item.price,
          discount_item: 0,
          modifiers_applied: item.modifiers,
          split_group_id: null,
          status: 'pending' as const,
          is_free: false,
        }));

        // Create order items for free items
        const freeOrderItems = state.freeItems.map((item) => ({
          id: generateUUID(),
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          price_at_time: item.price,
          discount_item: item.price, // Full discount for free items
          modifiers_applied: item.modifiers,
          split_group_id: null,
          status: 'pending' as const,
          is_free: true,
        }));

        // Combine regular and free items
        const allOrderItems = [...orderItems, ...freeOrderItems];

        // Check connection and local API availability
        const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

        const saveOffline = async (mode: string) => {
          console.log(`📴 ${mode} mode: Saving payment to IndexedDB...`);
          try {
            console.log(`Saving order ${orderId} to IndexedDB awaiting sync...`);
            console.log('Menyimpan pesanan ke database:', orderData);
            // Save order to IndexedDB, flagged for sync once the API is reachable
            await db.orders.add({
              ...orderData,
              sync_status: 'pending',
            });
            console.log(`✅ Order ${orderId} saved to IndexedDB successfully`);

            console.log(`📥 Saving ${allOrderItems.length} order items to IndexedDB...`);
            // Save order items to IndexedDB
            await db.order_items.bulkAdd(allOrderItems);
            console.log(`✅ Order items saved to IndexedDB successfully`);

            // Deduct stock based on bom_type for each item (offline mode)
            for (const item of state.items) {
              const product = await db.products.get(item.productId);
              if (!product) continue;

              if (product.bom_type === 'manufacture') {
                await deductManufactureStock(item.productId, item.quantity);
              } else if (product.bom_type === 'kit') {
                await deductKitStock(item.productId, item.quantity);
              }
            }

            // Update member points and total spent
            if (state.member) {
              try {
                const pointsEarned = Math.floor(finalTotal / 1000); // 1 point per 1000 spent
                const updated = await addCustomerPoints(state.member.id!, pointsEarned, finalTotal);
                if (updated) {
                  console.log(`✅ Member updated: +${pointsEarned} points, +Rp${finalTotal.toLocaleString('id-ID')} total spent, tier: ${updated.tier}`);

                  // Dispatch event to notify CRM page
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('memberUpdated'));
                    console.log('📡 Dispatched memberUpdated event');
                  }
                }
              } catch (memberError) {
                console.error('Failed to update member:', memberError);
                // Don't fail the payment if member update fails
              }
            }

            // Prepare receipt data BEFORE clearing cart
            const receiptData = {
              orderId,
              tableNumber: state.tableNumber,
              items: state.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                modifiers: item.modifiers.map(m => m.name),
                isFree: false,
              })),
              freeItems: state.freeItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                modifiers: item.modifiers.map(m => m.name),
                isFree: true,
              })),
              subtotal: state.getSubtotal(),
              tax: state.getTax(),
              discount: discount,
              discountType: state.discountType,
              globalDiscount: globalDiscount,
              globalDiscountType: state.globalDiscountType,
              globalDiscountAuthorizedBy: state.globalDiscountAuthorizedBy,
              globalDiscountReason: state.globalDiscountReason,
              voucherCode: state.voucherCode,
              voucherDiscountAmount: state.voucherDiscountAmount,
              memberName: state.member?.name || null,
              memberTier: state.member?.tier || null,
              memberDiscountAmount: state.memberDiscountAmount,
              roundingAmount,
              total: finalTotal,
              paymentMethod,
              notes: state.notes,
            };

            // Clear cart after saving
            set({ items: [], tableNumber: '', notes: '', discountAmount: 0, discountType: 'nominal', freeItems: [], globalDiscountAmount: 0, globalDiscountType: 'nominal', globalDiscountAuthorizedBy: null, globalDiscountReason: '', voucherCode: null, voucherId: null, voucherDiscountType: null, voucherDiscountValue: 0, voucherDiscountAmount: 0, member: null, memberDiscountAmount: 0, appliedPromotion: null, promotionDiscountAmount: 0 });
            console.log('🧹 Cart cleared after saving to IndexedDB');

            return { 
              success: true, 
              message: `${mode}: Transaksi tersimpan lokal, akan disinkron saat online.`, 
              orderId,
              receiptData,
            };
          } catch (error) {
            console.error('❌ Failed to save offline order:', error);
            console.error('Error details:', {
              name: error instanceof Error ? error.name : 'Unknown',
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            });
            return {
              success: false,
              message: `Gagal menyimpan transaksi lokal: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
          }
        };

        if (isOnline) {
          // Online: Send to local API AND save to IndexedDB for local history
          console.log('🌐 Online mode: Sending payment to local API and IndexedDB...');
          try {
            console.log(`📡 Inserting order ${orderId} to local API...`);
            await api.createOrder(orderData, allOrderItems);
            console.log(`✅ Order ${orderId} inserted to local API successfully`);

            // Get print jobs for kitchen/bar routing
            try {
              console.log('🖨️ Getting print jobs for order...');
              const printJobs = await api.getPrintJobsForOrder(orderId);
              console.log('🖨️ Print jobs:', printJobs);

              // TODO: Open kitchen receipt modals for each printer
              // This will be handled by the UI component that calls processPayment
            } catch (printError) {
              console.warn('⚠️ Failed to get print jobs:', printError);
              // Don't fail the payment if print routing fails
            }

            console.log(`✅ Order items inserted to local API successfully`);

            // Also save to IndexedDB for local order history
            console.log('💾 Saving order to IndexedDB for local history...');
            await db.orders.add({
              ...orderData,
              sync_status: 'synced',
            });
            console.log(`✅ Order ${orderId} saved to IndexedDB for history`);

            console.log(`📥 Saving ${allOrderItems.length} order items to IndexedDB...`);
            await db.order_items.bulkAdd(allOrderItems);
            console.log(`✅ Order items saved to IndexedDB successfully`);

            // Deduct stock based on bom_type for each item
            for (const item of state.items) {
              const product = await db.products.get(item.productId);
              if (!product) continue;

              if (product.bom_type === 'manufacture') {
                await deductManufactureStock(item.productId, item.quantity);
              } else if (product.bom_type === 'kit') {
                await deductKitStock(item.productId, item.quantity);
              }
            }

            // Update member points and total spent
            if (state.member) {
              try {
                const pointsEarned = Math.floor(finalTotal / 1000); // 1 point per 1000 spent
                const updated = await addCustomerPoints(state.member.id!, pointsEarned, finalTotal);
                if (updated) {
                  console.log(`✅ Member updated: +${pointsEarned} points, +Rp${finalTotal.toLocaleString('id-ID')} total spent, tier: ${updated.tier}`);

                  // Dispatch event to notify CRM page
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('memberUpdated'));
                    console.log('📡 Dispatched memberUpdated event');
                  }
                }
              } catch (memberError) {
                console.error('Failed to update member:', memberError);
                // Don't fail the payment if member update fails
              }
            }

            // Update order status to 'completed' after successful payment
            try {
              await db.orders.where('id').equals(orderId).modify({ status: 'completed' as any });
              console.log(`✅ Updated order ${orderId} status to 'completed' in IndexedDB`);
              
              // Dispatch event to notify UI components
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('orderCompleted', { detail: { orderId } }));
                console.log('📡 Dispatched orderCompleted event');
              }
            } catch (statusError) {
              console.error('Failed to update order status to completed:', statusError);
              // Don't fail the payment if status update fails
            }

            // Prepare receipt data BEFORE clearing cart
            const receiptData = {
              orderId,
              tableNumber: state.tableNumber,
              items: state.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                modifiers: item.modifiers.map(m => m.name),
                isFree: false,
              })),
              freeItems: state.freeItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                modifiers: item.modifiers.map(m => m.name),
                isFree: true,
              })),
              subtotal: state.getSubtotal(),
              tax: state.getTax(),
              discount: discount,
              discountType: state.discountType,
              globalDiscount: globalDiscount,
              globalDiscountType: state.globalDiscountType,
              globalDiscountAuthorizedBy: state.globalDiscountAuthorizedBy,
              globalDiscountReason: state.globalDiscountReason,
              voucherCode: state.voucherCode,
              voucherDiscountAmount: state.voucherDiscountAmount,
              roundingAmount,
              total: finalTotal,
              paymentMethod,
              notes: state.notes,
            };

            // Clear cart after successful payment
            set({ items: [], tableNumber: '', notes: '', discountAmount: 0, discountType: 'nominal', freeItems: [], globalDiscountAmount: 0, globalDiscountType: 'nominal', globalDiscountAuthorizedBy: null, globalDiscountReason: '', voucherCode: null, voucherId: null, voucherDiscountType: null, voucherDiscountValue: 0, voucherDiscountAmount: 0, member: null, memberDiscountAmount: 0, appliedPromotion: null, promotionDiscountAmount: 0 });
            console.log('🧹 Cart cleared after successful payment');

            return {
              success: true,
              message: 'Pembayaran berhasil!',
              orderId,
              receiptData,
            };
          } catch (error) {
            if (error instanceof NetworkError) {
              console.warn('📴 Local API unreachable, falling back to IndexedDB...');
            } else {
              console.error('❌ Payment failed:', error);
              return {
                success: false,
                message: `Pembayaran gagal: ${error instanceof Error ? error.message : 'Unknown error'}`
              };
            }
          }
        }

        return await saveOffline(!isOnline ? 'Offline' : 'API fallback');
      },

      voidItem: async (itemId, reason) => {
        try {
          const state = get();
          const item = state.items.find((i) => i.id === itemId);
          
          if (!item) {
            return { success: false, message: 'Item tidak ditemukan' };
          }

          // Remove item from cart
          set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
          }));

          return { success: true, message: 'Item berhasil dibatalkan dari keranjang' };
        } catch (error) {
          console.error('Failed to void item:', error);
          return { 
            success: false, 
            message: `Gagal membatalkan item: ${error instanceof Error ? error.message : 'Unknown error'}` 
          };
        }
      },

      voidOrderItem: async (orderId, orderItemId, productId, quantity, reason) => {
        try {
          const state = get();
          const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

          const voidLog = {
            id: generateUUID(),
            order_id: orderId,
            product_id: productId,
            quantity,
            reason,
            cashier_id: state.cashierId,
            created_at: new Date().toISOString(),
          };

          const queueVoidLog = async () => {
            await db.order_void_logs.add(voidLog);
            // Queue so the sync manager replays it when the API is reachable
            await useOfflineStore.getState().addTransaction('create', 'order_void_logs', voidLog);
          };

          if (isOnline) {
            // Online: Send directly to the local API
            try {
              await api.createVoidLogs([voidLog]);
            } catch (error) {
              if (error instanceof NetworkError) {
                console.warn('📴 Local API unreachable, queueing void log for sync');
                await queueVoidLog();
              } else {
                throw error;
              }
            }
          } else {
            // Offline: queue for sync
            await queueVoidLog();
          }

          return { success: true, message: 'Item berhasil dibatalkan' };
        } catch (error) {
          console.error('Failed to void item:', error);
          return { 
            success: false, 
            message: `Gagal membatalkan item: ${error instanceof Error ? error.message : 'Unknown error'}` 
          };
        }
      },

      calculateTotal: () => {
        const state = get();
        return state.getTotal();
      },

      calculateRoundedTotal: (roundTo: number) => {
        const state = get();
        const total = state.getTotal();
        const roundingAmount = Math.round(total / roundTo) * roundTo - total;
        return {
          total: total + roundingAmount,
          roundingAmount,
        };
      },

      assignSplitGroup: (itemId, groupId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, splitGroupId: groupId } : item
          ),
        }));
      },

      removeSplitGroup: (itemId) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, splitGroupId: undefined } : item
          ),
        }));
      },

      getSplitGroupTotal: (groupId) => {
        const state = get();
        return state.items
          .filter((item) => item.splitGroupId === groupId)
          .reduce((sum, item) => {
            const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
            return sum + ((item.price + modifierTotal) * item.quantity);
          }, 0);
      },

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
      },

      getTax: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
        const globalDiscount = state.getGlobalDiscount(); // Applied BEFORE tax
        const discountedSubtotal = subtotal - globalDiscount;
        const taxRate = useConfigStore.getState().getTaxRateAsDecimal(); // Get dynamic tax rate from config
        return discountedSubtotal * taxRate;
      },

      getDiscount: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
        
        if (state.discountType === 'percentage') {
          return subtotal * (state.discountAmount / 100);
        }
        return state.discountAmount; // nominal
      },

      getGlobalDiscount: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
        
        if (state.globalDiscountType === 'percentage') {
          return subtotal * (state.globalDiscountAmount / 100);
        }
        return state.globalDiscountAmount; // nominal
      },

      getTotal: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => {
          const modifierTotal = item.modifiers.reduce((mSum, m) => mSum + m.price, 0);
          return sum + ((item.price + modifierTotal) * item.quantity);
        }, 0);
        const globalDiscount = state.getGlobalDiscount(); // Applied BEFORE tax
        const voucherDiscount = state.voucherDiscountAmount; // Applied BEFORE tax
        const memberDiscount = state.memberDiscountAmount; // Applied BEFORE tax
        const promotionDiscount = state.promotionDiscountAmount; // Applied BEFORE tax
        const discountedSubtotal = subtotal - globalDiscount - voucherDiscount - memberDiscount - promotionDiscount;
        const taxRate = useConfigStore.getState().getTaxRateAsDecimal(); // Get dynamic tax rate from config
        const tax = discountedSubtotal * taxRate; // Dynamic tax rate on discounted subtotal (free items have price 0, so they don't affect tax)
        const discount = state.getDiscount(); // Regular discount applied after tax
        return discountedSubtotal + tax - discount; // (subtotal - globalDiscount - voucherDiscount - memberDiscount - promotionDiscount) + tax - regularDiscount
      },

      // Reverse calculation for internal reporting
      // Extracts tax and service charge from final price for accounting purposes
      getInternalBreakdown: (finalPrice: number) => {
        const taxRate = useConfigStore.getState().getTaxRateAsDecimal(); // Get dynamic tax rate from config
        const serviceChargeRate = useConfigStore.getState().getServiceChargeRateAsDecimal(); // Get dynamic service charge rate from config
        
        // Formula: finalPrice = netSales + tax + serviceCharge
        // where tax = netSales * taxRate and serviceCharge = netSales * serviceChargeRate
        // finalPrice = netSales + (netSales * taxRate) + (netSales * serviceChargeRate)
        // finalPrice = netSales * (1 + taxRate + serviceChargeRate)
        // netSales = finalPrice / (1 + taxRate + serviceChargeRate)
        
        const divisor = 1 + taxRate + serviceChargeRate;
        const netSales = finalPrice / divisor;
        const taxAmount = netSales * taxRate;
        const serviceChargeAmount = netSales * serviceChargeRate;
        
        return {
          netSales: Math.round(netSales),
          taxAmount: Math.round(taxAmount),
          serviceChargeAmount: Math.round(serviceChargeAmount),
        };
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      splitBill: (selectedItemIds) => {
        const state = get();
        if (selectedItemIds.length === 0) {
          return { success: false, message: 'Pilih minimal satu item untuk split bill' };
        }

        const splitItems = state.items.filter(item => selectedItemIds.includes(item.id));
        const remainingItems = state.items.filter(item => !selectedItemIds.includes(item.id));

        // Update cart with remaining items
        set({ items: remainingItems });

        return {
          success: true,
          message: 'Split bill berhasil',
          splitCart: splitItems
        };
      },

      mergeTable: async (targetTable, sourceTable) => {
        try {
          const result = await api.mergeTable(targetTable, sourceTable);
          return { success: true, message: `Berhasil menggabungkan meja ${sourceTable} ke ${targetTable}` };
        } catch (error) {
          console.error('Failed to merge tables:', error);
          return { success: false, message: 'Gagal menggabungkan meja' };
        }
      },

      sendToKitchen: async () => {
        const state = get();

        if (state.items.length === 0) {
          return { success: false, message: 'Keranjang kosong' };
        }

        if (!state.tableNumber) {
          return { success: false, message: 'Mohon isi nomor meja terlebih dahulu' };
        }

        // Check stock availability for all items based on their bom_type
        for (const item of state.items) {
          const stockCheck = await canOrderProduct(item.productId, item.quantity);
          if (!stockCheck.canOrder) {
            return { success: false, message: stockCheck.message };
          }
        }

        const subtotal = state.getSubtotal();
        const tax = state.getTax();
        const discount = state.getDiscount();
        const globalDiscount = state.getGlobalDiscount();
        const total = state.getTotal();

        const orderId = generateUUID();

        // Prepare order data
        const orderData = {
          id: orderId,
          cashier_id: state.cashierId,
          total_amount: total,
          payment_method: null, // Set to null to indicate "Belum Bayar" (Pending)
          status: 'pending' as const,
          table_number: state.tableNumber,
          discount_amount: discount,
          rounding_amount: 0,
          notes: state.notes,
          outlet_id: null,
          created_at: new Date().toISOString(),
        };

        // Prepare order items
        const allOrderItems = [
          ...state.items.map(item => ({
            id: generateUUID(),
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_time: item.price,
            modifiers_applied: item.modifiers,
            discount_item: 0,
            split_group_id: null,
            status: 'pending' as const,
          })),
          ...state.freeItems.map(item => ({
            id: generateUUID(),
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            price_at_time: 0,
            modifiers_applied: item.modifiers,
            discount_item: 0,
            split_group_id: null,
            status: 'pending' as const,
          })),
        ];

        try {
          // Send to API
          await api.createOrder(orderData, allOrderItems);
          console.log('✅ Order sent to kitchen successfully');

          // Save to IndexedDB
          await db.orders.add({
            ...orderData,
            sync_status: 'synced',
          });
          await db.order_items.bulkAdd(allOrderItems);
          console.log('✅ Order saved to IndexedDB');

          // Dispatch event to notify KDS
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('orderCreated', { detail: { orderId } }));
            console.log('📡 Dispatched orderCreated event');
          }

          // Set kitchenSent to true to prevent duplicate submissions
          set({ kitchenSent: true });
          console.log('✅ kitchenSent set to true');

          // Clear cart after successful send to kitchen
          get().clearCart();
          console.log('✅ Cart cleared after send to kitchen');

          // Dispatch event to notify POS page to recalculate menu stock
          // Backend handles stock reduction in POST /orders transaction
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('inventoryStockChanged'));
            console.log('📡 Dispatched inventoryStockChanged event');
          }

          return {
            success: true,
            message: 'Pesanan dikirim ke dapur',
            orderId,
          };
        } catch (error) {
          console.error('Failed to send order to kitchen:', error);
          return {
            success: false,
            message: `Gagal mengirim pesanan: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      },
    }),
    {
      name: 'kitchen-pos-cart-storage',
      partialize: (state) => ({
        items: state.items,
        tableNumber: state.tableNumber,
        notes: state.notes,
      }),
    }
  )
);
