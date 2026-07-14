'use client';

import { useState } from 'react';
import { Image as ImageIcon, Edit } from 'lucide-react';
import { ModifierModal, ModifierOption, UIModifierGroup } from './ModifierModal';
import { EditProductModal } from './EditProductModal';
import { Product } from '@/src/types/database.types';
import * as api from '@/src/lib/api';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, name: string, price: number, modifiers: ModifierOption[]) => void;
  modifiers?: UIModifierGroup[];
  userRole?: 'admin' | 'cashier';
  onProductUpdate?: () => void;
}

export const ProductCard = ({ product, onAddToCart, modifiers = [], userRole = 'cashier', onProductUpdate }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = () => {
    console.log('🛒 Product clicked:', product);
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

  const handleSaveProduct = async (updatedData: Partial<Product>) => {
    const dataToUpdate = {
      name: updatedData.name,
      price: updatedData.price,
      stock_quantity: product.stock_quantity,
      image_url: updatedData.image_url || null,
      category_id: product.category_id,
    };
    try {
      await api.updateProduct(product.id, dataToUpdate);
      alert('Produk berhasil diupdate');
      onProductUpdate?.();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal mengupdate produk');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.image_url && product.image_url.length > 0 && !imageError ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onLoad={() => console.log('✅ Image loaded:', product.image_url)}
              onError={() => {
                console.error('❌ Image error:', product.image_url);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <ImageIcon className="w-16 h-16 text-blue-300" />
            </div>
          )}
          
          {/* Add Button Overlay */}
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <button
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              + Tambah
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
            {userRole === 'admin' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditModalOpen(true);
                }}
                className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                title="Edit Produk"
              >
                <Edit className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-blue-600">
              Rp {product.price.toLocaleString()}
            </p>
            {modifiers.length > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                + Modifier
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modifier Modal */}
      <ModifierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modifiers={modifiers}
        onConfirm={handleConfirmModifiers}
        productName={product.name}
        basePrice={product.price}
        productId={product.id}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={product}
        onSave={handleSaveProduct}
        userRole={userRole}
      />
    </>
  );
};
