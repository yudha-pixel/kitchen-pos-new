'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Settings, LogOut, ArrowLeft, Users } from 'lucide-react';
import { TableMergeModal } from './TableMergeModal';

interface HeaderProps {
  title?: string;
  onSearch?: (query: string) => void;
  onTableSelect?: (tableId: number) => void;
}

export const Header = ({ 
  title = 'Kitchen POS',
  onSearch,
  onTableSelect 
}: HeaderProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showTableMergeModal, setShowTableMergeModal] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleTableSelect = (tableId: number) => {
    setSelectedTable(tableId);
    onTableSelect?.(tableId);
  };

  const tables = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <header className="bg-white border-b px-6 py-4 relative z-50">
      <div className="flex items-center justify-between">
        {/* Left: Back Button, Title and Search */}
        <div className="flex items-center gap-6 flex-1">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Center: Table Selection */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Meja:</span>
          <div className="flex gap-1">
            {tables.map((table) => (
              <button
                key={table}
                onClick={() => handleTableSelect(table)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedTable === table
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {table}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Time and User Actions */}
        <div className="flex items-center gap-6">
          {/* Current Time */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-gray-500">
              {currentTime.toLocaleDateString('id-ID', { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short' 
              })}
            </p>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTableMergeModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Gabung Meja"
            >
              <Users className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
            <div className="w-px h-8 bg-gray-200" />
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Merge Modal */}
      <TableMergeModal
        isOpen={showTableMergeModal}
        onClose={() => setShowTableMergeModal(false)}
      />
    </header>
  );
};
