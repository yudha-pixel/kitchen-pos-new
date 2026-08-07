'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { Header } from '@/src/components/layout/Header';
import { useAuth } from '@/src/context/AuthContext';
import { Camera, AlertCircle } from 'lucide-react';
import { AttendanceSection } from '@/src/components/hr/AttendanceSection';
import { Employee, getAllEmployees, initializeDefaultShifts } from '@/src/features/hr/hrService';

export default function AttendancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // RBAC Protection
  if (user && user.role !== 'admin' && user.role !== 'management' && user.role !== 'owner') {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
                <p className="text-gray-600 mb-4">Halaman ini hanya dapat diakses oleh Owner, Management, dan Admin.</p>
                <button
                  onClick={() => router.push('/inventory')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kembali ke Inventori
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadEmployees();
    initializeDefaultShifts();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceUpdate = () => {
    // Refresh stats if needed
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Absensi dengan Selfie</h1>
              </div>
            </div>

            {/* Attendance Section */}
            <AttendanceSection
              employees={employees}
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
