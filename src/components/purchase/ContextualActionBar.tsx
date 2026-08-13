'use client';

import React from 'react';
import { Printer, Copy, Download, Trash2, SlidersHorizontal, X } from 'lucide-react';

interface ContextualActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onPrint?: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
  onStatusChange?: () => void;
}

export function ContextualActionBar({
  selectedCount,
  onClearSelection,
  onPrint,
  onDuplicate,
  onExport,
  onDelete,
  onStatusChange,
}: ContextualActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-0 z-20 bg-primary text-on-primary shadow-md rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onClearSelection}
          className="p-1 rounded-md hover:bg-black/10 transition-colors"
          title="Batal seleksi"
        >
          <X className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">
          Terpilih ({selectedCount})
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-2 text-xs font-medium">
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak
          </button>
        )}
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplikat
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        )}
        {onStatusChange && (
          <button
            onClick={onStatusChange}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Ubah Status
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors ml-auto sm:ml-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}
