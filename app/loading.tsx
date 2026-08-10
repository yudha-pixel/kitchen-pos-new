'use client';

import { Spinner } from '@/src/components/ui/Spinner';

export default function GlobalLoading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" className="text-violet-600" />
        <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase animate-pulse">
          Memuat Kitchen POS...
        </span>
      </div>
    </div>
  );
}
