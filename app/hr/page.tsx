'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, Calendar, DollarSign, X } from 'lucide-react';
import { EmployeeTable } from '@/src/components/hr/EmployeeTable';
import { AddEmployeeModal } from '@/src/components/hr/AddEmployeeModal';
import { AttendanceSection } from '@/src/components/hr/AttendanceSection';
import { PayrollSection } from '@/src/components/hr/PayrollSection';
import { ShiftManagementSection } from '@/src/components/hr/ShiftManagementSection';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import {
  getAllEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getHRStatistics,
  initializeDefaultShifts,
  Employee,
} from '@/src/features/hr/hrService';

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'employees' | 'shifts' | 'attendance' | 'payroll'>('employees');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    presentToday: 0,
    totalSalary: 0,
  });

  useEffect(() => {
    loadEmployees();
    loadStats();
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

  const loadStats = async () => {
    try {
      const data = await getHRStatistics();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setSaveError('');
    setShowAddModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setSaveError('');
    setShowAddModal(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteEmployee(id);
      await loadEmployees();
      await loadStats();
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Failed to delete employee:', error);
      setDeleteError('Gagal menghapus karyawan. Silakan coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const requestDeleteEmployee = (id: string) => {
    const employee = employees.find((item) => item.id === id);
    if (!employee) return;
    setDeleteError('');
    setEmployeeToDelete(employee);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setEmployeeToDelete(null);
    setDeleteError('');
  };

  const handleSaveEmployee = async (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id!, employee);
      } else {
        await addEmployee(employee);
      }
      await loadEmployees();
      await loadStats();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to save employee:', error);
      setSaveError('Gagal menyimpan karyawan');
    }
  };

  const handleAttendanceUpdate = () => {
    loadStats();
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex h-dvh bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HR & Payroll</h1>
                <p className="text-gray-600 mt-1">Kelola karyawan, absensi, dan penggajian</p>
              </div>
              {activeTab === 'employees' && (
                <button
                  onClick={handleAddEmployee}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 hover:text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Karyawan
                </button>
              )}
            </div>

            {saveError && (
              <div role="alert" className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                <span className="text-sm font-medium text-red-800">{saveError}</span>
                <button
                  onClick={() => setSaveError('')}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Karyawan</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalEmployees}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Kehadiran Hari Ini</p>
                    <p className="text-2xl font-bold text-green-600">{stats.presentToday}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Pengeluaran Gaji</p>
                    <p className="text-2xl font-bold text-red-600">{formatRupiah(stats.totalSalary)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('employees')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'employees'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Karyawan
                  </button>
                  <button
                    onClick={() => setActiveTab('shifts')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'shifts'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Manajemen Shift
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'attendance'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Absensi Foto
                  </button>
                  <button
                    onClick={() => setActiveTab('payroll')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'payroll'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Penggajian
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'employees' && (
                  <EmployeeTable
                    employees={employees}
                    onEdit={handleEditEmployee}
                    onDelete={requestDeleteEmployee}
                    loading={loading}
                  />
                )}
                {activeTab === 'shifts' && (
                  <ShiftManagementSection />
                )}
                {activeTab === 'attendance' && (
                  <AttendanceSection
                    employees={employees}
                    onAttendanceUpdate={handleAttendanceUpdate}
                  />
                )}
                {activeTab === 'payroll' && (
                  <PayrollSection employees={employees} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveEmployee}
        editingEmployee={editingEmployee}
      />

      <Modal
        isOpen={Boolean(employeeToDelete)}
        onClose={closeDeleteDialog}
        title="Hapus karyawan?"
        role="alertdialog"
        descriptionId="delete-employee-description"
        closeOnBackdrop={false}
        showCloseButton={false}
        size="sm"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeDeleteDialog} disabled={deleting}>
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={deleting}
              onClick={() => employeeToDelete?.id && handleDeleteEmployee(employeeToDelete.id)}
            >
              Hapus karyawan
            </Button>
          </>
        }
      >
        <p id="delete-employee-description" className="text-pretty text-sm text-ink-secondary">
          Karyawan <strong className="text-ink">{employeeToDelete?.name}</strong> akan dihapus permanen.
          Tindakan ini tidak dapat dibatalkan.
        </p>
        {deleteError && (
          <p role="alert" className="mt-3 text-sm font-medium text-danger">
            {deleteError}
          </p>
        )}
      </Modal>
    </div>
  );
}
