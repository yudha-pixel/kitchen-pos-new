'use client';

import { useState } from 'react';
import { History, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export interface AuditLogItem {
  timestamp: string;
  user: string;
  action: string;
  type?: 'create' | 'submit' | 'approve' | 'convert' | 'reject' | 'cancel';
}

export interface DocumentChatterProps {
  entityType: 'purchase_requisition' | 'purchase_order' | 'quotation' | 'goods_received' | 'invoice';
  entityId: string;
  initialLogs?: AuditLogItem[];
  onAddComment?: (comment: string) => void;
}

export function DocumentChatter({ entityType, entityId, initialLogs = [], onAddComment }: DocumentChatterProps) {
  const [commentText, setCommentText] = useState('');
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newLog: AuditLogItem = {
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      user: 'admin',
      action: `Catatan Internal: "${commentText.trim()}"`,
      type: 'submit',
    };

    setLogs(prev => [newLog, ...prev]);
    onAddComment?.(commentText.trim());
    setCommentText('');
  };

  const getDotColor = (type?: string) => {
    switch (type) {
      case 'approve':
        return 'bg-emerald-500';
      case 'convert':
        return 'bg-indigo-500';
      case 'reject':
      case 'cancel':
        return 'bg-rose-500';
      case 'submit':
        return 'bg-blue-500';
      default:
        return 'bg-amber-500';
    }
  };

  return (
    <div className="bg-surface border border-line rounded-xl p-4 shadow-lg space-y-4 text-ink">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
          <History className="h-4 w-4 text-primary" />
          Riwayat & Audit Log
        </h3>
        <span className="text-[10px] font-semibold bg-primary-soft text-primary px-2 py-0.5 rounded-full">
          {logs.length} Event
        </span>
      </div>

      {/* Vertical Timeline */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-center py-6 text-xs text-ink-muted">
            Belum ada log aktivitas tercatat
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg border border-line bg-surface-alt/40 flex items-start gap-2.5 text-xs transition-colors hover:bg-surface-alt"
            >
              <div className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${getDotColor(log.type)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink truncate">{log.user}</span>
                  <span className="text-ink-muted text-[10px] shrink-0 ml-1">{log.timestamp}</span>
                </div>
                <p className="text-ink-secondary text-[11px] mt-0.5 leading-snug">{log.action}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handlePostComment} className="pt-3 border-t border-line space-y-2">
        <label className="text-[11px] font-semibold text-ink-muted flex items-center gap-1">
          <MessageSquare className="h-3 w-3 text-primary" />
          Tambah Catatan Internal:
        </label>
        <textarea
          rows={2}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Tulis catatan staf / memo internal..."
          className="w-full rounded-lg border border-line bg-surface p-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!commentText.trim()}
          className="w-full flex items-center justify-center gap-1.5 text-xs py-1.5"
        >
          <Send className="h-3 w-3" />
          Kirim Catatan
        </Button>
      </form>
    </div>
  );
}
