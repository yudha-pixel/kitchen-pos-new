'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, DollarSign, Calendar, Briefcase } from 'lucide-react';
import { Employee } from '@/src/features/hr/hrService';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => void;
  editingEmployee?: Employee | null;
}

export function AddEmployeeModal({ isOpen, onClose, onSave, editingEmployee }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    base_salary: 0,
    employment_type: 'permanent' as 'permanent' | 'freelance',
    hourly_rate: 0,
    join_date: new Date().toISOString().split('T')[0],
    is_active: true,
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setFormError('');
    if (editingEmployee) {
      setFormData({
        name: editingEmployee.name,
        position: editingEmployee.position,
        email: editingEmployee.email,
        phone: editingEmployee.phone,
        base_salary: editingEmployee.base_salary,
        employment_type: editingEmployee.employment_type || 'permanent',
        hourly_rate: editingEmployee.hourly_rate || 0,
        join_date: editingEmployee.join_date.split('T')[0],
        is_active: editingEmployee.is_active,
      });
    } else {
      setFormData({
        name: '',
        position: '',
        email: '',
        phone: '',
        base_salary: 0,
        employment_type: 'permanent',
        hourly_rate: 0,
        join_date: new Date().toISOString().split('T')[0],
        is_active: true,
      });
    }
  }, [editingEmployee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.position || !formData.email || !formData.phone) {
      setFormError('Mohon lengkapi semua field wajib');
      return;
    }

    if (formData.employment_type === 'permanent' && formData.base_salary <= 0) {
      setFormError('Gaji pokok harus lebih dari 0 untuk karyawan tetap');
      return;
    }

    if (formData.employment_type === 'freelance' && formData.hourly_rate <= 0) {
      setFormError('Tarif per jam harus lebih dari 0 untuk pekerja lepas');
      return;
    }

    onSave({
      ...formData,
      join_date: new Date(formData.join_date).toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <User className="h-4 w-4" />
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nama lengkap karyawan"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jabatan *
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jabatan/posisi"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telepon *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kepegawaian</label>
            <select
              value={formData.employment_type}
              onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as 'permanent' | 'freelance' })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="permanent">Tetap (Permanent)</option>
              <option value="freelance">Lepas (Freelance)</option>
            </select>
          </div>

          {formData.employment_type === 'permanent' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Gaji Pokok *
              </label>
              <input
                type="number"
                value={formData.base_salary}
                onChange={(e) => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Tarif Per Jam *
              </label>
              <input
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                min="0"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tanggal Masuk *
            </label>
            <input
              type="date"
              value={formData.join_date}
              onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.is_active ? 'active' : 'inactive'}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Non-aktif</option>
            </select>
          </div>
        </form>

        <div className="sticky bottom-0 bg-white border-t p-6 flex flex-col gap-3">
          {formError && (
            <p role="alert" className="text-sm text-red-600">{formError}</p>
          )}
          <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {editingEmployee ? 'Update' : 'Simpan'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
