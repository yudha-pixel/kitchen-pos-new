'use client';

import { useState, useEffect } from 'react';
import { X, Printer, FileText, DollarSign, Clock, Calendar, User, Briefcase } from 'lucide-react';
import { Employee, Payroll, Attendance } from '@/src/features/hr/hrService';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  payroll: Payroll;
  overtimeHours: number;
  attendance: Attendance[];
  month: string;
  year: number;
}

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function PayslipModal({ 
  isOpen, 
  onClose, 
  employee, 
  payroll, 
  overtimeHours, 
  attendance,
  month,
  year 
}: PayslipModalProps) {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const monthName = months[parseInt(month) - 1];
  
  // Calculate late days for potential deductions
  const lateDays = attendance.filter(a => a.status === 'late').length;
  const lateDeduction = lateDays * 50000; // Rp 50.000 per late day (example)

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Slip Gaji</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Payslip Content */}
          <div id="payslip-content" className="p-6 space-y-6">
            {/* Company Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Kitchen POS System</h2>
              <p className="text-sm text-gray-600">Slip Gaji Karyawan</p>
            </div>

            {/* Employee Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4" />
                Informasi Karyawan
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nama:</span>
                  <span className="font-medium text-gray-900">{employee.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jabatan:</span>
                  <span className="font-medium text-gray-900">{employee.position}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipe:</span>
                  <span className={`font-medium ${
                    employee.employment_type === 'permanent' 
                      ? 'text-green-600' 
                      : 'text-blue-600'
                  }`}>
                    {employee.employment_type === 'permanent' ? 'Tetap' : 'Lepas'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Periode:</span>
                  <span className="font-medium text-gray-900">{monthName} {year}</span>
                </div>
              </div>
            </div>

            {/* Income Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Rincian Pendapatan
              </h3>
              <div className="bg-green-50 rounded-lg p-4 space-y-2 text-sm">
                {employee.employment_type === 'permanent' ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gaji Pokok:</span>
                    <span className="font-medium text-gray-900">{formatRupiah(payroll.base_salary)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tarif Per Jam:</span>
                      <span className="font-medium text-gray-900">{formatRupiah(employee.hourly_rate || 0)}/jam</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Jam Kerja:</span>
                      <span className="font-medium text-gray-900">{((payroll.working_days * 8) + overtimeHours).toFixed(1)} jam</span>
                    </div>
                  </>
                )}
                {overtimeHours > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upah Lembur ({overtimeHours.toFixed(1)} jam):</span>
                    <span className="font-medium text-gray-900">{formatRupiah(payroll.bonus)}</span>
                  </div>
                )}
                <div className="border-t border-green-200 pt-2 mt-2 flex justify-between font-semibold">
                  <span className="text-gray-900">Total Pendapatan:</span>
                  <span className="text-green-700">{formatRupiah(payroll.total_salary + lateDeduction)}</span>
                </div>
              </div>
            </div>

            {/* Deduction Details */}
            {lateDeduction > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Rincian Potongan
                </h3>
                <div className="bg-red-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Potongan Keterlambatan ({lateDays} hari):</span>
                    <span className="font-medium text-gray-900">{formatRupiah(lateDeduction)}</span>
                  </div>
                  <div className="border-t border-red-200 pt-2 mt-2 flex justify-between font-semibold">
                    <span className="text-gray-900">Total Potongan:</span>
                    <span className="text-red-700">{formatRupiah(lateDeduction)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Net Salary */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Gaji Bersih / Take Home Pay
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {formatRupiah(payroll.total_salary - lateDeduction)}
                </p>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Ringkasan Kehadiran
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{payroll.working_days}</p>
                  <p className="text-gray-600">Hari Kerja</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{lateDays}</p>
                  <p className="text-gray-600">Terlambat</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              Cetak
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #payslip-content, #payslip-content * {
            visibility: visible;
          }
          #payslip-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
}
