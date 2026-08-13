'use client';

import React from 'react';

export type StandardPurchaseStatus = 
  | 'draft' | 'Pending Approval' | 'pending' | 'open'
  | 'Approved' | 'approved' | 'Converted to PO' | 'converted'
  | 'Rejected' | 'rejected' | 'Cancelled' | 'cancelled'
  | 'completed' | 'closed' | 'verified' | 'paid';

interface PurchaseStatusBadgeProps {
  status: string;
}

export function PurchaseStatusBadge({ status }: PurchaseStatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  let label = status;
  let colorStyle = 'bg-slate-500/10 text-slate-400 border-slate-700/50';

  if (normalized === 'draft' || normalized === 'draf') {
    label = 'Draf';
    colorStyle = 'bg-slate-500/10 text-slate-400 border-slate-700/50';
  } else if (normalized.includes('pending') || normalized === 'open' || normalized === 'menunggu' || normalized === 'terbuka') {
    label = 'Menunggu';
    colorStyle = 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20';
  } else if (normalized.includes('approved') || normalized === 'disetujui') {
    label = 'Disetujui';
    colorStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  } else if (normalized.includes('converted') || normalized === 'dikonversi') {
    label = 'Dikonversi';
    colorStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  } else if (normalized.includes('rejected') || normalized === 'ditolak') {
    label = 'Ditolak';
    colorStyle = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  } else if (normalized.includes('cancelled') || normalized.includes('cancel') || normalized === 'dibatalkan') {
    label = 'Dibatalkan';
    colorStyle = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  } else if (normalized === 'completed' || normalized === 'closed' || normalized === 'selesai') {
    label = 'Selesai';
    colorStyle = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
  } else if (normalized === 'verified' || normalized === 'diverifikasi') {
    label = 'Diverifikasi';
    colorStyle = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
  } else if (normalized === 'paid' || normalized === 'dibayar') {
    label = 'Dibayar';
    colorStyle = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyle}`}>
      {label}
    </span>
  );
}
