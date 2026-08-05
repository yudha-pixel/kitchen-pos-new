'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to inventory page since admin dashboard doesn't exist yet
    router.push('/inventory');
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="text-center text-gray-500">
            <p>Redirecting to Inventory...</p>
          </div>
        </main>
      </div>
    </div>
  );
}
