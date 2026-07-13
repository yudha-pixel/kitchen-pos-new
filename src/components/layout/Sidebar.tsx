'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

interface SidebarProps {
  categories?: string[];
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
}

export const Sidebar = ({ 
  categories = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Dessert'],
  selectedCategory = 'Semua',
  onCategorySelect 
}: SidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} bg-white border-r transition-all duration-300 flex flex-col`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 hover:bg-gray-100 border-b"
      >
        {isOpen ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
      </button>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {isOpen ? (
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 px-3">Kategori</h3>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategorySelect?.(category)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategorySelect?.(category)}
                className={`w-full p-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title={category}
              >
                <div className="w-8 h-8 bg-gray-200 rounded mx-auto" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Profile */}
      {isOpen && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">Admin</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
