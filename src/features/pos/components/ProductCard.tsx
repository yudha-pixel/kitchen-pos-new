'use client';

import { useState } from 'react';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { ModifierModal, ModifierOption, UIModifierGroup } from './ModifierModal';
import { Product } from '@/src/types/database.types';
import { Badge } from '@/src/components/ui/Badge';
import { formatRupiah } from '@/src/lib/format';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, name: string, price: number, modifiers: ModifierOption[]) => void;
  modifiers?: UIModifierGroup[];
  stockCount?: number | null; // null = unlimited, number = available stock
  cardView?: 'grid' | 'list' | 'minimalist';
}

export const ProductCard = ({ product, onAddToCart, modifiers = [], stockCount }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isOutOfStock = stockCount === 0;
  const isUnlimited = stockCount === null;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return; // Prevent adding to cart if out of stock
    }
    if (modifiers.length > 0) {
      setIsModalOpen(true);
    } else {
      onAddToCart(product.id, product.name, product.price, []);
    }
  };

  const handleConfirmModifiers = (selectedModifiers: ModifierOption[]) => {
    onAddToCart(product.id, product.name, product.price, selectedModifiers);
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Whole card is the tap target (touch-first); hover overlay is a desktop extra */}
      <div className={`group relative overflow-hidden rounded-lg bg-surface shadow-md transition-shadow hover:shadow-lg ${isOutOfStock ? 'opacity-60' : ''}`}>
        <button
          onClick={handleAddToCart}
          aria-label={`Tambah ${product.name} ke keranjang`}
          className={`block w-full text-left transition-transform active:scale-[0.98] ${isOutOfStock ? 'cursor-not-allowed' : ''}`}
          disabled={isOutOfStock}
        >
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-surface-alt">
            {product.image_url && product.image_url.length > 0 && !imageError ? (
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-soft/50 to-primary-soft">
                <ImageIcon className="h-16 w-16 text-primary/40" aria-hidden="true" />
              </div>
            )}

            {/* Desktop hover affordance */}
            <div className="pointer-events-none absolute inset-0 hidden items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/25 lg:flex">
              <span className="flex translate-y-2 items-center gap-1 rounded-lg bg-primary px-4 py-2 font-medium text-on-primary opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <Plus className="h-4 w-4" /> Tambah
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 pr-12">
            <h3 className="mb-1 line-clamp-2 font-semibold text-ink">{product.name}</h3>
            <div className="flex flex-wrap items-center justify-between gap-1">
              <p className="tnum text-lg font-bold text-primary">{formatRupiah(product.price)}</p>
              <div className="flex gap-1">
                {modifiers.length > 0 && <Badge tone="warning">+ Modifier</Badge>}
                {isUnlimited ? (
                  <Badge tone="success">Tersedia</Badge>
                ) : (
                  <Badge tone={isOutOfStock ? 'danger' : stockCount! <= 5 ? 'warning' : 'success'}>
                    {isOutOfStock ? 'Habis' : `Stok: ${stockCount}`}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </button>

      </div>

      {/* Modifier Modal */}
      <ModifierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modifiers={modifiers}
        onConfirm={handleConfirmModifiers}
        productName={product.name}
        basePrice={product.price}
      />
    </>
  );
};
