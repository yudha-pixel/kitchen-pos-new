'use client';

import { useState } from 'react';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';

interface Table {
  id: string;
  nomor_meja: string;
  kapasitas: number;
  status: 'Available' | 'Occupied' | 'Reserved';
}

export default function TableManagementPage() {
  const [tables, setTables] = useState<Table[]>([
    { id: '1', nomor_meja: 'Meja 1', kapasitas: 4, status: 'Available' },
    { id: '2', nomor_meja: 'Meja 2', kapasitas: 4, status: 'Available' },
    { id: '3', nomor_meja: 'Meja 3', kapasitas: 6, status: 'Occupied' },
    { id: '4', nomor_meja: 'Meja 4', kapasitas: 2, status: 'Available' },
    { id: '5', nomor_meja: 'Meja 5', kapasitas: 8, status: 'Reserved' },
    { id: '6', nomor_meja: 'Meja 6', kapasitas: 4, status: 'Available' },
    { id: '7', nomor_meja: 'Meja 7', kapasitas: 4, status: 'Occupied' },
    { id: '8', nomor_meja: 'Meja 8', kapasitas: 6, status: 'Available' },
    { id: '9', nomor_meja: 'Meja 9', kapasitas: 10, status: 'Available' },
    { id: '10', nomor_meja: 'Meja 10', kapasitas: 4, status: 'Reserved' },
    { id: '11', nomor_meja: 'Meja 11', kapasitas: 2, status: 'Available' },
    { id: '12', nomor_meja: 'Meja 12', kapasitas: 4, status: 'Available' },
  ]);

  const handleTableClick = (tableId: string) => {
    setTables(prevTables =>
      prevTables.map(table => {
        if (table.id === tableId) {
          // Cycle through statuses: Available -> Occupied -> Reserved -> Available
          const statusCycle: ('Available' | 'Occupied' | 'Reserved')[] = ['Available', 'Occupied', 'Reserved'];
          const currentIndex = statusCycle.indexOf(table.status);
          const nextIndex = (currentIndex + 1) % statusCycle.length;
          return { ...table, status: statusCycle[nextIndex] };
        }
        return table;
      })
    );
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500 hover:bg-green-600';
      case 'Occupied':
        return 'bg-red-500 hover:bg-red-600';
      case 'Reserved':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'Available':
        return 'Tersedia';
      case 'Occupied':
        return 'Terisi';
      case 'Reserved':
        return 'Reservasi';
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header title="Manajemen Meja" />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Meja</h1>
            <p className="text-gray-600 mt-2">Kelola status dan kapasitas meja restoran</p>
          </div>

          {/* Legend */}
          <div className="flex gap-6 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Tersedia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-700">Terisi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-700">Reservasi</span>
            </div>
          </div>

          {/* Table Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`${getStatusColor(table.status)} text-white rounded-lg p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer`}
              >
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold mb-2">{table.nomor_meja}</div>
                  <div className="text-sm opacity-90 mb-1">Kapasitas: {table.kapasitas} orang</div>
                  <div className="text-xs font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {getStatusText(table.status)}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Petunjuk:</h3>
            <p className="text-sm text-blue-700">
              Klik pada kotak meja untuk mengubah statusnya. Status akan berurutan: Tersedia → Terisi → Reservasi → Tersedia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
