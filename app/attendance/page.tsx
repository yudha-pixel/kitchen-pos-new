'use client';

import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { AttendanceSection } from '@/src/components/hr/AttendanceSection';
import { Employee, getAllEmployees, initializeDefaultShifts } from '@/src/features/hr/hrService';

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex-1 flex flex-col overflow-hidden">
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
