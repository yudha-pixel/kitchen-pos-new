'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, ShoppingCart, ChefHat, Settings, Table, Users, Clock, ArrowLeft } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  color?: string | null;
}

interface SidebarProps {
  categories?: Category[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

export const Sidebar = ({ 
  categories = [],
  selectedCategory = 'Semua',
  onCategorySelect 
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isAdminArea = pathname?.startsWith('/admin');

  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} bg-white border-r-2 transition-all duration-300 flex flex-col`}>
      {/* BLOK 1: Header & App Switcher (Statis) */}
      <div className="border-b-2 border-blue-400">
        {/* Header dengan Toggle Button */}
        <div className="p-4 flex items-center justify-between bg-blue-600">
          {isOpen && <span className="font-bold text-lg text-white">Kitchen POS</span>}
          <div
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            className="p-2 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            title={isOpen ? "Tutup Sidebar" : "Buka Sidebar"}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
        </div>

        {isOpen && (
          <div className="p-3 bg-blue-600">
            <h3 className="text-xs font-semibold text-blue-200 mb-2 px-3">MODUL APLIKASI</h3>
            <div className="space-y-1">
              <Link 
                href="/pos"
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/pos' ? 'bg-white text-blue-600' : 'hover:bg-blue-500 text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                POS (Kasir)
              </Link>
              <Link 
                href="/kitchen"
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  pathname === '/kitchen' ? 'bg-white text-blue-600' : 'hover:bg-blue-500 text-white'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                KDS (Dapur)
              </Link>
              <Link 
                href="/admin"
                className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  isAdminArea ? 'bg-white text-blue-600' : 'hover:bg-blue-500 text-white'
                }`}
              >
                <Settings className="w-4 h-4" />
                Back-Office Admin
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* BLOK 2: Dinamis (Kategori atau Admin Menu) */}
      <div className="flex-1 overflow-y-auto p-2">
        {isOpen ? (
          <div className="space-y-1">
            {!isAdminArea ? (
              <>
                {/* KATEGORI MENU - Gunakan kategori asli dari props */}
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-3">KATEGORI MENU</h3>
                <button
                  onClick={() => onCategorySelect?.('Semua')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'Semua'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  Semua
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategorySelect?.(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}

                {/* OPERASIONAL KASIR - Tautan statis */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2 px-3">OPERASIONAL KASIR</h3>
                  <div className="space-y-1">
                    <Link 
                      href="/pos/meja"
                      className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Table className="w-4 h-4" />
                      Manajemen Meja
                    </Link>
                    <Link 
                      href="/customers"
                      className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Data Pelanggan
                    </Link>
                    <Link 
                      href="/shift"
                      className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      Buka/Tutup Shift
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* MANAJEMEN ERP - Admin area */}
                <h3 className="text-sm font-semibold text-gray-500 mb-2 px-3">MANAJEMEN ERP</h3>
                <Link 
                  href="/admin/dashboard"
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  Dashboard & Laporan
                </Link>
                <Link 
                  href="/admin/inventory"
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  Inventory & Pengadaan
                </Link>
                <Link 
                  href="/admin/finance"
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  Finance & Expense
                </Link>
                <Link 
                  href="/admin/crm"
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  Pelanggan & CRM
                </Link>
                <Link 
                  href="/admin/hr"
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  HR & Payroll
                </Link>
                <Link 
                  href="/admin/settings"
                  className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  Pengaturan Sistem
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => onCategorySelect?.('Semua')}
              className={`w-full p-2 rounded-lg transition-colors ${
                selectedCategory === 'Semua'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title="Semua"
            >
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto" />
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect?.(category.id)}
                className={`w-full p-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title={category.name}
              >
                <div 
                  className="w-8 h-8 rounded mx-auto"
                  style={{ backgroundColor: category.color || '#e5e7eb' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
