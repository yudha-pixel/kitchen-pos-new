'use client';

import React from 'react';
import { X } from 'lucide-react';
import { PurchaseStatusBadge } from './PurchaseStatusBadge';

export interface DetailDrawerField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

export interface DetailDrawerItem {
  id: string | number;
  name: string;
  quantity?: number | string;
  unit?: string;
  price?: number | string;
  total?: number | string;
  notes?: string;
}

interface PurchaseDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  status?: string;
  fields: DetailDrawerField[];
  items?: DetailDrawerItem[];
  itemsTitle?: string;
  actions?: React.ReactNode;
}

export function PurchaseDetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  status,
  fields,
  items = [],
  itemsTitle = 'Daftar Items / Bahan',
  actions,
}: PurchaseDetailDrawerProps) {
  if (!isOpen) return null;

  const formatCurrency = (val?: number | string) => {
    if (val === undefined || val === null || val === '') return '-';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return String(val);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-surface text-ink border-l border-line shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-line flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-ink">{title}</h2>
                {status && <PurchaseStatusBadge status={status} />}
              </div>
              {subtitle && <p className="text-xs text-ink-muted mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-alt transition-colors shrink-0"
              title="Tutup"
            >
              <X className="h-5 w-5 text-ink-muted" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Fields Grid */}
            <div className="grid grid-cols-2 gap-4">
              {fields.map((f, i) => (
                <div key={i} className={f.fullWidth ? 'col-span-2' : 'col-span-1'}>
                  <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                    {f.label}
                  </label>
                  <div className="mt-1 text-sm font-medium text-ink">
                    {f.value ?? '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Line Items Table */}
            {items && items.length > 0 && (
              <div className="pt-4 border-t border-line">
                <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                  {itemsTitle} ({items.length})
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-line rounded-lg p-3 bg-surface-alt/50 space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold text-ink">{item.name}</span>
                        {item.total !== undefined && (
                          <span className="text-xs font-bold text-ink">
                            {formatCurrency(item.total)}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between text-xs text-ink-secondary">
                        <span>
                          Jumlah: {item.quantity ?? '-'} {item.unit || ''}
                        </span>
                        {item.price !== undefined && (
                          <span>Harga: {formatCurrency(item.price)}</span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-xs text-ink-muted italic pt-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {actions && (
            <div className="p-6 border-t border-line bg-surface flex items-center justify-end gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
