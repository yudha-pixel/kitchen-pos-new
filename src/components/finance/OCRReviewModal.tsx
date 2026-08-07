'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { OCRResult, Expense } from '@/src/features/finance/expenseService';

interface OCRReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  ocrResult: OCRResult | null;
  onSave: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => void;
  categories: Array<{ value: string; label: string }>;
}

export function OCRReviewModal({ isOpen, onClose, ocrResult, onSave, categories }: OCRReviewModalProps) {
  const [formData, setFormData] = useState({
    supplier_name: '',
    date: new Date().toISOString().split('T')[0],
    category: 'operasional',
    description: '',
    amount: 0,
    payment_method: 'cash' as 'cash' | 'transfer' | 'card',
  });

  const [lineItems, setLineItems] = useState<Array<{
    name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>>([]);

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit_price: 0,
  });

  useEffect(() => {
    if (ocrResult) {
      setFormData({
        supplier_name: ocrResult.supplier_name,
        date: ocrResult.date,
        category: 'operasional',
        description: `Pembelian dari ${ocrResult.supplier_name}`,
        amount: ocrResult.total,
        payment_method: 'cash',
      });
      setLineItems(ocrResult.line_items);
    }
  }, [ocrResult]);

  const handleAddItem = () => {
    if (!newItem.name || newItem.quantity <= 0 || newItem.unit_price <= 0) {
      alert('Mohon lengkapi data item');
      return;
    }

    const total = newItem.quantity * newItem.unit_price;
    setLineItems([...lineItems, { ...newItem, total }]);
    setNewItem({ name: '', quantity: 1, unit_price: 0 });
  };

  const handleRemoveItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSave = () => {
    if (!formData.description || formData.amount <= 0) {
      alert('Deskripsi dan jumlah wajib diisi');
      return;
    }

    const expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      amount: calculateTotal(),
      supplier_name: formData.supplier_name,
      line_items: lineItems,
    };

    onSave(expense);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Review Hasil OCR</h3>
              <p className="text-sm text-gray-600 mt-1">
                {ocrResult && `Confidence: ${(ocrResult.confidence * 100).toFixed(1)}%`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Supplier</label>
              <input
                type="text"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Tunai</option>
                <option value="transfer">Transfer</option>
                <option value="card">Kartu</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Deskripsi pengeluaran"
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Rincian Barang</h4>
              <span className="text-sm text-gray-600">
                Total: Rp{calculateTotal().toLocaleString('id-ID')}
              </span>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">Rp{item.unit_price.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">Rp{item.total.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Item */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Nama barang"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                min="1"
                className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                placeholder="Harga"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
                min="0"
                className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddItem}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Tambah
              </button>
            </div>
          </div>

          {/* Warning if OCR confidence is low */}
          {ocrResult && ocrResult.confidence < 0.8 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Confidence OCR rendah</p>
                <p className="mt-1">Mohon periksa kembali data yang diekstrak sebelum menyimpan.</p>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Check className="h-4 w-4" />
            Simpan Pengeluaran
          </button>
        </div>
      </div>
    </div>
  );
}
