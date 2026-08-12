'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Building2, ImageUp, Save, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { useToast } from '@/src/components/ui/Toast';
import { useCompany } from '@/src/context/CompanyContext';
import { API_BASE_URL } from '@/src/config/runtime';
import { getToken } from '@/src/lib/api';
import { useConfigStore } from '@/src/store/useConfigStore';

interface CompanyForm {
  name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  tax_id: string | null;
  company_registry: string | null;
  timezone: string;
  currency: string;
  tax_rate: number;
  service_charge: number;
}

const fieldClass = 'min-h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30';

export default function CompanySettingsPage() {
  const { toast } = useToast();
  const { refreshCompany } = useCompany();
  const setTaxRate = useConfigStore((state) => state.setTaxRate);
  const setServiceChargeRate = useConfigStore((state) => state.setServiceChargeRate);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [company, setCompany] = useState<CompanyForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [logoVersion, setLogoVersion] = useState(0);

  const request = useCallback(async (path = '', init?: RequestInit) => {
    const response = await fetch(`${API_BASE_URL}/api/company${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${getToken()}`, ...init?.headers },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new Error(body?.error || 'Permintaan konfigurasi perusahaan gagal.');
    return body as CompanyForm;
  }, []);

  const loadCompany = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setCompany(await request());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Gagal memuat konfigurasi perusahaan.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { void Promise.resolve().then(loadCompany); }, [loadCompany]);

  const updateField = <K extends keyof CompanyForm>(field: K, value: CompanyForm[K]) => {
    setCompany((current) => current ? { ...current, [field]: value } : current);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!company) return;
    setSaving(true);
    setError('');
    try {
      const updated = await request('', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });
      setCompany(updated);
      setTaxRate(updated.tax_rate);
      setServiceChargeRate(updated.service_charge);
      await refreshCompany();
      toast('success', 'Konfigurasi perusahaan berhasil disimpan.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Gagal menyimpan konfigurasi perusahaan.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const updated = await request('/logo', { method: 'POST', body: formData });
      setCompany(updated);
      setLogoVersion((version) => version + 1);
      await refreshCompany();
      toast('success', 'Logo perusahaan berhasil diperbarui.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Gagal mengunggah logo perusahaan.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    setUploading(true);
    setError('');
    try {
      const updated = await request('/logo', { method: 'DELETE' });
      setCompany(updated);
      setRemoveDialogOpen(false);
      await refreshCompany();
      toast('success', 'Logo perusahaan dihapus.');
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Gagal menghapus logo perusahaan.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div role="status" className="p-6 text-sm text-ink-secondary">Memuat konfigurasi perusahaan...</div>;

  if (!company) return (
    <div className="p-6">
      <div role="alert" className="rounded-xl border border-danger/30 bg-danger-soft p-5 text-danger">
        <p className="text-pretty text-sm">{error || 'Konfigurasi perusahaan belum tersedia.'}</p>
        <Button type="button" variant="secondary" className="mt-4" onClick={() => void loadCompany()}>Coba lagi</Button>
      </div>
    </div>
  );

  const logoSrc = company.logo_url ? `${company.logo_url}?v=${logoVersion}` : null;

  return (
    <main className="min-h-full bg-surface-alt p-4 sm:p-6">
      <form onSubmit={handleSave} className="mx-auto max-w-5xl space-y-6" aria-busy={saving || uploading}>
        <div>
          <h1 className="text-balance text-2xl font-semibold text-ink">Perusahaan</h1>
          <p className="mt-1 text-pretty text-sm text-ink-secondary">Identitas bisnis yang digunakan pada navigasi, struk, laporan, dan perhitungan biaya.</p>
        </div>

        {error && <p role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>}

        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6" aria-labelledby="company-identity-heading">
          <h2 id="company-identity-heading" className="text-balance text-lg font-semibold text-ink">Identitas perusahaan</h2>
          <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface-alt text-primary">
              {logoSrc ? (
                // Company logos are managed runtime API assets with reserved dimensions.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} alt={`Logo ${company.name}`} className="size-full object-contain" width={96} height={96} />
              ) : <Building2 className="size-10" aria-hidden="true" />}
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={fileInputRef} id="company-logo" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={handleLogoUpload} />
              <Button type="button" variant="secondary" loading={uploading} onClick={() => fileInputRef.current?.click()}><ImageUp className="size-4" aria-hidden="true" />Unggah logo</Button>
              {company.logo_url && <Button type="button" variant="ghost" disabled={uploading} onClick={() => setRemoveDialogOpen(true)}><Trash2 className="size-4" aria-hidden="true" />Hapus logo</Button>}
              <p className="w-full text-pretty text-xs text-ink-muted">PNG, JPEG, atau WebP. Maksimum 2 MB.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-ink">Nama perusahaan<span aria-hidden="true" className="text-danger"> *</span><input required maxLength={120} value={company.name} onChange={(e) => updateField('name', e.target.value)} className={`${fieldClass} mt-1.5`} /></label>
            <label className="text-sm font-medium text-ink">Email<input type="email" value={company.email ?? ''} onChange={(e) => updateField('email', e.target.value)} className={`${fieldClass} mt-1.5`} /></label>
            <label className="text-sm font-medium text-ink">Telepon<input type="tel" value={company.phone ?? ''} onChange={(e) => updateField('phone', e.target.value)} className={`${fieldClass} mt-1.5`} /></label>
            <label className="text-sm font-medium text-ink">Website<input type="url" placeholder="https://contoh.co.id" value={company.website ?? ''} onChange={(e) => updateField('website', e.target.value)} className={`${fieldClass} mt-1.5`} /></label>
            <label className="text-sm font-medium text-ink md:col-span-2">Alamat<textarea rows={3} value={company.address ?? ''} onChange={(e) => updateField('address', e.target.value)} className={`${fieldClass} mt-1.5 py-3`} /></label>
            <label className="text-sm font-medium text-ink">NPWP / Tax ID<input value={company.tax_id ?? ''} onChange={(e) => updateField('tax_id', e.target.value)} className={`${fieldClass} mt-1.5`} /></label>
            <label className="text-sm font-medium text-ink">Nomor registrasi perusahaan<input value={company.company_registry ?? ''} onChange={(e) => updateField('company_registry', e.target.value)} className={`${fieldClass} mt-1.5`} /></label>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6" aria-labelledby="company-defaults-heading">
          <h2 id="company-defaults-heading" className="text-balance text-lg font-semibold text-ink">Default operasional</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-ink">Zona waktu<select value={company.timezone} onChange={(e) => updateField('timezone', e.target.value)} className={`${fieldClass} mt-1.5`}><option value="Asia/Jakarta">WIB (Jakarta)</option><option value="Asia/Makassar">WITA (Makassar)</option><option value="Asia/Jayapura">WIT (Jayapura)</option></select></label>
            <label className="text-sm font-medium text-ink">Mata uang<select value={company.currency} onChange={(e) => updateField('currency', e.target.value)} className={`${fieldClass} mt-1.5`}><option value="IDR">IDR — Rupiah Indonesia</option></select></label>
            <label className="text-sm font-medium text-ink">Pajak / PPN (%)<input type="number" min="0" max="100" step="0.01" value={company.tax_rate} onChange={(e) => updateField('tax_rate', Number(e.target.value))} className={`${fieldClass} mt-1.5 tabular-nums`} /></label>
            <label className="text-sm font-medium text-ink">Biaya layanan (%)<input type="number" min="0" max="100" step="0.01" value={company.service_charge} onChange={(e) => updateField('service_charge', Number(e.target.value))} className={`${fieldClass} mt-1.5 tabular-nums`} /></label>
          </div>
        </section>

        <div className="flex justify-end"><Button type="submit" loading={saving}><Save className="size-4" aria-hidden="true" />Simpan perusahaan</Button></div>
      </form>

      <Modal isOpen={removeDialogOpen} onClose={() => !uploading && setRemoveDialogOpen(false)} title="Hapus logo perusahaan?" role="alertdialog" descriptionId="remove-company-logo-description" closeOnBackdrop={!uploading}>
        <p id="remove-company-logo-description" className="text-pretty text-sm text-ink-secondary">Header dan dokumen akan kembali menggunakan inisial perusahaan.</p>
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" disabled={uploading} onClick={() => setRemoveDialogOpen(false)}>Batal</Button><Button type="button" variant="danger" loading={uploading} onClick={() => void handleRemoveLogo()}>Hapus logo</Button></div>
      </Modal>
    </main>
  );
}
