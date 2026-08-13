'use client';

import { useEffect, useState } from 'react';
import { formatRupiah } from '@/src/lib/format';
import { getToken } from '@/src/lib/api';
import { Search, UserPlus, Edit, Trash2, Crown, Shield, Star, Gem, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL } from '@/src/config/runtime';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';

interface Member {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  total_spent: number;
  discount_percentage: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

const TIER_CONFIG = {
  bronze: { color: 'text-amber-700', bg: 'bg-amber-100', icon: Shield, discount: 5, minSpent: 0 },
  silver: { color: 'text-gray-600', bg: 'bg-gray-200', icon: Star, discount: 10, minSpent: 500000 },
  gold: { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Crown, discount: 15, minSpent: 2000000 },
  platinum: { color: 'text-purple-600', bg: 'bg-purple-100', icon: Gem, discount: 20, minSpent: 5000000 },
};

export default function CRMPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    tier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum',
    points: 0,
    total_spent: 0,
    discount_percentage: 5,
    is_active: true,
  });

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, searchTerm, filterTier]);

  // Listen for member updates from POS transactions
  useEffect(() => {
    const handleMemberUpdated = () => {
      loadMembers();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('memberUpdated', handleMemberUpdated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('memberUpdated', handleMemberUpdated);
      }
    };
  }, []);

  const loadMembers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const allMembers = await response.json();
      setMembers(allMembers);
      setFilteredMembers(allMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterTier) {
      filtered = filtered.filter(member => member.tier === filterTier);
    }

    setFilteredMembers(filtered);
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setFormError('');
    setFormData({
      name: '',
      phone: '',
      email: '',
      tier: 'bronze',
      points: 0,
      total_spent: 0,
      discount_percentage: 5,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setFormError('');
    setFormData({
      name: member.name,
      phone: member.phone,
      email: member.email || '',
      tier: member.tier,
      points: member.points,
      total_spent: member.total_spent,
      discount_percentage: member.discount_percentage,
      is_active: member.is_active,
    });
    setShowModal(true);
  };

  const handleDeleteMember = async (id: string) => {
    setDeleting(true);
    setDeleteError('');
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      await loadMembers();
      setMemberToDelete(null);
    } catch (error) {
      console.error('Failed to delete member:', error);
      setDeleteError('Gagal menghapus member. Silakan coba lagi.');
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setMemberToDelete(null);
    setDeleteError('');
  };

  const handleSaveMember = async () => {
    setFormError('');
    if (!formData.name || !formData.phone) {
      setFormError('Nama dan nomor HP wajib diisi');
      return;
    }

    try {
      const token = getToken();
      const url = editingMember ? `${API_BASE_URL}/api/customers/${editingMember.id}` : `${API_BASE_URL}/api/customers`;
      const method = editingMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save member');
      }

      await loadMembers();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save member:', error);
      setFormError('Gagal menyimpan member');
    }
  };

  const handleToggleActive = async (member: Member) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/customers/${member.id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle member status');
      }

      await loadMembers();
    } catch (error) {
      console.error('Failed to toggle member status:', error);
    }
  };

  const handleTierChange = (tier: 'bronze' | 'silver' | 'gold' | 'platinum') => {
    const config = TIER_CONFIG[tier];
    setFormData({
      ...formData,
      tier,
      discount_percentage: config.discount,
    });
  };

  const autoUpgradeTier = (totalSpent: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
    if (totalSpent >= TIER_CONFIG.platinum.minSpent) return 'platinum';
    if (totalSpent >= TIER_CONFIG.gold.minSpent) return 'gold';
    if (totalSpent >= TIER_CONFIG.silver.minSpent) return 'silver';
    return 'bronze';
  };

  const getTierIcon = (tier: string) => {
    const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
    const Icon = config?.icon || Shield;
    return <Icon className="h-4 w-4" />;
  };

  // Calculate statistics
  const totalMembers = filteredMembers.length;
  const activeMembers = filteredMembers.filter(m => m.is_active).length;
  const totalPoints = filteredMembers.reduce((sum, m) => sum + m.points, 0);
  const totalRevenue = filteredMembers.reduce((sum, m) => sum + m.total_spent, 0);

  return (
    <div className="flex h-dvh bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Pelanggan & CRM</h1>
              <p className="text-gray-600 mt-1">Kelola data member, tier, dan diskon otomatis</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Member</div>
                <div className="text-2xl font-bold text-gray-900">{totalMembers}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Member Aktif</div>
                <div className="text-2xl font-bold text-green-600">{activeMembers}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Poin</div>
                <div className="text-2xl font-bold text-purple-600">{totalPoints.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold text-gray-900">{formatRupiah(totalRevenue)}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari nama, nomor HP, atau email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Tier</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 hover:text-white flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Tambah Member
                </button>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Memuat data...</div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Tidak ada data member
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Belanja</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMembers.map((member) => {
                        const config = TIER_CONFIG[member.tier];
                        return (
                          <tr key={member.id || Math.random()} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <UserPlus className="h-5 w-5 text-gray-500" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(member.created_at).toLocaleDateString('id-ID')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                {member.phone}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {member.email ? (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  {member.email}
                                </div>
                              ) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                                {getTierIcon(member.tier)}
                                {member.tier.charAt(0).toUpperCase() + member.tier.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {member.discount_percentage}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-purple-400" />
                                {member.points.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatRupiah(member.total_spent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(member)}
                                className={`min-h-11 rounded-full px-3 py-1 text-xs font-medium ${
                                  member.is_active
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {member.is_active ? 'Aktif' : 'Nonaktif'}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleEditMember(member)}
                                  aria-label={`Edit member ${member.name}`}
                                  className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                                >
                                  <Edit className="size-4" aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteError('');
                                    setMemberToDelete(member);
                                  }}
                                  aria-label={`Hapus member ${member.name}`}
                                  className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:text-red-900"
                                >
                                  <Trash2 className="size-4" aria-hidden="true" />
                                </button>
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
          </div>
        </main>
      </div>

      {/* Add/Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              {editingMember ? 'Edit Member' : 'Tambah Member Baru'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nama lengkap"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => handleTierChange(e.target.value as any)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bronze">Bronze (5% diskon)</option>
                  <option value="silver">Silver (10% diskon)</option>
                  <option value="gold">Gold (15% diskon)</option>
                  <option value="platinum">Platinum (20% diskon)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poin Awal</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Belanja Awal</label>
                <input
                  type="number"
                  value={formData.total_spent}
                  onChange={(e) => setFormData({ ...formData, total_spent: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Member Aktif</label>
              </div>
            </div>
            
            {formError && (
              <p role="alert" className="mt-4 text-sm text-red-600">{formError}</p>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-gray-900"
              >
                Batal
              </button>
              <button
                onClick={handleSaveMember}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 hover:text-white"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(memberToDelete)}
        onClose={closeDeleteDialog}
        title="Hapus member?"
        role="alertdialog"
        descriptionId="delete-member-description"
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
              onClick={() => memberToDelete?.id && handleDeleteMember(memberToDelete.id)}
            >
              Hapus member
            </Button>
          </>
        }
      >
        <p id="delete-member-description" className="text-pretty text-sm text-ink-secondary">
          Member <strong className="text-ink">{memberToDelete?.name}</strong> akan dihapus permanen.
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
