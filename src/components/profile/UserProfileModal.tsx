'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { 
  updateUserProfile, 
  changeUserPassword, 
  updateUserPin, 
  getUserPreferences, 
  updateUserPreferences 
} from '@/src/lib/api';
import { getProfileInitials, formatRoleLabel } from '@/src/components/layout/UserProfileMenu';
import { 
  User, 
  Shield, 
  Sliders, 
  Camera, 
  Lock, 
  KeyRound, 
  Globe, 
  LayoutGrid, 
  List, 
  Volume2, 
  Printer, 
  Building2, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Mail,
  Phone,
  UserCheck,
  Smartphone
} from 'lucide-react';

type TabType = 'personal' | 'security' | 'preferences';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [loading, setLoading] = useState(false);

  // Tab 1: Personal Info
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Tab 2: Security & PIN
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [posPinEnabled, setPosPinEnabled] = useState(false);
  const [posPin, setPosPin] = useState('');

  // Tab 3: Preferences
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [productView, setProductView] = useState<'grid' | 'list'>('grid');
  const [soundFeedback, setSoundFeedback] = useState(true);
  const [defaultPrinter, setDefaultPrinter] = useState('Bluetooth Thermal Printer 80mm');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }

    async function loadPreferences() {
      try {
        const prefs = await getUserPreferences();
        if (prefs) {
          if (prefs.language) setLanguage(prefs.language);
          if (prefs.product_view) setProductView(prefs.product_view);
          if (typeof prefs.sound_feedback === 'boolean') setSoundFeedback(prefs.sound_feedback);
          if (prefs.default_printer) setDefaultPrinter(prefs.default_printer);
          if (typeof prefs.pos_pin_enabled === 'boolean') setPosPinEnabled(prefs.pos_pin_enabled);
        }
      } catch (err) {
        console.error('Failed to load user preferences:', err);
      }
    }

    if (isOpen) {
      loadPreferences();
    }
  }, [user, isOpen]);

  const displayName = fullName || user?.full_name || user?.username || 'Pengguna';
  const usernameText = user?.username ? `@${user.username}` : '@user';
  const roleText = user?.role ? formatRoleLabel(user.role) : 'Pengguna';
  const outletText = user?.outlet_name || 'Outlet Utama';
  const initials = getProfileInitials(displayName, user?.username || 'U');

  const handleSave = async () => {
    setLoading(true);
    try {
      if (activeTab === 'personal') {
        const res = await updateUserProfile({
          full_name: fullName,
          email: email.trim() || null,
          phone: phone.trim() || null,
        });
        if (res.success) {
          toast('success', 'Informasi profil berhasil diperbarui');
        }
      } else if (activeTab === 'security') {
        let passwordChanged = false;
        let pinChanged = false;

        if (newPassword || currentPassword) {
          if (!currentPassword) {
            toast('error', 'Masukkan kata sandi saat ini untuk mengubah kata sandi');
            setLoading(false);
            return;
          }
          if (newPassword !== confirmPassword) {
            toast('error', 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru');
            setLoading(false);
            return;
          }
          if (newPassword.length < 6) {
            toast('error', 'Kata sandi baru minimal 6 karakter');
            setLoading(false);
            return;
          }

          const res = await changeUserPassword({
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          });

          if (res.success) {
            passwordChanged = true;
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          }
        }

        if (posPinEnabled && posPin) {
          if (!/^\d{4,6}$/.test(posPin)) {
            toast('error', 'PIN POS harus 4-6 digit angka');
            setLoading(false);
            return;
          }
        }

        const pinRes = await updateUserPin({
          enabled: posPinEnabled,
          pin: posPin || undefined,
        });

        if (pinRes.success) {
          pinChanged = true;
          setPosPin('');
        }

        if (passwordChanged || pinChanged) {
          toast('success', 'Pengaturan keamanan dan PIN berhasil disimpan');
        }
      } else if (activeTab === 'preferences') {
        const updated = await updateUserPreferences({
          language,
          product_view: productView,
          sound_feedback: soundFeedback,
          default_printer: defaultPrinter,
        });

        if (updated) {
          toast('success', 'Preferensi POS & UI berhasil disimpan');
        }
      }
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan perubahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Profil Pengguna"
      size="lg"
    >
      <div className="space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-alt p-4">
          <div className="relative group shrink-0">
            <div className="flex size-14 items-center justify-center rounded-xl bg-primary-soft text-lg font-bold text-primary shadow-xs">
              {initials}
            </div>
            <button
              type="button"
              aria-label="Ubah foto profil"
              onClick={() => toast('info', 'Fitur unggah foto avatar akan segera tersedia')}
              className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-surface bg-primary text-on-primary shadow-md hover:scale-110"
            >
              <Camera className="size-3" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-ink truncate">{displayName}</h2>
              <Badge tone="primary" className="text-xs shrink-0">
                {roleText}
              </Badge>
            </div>
            <p className="text-xs font-medium text-ink-muted">{usernameText}</p>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 rounded bg-surface px-2 py-0.5 text-xs font-medium text-ink-secondary border border-line">
                <Building2 className="size-3 text-primary" aria-hidden="true" />
                {outletText}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-line">
          <nav className="-mb-px flex gap-4 overflow-x-auto scrollbar-hide" aria-label="Modal Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-1.5 border-b-2 pb-2 text-xs font-semibold transition-colors ${
                activeTab === 'personal'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              <User className="size-3.5" aria-hidden="true" />
              Info Profil
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-1.5 border-b-2 pb-2 text-xs font-semibold transition-colors ${
                activeTab === 'security'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              <Shield className="size-3.5" aria-hidden="true" />
              Keamanan & PIN
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-1.5 border-b-2 pb-2 text-xs font-semibold transition-colors ${
                activeTab === 'preferences'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-secondary hover:text-ink'
              }`}
            >
              <Sliders className="size-3.5" aria-hidden="true" />
              Preferensi POS
            </button>
          </nav>
        </div>

        {/* Tab 1 */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">Username (Disabled)</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full rounded-xl border border-line bg-surface-alt px-3 py-2 text-sm text-ink-muted opacity-75 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@restoran.com"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-ink">Nomor Telepon / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Ubah Kata Sandi</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-secondary mb-1">Konfirmasi Sandi Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <hr className="border-line" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Quick PIN Access POS</h4>
                  <p className="text-xs text-ink-secondary">PIN 4-6 digit untuk kunci/buka kasir cepat.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={posPinEnabled}
                    onChange={(e) => setPosPinEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-surface-alt border border-line after:absolute after:top-0.5 after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-xs after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {posPinEnabled && (
                <div className="max-w-xs">
                  <input
                    type="password"
                    maxLength={6}
                    value={posPin}
                    onChange={(e) => setPosPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="PIN 4-6 Digit"
                    className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-center text-sm font-bold tracking-widest outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3 */}
        {activeTab === 'preferences' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">Bahasa Antarmuka (Interface Language)</p>
                <p className="text-xs text-ink-secondary">Preferensi per user</p>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
                className="rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-medium outline-none focus:border-primary"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English (US)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">Tampilan Produk Kasir</p>
                <p className="text-xs text-ink-secondary">Preferensi per user</p>
              </div>
              <div className="inline-flex rounded-lg border border-line bg-surface-alt p-1">
                <button
                  type="button"
                  onClick={() => setProductView('grid')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${productView === 'grid' ? 'bg-surface text-primary shadow-xs' : 'text-ink-secondary'}`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setProductView('list')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded ${productView === 'list' ? 'bg-surface text-primary shadow-xs' : 'text-ink-secondary'}`}
                >
                  List
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">Efek Suara POS (Beep Sound)</p>
                <p className="text-xs text-ink-secondary">Preferensi per user</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={soundFeedback}
                  onChange={(e) => setSoundFeedback(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-surface-alt border border-line after:absolute after:top-0.5 after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-xs after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-ink">Printer Struk Personal (Local Device)</p>
                <p className="text-xs text-ink-secondary">Printer Bluetooth/Lokal milik kasir</p>
              </div>
              <input
                type="text"
                value={defaultPrinter}
                onChange={(e) => setDefaultPrinter(e.target.value)}
                className="w-48 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-line">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" size="sm" loading={loading} onClick={handleSave}>
            <Save className="size-3.5" aria-hidden="true" />
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
