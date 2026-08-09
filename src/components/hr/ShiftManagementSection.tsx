'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Users } from 'lucide-react';
import { Shift, Employee, getAllShifts, addShift, updateShift, deleteShift, initializeDefaultShifts, getAllEmployees, getEmployeeNamesByIds } from '@/src/features/hr/hrService';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';

export function ShiftManagementSection() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeNamesMap, setEmployeeNamesMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftToDelete, setShiftToDelete] = useState<Shift | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    end_time: '',
    description: '',
    assigned_employees: [] as string[],
  });

  useEffect(() => {
    loadShifts();
    loadEmployees();
    initializeDefaultShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const data = await getAllShifts();
      setShifts(data);
      
      // Load employee names for all shifts
      const allEmployeeIds = data.flatMap(s => s.assigned_employees || []);
      if (allEmployeeIds.length > 0) {
        const namesMap = await getEmployeeNamesByIds(allEmployeeIds);
        setEmployeeNamesMap(namesMap);
      }
    } catch (error) {
      console.error('Failed to load shifts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data.filter(e => e.is_active));
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleAddShift = () => {
    setFormError('');
    setEditingShift(null);
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
      description: '',
      assigned_employees: [],
    });
    setShowModal(true);
  };

  const handleEditShift = (shift: Shift) => {
    setFormError('');
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      start_time: shift.start_time,
      end_time: shift.end_time,
      description: shift.description || '',
      assigned_employees: shift.assigned_employees || [],
    });
    setShowModal(true);
  };

  const handleDeleteShift = async (id: string) => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteShift(id);
      await loadShifts();
      setShiftToDelete(null);
    } catch (error) {
      console.error('Failed to delete shift:', error);
      setDeleteError('Gagal menghapus shift. Silakan coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setShiftToDelete(null);
    setDeleteError('');
  };

  const handleSaveShift = async () => {
    if (!formData.name || !formData.start_time || !formData.end_time) {
      setFormError('Nama, jam mulai, dan jam selesai wajib diisi.');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      setFormError('Jam mulai harus sebelum jam selesai.');
      return;
    }

    setFormError('');
    try {
      if (editingShift) {
        await updateShift(editingShift.id!, formData);
      } else {
        await addShift(formData);
      }
      await loadShifts();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save shift:', error);
      setFormError('Gagal menyimpan shift. Silakan coba lagi.');
    }
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      assigned_employees: prev.assigned_employees.includes(employeeId)
        ? prev.assigned_employees.filter(id => id !== employeeId)
        : [...prev.assigned_employees, employeeId],
    }));
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getAssignedEmployeeNames = (shift: Shift) => {
    if (!shift.assigned_employees || shift.assigned_employees.length === 0) return '-';
    return shift.assigned_employees
      .map(id => employeeNamesMap.get(id) || 'Unknown')
      .join(', ');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center text-gray-500">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Manajemen Shift Kerja</h2>
        <button
          onClick={handleAddShift}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Shift
        </button>
      </div>

      {/* Shift Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {shifts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Tidak ada data shift
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Karyawan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Shift</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Mulai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam Selesai</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="truncate max-w-xs">{getAssignedEmployeeNames(shift)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{shift.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(shift.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(shift.end_time)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {shift.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditShift(shift)}
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                          aria-label={`Edit shift ${shift.name}`}
                        >
                          <Edit className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError('');
                            setShiftToDelete(shift);
                          }}
                          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-900"
                          aria-label={`Hapus shift ${shift.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Shift Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              {editingShift ? 'Edit Shift' : 'Tambah Shift Baru'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Shift</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Pagi, Siang, Malam"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Karyawan Ditugaskan</label>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                  {employees.length === 0 ? (
                    <p className="text-sm text-gray-500">Tidak ada karyawan aktif</p>
                  ) : (
                    <div className="space-y-2">
                      {employees.map((employee) => (
                        <label key={employee.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.assigned_employees.includes(employee.id!)}
                            onChange={() => handleEmployeeToggle(employee.id!)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900">{employee.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            employee.employment_type === 'permanent' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {employee.employment_type === 'permanent' ? 'Tetap' : 'Lepas'}
                          </span>
                          <span className="text-xs text-gray-500">({employee.position})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Deskripsi shift (opsional)"
                />
              </div>
            </div>
            {formError && (
              <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                {formError}
              </p>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setFormError('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveShift}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(shiftToDelete)}
        onClose={closeDeleteDialog}
        title="Hapus shift?"
        role="alertdialog"
        descriptionId="delete-shift-description"
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
              onClick={() => shiftToDelete?.id && handleDeleteShift(shiftToDelete.id)}
            >
              Hapus shift
            </Button>
          </>
        }
      >
        <p id="delete-shift-description" className="text-pretty text-sm text-ink-secondary">
          Shift <strong className="text-ink">{shiftToDelete?.name}</strong> akan dihapus permanen.
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
