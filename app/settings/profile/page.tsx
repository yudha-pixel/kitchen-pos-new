'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Menu } from '@base-ui/react/menu';
import { usePageHeaderContext } from '@/src/context/PageHeaderContext';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  fetchRoles, 
  fetchOutlets, 
  sendPasswordResetEmailApi,
  type UserRecord 
} from '@/src/lib/api';
import { getProfileInitials, formatRoleLabel } from '@/src/components/layout/UserProfileMenu';
import { 
  Users, 
  UserPlus, 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  RefreshCw,
  Save,
  Camera,
  KeyRound,
  UserCheck,
  Sliders,
  Globe,
  LayoutGrid,
  List,
  Volume2,
  Lock,
  MoreVertical,
  RotateCcw,
  Smartphone
} from 'lucide-react';

type ViewMode = 'list' | 'form';
type FormTab = 'access' | 'contact' | 'security';

export default function UsersManagementPage() {
  const { can } = useAuth();
  const { toast } = useToast();
  const { setConfig } = usePageHeaderContext();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; description?: string | null }>>([]);
  const [outlets, setOutlets] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // View & Edit Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formTab, setFormTab] = useState<FormTab>('access');
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [outletId, setOutletId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Preferences State
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [productView, setProductView] = useState<'grid' | 'list'>('grid');
  const [soundFeedback, setSoundFeedback] = useState(true);
  const [posPinEnabled, setPosPinEnabled] = useState(false);
  const [posPin, setPosPin] = useState('');

  // 1. Single Clean Navbar Breadcrumb Setup (No duplication & no chevron clutter)
  useEffect(() => {
    if (viewMode === 'list') {
      setConfig({
        title: 'Data Pengguna',
        breadcrumbs: [
          { label: 'Pengaturan', href: '/settings' },
          { label: 'Data Pengguna' },
        ],
      });
    } else {
      const userLabel = selectedUser ? (selectedUser.full_name || selectedUser.username) : 'Pengguna Baru';
      setConfig({
        title: userLabel,
        breadcrumbs: [
          { label: 'Pengaturan', href: '/settings' },
          { label: 'Data Pengguna', href: '#', onClick: () => handleSwitchToList() },
          { label: userLabel },
        ],
      });
    }
  }, [setConfig, viewMode, selectedUser, fullName, username]);

  // Load Data from Backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData, outletsData] = await Promise.all([
        fetchUsers().catch(() => []),
        fetchRoles().catch(() => []),
        fetchOutlets().catch(() => []),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
      setOutlets(outletsData || []);
    } catch (err: any) {
      toast('error', err.message || 'Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch = 
        !searchQuery ||
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role.name === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const total = users.length;
    const admin = users.filter((u) => u.role.name === 'admin' || u.role.name === 'owner').length;
    const cashier = users.filter((u) => u.role.name === 'cashier' || u.role.name === 'waiter').length;
    const active = users.filter((u) => u.is_active).length;
    return { total, admin, cashier, active };
  }, [users]);

  // Open Form View (Detail Mode by Default, or Edit/Create Mode if new)
  const handleOpenFormView = (userRecord?: UserRecord | null) => {
    if (userRecord) {
      setSelectedUser(userRecord);
      setUsername(userRecord.username);
      setPassword('');
      setFullName(userRecord.full_name || '');
      setEmail(userRecord.email || '');
      setPhone(userRecord.phone || '');
      setRoleId(userRecord.role_id || (roles[0]?.id || ''));
      setOutletId(userRecord.outlet_id || (outlets[0]?.id || ''));
      setIsActive(userRecord.is_active);
      setIsEditing(false); // 5. Default to Detail/Read-only Mode when inspecting existing user!
    } else {
      setSelectedUser(null);
      setUsername('');
      setPassword('');
      setFullName('');
      setEmail('');
      setPhone('');
      setRoleId(roles[0]?.id || '');
      setOutletId(outlets[0]?.id || '');
      setIsActive(true);
      setIsEditing(true); // Create mode is always editable!
    }
    setFormTab('access');
    setViewMode('form');
  };

  // Switch back to List View
  const handleSwitchToList = () => {
    setViewMode('list');
    setSelectedUser(null);
    setIsEditing(false);
  };

  // Cancel Editing in Form View
  const handleCancelEdit = () => {
    if (!selectedUser) {
      handleSwitchToList();
      return;
    }
    // Revert to original user values and exit edit mode
    setUsername(selectedUser.username);
    setPassword('');
    setFullName(selectedUser.full_name || '');
    setEmail(selectedUser.email || '');
    setPhone(selectedUser.phone || '');
    setRoleId(selectedUser.role_id || '');
    setOutletId(selectedUser.outlet_id || '');
    setIsActive(selectedUser.is_active);
    setIsEditing(false);
    toast('info', 'Perubahan dibatalkan');
  };

  // Form Save Submit Handler
  const handleSaveForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!username.trim()) {
      toast('error', 'Username harus diisi');
      return;
    }

    if (!selectedUser && (!password || password.length < 6)) {
      toast('error', 'Kata sandi baru minimal 6 karakter');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedUser) {
        // Update user
        const updated = await updateUser(selectedUser.id, {
          full_name: fullName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          role_id: roleId || undefined,
          outlet_id: outletId || undefined,
          is_active: isActive,
        });
        toast('success', `Data pengguna ${username} berhasil disimpan`);
        setSelectedUser(updated);
      } else {
        // Create new user
        await createUser({
          username: username.trim(),
          password: password,
          full_name: fullName.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          role_id: roleId || undefined,
          outlet_id: outletId || undefined,
        });
        toast('success', `Pengguna baru ${username} berhasil dibuat`);
      }

      await loadData();
      setIsEditing(false);
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan data pengguna');
    } finally {
      setSubmitting(false);
    }
  };

  // Send Reset Password Email via SMTP
  const handleSendResetPasswordEmail = async () => {
    if (!selectedUser) return;
    try {
      toast('info', 'Mengirim email reset password via SMTP...');
      const res = await sendPasswordResetEmailApi(selectedUser.id);
      toast('success', res.message || `Email reset password telah dikirim ke ${selectedUser.email || selectedUser.username}`);
    } catch (err: any) {
      toast('error', err.message || 'Gagal mengirim email reset password');
    }
  };

  // Toggle Status Action from Triple-Dot Menu
  const handleToggleFormUserStatus = async () => {
    if (!selectedUser) return;
    try {
      const nextActive = !isActive;
      setIsActive(nextActive);
      const updated = await updateUser(selectedUser.id, { is_active: nextActive });
      toast('success', `Status akun ${selectedUser.username} diubah menjadi ${nextActive ? 'Aktif' : 'Non-aktif'}`);
      setSelectedUser(updated);
      loadData();
    } catch (err: any) {
      toast('error', err.message || 'Gagal memperbarui status pengguna');
    }
  };

  const getRoleBadgeTone = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case 'admin':
      case 'owner':
        return 'primary';
      case 'cashier':
        return 'info';
      case 'waiter':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const selectedRoleObj = roles.find((r) => r.id === roleId);
  const roleNameLabel = selectedRoleObj ? formatRoleLabel(selectedRoleObj.name) : (selectedUser ? formatRoleLabel(selectedUser.role.name) : 'Administrator');
  const roleBadgeTone = selectedRoleObj ? getRoleBadgeTone(selectedRoleObj.name) : (selectedUser ? getRoleBadgeTone(selectedUser.role.name) : 'primary');
  const userInitials = getProfileInitials(fullName || selectedUser?.full_name, username || selectedUser?.username || 'U');

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <>
          {/* Header Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink">Data Pengguna</h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Kelola akun kasir, admin, dan staff restoran serta hak akses sistem POS
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={loadData}
                loading={loading}
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Refresh
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleOpenFormView(null)}
              >
                <UserPlus className="size-4" aria-hidden="true" />
                Tambah Pengguna
              </Button>
            </div>
          </div>

          {/* Summary Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="appearance-card rounded-2xl border border-line bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Total Pengguna</span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Users className="size-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-ink">{stats.total}</p>
            </div>

            <div className="appearance-card rounded-2xl border border-line bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Administrator</span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-info-soft text-info">
                  <Shield className="size-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-ink">{stats.admin}</p>
            </div>

            <div className="appearance-card rounded-2xl border border-line bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Kasir & Waiter</span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-warning-soft text-warning">
                  <UserCheck className="size-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-ink">{stats.cashier}</p>
            </div>

            <div className="appearance-card rounded-2xl border border-line bg-surface p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted">Akun Aktif</span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-success-soft text-success">
                  <CheckCircle2 className="size-5" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-ink">{stats.active}</p>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="appearance-card flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pengguna berdasarkan nama, username, atau email..."
                className="w-full rounded-xl border border-line bg-surface pl-10 pr-4 py-2 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-secondary shrink-0">Filter Peran:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-primary"
              >
                <option value="all">Semua Peran</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {formatRoleLabel(r.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="appearance-card overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-ink">
                <thead className="border-b border-line bg-surface-alt text-xs font-bold uppercase tracking-wider text-ink-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Pengguna</th>
                    <th scope="col" className="px-6 py-3.5">Peran (Role)</th>
                    <th scope="col" className="px-6 py-3.5">Kontak</th>
                    <th scope="col" className="px-6 py-3.5">Outlet</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-ink-muted">
                        Memuat data pengguna...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-ink-muted">
                        Tidak ada pengguna ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const initials = getProfileInitials(u.full_name, u.username);
                      const roleLabel = formatRoleLabel(u.role.name);
                      const tone = getRoleBadgeTone(u.role.name);

                      return (
                        <tr 
                          key={u.id} 
                          onClick={() => handleOpenFormView(u)}
                          className="cursor-pointer transition-colors hover:bg-primary-soft/30 group"
                        >
                          {/* Pengguna Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-bold text-primary transition-transform group-hover:scale-105">
                                {initials}
                              </div>
                              <div>
                                <p className="font-semibold text-ink group-hover:text-primary transition-colors">{u.full_name || u.username}</p>
                                <p className="text-xs text-ink-muted">@{u.username}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Column */}
                          <td className="px-6 py-4">
                            <Badge tone={tone} className="font-medium">
                              {roleLabel}
                            </Badge>
                          </td>

                          {/* Contact Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-0.5 text-xs text-ink-secondary">
                              {u.email && (
                                <div className="flex items-center gap-1.5">
                                  <Mail className="size-3.5 text-ink-muted" aria-hidden="true" />
                                  <span className="truncate max-w-[180px]">{u.email}</span>
                                </div>
                              )}
                              {u.phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone className="size-3.5 text-ink-muted" aria-hidden="true" />
                                  <span>{u.phone}</span>
                                </div>
                              )}
                              {!u.email && !u.phone && <span className="text-ink-muted">-</span>}
                            </div>
                          </td>

                          {/* Outlet Column */}
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
                              <Building2 className="size-3.5 text-primary" aria-hidden="true" />
                              {u.outlet?.name || 'Outlet Utama'}
                            </span>
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.is_active ? 'text-success' : 'text-danger'}`}>
                              {u.is_active ? (
                                <>
                                  <CheckCircle2 className="size-3.5" aria-hidden="true" />
                                  Aktif
                                </>
                              ) : (
                                <>
                                  <XCircle className="size-3.5" aria-hidden="true" />
                                  Non-aktif
                                </>
                              )}
                            </span>
                          </td>

                          {/* Action Column */}
                          <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenFormView(u)}
                                title="Lihat detail pengguna"
                              >
                                <Edit3 className="size-3.5" aria-hidden="true" />
                                Detail
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW MODE 2: ERP RES.USERS FORM VIEW */}
      {viewMode === 'form' && (
        <form onSubmit={handleSaveForm} className="space-y-6">
          {/* Main ERP res.users Form Sheet Card */}
          <div className="appearance-card rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-6">
            {/* Header Sheet Banner: Avatar + Headline Name + Status Badges + Right Action Menu */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between border-b border-line pb-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start flex-1 min-w-0">
                {/* Big Avatar Widget */}
                <div className="relative group shrink-0">
                  <div className="flex size-24 items-center justify-center rounded-2xl bg-primary-soft text-3xl font-extrabold text-primary shadow-xs">
                    {userInitials}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      aria-label="Ubah Foto Avatar"
                      onClick={() => toast('info', 'Fitur unggah foto avatar akan segera tersedia')}
                      className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-surface bg-primary text-on-primary shadow-md hover:scale-110"
                    >
                      <Camera className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Name & Headline Field + Badges */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                        Nama Pengguna
                      </label>
                      <Badge tone={roleBadgeTone} className="font-semibold text-xs">
                        {roleNameLabel}
                      </Badge>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isActive ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                      }`}>
                        {isActive ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="e.g. Budi Santoso"
                      className={`w-full text-2xl font-extrabold text-ink bg-transparent border-b-2 border-line outline-none transition-all py-1 ${
                        isEditing ? 'focus:border-primary border-primary/50' : 'border-transparent'
                      }`}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-ink-secondary mb-1">
                        Username / Login
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-muted text-xs font-medium">@</span>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={!isEditing || !!selectedUser}
                          placeholder="e.g. kasir1"
                          className={`w-full rounded-xl border border-line bg-surface pl-8 pr-3 py-2 text-sm text-ink outline-none ${
                            isEditing && !selectedUser ? 'focus:border-primary' : 'bg-surface-alt/70 opacity-80 cursor-not-allowed'
                          }`}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-secondary mb-1">
                        Outlet Penugasan Utama
                      </label>
                      <select
                        value={outletId}
                        onChange={(e) => setOutletId(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none ${
                          isEditing ? 'focus:border-primary' : 'bg-surface-alt/70 opacity-80 cursor-not-allowed'
                        }`}
                      >
                        {outlets.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Sheet Actions: Save/Cancel when isEditing, Triple-Dot Action Menu when !isEditing */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                {isEditing ? (
                  <>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      loading={submitting}
                    >
                      <Save className="size-4" aria-hidden="true" />
                      Simpan
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleCancelEdit}
                      disabled={submitting}
                    >
                      Batal
                    </Button>
                  </>
                ) : (
                  <Menu.Root>
                    <Menu.Trigger
                      aria-label="Aksi Pengguna"
                      className="flex size-10 items-center justify-center rounded-xl border border-line bg-surface-alt hover:bg-surface text-ink outline-none transition-colors"
                    >
                      <MoreVertical className="size-4 text-ink-secondary" aria-hidden="true" />
                    </Menu.Trigger>

                    <Menu.Portal>
                      <Menu.Positioner sideOffset={6} align="end" className="z-50">
                        <Menu.Popup
                          aria-label="Menu Aksi"
                          className="w-56 rounded-xl border border-line bg-surface p-1.5 text-ink shadow-lg outline-none"
                        >
                          <Menu.Item
                            onClick={() => setIsEditing(true)}
                            className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-xs font-semibold text-ink outline-none hover:bg-surface-alt"
                          >
                            <Edit3 className="size-4 text-primary" />
                            Edit Pengguna
                          </Menu.Item>
                          {selectedUser && (
                            <>
                              <Menu.Item
                                onClick={handleToggleFormUserStatus}
                                className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-xs font-semibold outline-none ${
                                  isActive ? 'text-danger hover:bg-danger-soft' : 'text-success hover:bg-success-soft'
                                }`}
                              >
                                {isActive ? <XCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
                                {isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                              </Menu.Item>
                              <Menu.Item
                                onClick={handleSendResetPasswordEmail}
                                className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-xs font-semibold text-ink outline-none hover:bg-surface-alt"
                              >
                                <KeyRound className="size-4 text-ink-muted" />
                                Kirim Reset Password
                              </Menu.Item>
                            </>
                          )}
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.Root>
                )}
              </div>
            </div>

            {/* ERP Notebook / Tabbed Section */}
            <div className="space-y-6">
              {/* Notebook Tab Bar */}
              <div className="border-b border-line">
                <nav className="-mb-px flex gap-6 overflow-x-auto scrollbar-hide" aria-label="Notebook Tabs">
                  <button
                    type="button"
                    onClick={() => setFormTab('access')}
                    className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-bold transition-all ${
                      formTab === 'access'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-ink-secondary hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    <Shield className="size-4" aria-hidden="true" />
                    Hak Akses & Peran (Access Rights)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTab('contact')}
                    className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-bold transition-all ${
                      formTab === 'contact'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-ink-secondary hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    <Sliders className="size-4" aria-hidden="true" />
                    Kontak & Preferensi POS
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormTab('security')}
                    className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-bold transition-all ${
                      formTab === 'security'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-ink-secondary hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    <Lock className="size-4" aria-hidden="true" />
                    Keamanan & PIN Kasir
                  </button>
                </nav>
              </div>

              {/* Notebook Tab 1: Access Rights (Hak Akses & Peran) */}
              {formTab === 'access' && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Role Selection */}
                    <div className="space-y-3 rounded-2xl border border-line bg-surface-alt/50 p-5">
                      <div className="flex items-center gap-2">
                        <Shield className="size-5 text-primary" />
                        <h3 className="text-sm font-bold text-ink">Peran Utama (User Role)</h3>
                      </div>
                      <p className="text-xs text-ink-secondary">
                        Menentukan grup otorisasi dan akses aplikasi yang dapat dibuka oleh pengguna.
                      </p>

                      <select
                        value={roleId}
                        onChange={(e) => setRoleId(e.target.value)}
                        disabled={!isEditing}
                        className={`w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink outline-none ${
                          isEditing ? 'focus:border-primary' : 'bg-surface-alt opacity-80 cursor-not-allowed'
                        }`}
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {formatRoleLabel(r.name)} — {r.description || 'Akses Modul'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Allowed Outlets */}
                    <div className="space-y-3 rounded-2xl border border-line bg-surface-alt/50 p-5">
                      <div className="flex items-center gap-2">
                        <Building2 className="size-5 text-primary" />
                        <h3 className="text-sm font-bold text-ink">Outlet Diizinkan (Multi-Outlet)</h3>
                      </div>
                      <p className="text-xs text-ink-secondary">
                        Restoran/cabang yang diizinkan untuk dikelola oleh akun pengguna ini.
                      </p>

                      <div className="space-y-2">
                        {outlets.map((o) => (
                          <label key={o.id} className="flex items-center gap-2.5 text-xs font-semibold text-ink cursor-pointer">
                            <input
                              type="checkbox"
                              checked={outletId === o.id}
                              onChange={() => isEditing && setOutletId(o.id)}
                              disabled={!isEditing}
                              className="size-4 rounded border-line text-primary focus:ring-primary disabled:opacity-75"
                            />
                            {o.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Access Capability Overview */}
                  <div className="rounded-2xl border border-line bg-surface p-5 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Matriks Akses Modul POS & ERP</h4>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-alt px-3 py-2 text-xs font-semibold text-ink">
                        <CheckCircle2 className="size-4 text-success" />
                        Point of Sale (POS)
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-alt px-3 py-2 text-xs font-semibold text-ink">
                        <CheckCircle2 className="size-4 text-success" />
                        Kitchen Display System (KDS)
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-alt px-3 py-2 text-xs font-semibold text-ink">
                        <CheckCircle2 className="size-4 text-success" />
                        Katalog Produk & Menu
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-alt px-3 py-2 text-xs font-semibold text-ink">
                        <CheckCircle2 className="size-4 text-success" />
                        Manajemen Inventori & Stok
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-alt px-3 py-2 text-xs font-semibold text-ink">
                        <CheckCircle2 className="size-4 text-success" />
                        Laporan Operasional
                      </div>
                      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-alt px-3 py-2 text-xs font-semibold text-ink">
                        <CheckCircle2 className="size-4 text-success" />
                        Pengaturan Sistem
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notebook Tab 2: Contact & Preferences */}
              {formTab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">Alamat Email</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-muted">
                          <Mail className="size-4" />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={!isEditing}
                          placeholder="kasir@restoran.com"
                          className={`w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 py-2.5 text-sm text-ink outline-none ${
                            isEditing ? 'focus:border-primary' : 'bg-surface-alt opacity-80 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">Nomor Telepon / WhatsApp</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-muted">
                          <Phone className="size-4" />
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditing}
                          placeholder="081234567890"
                          className={`w-full rounded-xl border border-line bg-surface pl-10 pr-3.5 py-2.5 text-sm text-ink outline-none ${
                            isEditing ? 'focus:border-primary' : 'bg-surface-alt opacity-80 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-line" />

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">Preferensi Tampilan POS (ERP Style)</h4>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-line bg-surface-alt p-4">
                        <div>
                          <p className="text-xs font-bold text-ink">Bahasa Antarmuka</p>
                          <p className="text-[11px] text-ink-secondary">Bahasa pengantar aplikasi</p>
                        </div>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
                          disabled={!isEditing}
                          className={`rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink outline-none ${
                            isEditing ? 'focus:border-primary' : 'bg-surface-alt opacity-80 cursor-not-allowed'
                          }`}
                        >
                          <option value="id">Bahasa Indonesia</option>
                          <option value="en">English (US)</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-line bg-surface-alt p-4">
                        <div>
                          <p className="text-xs font-bold text-ink">Tampilan Katalog POS</p>
                          <p className="text-[11px] text-ink-secondary">Grid Gambar vs List Ringkas</p>
                        </div>
                        <div className="inline-flex rounded-lg border border-line bg-surface p-1">
                          <button
                            type="button"
                            onClick={() => isEditing && setProductView('grid')}
                            disabled={!isEditing}
                            className={`px-2.5 py-1 text-xs font-semibold rounded ${productView === 'grid' ? 'bg-primary-soft text-primary' : 'text-ink-secondary'}`}
                          >
                            Grid
                          </button>
                          <button
                            type="button"
                            onClick={() => isEditing && setProductView('list')}
                            disabled={!isEditing}
                            className={`px-2.5 py-1 text-xs font-semibold rounded ${productView === 'list' ? 'bg-primary-soft text-primary' : 'text-ink-secondary'}`}
                          >
                            List
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notebook Tab 3: Security & PIN */}
              {formTab === 'security' && (
                <div className="space-y-6">
                  {/* Password section */}
                  <div className="space-y-3 rounded-2xl border border-line bg-surface-alt/50 p-5">
                    <h3 className="text-sm font-bold text-ink">Kata Sandi Akun (Password)</h3>
                    <p className="text-xs text-ink-secondary">
                      {selectedUser ? 'Kosongkan jika Anda tidak ingin merubah kata sandi pengguna ini.' : 'Masukkan kata sandi untuk akun pengguna baru.'}
                    </p>

                    <div className="max-w-md space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        Kata Sandi Baru {selectedUser ? '' : <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Minimal 6 karakter"
                        className={`w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink outline-none ${
                          isEditing ? 'focus:border-primary' : 'bg-surface-alt opacity-80 cursor-not-allowed'
                        }`}
                        required={!selectedUser}
                      />
                    </div>
                  </div>

                  {/* POS Quick Access PIN section */}
                  <div className="space-y-4 rounded-2xl border border-line bg-surface-alt/50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-ink">PIN Cepat Layar POS (Numeric PIN)</h3>
                        <p className="text-xs text-ink-secondary">PIN 4-6 digit angka untuk mengunci & membuka layar kasir.</p>
                      </div>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={posPinEnabled}
                          onChange={(e) => isEditing && setPosPinEnabled(e.target.checked)}
                          disabled={!isEditing}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-surface-alt border border-line after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-xs after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full disabled:opacity-75"></div>
                      </label>
                    </div>

                    {posPinEnabled && (
                      <div className="max-w-xs space-y-1">
                        <label className="block text-xs font-semibold text-ink">Set PIN POS (4-6 Digit)</label>
                        <input
                          type="password"
                          maxLength={6}
                          value={posPin}
                          onChange={(e) => setPosPin(e.target.value.replace(/\D/g, ''))}
                          disabled={!isEditing}
                          placeholder="Contoh: 123456"
                          className={`w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-center text-base font-bold tracking-widest text-ink outline-none ${
                            isEditing ? 'focus:border-primary' : 'bg-surface-alt opacity-80 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
