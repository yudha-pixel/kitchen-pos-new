'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to inventory page since admin dashboard doesn't exist yet
    router.push('/inventory');
  }, [router]);

  return (
    <div className="text-center text-gray-500">
      <p>Redirecting to Inventory...</p>
    </div>
  );
}
