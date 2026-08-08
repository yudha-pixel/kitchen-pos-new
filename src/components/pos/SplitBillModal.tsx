'use client';

import { useState, useEffect } from 'react';
import { X, Users, DollarSign, Divide, Check, Plus } from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { formatRupiah } from '@/src/lib/format';
import { Button } from '@/src/components/ui/Button';

type SplitMethod = 'equal' | 'items' | 'amount';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (splits: any[]) => void;
}

export function SplitBillModal({ isOpen, onClose, onConfirm }: SplitBillModalProps) {
  const { items, getSubtotal, getTax } = useCartStore();
  const [method, setMethod] = useState<SplitMethod>('equal');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [itemAssignments, setItemAssignments] = useState<Record<string, string>>({});
  const [amountSplits, setAmountSplits] = useState<number[]>([]);
  const [splitNames, setSplitNames] = useState<string[]>(['Person 1', 'Person 2']);
  const [calculatedSplits, setCalculatedSplits] = useState<any[]>([]);

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = subtotal + tax;

  // Calculate splits based on selected method
  useEffect(() => {
    if (!isOpen) return;

    if (method === 'equal') {
      const perPerson = total / numberOfPeople;
      const splits = Array.from({ length: numberOfPeople }, (_, i) => ({
        name: splitNames[i] || `Person ${i + 1}`,
        subtotal: subtotal / numberOfPeople,
        tax: tax / numberOfPeople,
        total: perPerson,
      }));
      setCalculatedSplits(splits);
    } else if (method === 'items') {
      const splits: any[] = [];
      const uniqueGroups = Array.from(new Set(Object.values(itemAssignments)));
      
      uniqueGroups.forEach((groupId, index) => {
        const groupItems = items.filter(item => itemAssignments[item.id] === groupId);
        const groupSubtotal = groupItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const groupTax = groupSubtotal * 0.1; // Assuming 10% tax
        const groupTotal = groupSubtotal + groupTax;
        
        splits.push({
          name: splitNames[index] || `Group ${index + 1}`,
          items: groupItems,
          subtotal: groupSubtotal,
          tax: groupTax,
          total: groupTotal,
        });
      });
      
      setCalculatedSplits(splits);
    } else if (method === 'amount') {
      const totalAmount = amountSplits.reduce((sum, amount) => sum + amount, 0);
      const difference = total - totalAmount;
      
      const splits = amountSplits.map((amount, index) => {
        const subtotal = amount / 1.1; // Reverse tax calculation
        const tax = amount - subtotal;
        
        return {
          name: splitNames[index] || `Split ${index + 1}`,
          subtotal,
          tax,
          total: amount,
        };
      });
      
      setCalculatedSplits(splits);
    }
  }, [method, numberOfPeople, itemAssignments, amountSplits, splitNames, items, subtotal, tax, total, isOpen]);

  const handleConfirm = () => {
    onConfirm(calculatedSplits);
    onClose();
  };

  const handleAddPerson = () => {
    setNumberOfPeople(prev => prev + 1);
    setSplitNames(prev => [...prev, `Person ${prev.length + 1}`]);
  };

  const handleRemovePerson = () => {
    if (numberOfPeople > 2) {
      setNumberOfPeople(prev => prev - 1);
      setSplitNames(prev => prev.slice(0, -1));
    }
  };

  const handleItemAssignment = (itemId: string, groupId: string) => {
    setItemAssignments(prev => ({ ...prev, [itemId]: groupId }));
  };

  const handleAmountChange = (index: number, value: string) => {
    const newAmounts = [...amountSplits];
    newAmounts[index] = parseFloat(value) || 0;
    setAmountSplits(newAmounts);
  };

  const handleAddAmountSplit = () => {
    setAmountSplits(prev => [...prev, 0]);
    setSplitNames(prev => [...prev, `Split ${prev.length + 1}`]);
  };

  const handleRemoveAmountSplit = (index: number) => {
    if (amountSplits.length > 1) {
      setAmountSplits(prev => prev.filter((_, i) => i !== index));
      setSplitNames(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Split Bill</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Metode Pembagian</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMethod('equal')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  method === 'equal'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">Equal</span>
              </button>
              <button
                onClick={() => setMethod('items')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  method === 'items'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Divide className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">By Items</span>
              </button>
              <button
                onClick={() => setMethod('amount')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  method === 'amount'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <DollarSign className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">By Amount</span>
              </button>
            </div>
          </div>

          {/* Equal Split */}
          {method === 'equal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Orang</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRemovePerson}
                    disabled={numberOfPeople <= 2}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{numberOfPeople}</span>
                  <button
                    onClick={handleAddPerson}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Per Orang</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {formatRupiah(total / numberOfPeople)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* By Items */}
          {method === 'items' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Alokasi Item</label>
                <button
                  onClick={() => {
                    const newGroupId = `group-${Date.now()}`;
                    setSplitNames(prev => [...prev, `Group ${prev.length + 1}`]);
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  + Tambah Group
                </button>
              </div>

              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} x {formatRupiah(item.price)} = {formatRupiah(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {splitNames.map((name, index) => (
                      <button
                        key={index}
                        onClick={() => handleItemAssignment(item.id, `group-${index}`)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                          itemAssignments[item.id] === `group-${index}`
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* By Amount */}
          {method === 'amount' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Nominal Pembagian</label>
                <button
                  onClick={handleAddAmountSplit}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  + Tambah Split
                </button>
              </div>

              {amountSplits.map((amount, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={splitNames[index] || `Split ${index + 1}`}
                    onChange={(e) => {
                      const newNames = [...splitNames];
                      newNames[index] = e.target.value;
                      setSplitNames(newNames);
                    }}
                    className="flex-1 p-2 border rounded-lg text-sm"
                    placeholder="Nama"
                  />
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    className="w-32 p-2 border rounded-lg text-sm"
                    placeholder="0"
                  />
                  {amountSplits.length > 1 && (
                    <button
                      onClick={() => handleRemoveAmountSplit(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Tagihan:</span>
                  <span className="font-medium">{formatRupiah(total)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Total Split:</span>
                  <span className={`font-medium ${amountSplits.reduce((sum, a) => sum + a, 0) === total ? 'text-green-600' : 'text-red-600'}`}>
                    {formatRupiah(amountSplits.reduce((sum, a) => sum + a, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {calculatedSplits.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Ringkasan Pembagian</h3>
              <div className="space-y-2">
                {calculatedSplits.map((split, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{split.name}</span>
                      <span className="font-bold text-indigo-600">{formatRupiah(split.total)}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Subtotal: {formatRupiah(split.subtotal)} | Tax: {formatRupiah(split.tax)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
            disabled={calculatedSplits.length === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Konfirmasi
          </Button>
        </div>
      </div>
    </div>
  );
}
