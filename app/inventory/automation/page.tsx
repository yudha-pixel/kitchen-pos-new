'use client';

import { LayoutGrid, Box, Zap } from 'lucide-react';
import Link from 'next/link';
import { OutletSelector } from '@/src/components/outlet/OutletSelector';
import { useAuth } from '@/src/context/AuthContext';

export default function AutomationPage() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-2 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Otomatisasi Restok</h1>
            <p className="text-xs text-slate-500">Automated stock replenishment rules</p>
          </div>
        </div>
        <OutletSelector />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white">
            <Box className="mx-auto h-16 w-16 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Otomatisasi Restok</h2>
            <p className="mt-2 text-sm text-slate-500">
              This page is under construction. It will allow you to configure automated stock replenishment rules based on reorder points and supplier lead times.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/inventory"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
              >
                <LayoutGrid className="h-4 w-4" />
                Back to Inventory
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
