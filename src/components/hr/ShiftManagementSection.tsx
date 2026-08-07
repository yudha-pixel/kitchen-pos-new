'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, AlertCircle, Users } from 'lucide-react';
import { Shift, Employee, getAllShifts, addShift, updateShift, deleteShift, initializeDefaultShifts, getAllEmployees, getEmployeeNamesByIds } from '@/src/features/hr/hrService';

export function ShiftManagementSection() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeNamesMap, setEmployeeNamesMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
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
      setEmployees(data.filter(e => e.status === 'active'));
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleAddShift = () => {
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
    if (!confirm('Apakah Anda yakin ingin menghapus shift ini?')) return;

    try {
      await deleteShift(id);
      await loadShifts();
    } catch (error) {
      console.error('Failed to delete shift:', error);
      alert('Gagal menghapus shift');
    }
  };

  const handleSaveShift = async () => {
    if (!formData.name || !formData.start_time || !formData.end_time) {
      alert('Nama, jam mulai, dan jam selesai wajib diisi');
      return;
    }

    if (formData.start_time >= formData.end_time) {
      alert('Jam mulai harus sebelum jam selesai');
      return;
    }

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
      alert('Gagal menyimpan shift');
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
                          onClick={() => handleEditShift(shift)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id!)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
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
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={handleSaveShift}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
