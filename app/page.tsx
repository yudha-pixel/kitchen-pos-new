'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/src/context/AuthContext';
import { getRootDestination } from '@/src/features/auth/root-entry';

export default function Home() {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      router.replace(getRootDestination(Boolean(user)));
    }
  }, [isLoading, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-6 text-ink">
      <p role="status" aria-live="polite" className="text-sm text-ink-secondary">
        Memeriksa sesi…
      </p>
    </main>
  );
}
