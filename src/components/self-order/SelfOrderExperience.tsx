'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Minus, ChevronDown, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useToast } from '@/src/components/ui/Toast';
import { formatRupiah } from '@/src/lib/format';
import { ModifierOption, UIModifierGroup, ModifierModal } from '@/src/features/pos/components/ModifierModal';
import {
  getSelfOrderProducts,
  getSelfOrderCategories,
  getSelfOrderPaymentMethods,
  createCustomerOrder,
  type ProductWithCategory,
  type Category,
} from '@/src/features/self-order/selfOrderService';
import type { SelfOrderPaymentMethod } from '@/src/features/self-order/paymentMethods';

interface SelfOrderExperienceProps {
  tableId: string;
  tableNumber: string;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: ModifierOption[];
}

type View = 'browsing' | 'review' | 'success';

const lineTotal = (item: CartItem) =>
  (item.price + item.modifiers.reduce((sum, m) => sum + m.price, 0)) * item.quantity;

/**
 * The guest-facing dine-in ordering screen at /order/[tableId]. A deliberate fork
 * of WaiterOrderModal rather than an isSelfOrder branch of it: a guest has no auth
 * token, no cashier session, and none of Tunai/Debit/Split Bill/Cancel/Cetak Struk
 * apply to them — those are cashier actions that a shared component kept leaking
 * into this screen. This component only ever talks to the /self-order API surface
 * and only ever writes a CustomerOrder (never the POS Order/IndexedDB cart store).
 */
export default function SelfOrderExperience({ tableId, tableNumber }: SelfOrderExperienceProps) {
  const { toast } = useToast();

  const [view, setView] = useState<View>('browsing');
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductForModifier, setSelectedProductForModifier] = useState<ProductWithCategory | null>(null);
  const [modifierModalOpen, setModifierModalOpen] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState<SelfOrderPaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedMethod, setSubmittedMethod] = useState<SelfOrderPaymentMethod | null>(null);
  const [wasAutoAccepted, setWasAutoAccepted] = useState(false);
  // Stable across retries of the same checkout attempt so a double-tap or a
  // dropped-then-retried request resolves to one order, not two — see
  // createCustomerOrder's doc comment. Freshly generated for each new order.
  const [draftOrderId, setDraftOrderId] = useState<string>(() => crypto.randomUUID());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const [productList, categoryList, methods] = await Promise.all([
          getSelfOrderProducts(),
          getSelfOrderCategories(),
          getSelfOrderPaymentMethods(),
        ]);
        if (cancelled) return;
        setProducts(productList);
        setCategories(categoryList);
        setPaymentMethods(methods);
        setSelectedPaymentMethodId(methods[0]?.id ?? '');
      } catch (err) {
        if (!cancelled) setProductsError('Gagal memuat menu');
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getProductModifiers = (product: ProductWithCategory): UIModifierGroup[] => {
    const groups = (product as any).modifier_groups;
    if (!groups || groups.length === 0) return [];
    return groups.map((group: any) => ({
      id: group.id,
      name: group.name,
      required: group.is_required,
      multiSelect: group.max_selections > 1,
      options: group.modifiers.map((mod: any) => ({
        id: mod.id,
        name: mod.name,
        price: mod.price_extra || 0,
        selected: false,
      })),
    }));
  };

  const addToCart = (productId: string, name: string, price: number, modifiers: ModifierOption[] = []) => {
    setCartItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), productId, name, price, quantity: 1, modifiers },
    ]);
    toast('success', `${name} ditambahkan ke keranjang`);
  };

  const handleProductClick = (product: ProductWithCategory) => {
    if (!product.id) return; // guards the shared Dexie type's optional id; the API always returns one
    const modifiers = getProductModifiers(product);
    if (modifiers.length > 0) {
      setSelectedProductForModifier(product);
      setModifierModalOpen(true);
    } else {
      addToCart(product.id, product.name, product.price, []);
    }
  };

  const handleModifierConfirm = (selected: ModifierOption[]) => {
    if (selectedProductForModifier?.id) {
      addToCart(selectedProductForModifier.id, selectedProductForModifier.name, selectedProductForModifier.price, selected);
    }
    setModifierModalOpen(false);
    setSelectedProductForModifier(null);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
      return;
    }
    setCartItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Semua' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + lineTotal(item), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = async () => {
    const method = paymentMethods.find((m) => m.id === selectedPaymentMethodId);
    if (!method) {
      setSubmitError('Pilih metode pembayaran terlebih dahulu');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await createCustomerOrder(
        draftOrderId,
        tableId,
        customerName.trim() || undefined,
        method.id,
        cartItems.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          modifiers_applied: item.modifiers,
        }))
      );
      setSubmittedMethod(method);
      setWasAutoAccepted(created.status === 'accepted');
      setCartItems([]);
      setView('success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Gagal mengirim pesanan');
    } finally {
      setSubmitting(false);
    }
  };

  const startNewOrder = () => {
    setCustomerName('');
    setSubmitError(null);
    setSubmittedMethod(null);
    setWasAutoAccepted(false);
    setDraftOrderId(crypto.randomUUID());
    setView('browsing');
  };

  if (view === 'success') {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-surface p-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-success" aria-hidden="true" />
        <h1 className="text-xl font-bold">Pesanan Terkirim</h1>
        <p className="max-w-xs text-ink-secondary">
          {wasAutoAccepted
            ? `Pesanan Anda sedang disiapkan oleh dapur.${submittedMethod?.type === 'counter' ? ` ${submittedMethod.description}.` : ''}`
            : submittedMethod?.type === 'counter'
            ? `Pesanan Anda telah diterima. ${submittedMethod.description}.`
            : 'Pesanan Anda menunggu konfirmasi pembayaran dari kasir.'}
        </p>
        <button
          onClick={startNewOrder}
          className="mt-2 rounded-lg bg-primary px-6 py-3 font-medium text-on-primary hover:bg-primary-hover"
        >
          Pesan Lagi
        </button>
      </div>
    );
  }

  if (view === 'review') {
    return (
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-surface">
        <div className="flex items-center gap-2 border-b border-line p-4">
          <button
            onClick={() => setView('browsing')}
            aria-label="Kembali ke menu"
            className="rounded-lg p-2 hover:bg-surface-alt"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-bold">Konfirmasi Pesanan</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-ink-muted">Meja</span>
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-sm font-semibold text-primary">
              {tableNumber}
            </span>
          </div>

          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg bg-surface-alt p-3">
                <div>
                  <p className="font-medium text-sm">
                    {item.quantity}x {item.name}
                  </p>
                  {item.modifiers.length > 0 && (
                    <p className="text-xs text-ink-muted">{item.modifiers.map((m) => m.name).join(', ')}</p>
                  )}
                </div>
                <span className="text-sm font-medium">{formatRupiah(lineTotal(item))}</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-ink-secondary">Nama (opsional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Agar staf bisa memanggil Anda"
              className="w-full rounded-lg border border-line px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {paymentMethods.length > 1 && (
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-ink-secondary">Metode Pembayaran</label>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPaymentMethodId(method.id)}
                    aria-pressed={selectedPaymentMethodId === method.id}
                    className={`w-full rounded-lg border-2 p-3 text-left transition-colors ${
                      selectedPaymentMethodId === method.id
                        ? 'border-primary bg-primary-soft text-primary'
                        : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <p className="font-medium">{method.label}</p>
                    <p className="text-xs text-ink-muted">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {submitError && (
            <p role="alert" className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
              {submitError}
            </p>
          )}
        </div>

        <div className="border-t border-line bg-surface p-4">
          <div className="mb-3 flex justify-between">
            <span className="font-medium">Total</span>
            <span className="font-bold text-primary">{formatRupiah(cartTotal)}</span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={submitting || cartItems.length === 0}
            className="w-full rounded-lg bg-success py-3 font-medium text-on-primary hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Mengirim...' : 'Konfirmasi Pesanan'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-surface">
      <div className="flex items-center justify-between border-b border-line p-4">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          Pemesanan
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-sm font-semibold text-primary">
            {tableNumber}
          </span>
        </h1>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="space-y-3 border-b border-line p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-line py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div
            className="flex gap-2 overflow-x-auto pb-2"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 24px), transparent)',
              maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 24px), transparent)',
            }}
          >
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                selectedCategory === 'Semua' ? 'bg-primary text-on-primary' : 'bg-surface-alt text-ink-secondary hover:bg-line'
              }`}
            >
              Semua
            </button>
            {categories.filter((cat): cat is Category & { id: string } => Boolean(cat.id)).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                  selectedCategory === cat.id ? 'bg-primary text-on-primary' : 'bg-surface-alt text-ink-secondary hover:bg-line'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-surface-alt p-3" style={{ height: 140 }} />
              ))}
            </div>
          ) : productsError ? (
            <EmptyState icon={Search} title="Gagal memuat menu" message={productsError} />
          ) : filteredProducts.length === 0 ? (
            <EmptyState icon={Search} title="Tidak ada menu ditemukan" message="Coba kata kunci atau kategori lain" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="rounded-xl bg-surface p-3 text-left shadow-sm transition-shadow hover:shadow-md active:scale-95"
                >
                  <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-surface-alt">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-2xl text-ink-muted">🍽️</span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  <p className="text-xs text-ink-muted">{formatRupiah(product.price)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col border-t border-line bg-surface">
          <button
            onClick={() => setIsCartOpen((open) => !open)}
            aria-expanded={isCartOpen}
            className="flex w-full items-center justify-between p-4 text-left"
          >
            <span className="font-bold">Keranjang</span>
            <span className="flex items-center gap-2">
              <Badge tone="info">{cartCount} item</Badge>
              <ChevronDown className={`h-4 w-4 transition-transform ${isCartOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </span>
          </button>

          {isCartOpen && (
            <div className="max-h-[40vh] overflow-y-auto border-t border-line p-4">
              {cartItems.length === 0 ? (
                <EmptyState icon={Search} title="Keranjang kosong" message="Tambahkan menu untuk memulai" />
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg bg-surface-alt p-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <p className="text-xs text-ink-muted">{formatRupiah(item.price)}</p>
                        {item.modifiers.length > 0 && (
                          <p className="mt-1 text-xs text-ink-muted">{item.modifiers.map((m) => m.name).join(', ')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label={`Kurangi ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-line hover:bg-line-strong"
                        >
                          <Minus className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label={`Tambah ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary-hover"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-line p-4">
            <div className="mb-3 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-primary">{formatRupiah(cartTotal)}</span>
            </div>
            <button
              onClick={() => setView('review')}
              disabled={cartItems.length === 0}
              className="w-full rounded-lg bg-primary py-3 font-medium text-on-primary hover:bg-primary-hover disabled:opacity-50"
            >
              Lanjut ke Pemesanan
            </button>
          </div>
        </div>
      </div>

      {selectedProductForModifier && (
        <ModifierModal
          isOpen={modifierModalOpen}
          onClose={() => {
            setModifierModalOpen(false);
            setSelectedProductForModifier(null);
          }}
          modifiers={getProductModifiers(selectedProductForModifier)}
          onConfirm={handleModifierConfirm}
          productName={selectedProductForModifier.name}
          basePrice={selectedProductForModifier.price}
        />
      )}
    </div>
  );
}
