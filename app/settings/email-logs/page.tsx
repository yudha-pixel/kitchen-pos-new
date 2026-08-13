'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Modal } from '@/src/components/ui/Modal';
import { usePageHeaderContext } from '@/src/context/PageHeaderContext';
import { 
  fetchEmailLogs, 
  resendEmailLog, 
  type EmailLogRecord 
} from '@/src/lib/api';
import { 
  MailCheck, 
  Search, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Info,
  Mail
} from 'lucide-react';

export default function EmailLogsPage() {
  const { toast } = useToast();
  const { setConfig } = usePageHeaderContext();

  const [logs, setLogs] = useState<EmailLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<EmailLogRecord | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  // Set Single Clean Navbar Breadcrumb
  useEffect(() => {
    setConfig({
      title: 'Log Email Terkirim',
      breadcrumbs: [
        { label: 'Pengaturan', href: '/settings' },
        { label: 'Log Email Terkirim' },
      ],
    });
  }, [setConfig]);

  // Load Sent Email Logs
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchEmailLogs(statusFilter, searchQuery);
      setLogs(data || []);
    } catch (err: any) {
      toast('error', err.message || 'Gagal memuat log email terkirim');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Handle Search Input Submit or Debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Resend Email from Log
  const handleResend = async (log: EmailLogRecord) => {
    setResendingId(log.id);
    try {
      toast('info', `Mengirim ulang email ke ${log.recipient}...`);
      const res = await resendEmailLog(log.id);
      toast('success', res.message || `Email berhasil dikirim ulang ke ${log.recipient}`);
      await loadData();
    } catch (err: any) {
      toast('error', err.message || 'Gagal mengirim ulang email');
    } finally {
      setResendingId(null);
    }
  };

  // Status Tone Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
            <CheckCircle2 className="size-3.5" />
            TERKIRIM (SENT)
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3 py-1 text-xs font-bold text-danger">
            <XCircle className="size-3.5" />
            GAGAL (FAILED)
          </span>
        );
      case 'SIMULATED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-info-soft px-3 py-1 text-xs font-bold text-info">
            <Info className="size-3.5" />
            SIMULATED LOG
          </span>
        );
      default:
        return <Badge tone="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink flex items-center gap-2">
            <MailCheck className="size-6 text-primary" aria-hidden="true" />
            Log Email Terkirim
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Riwayat log pengiriman email otomatis sistem, status pengiriman via SMTP, serta opsi kirim ulang.
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

      {/* Filter & Search Toolbar */}
      <form onSubmit={handleSearchSubmit} className="appearance-card flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan email penerima atau subjek email..."
            className="w-full rounded-xl border border-line bg-surface pl-10 pr-4 py-2 text-sm text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink-secondary shrink-0">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink outline-none focus:border-primary"
          >
            <option value="all">Semua Status</option>
            <option value="SENT">Terkirim (SENT)</option>
            <option value="FAILED">Gagal (FAILED)</option>
            <option value="SIMULATED">Simulasi (SIMULATED)</option>
          </select>
        </div>
      </form>

      {/* Email Logs Data Table */}
      <div className="appearance-card overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-ink">
            <thead className="border-b border-line bg-surface-alt text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th scope="col" className="px-6 py-3.5">Penerima (To)</th>
                <th scope="col" className="px-6 py-3.5">Subjek Email</th>
                <th scope="col" className="px-6 py-3.5">Template</th>
                <th scope="col" className="px-6 py-3.5">Status Pengiriman</th>
                <th scope="col" className="px-6 py-3.5">Waktu Pengiriman</th>
                <th scope="col" className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-ink-muted">
                    Memuat log email terkirim...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-ink-muted">
                    Belum ada riwayat email terkirim.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="transition-colors hover:bg-primary-soft/20">
                    {/* Recipient */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-primary shrink-0" />
                        <span className="font-semibold text-ink">{log.recipient}</span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink truncate max-w-[280px]">{log.subject}</p>
                    </td>

                    {/* Template Code */}
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-surface-alt px-2.5 py-1 text-xs font-mono font-bold text-ink-secondary">
                        {log.template_code || 'Direct Mail'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(log.status)}
                    </td>

                    {/* Sent Date */}
                    <td className="px-6 py-4 text-xs text-ink-secondary">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3.5 text-ink-muted" />
                        {new Date(log.sent_at).toLocaleString('id-ID')}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          title="Lihat Detail Log"
                        >
                          <Eye className="size-3.5" />
                          Detail
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResend(log)}
                          loading={resendingId === log.id}
                          title="Kirim ulang email ini"
                        >
                          <Send className="size-3.5" />
                          Kirim Ulang
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Drawer Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Detail Log Pengiriman Email"
        >
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-line bg-surface-alt p-4 space-y-2">
              <div>
                <span className="text-xs font-bold text-ink-muted uppercase">Penerima Email:</span>
                <p className="font-semibold text-ink">{selectedLog.recipient}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-ink-muted uppercase">Subjek Email:</span>
                <p className="font-semibold text-ink">{selectedLog.subject}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-ink-muted uppercase">Status & Message ID:</span>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedLog.status)}
                  <span className="text-xs font-mono text-ink-muted">{selectedLog.message_id || '-'}</span>
                </div>
              </div>

              {selectedLog.error_message && (
                <div className="mt-3 rounded-lg border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
                  <strong>Error Log:</strong> {selectedLog.error_message}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setSelectedLog(null)}
              >
                Tutup
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => {
                  handleResend(selectedLog);
                  setSelectedLog(null);
                }}
              >
                <Send className="size-4" />
                Kirim Ulang Sekarang
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
