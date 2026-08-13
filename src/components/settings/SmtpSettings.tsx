'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/Button';
import { useToast } from '@/src/components/ui/Toast';
import { 
  fetchSmtpSettings, 
  updateSmtpSettings, 
  testSmtpConnection, 
  type SmtpSettingsData 
} from '@/src/lib/api';
import { 
  Mail, 
  Server, 
  KeyRound, 
  User, 
  ShieldCheck, 
  Send, 
  Save, 
  CheckCircle2, 
  RefreshCw,
  HelpCircle,
  Zap
} from 'lucide-react';

export function SmtpSettings() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('Kitchen POS Notification');
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [testRecipient, setTestRecipient] = useState('');

  // Load SMTP Settings from Backend
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSmtpSettings();
      setSmtpHost(data.smtp_host || '');
      setSmtpPort(data.smtp_port || 587);
      setSmtpUser(data.smtp_user || '');
      setSmtpPass(data.smtp_pass || '');
      setSmtpFromEmail(data.smtp_from_email || '');
      setSmtpFromName(data.smtp_from_name || 'Kitchen POS');
      setSmtpSecure(data.smtp_secure ?? true);
    } catch (err: any) {
      toast('error', err.message || 'Gagal memuat pengaturan SMTP');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save SMTP Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSmtpSettings({
        smtp_host: smtpHost.trim(),
        smtp_port: Number(smtpPort),
        smtp_user: smtpUser.trim(),
        smtp_pass: smtpPass,
        smtp_from_email: smtpFromEmail.trim(),
        smtp_from_name: smtpFromName.trim(),
        smtp_secure: smtpSecure,
      });
      toast('success', 'Pengaturan server SMTP email berhasil disimpan');
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan pengaturan SMTP');
    } finally {
      setSaving(false);
    }
  };

  // Test SMTP Connection
  const handleTestConnection = async () => {
    if (!smtpHost.trim()) {
      toast('error', 'Masukkan Server SMTP Host terlebih dahulu');
      return;
    }

    setTesting(true);
    try {
      toast('info', 'Menghubungkan ke server SMTP...');
      const res = await testSmtpConnection({
        smtp_host: smtpHost.trim(),
        smtp_port: Number(smtpPort),
        smtp_user: smtpUser.trim(),
        smtp_pass: smtpPass,
        smtp_from_email: smtpFromEmail.trim(),
        smtp_from_name: smtpFromName.trim(),
        smtp_secure: smtpSecure,
        test_recipient: testRecipient.trim() || undefined,
      });

      toast('success', res.message || 'Koneksi ke server SMTP berhasil!');
    } catch (err: any) {
      toast('error', err.message || 'Gagal terhubung ke server SMTP');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-ink-muted">
        Memuat pengaturan server SMTP...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink flex items-center gap-2">
            <Mail className="size-5 text-primary" aria-hidden="true" />
            Pengaturan Server SMTP & Email
          </h2>
          <p className="text-xs text-ink-secondary">
            Konfigurasi layanan pengiriman email otomatis untuk fitur Reset Password, Notifikasi Stok, dan Laporan Kasir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={loadData}
            loading={loading}
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Refresh
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={saving}
          >
            <Save className="size-3.5" aria-hidden="true" />
            Simpan SMTP
          </Button>
        </div>
      </div>

      {/* Main SMTP Config Fields */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Server Credentials */}
        <div className="space-y-4 rounded-2xl border border-line bg-surface-alt/40 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-2">
            <Server className="size-4 text-primary" />
            Kredensial Server SMTP
          </h3>

          {/* SMTP Host */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-ink">
              Server Host SMTP <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="e.g. smtp.gmail.com atau smtp.mailtrap.io"
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              required
            />
          </div>

          {/* SMTP Port */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink">Port SMTP</label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                placeholder="587 / 465"
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>

            {/* SSL/TLS Toggle */}
            <div className="space-y-1 flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  className="size-4 rounded border-line text-primary focus:ring-primary"
                />
                <span className="text-xs font-semibold text-ink">Gunakan SSL / TLS</span>
              </label>
            </div>
          </div>

          {/* SMTP User */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-ink">Username / Email Login SMTP</label>
            <input
              type="text"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="e.g. pos-admin@restoran.com"
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>

          {/* SMTP Password */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-ink">Password / App Password SMTP</label>
            <input
              type="password"
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="Password rahasia atau Google App Password"
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Right Column: Sender Info & Connection Test */}
        <div className="space-y-6">
          {/* Sender Info Card */}
          <div className="space-y-4 rounded-2xl border border-line bg-surface-alt/40 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-2">
              <User className="size-4 text-primary" />
              Identitas Pengirim Email
            </h3>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink">Nama Pengirim (From Name)</label>
              <input
                type="text"
                value={smtpFromName}
                onChange={(e) => setSmtpFromName(e.target.value)}
                placeholder="e.g. Kitchen POS System"
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink">Email Pengirim (From Email)</label>
              <input
                type="email"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
                placeholder="e.g. noreply@kitchenpos.com"
                className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Connection Testing Card */}
          <div className="space-y-3 rounded-2xl border border-line bg-primary-soft/30 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              Uji Koneksi & Pengiriman Test Email
            </h3>
            <p className="text-xs text-ink-secondary">
              Masukkan alamat email Anda di bawah untuk menguji apakah server SMTP siap mengirimkan email reset password.
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="email-anda@domain.com (Opsional)"
                className="flex-1 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs text-ink outline-none focus:border-primary"
              />
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleTestConnection}
                loading={testing}
              >
                <Send className="size-3.5" aria-hidden="true" />
                Uji Koneksi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
