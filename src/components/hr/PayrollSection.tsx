'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Download, Calculator, FileText } from 'lucide-react';
import { Employee, Payroll, calculatePayroll, getAttendanceByEmployee, getAttendanceByEmployee as getAttendance } from '@/src/features/hr/hrService';
import { PayslipModal } from './PayslipModal';

interface PayrollSectionProps {
  employees: Employee[];
}

export function PayrollSection({ employees }: PayrollSectionProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payrollData, setPayrollData] = useState<Payroll[]>([]);
  const [overtimeData, setOvertimeData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslipEmployee, setSelectedPayslipEmployee] = useState<Employee | null>(null);
  const [selectedPayslipData, setSelectedPayslipData] = useState<Payroll | null>(null);
  const [selectedPayslipAttendance, setSelectedPayslipAttendance] = useState<any[]>([]);

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth, selectedYear]);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const monthStr = selectedMonth.toString().padStart(2, '0');
      const data = await calculatePayroll(monthStr, selectedYear);
      setPayrollData(data);
      
      // Calculate overtime hours for each employee
      const overtimeMap = new Map<string, number>();
      for (const employee of employees) {
        if (employee.status !== 'active') continue;
        const attendance = await getAttendanceByEmployee(employee.id!);
        const monthStart = `${selectedYear}-${monthStr}-01`;
        const monthEnd = `${selectedYear}-${monthStr}-31`;
        
        const monthlyAttendance = attendance.filter(
          a => a.date >= monthStart && a.date <= monthEnd
        );
        
        const totalOvertime = monthlyAttendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
        overtimeMap.set(employee.id!, totalOvertime);
      }
      setOvertimeData(overtimeMap);
    } catch (error) {
      console.error('Failed to load payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown';
  };

  const getEmployeeType = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.employment_type || 'permanent';
  };

  const getEmployeeHourlyRate = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.hourly_rate || 0;
  };

  const handleViewPayslip = async (payroll: Payroll) => {
    const employee = employees.find(e => e.id === payroll.employee_id);
    if (!employee) return;

    try {
      const attendance = await getAttendance(employee.id!);
      const monthStr = selectedMonth.toString().padStart(2, '0');
      const monthStart = `${selectedYear}-${monthStr}-01`;
      const monthEnd = `${selectedYear}-${monthStr}-31`;
      
      const monthlyAttendance = attendance.filter(
        a => a.date >= monthStart && a.date <= monthEnd
      );

      setSelectedPayslipEmployee(employee);
      setSelectedPayslipData(payroll);
      setSelectedPayslipAttendance(monthlyAttendance);
      setShowPayslipModal(true);
    } catch (error) {
      console.error('Failed to load attendance for payslip:', error);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExportCSV = () => {
    const monthName = months.find(m => m.value === selectedMonth)?.label;
    let csvContent = `Laporan Penggajian - ${monthName} ${selectedYear}\n`;
    csvContent += `Tanggal Export,${new Date().toLocaleString('id-ID')}\n\n`;
    
    csvContent += 'Nama Karyawan,Gaji Pokok,Hari Kerja,Jam Lembur,Upah Lembur,Bonus,Potongan,Total Gaji\n';
    
    payrollData.forEach(payroll => {
      const overtimeHours = overtimeData.get(payroll.employee_id) || 0;
      csvContent += `${getEmployeeName(payroll.employee_id)},${payroll.base_salary},${payroll.working_days},${overtimeHours.toFixed(1)},${payroll.bonus},${0},${payroll.deduction},${payroll.total_salary}\n`;
    });
    
    const totalGaji = payrollData.reduce((sum, p) => sum + p.total_salary, 0);
    csvContent += `\nTotal Pengeluaran Gaji,${totalGaji}\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_${selectedYear}_${selectedMonth.toString().padStart(2, '0')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPayroll = payrollData.reduce((sum, p) => sum + p.total_salary, 0);
  const totalOvertimeHours = Array.from(overtimeData.values()).reduce((sum, hours) => sum + hours, 0);
  
  const permanentPayroll = payrollData.filter(p => getEmployeeType(p.employee_id) === 'permanent');
  const freelancePayroll = payrollData.filter(p => getEmployeeType(p.employee_id) === 'freelance');
  const totalPermanentPayroll = permanentPayroll.reduce((sum, p) => sum + p.total_salary, 0);
  const totalFreelancePayroll = freelancePayroll.reduce((sum, p) => sum + p.total_salary, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Penggajian Bulanan</h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Month/Year Selector */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Pengeluaran HR</p>
                <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalPayroll)}</p>
              </div>
            </div>
            <Calculator className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Gaji Karyawan Tetap</p>
                <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalPermanentPayroll)}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Upah Pekerja Lepas</p>
                <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalFreelancePayroll)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="space-y-6">
        {/* Permanent Employees Section */}
        {permanentPayroll.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h3 className="text-sm font-semibold text-gray-900">Karyawan Tetap</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Memuat data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji Pokok</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hari Kerja</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Lembur</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Upah Lembur</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Potongan</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Gaji</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permanentPayroll.map((payroll) => (
                      <tr key={payroll.employee_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getEmployeeName(payroll.employee_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatRupiah(payroll.base_salary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {payroll.working_days} hari
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600 text-right">
                          {(overtimeData.get(payroll.employee_id) || 0).toFixed(1)} jam
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                          {formatRupiah(payroll.bonus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                          {formatRupiah(payroll.deduction)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                          {formatRupiah(payroll.total_salary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewPayslip(payroll)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Lihat Slip Gaji"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900" colSpan={7}>
                        Total Karyawan Tetap
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                        {formatRupiah(totalPermanentPayroll)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Freelance Workers Section */}
        {freelancePayroll.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b">
              <h3 className="text-sm font-semibold text-gray-900">Pekerja Lepas</h3>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-500">Memuat data...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Karyawan</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tarif Per Jam</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hari Kerja</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Jam</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Upah</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {freelancePayroll.map((payroll) => (
                      <tr key={payroll.employee_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getEmployeeName(payroll.employee_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatRupiah(getEmployeeHourlyRate(payroll.employee_id))}/jam
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {payroll.working_days} hari
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                          {((payroll.working_days * 8) + (overtimeData.get(payroll.employee_id) || 0)).toFixed(1)} jam
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                          {formatRupiah(payroll.total_salary)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewPayslip(payroll)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Lihat Slip Gaji"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900" colSpan={5}>
                        Total Pekerja Lepas
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                        {formatRupiah(totalFreelancePayroll)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {payrollData.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Tidak ada data penggajian untuk periode ini
          </div>
        )}
      </div>

      {/* Payslip Modal */}
      {showPayslipModal && selectedPayslipEmployee && selectedPayslipData && (
        <PayslipModal
          isOpen={showPayslipModal}
          onClose={() => {
            setShowPayslipModal(false);
            setSelectedPayslipEmployee(null);
            setSelectedPayslipData(null);
            setSelectedPayslipAttendance([]);
          }}
          employee={selectedPayslipEmployee}
          payroll={selectedPayslipData}
          overtimeHours={overtimeData.get(selectedPayslipData.employee_id) || 0}
          attendance={selectedPayslipAttendance}
          month={selectedMonth.toString().padStart(2, '0')}
          year={selectedYear}
        />
      )}
    </div>
  );
}
