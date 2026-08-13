'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { DocumentSequenceMap, DEFAULT_DOCUMENT_SEQUENCES } from '@/server/lib/sequence';
import { SequenceListView } from './SequenceListView';
import { SequenceFormView, SequenceRecord } from './SequenceFormView';

const DOC_METADATA_MAP: Record<string, { name: string; code: string; category: SequenceRecord['category'] }> = {
  pr: { name: 'Permintaan Dapur (PR)', code: 'purchase.requisition', category: 'purchasing' },
  quotation: { name: 'Penawaran Harga (QT)', code: 'purchase.quotation', category: 'purchasing' },
  po: { name: 'Pesanan Pembelian (PO)', code: 'purchase.order', category: 'purchasing' },
  grn: { name: 'Penerimaan Barang (GRN)', code: 'goods.received.note', category: 'inventory' },
  invoice: { name: 'Faktur Supplier (INV)', code: 'vendor.invoice', category: 'purchasing' },
  pos_receipt: { name: 'Nota Kasir (POS)', code: 'pos.receipt', category: 'sales' },
};

export function SequenceSettings() {
  const { toast } = useToast();
  const [sequencesMap, setSequencesMap] = useState<DocumentSequenceMap>(DEFAULT_DOCUMENT_SEQUENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active view: List View ('list') or Form View ('form')
  const [activeView, setActiveView] = useState<'list' | 'form'>('list');
  const [selectedSequence, setSelectedSequence] = useState<SequenceRecord | null>(null);

  const fetchSequences = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/settings/sequences`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSequencesMap({ ...DEFAULT_DOCUMENT_SEQUENCES, ...data });
      }
    } catch (error) {
      console.error('Failed to fetch document sequences:', error);
      toast('error', 'Gagal memuat pengaturan sequence');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSequences();
  }, [fetchSequences]);

  // Convert DocumentSequenceMap into SequenceRecord array for List View
  const sequenceRecords: SequenceRecord[] = Object.entries(sequencesMap).map(([key, rule]) => {
    const meta = DOC_METADATA_MAP[key] || {
      name: key.toUpperCase(),
      code: `doc.${key}`,
      category: 'purchasing',
    };
    return {
      id: key,
      name: meta.name,
      code: meta.code,
      category: meta.category,
      prefix: rule.prefix,
      suffix: rule.suffix,
      padding: rule.padding,
      next_number: rule.next_number,
      reset_frequency: rule.reset_frequency,
      last_reset_year: rule.last_reset_year,
      last_reset_month: rule.last_reset_month,
    };
  });

  const handleSelectSequence = (seq: SequenceRecord) => {
    setSelectedSequence(seq);
    setActiveView('form');
  };

  const handleCreateNew = () => {
    const newSeq: SequenceRecord = {
      id: `custom_${Date.now()}`,
      name: 'Custom Sequence Baru',
      code: 'custom.sequence',
      category: 'purchasing',
      prefix: 'DOC/',
      suffix: '',
      padding: 4,
      next_number: 1,
      reset_frequency: 'never',
    };
    setSelectedSequence(newSeq);
    setActiveView('form');
  };

  const handleSaveForm = async (updatedSeq: SequenceRecord) => {
    setSaving(true);
    try {
      const key = updatedSeq.id;
      const updatedMap: Partial<DocumentSequenceMap> = {
        [key]: {
          prefix: updatedSeq.prefix,
          suffix: updatedSeq.suffix,
          padding: updatedSeq.padding,
          next_number: updatedSeq.next_number,
          reset_frequency: updatedSeq.reset_frequency,
          last_reset_year: updatedSeq.last_reset_year,
          last_reset_month: updatedSeq.last_reset_month,
        },
      };

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/settings/sequences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedMap),
      });

      if (response.ok) {
        toast('success', `Sequence ${updatedSeq.name} berhasil disimpan`);
        await fetchSequences();
        setActiveView('list');
      } else {
        toast('error', 'Gagal menyimpan sequence');
      }
    } catch (error) {
      toast('error', 'Terjadi kesalahan sistem');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {activeView === 'form' && selectedSequence ? (
        <SequenceFormView
          sequence={selectedSequence}
          onSave={handleSaveForm}
          onClose={() => setActiveView('list')}
          saving={saving}
        />
      ) : (
        <SequenceListView
          sequences={sequenceRecords}
          onSelectSequence={handleSelectSequence}
          onCreateNew={handleCreateNew}
          loading={loading}
        />
      )}
    </div>
  );
}
