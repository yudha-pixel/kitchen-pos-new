'use client';

import { LayoutGrid, Box } from 'lucide-react';
import Link from 'next/link';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';

export default function MappingPage() {
  return (
    <ResponsiveShell title="Mapping Resep (BOM)">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white">
          <Box className="mx-auto h-16 w-16 text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Mapping Resep (BOM)</h2>
          <p className="mt-2 text-sm text-slate-500">
            This page is under construction. It will allow you to map recipes (Bill of Materials) to products.
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
    </ResponsiveShell>
  );
}
