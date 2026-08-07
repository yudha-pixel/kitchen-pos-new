'use client';

import { useState, useEffect } from 'react';
import { Camera, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { Employee, Attendance, Shift, getAttendanceByDate, checkIn, checkOut, getAllShifts } from '@/src/features/hr/hrService';
import { AttendanceCameraModal } from './AttendanceCameraModal';

interface AttendanceSectionProps {
  employees: Employee[];
  onAttendanceUpdate: () => void;
}

export function AttendanceSection({ employees, onAttendanceUpdate }: AttendanceSectionProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraAction, setCameraAction] = useState<'check-in' | 'check-out'>('check-in');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showLateAlert, setShowLateAlert] = useState(false);
  const [lateAlertMessage, setLateAlertMessage] = useState('');

  useEffect(() => {
    loadAttendance();
    loadShifts();
  }, [selectedDate]);

  const loadAttendance = async () => {
    try {
      const data = await getAttendanceByDate(selectedDate);
      setAttendance(data);
      
      // Check for late attendance today
      const today = new Date().toISOString().split('T')[0];
      if (selectedDate === today) {
        const lateCount = data.filter(a => a.status === 'late').length;
        if (lateCount > 0) {
          setLateAlertMessage(`${lateCount} karyawan terlambat hari ini`);
          setShowLateAlert(true);
        }
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const loadShifts = async () => {
    try {
      const data = await getAllShifts();
      setShifts(data);
    } catch (error) {
      console.error('Failed to load shifts:', error);
    }
  };

  const handleCheckIn = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedShift('');
    setCameraAction('check-in');
    setShowCameraModal(true);
  };

  const handleCheckOut = (employee: Employee) => {
    setSelectedEmployee(employee);
    setCameraAction('check-out');
    setShowCameraModal(true);
  };

  const handleCameraCapture = async (photo: string) => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      if (cameraAction === 'check-in') {
        const result = await checkIn(selectedEmployee.id!, photo, selectedShift || undefined);
        if (result.isLate) {
          setLateAlertMessage(`${selectedEmployee.name} terlambat check-in hari ini`);
          setShowLateAlert(true);
        }
      } else {
        const result = await checkOut(selectedEmployee.id!, photo);
        if (result.overtimeHours > 0) {
          alert(`${selectedEmployee.name} memiliki ${result.overtimeHours} jam lembur hari ini`);
        }
      }
      await loadAttendance();
      onAttendanceUpdate();
    } catch (error: any) {
      console.error('Failed to record attendance:', error);
      alert(error.message || 'Gagal mencatat kehadiran');
    } finally {
      setLoading(false);
      setSelectedEmployee(null);
      setSelectedShift('');
    }
  };

  const getEmployeeAttendance = (employeeId: string) => {
    return attendance.find(a => a.employee_id === employeeId);
  };

  const getShiftName = (shiftId?: string) => {
    if (!shiftId) return '-';
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.name || '-';
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time;
  };

  const formatOvertime = (hours?: number) => {
    if (!hours || hours === 0) return '-';
    return `${hours.toFixed(1)} jam`;
  };

  const activeEmployees = employees.filter(e => e.status === 'active');

  return (
    <div className="space-y-4">
      {/* Late Alert Banner */}
      {showLateAlert && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 font-medium">{lateAlertMessage}</span>
          </div>
          <button
            onClick={() => setShowLateAlert(false)}
            className="text-yellow-600 hover:text-yellow-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Log Kehadiran</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeEmployees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada karyawan aktif
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lembur</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeEmployees.map((employee) => {
                  const empAttendance = getEmployeeAttendance(employee.id!);
                  const canCheckIn = !empAttendance;
                  const canCheckOut = empAttendance && !empAttendance.check_out_time;

                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {employee.position}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {getShiftName(empAttendance?.shift_id)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {formatTime(empAttendance?.check_in_time)}
                          {empAttendance?.check_in_photo && (
                            <img
                              src={empAttendance.check_in_photo}
                              alt="Check-in"
                              className="h-6 w-6 rounded object-cover cursor-pointer hover:opacity-80"
                              onClick={() => window.open(empAttendance.check_in_photo, '_blank')}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {formatTime(empAttendance?.check_out_time)}
                          {empAttendance?.check_out_photo && (
                            <img
                              src={empAttendance.check_out_photo}
                              alt="Check-out"
                              className="h-6 w-6 rounded object-cover cursor-pointer hover:opacity-80"
                              onClick={() => window.open(empAttendance.check_out_photo, '_blank')}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatOvertime(empAttendance?.overtime_hours)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {empAttendance ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                            empAttendance.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {empAttendance.status === 'present' && <CheckCircle className="h-3 w-3" />}
                            {empAttendance.status === 'late' && <AlertCircle className="h-3 w-3" />}
                            {empAttendance.status === 'absent' && <XCircle className="h-3 w-3" />}
                            {empAttendance.status === 'present' ? 'Hadir' : empAttendance.status === 'late' ? 'Telat' : 'Absen'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            Belum Hadir
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1">
                          {canCheckIn && (
                            <button
                              onClick={() => handleCheckIn(employee)}
                              disabled={loading}
                              className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
                            >
                              <Camera className="h-3 w-3" />
                              Check-in
                            </button>
                          )}
                          {canCheckOut && (
                            <button
                              onClick={() => handleCheckOut(employee)}
                              disabled={loading}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs"
                            >
                              <Camera className="h-3 w-3" />
                              Check-out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Camera Modal */}
      {showCameraModal && (
        <AttendanceCameraModal
          isOpen={showCameraModal}
          onClose={() => {
            setShowCameraModal(false);
            setSelectedEmployee(null);
            setSelectedShift('');
          }}
          onCapture={handleCameraCapture}
          title={cameraAction === 'check-in' ? 'Check-in dengan Foto' : 'Check-out dengan Foto'}
        >
          {cameraAction === 'check-in' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Shift</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Pilih Shift --</option>
                {shifts.map(shift => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.start_time} - {shift.end_time})
                  </option>
                ))}
              </select>
            </div>
          )}
        </AttendanceCameraModal>
      )}
    </div>
  );
}
