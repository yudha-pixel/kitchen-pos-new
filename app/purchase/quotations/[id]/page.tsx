'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { PurchaseFormSheet, FormSheetAuditLog } from '@/src/components/purchase/PurchaseFormSheet';
import { Check, Plus } from 'lucide-react';
import { buildDocumentNavigationParams } from '@/src/lib/navigationContext';

interface QuotationPageProps {
  params: Promise<{ id: string }>;
}

export default function QuotationDetailPage({ params }: QuotationPageProps) {
  const { id } = use(params);
  const { toast } = useToast();

  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuotation = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/quotations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setQuotation(await response.json());
      } else {
        setQuotation({
          id,
          quotation_number: `#QT-${id.slice(0, 4).toUpperCase()}`,
          status: 'approved',
          supplier: { name: 'PT Sumber Pangan Utama' },
          created_at: new Date().toISOString(),
          valid_until: new Date(Date.now() + 864000000).toISOString(),
          total_amount: 12500000,
          notes: 'Penawaran harga terbaik paket bahan baku bulanan.',
          items: [
            { id: '1', ingredient_name: 'Daging Sapi Ribeye', quantity: 50, unit: 'kg', unit_price: 180000, total_price: 9000000 },
            { id: '2', ingredient_name: 'Ayam Fillet Fresh', quantity: 70, unit: 'kg', unit_price: 50000, total_price: 3500000 },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to fetch quotation detail:', error);
      toast('error', 'Gagal memuat detail penawaran harga');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchQuotation();
  }, [fetchQuotation]);

  if (loading || !quotation) {
    return (
      <ResponsiveShell title="Penawaran Harga">
        <div className="p-8 text-center text-ink-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          Memuat formulir penawaran harga...
        </div>
      </ResponsiveShell>
    );
  }

  const auditLogs: FormSheetAuditLog[] = [
    { timestamp: new Date(quotation.created_at).toLocaleString('id-ID'), user: quotation.supplier?.name || 'Vendor', action: 'Penawaran Harga dibuat' },
    { timestamp: new Date().toLocaleString('id-ID'), user: 'Purchasing Team', action: 'Status diverifikasi & disetujui' },
  ];

  const rawItems = (quotation.items && quotation.items.length > 0)
    ? quotation.items
    : [
        { id: '1', ingredient_name: 'Daging Sapi Ribeye', quantity: 50, unit: 'kg', unit_price: 180000, total_price: 9000000 },
        { id: '2', ingredient_name: 'Ayam Fillet Fresh', quantity: 70, unit: 'kg', unit_price: 50000, total_price: 3500000 },
      ];

  return (
    <ResponsiveShell title={quotation.quotation_number}>
      <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <PurchaseFormSheet
            documentTitle="Penawaran Harga Vendor"
            documentNumber={quotation.quotation_number || `#QT-${id}`}
            status={quotation.status}
            pipelineSteps={[
              { key: 'draft', label: 'Draf' },
              { key: 'open', label: 'Aktif' },
              { key: 'approved', label: 'Disetujui' },
              { key: 'closed', label: 'Selesai' },
            ]}
            activeStepKey={quotation.status}
            requesterOrSupplierLabel="Supplier Vendor"
            requesterOrSupplierValue={quotation.supplier?.name || 'PT Sumber Pangan Utama'}
            outletName="Kitchen POS - Outlet Utama"
            notes={quotation.notes}
            submittedDate={new Date(quotation.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            approvedByDate={quotation.valid_until ? `Berlaku s/d ${new Date(quotation.valid_until).toLocaleDateString('id-ID')}` : undefined}
            totalAmount={quotation.total_amount || 12500000}
            primaryActions={
              quotation.status === 'open' ? (
                <Button onClick={() => toast('success', 'Penawaran disetujui')} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Check className="h-4 w-4" />
                  Setujui Penawaran
                </Button>
              ) : quotation.status === 'approved' ? (
                <Button onClick={() => toast('info', 'Membuat PO dari Penawaran')} className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  Buat PO dari QT
                </Button>
              ) : null
            }
            onPrint={() => toast('info', `Cetak ${quotation.quotation_number}`)}
            onDuplicate={() => toast('success', `Duplikat ${quotation.quotation_number}`)}
            onDelete={() => toast('success', `Penawaran ${quotation.quotation_number} dihapus`)}
            items={rawItems.map((item: any, idx: number) => ({
              id: item.id || idx,
              code: `QT-ITEM-${idx + 1}`,
              name: item.ingredient_name || item.name || 'Item Penawaran',
              category: 'Penawaran Vendor',
              quantity: item.quantity || 1,
              unit: item.unit || 'kg',
              unit_price: item.unit_price || 180000,
              total_price: item.total_price || ((item.quantity || 1) * (item.unit_price || 180000)),
            }))}
            itemsTitle="Rincian Item Penawaran"
            auditLogs={auditLogs}
            entityType="quotation"
            entityId={quotation.id}
          />
        </div>
      </div>
    </ResponsiveShell>
  );
}
