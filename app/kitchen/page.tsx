'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, AlertCircle, ChefHat, Wine, ArrowLeft } from 'lucide-react';
import * as api from '@/src/lib/api';

interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  price_at_time: number;
  modifiers_applied: any;
  product?: {
    name: string;
    category?: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  table_number: string | null;
  created_at: string;
  status: string;
  notes: string | null;
  items: OrderItem[];
}

export default function KitchenDisplayPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'kitchen' | 'bar'>('all');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      // /orders/active returns pending + preparing orders with items,
      // product, and category joined in a single call
      const data = await api.fetchActiveOrders();
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    
    const hasKitchenItems = order.items.some(item => 
      item.product?.category?.name?.toLowerCase().includes('makanan') ||
      item.product?.category?.name?.toLowerCase().includes('food')
    );
    
    const hasBarItems = order.items.some(item => 
      item.product?.category?.name?.toLowerCase().includes('minuman') ||
      item.product?.category?.name?.toLowerCase().includes('drink')
    );
    
    if (filter === 'kitchen') return hasKitchenItems;
    if (filter === 'bar') return hasBarItems;
    
    return true;
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getTimeElapsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // minutes
    
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff} menit`;
    const hours = Math.floor(diff / 60);
    return `${hours} jam ${diff % 60} menit`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
            <ChefHat className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold">Kitchen Display</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter('kitchen')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filter === 'kitchen' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              Dapur
            </button>
            <button
              onClick={() => setFilter('bar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                filter === 'bar' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Wine className="w-4 h-4" />
              Bar
            </button>
          </div>
          
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <AlertCircle className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Tidak ada order pending</p>
            <p className="text-sm">Order baru akan muncul di sini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
              >
                {/* Order Header */}
                <div className="bg-gray-700 p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">
                        {order.table_number || 'Take Away'}
                      </span>
                      <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                        #{order.id.slice(0, 6)}
                      </span>
                      {order.status === 'preparing' && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                          Diproses
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(order.created_at)}</span>
                      <span>•</span>
                      <span>{getTimeElapsed(order.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="border-l-4 border-orange-500 pl-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">{item.quantity}x</span>
                        <span className="font-medium">{item.product?.name || 'Unknown'}</span>
                      </div>
                      {item.modifiers_applied && Array.isArray(item.modifiers_applied) && item.modifiers_applied.length > 0 && (
                        <div className="text-sm text-gray-400 mt-1">
                          {item.modifiers_applied.map((mod: any, idx: number) => (
                            <span key={idx} className="block">+ {mod.name || mod}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="px-4 pb-3">
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded p-2 text-sm text-yellow-200">
                      <span className="font-bold">Catatan:</span> {order.notes}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 border-t border-gray-700 flex gap-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                    >
                      Proses
                    </button>
                  )}
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Selesai
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
