'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { usePageHeaderContext } from '@/src/context/PageHeaderContext';
import { 
  fetchEmailTemplates, 
  updateEmailTemplate, 
  resetEmailTemplate, 
  type EmailTemplateRecord 
} from '@/src/lib/api';
import { 
  FileCode, 
  Save, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Eye, 
  RotateCcw,
  Sparkles,
  Code,
  Info
} from 'lucide-react';

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const { setConfig } = usePageHeaderContext();

  const [templates, setTemplates] = useState<EmailTemplateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateRecord | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Form Fields
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Single Clean Navbar Breadcrumb
  useEffect(() => {
    if (viewMode === 'list') {
      setConfig({
        title: 'Template Email',
        breadcrumbs: [
          { label: 'Pengaturan', href: '/settings' },
          { label: 'Template Email' },
        ],
      });
    } else {
      const tplName = selectedTemplate?.name || 'Detail Template';
      setConfig({
        title: tplName,
        breadcrumbs: [
          { label: 'Pengaturan', href: '/settings' },
          { label: 'Template Email', href: '#', onClick: () => handleSwitchToList() },
          { label: tplName },
        ],
      });
    }
  }, [setConfig, viewMode, selectedTemplate]);

  // Load Email Templates
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchEmailTemplates();
      setTemplates(data || []);
    } catch (err: any) {
      toast('error', err.message || 'Gagal memuat template email');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenFormView = (tpl: EmailTemplateRecord) => {
    setSelectedTemplate(tpl);
    setSubject(tpl.subject);
    setBodyHtml(tpl.body_html);
    setIsActive(tpl.is_active);
    setActiveTab('editor');
    setViewMode('form');
  };

  const handleSwitchToList = () => {
    setViewMode('list');
    setSelectedTemplate(null);
  };

  // Save Template Changes
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTemplate) return;

    if (!subject.trim()) {
      toast('error', 'Subjek email wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateEmailTemplate(selectedTemplate.id, {
        subject: subject.trim(),
        body_html: bodyHtml,
        is_active: isActive,
      });

      toast('success', res.message || 'Template email berhasil disimpan');
      await loadData();
      setViewMode('list');
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan template email');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset Template to System Default
  const handleResetDefault = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await resetEmailTemplate(selectedTemplate.id);
      setSubject(res.template.subject);
      setBodyHtml(res.template.body_html);
      setIsActive(res.template.is_active);
      toast('success', res.message || 'Template direset ke nilai default');
      loadData();
    } catch (err: any) {
      toast('error', err.message || 'Gagal mereset template');
    }
  };

  // Insert Variable Chip into Subject or Body
  const handleInsertVariable = (varName: string) => {
    const varTag = `{{${varName}}}`;
    setBodyHtml((prev) => prev + varTag);
    toast('info', `Disisipkan ${varTag}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <>
          {/* Header Banner */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
                <FileCode className="size-6 text-primary" aria-hidden="true" />
                Template Email Sistem
              </h1>
              <p className="mt-1 text-sm text-ink-secondary">
                Kelola subjek, pesan HTML, dan variabel dinamis template email notifikasi & reset password.
              </p>
            </div>

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
          </div>

          {/* Templates Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full py-12 text-center text-sm text-ink-muted">
                Memuat template email...
              </div>
            ) : templates.length === 0 ? (
              <div className="col-span-full py-12 text-center text-sm text-ink-muted">
                Belum ada template email terdaftar.
              </div>
            ) : (
              templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleOpenFormView(tpl)}
                  className="appearance-card group flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary font-bold">
                        <FileCode className="size-5" />
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        tpl.is_active ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                      }`}>
                        {tpl.is_active ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                        {tpl.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-ink group-hover:text-primary transition-colors">{tpl.name}</h3>
                      <p className="mt-1 text-xs text-ink-muted line-clamp-2">{tpl.description || 'Tidak ada deskripsi'}</p>
                    </div>

                    <div className="rounded-xl border border-line bg-surface-alt p-3 text-xs">
                      <span className="font-bold text-ink-muted">Subjek:</span>
                      <p className="mt-0.5 font-medium text-ink truncate">{tpl.subject}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <span className="text-[11px] font-mono text-ink-muted">code: {tpl.code}</span>
                    <Button variant="ghost" size="sm">
                      <Edit3 className="size-3.5" />
                      Edit Template
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* VIEW MODE 2: FORM / EDITOR VIEW */}
      {viewMode === 'form' && selectedTemplate && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Main Template Sheet Card */}
          <div className="appearance-card rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-6">
            {/* Header Sheet Banner */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-line pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-ink">{selectedTemplate.name}</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isActive ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
                  }`}>
                    {isActive ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary">{selectedTemplate.description}</p>
                <span className="inline-block text-[11px] font-mono text-primary font-bold">Kode Template: {selectedTemplate.code}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleResetDefault}
                  title="Reset template ke standar sistem"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Reset Default
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={submitting}
                >
                  <Save className="size-4" aria-hidden="true" />
                  Simpan Template
                </Button>
              </div>
            </div>

            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
                Subjek Email <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. [Kitchen POS] Reset Password Akun {{username}}"
                className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink outline-none focus:border-primary"
                required
              />
            </div>

            {/* Variable Chips Bar */}
            {selectedTemplate.variables && (selectedTemplate.variables as string[]).length > 0 && (
              <div className="rounded-xl border border-line bg-surface-alt/60 p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  Variabel Dinamis Yang Tersedia (Klik untuk menyisipkan)
                </span>
                <div className="flex flex-wrap gap-2">
                  {(selectedTemplate.variables as string[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleInsertVariable(v)}
                      className="rounded-lg border border-primary/30 bg-primary-soft px-2.5 py-1 text-xs font-mono font-bold text-primary hover:bg-primary hover:text-on-primary transition-all"
                    >
                      {`{{${v}}}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab Bar Editor vs Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`flex items-center gap-2 border-b-2 pb-2 text-xs font-bold transition-all ${
                      activeTab === 'editor' ? 'border-primary text-primary' : 'border-transparent text-ink-secondary hover:text-ink'
                    }`}
                  >
                    <Code className="size-4" />
                    Editor HTML Email
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-2 border-b-2 pb-2 text-xs font-bold transition-all ${
                      activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-ink-secondary hover:text-ink'
                    }`}
                  >
                    <Eye className="size-4" />
                    Live Preview Tampilan
                  </button>
                </div>
              </div>

              {/* Tab Editor */}
              {activeTab === 'editor' && (
                <div className="space-y-1.5">
                  <textarea
                    rows={16}
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    placeholder="<body>HTML Content</body>"
                    className="w-full rounded-xl border border-line bg-surface p-4 font-mono text-xs text-ink outline-none focus:border-primary leading-relaxed"
                  />
                </div>
              )}

              {/* Tab Preview */}
              {activeTab === 'preview' && (
                <div className="rounded-xl border border-line bg-surface-alt p-6 min-h-[300px]">
                  <div className="mb-4 pb-3 border-b border-line">
                    <span className="text-xs text-ink-muted">Simulasi Subjek:</span>
                    <p className="font-bold text-ink text-sm">{subject}</p>
                  </div>

                  <div 
                    className="bg-white rounded-lg p-6 border border-line text-ink text-sm shadow-xs overflow-auto max-h-[500px]"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
