'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error caught:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Terjadi Kesalahan Sistem</h2>
        <p className="text-xs text-slate-600">
          Aplikasi mengalami kendala tak terduga. Silakan coba memuat ulang atau kembali ke beranda.
        </p>
        {error.message && (
          <div className="rounded-lg bg-slate-100 p-3 text-[11px] font-mono text-slate-700 text-left overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Coba Lagi</span>
          </button>
          <Link
            href="/apps"
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 shadow-2xs"
          >
            <Home className="h-4 w-4" />
            <span>App Launcher</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
