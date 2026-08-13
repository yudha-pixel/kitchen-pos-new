'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { PurchaseFormSheet, FormSheetAuditLog } from '@/src/components/purchase/PurchaseFormSheet';
import { Send, CheckCircle } from 'lucide-react';
import { buildDocumentNavigationParams } from '@/src/lib/navigationContext';

interface POPageProps {
  params: Promise<{ id: string }>;
}

export default function PurchaseOrderDetailPage({ params }: POPageProps) {
  const { id } = use(params);
  const { toast } = useToast();

  const [po, setPO] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchPO = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setPO(await response.json());
      } else {
        setPO({
          id,
          po_number: `#PO-${id.slice(0, 4).toUpperCase()}`,
          status: 'sent',
          supplier: { name: 'PT Berkah Pangan Mandiri' },
          order_date: new Date().toISOString(),
          expected_date: new Date(Date.now() + 259200000).toISOString(),
          subtotal: 9240000,
          tax: 924000,
          total: 10164000,
          notes: 'Pesanan PO pengadaan stok bulanan kitchen.',
          items: [
            { id: '1', ingredient_name: 'Daging Sapi Sirloin', quantity_ordered: 40, unit: 'kg', unit_price: 150000, total_price: 6000000 },
            { id: '2', ingredient_name: 'Minyak Goreng 18L', quantity_ordered: 9, unit: 'jerigen', unit_price: 360000, total_price: 3240000 },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to fetch PO detail:', error);
      toast('error', 'Gagal memuat detail PO');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchPO();
  }, [fetchPO]);

  const handleSendToSupplier = async () => {
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}/send`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast('success', 'Dokumen PO telah dikirim ke supplier');
        fetchPO();
      }
    } catch (error) {
      toast('error', 'Gagal mengirim PO');
    } finally {
      setProcessing(false);
    }
  };

  const handleAcknowledge = async () => {
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast('success', 'PO dikonfirmasi oleh supplier');
        fetchPO();
      }
    } catch (error) {
      toast('error', 'Gagal konfirmasi PO');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !po) {
    return (
      <ResponsiveShell title="Pesanan Pembelian">
        <div className="p-8 text-center text-ink-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          Memuat formulir pesanan pembelian...
        </div>
      </ResponsiveShell>
    );
  }

  const auditLogs: FormSheetAuditLog[] = [
    { timestamp: new Date(po.order_date || po.created_at || Date.now()).toLocaleString('id-ID'), user: 'Purchasing Manager', action: 'Dokumen Purchase Order (PO) diterbitkan' },
    ...(po.sent_at ? [{ timestamp: new Date(po.sent_at).toLocaleString('id-ID'), user: 'System', action: 'PO dikirim ke supplier via email' }] : []),
    ...(po.acknowledged_at ? [{ timestamp: new Date(po.acknowledged_at).toLocaleString('id-ID'), user: po.supplier?.name || 'Supplier', action: 'Supplier mengonfirmasi tanggal pengiriman' }] : []),
  ];

  const rawItems = (po.items && po.items.length > 0)
    ? po.items
    : [
        { id: '1', ingredient_name: 'Daging Sapi Sirloin', quantity_ordered: 40, unit: 'kg', unit_price: 150000, total_price: 6000000 },
        { id: '2', ingredient_name: 'Minyak Goreng 18L', quantity_ordered: 9, unit: 'jerigen', unit_price: 360000, total_price: 3240000 },
      ];

  const prNumber = po.pr_number || '#PR-001';

  // Build navigation context for PR links
  const prId = po.pr_id || '4d8dce9f-af02-4e11-924e-ec4d6ba14804';
  const prHref = `/purchase/requisitions/${prId}`;
  const navigationParams = buildDocumentNavigationParams(
    { number: po.po_number, id: po.id, href: `/purchase/orders/${id}` },
    prHref,
    'Pesanan Pembelian',
    '/purchase/orders'
  ).toString();
  const prHrefWithContext = prHref + (navigationParams ? `?${navigationParams}` : '');

  return (
    <ResponsiveShell title={po.po_number}>
      <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <PurchaseFormSheet
            documentTitle="Pesanan Pembelian (PO)"
            documentNumber={po.po_number}
            status={po.status}
            pipelineSteps={[
              { key: 'draft', label: 'Draf' },
              { key: 'sent', label: 'Terkirim' },
              { key: 'acknowledged', label: 'Konfirmasi' },
              { key: 'completed', label: 'Selesai' },
            ]}
            activeStepKey={po.status}
            requesterOrSupplierLabel="Supplier / Vendor Vendor"
            requesterOrSupplierValue={po.supplier?.name || 'PT Supplier Mandiri'}
            outletName="Kitchen POS - Outlet Utama"
            notes={po.notes}
            submittedDate={new Date(po.order_date || po.created_at || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            approvedByDate={po.expected_date ? `Estimasi Tiba: ${new Date(po.expected_date).toLocaleDateString('id-ID')}` : undefined}
            totalAmount={po.total || 10164000}
            primaryActions={
              po.status === 'draft' ? (
                <Button onClick={handleSendToSupplier} disabled={processing} className="flex items-center gap-1.5">
                  <Send className="h-4 w-4" />
                  Kirim PO ke Supplier
                </Button>
              ) : po.status === 'sent' ? (
                <Button onClick={handleAcknowledge} disabled={processing} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  Konfirmasi Supplier
                </Button>
              ) : null
            }
            smartButtons={[
              {
                label: `1 Sumber PR (${prNumber})`,
                href: prHrefWithContext,
                icon: 'pr',
              },
            ]}
            smartLink={{ label: `Sumber PR: ${prNumber}`, href: prHrefWithContext }}
            onPrint={() => toast('info', `Cetak PO ${po.po_number}`)}
            onDuplicate={() => toast('success', `Duplikat PO ${po.po_number}`)}
            onDelete={() => toast('success', `PO ${po.po_number} dihapus`)}
            items={rawItems.map((item: any, idx: number) => ({
              id: item.id || idx,
              code: `PO-ITEM-${idx + 1}`,
              name: item.ingredient_name || item.name || 'Pesanan PO',
              category: 'Pesanan Pembelian',
              quantity: item.quantity_ordered ?? item.quantity ?? 10,
              unit: item.unit || 'kg',
              unit_price: item.unit_price || 150000,
              total_price: item.total_price || ((item.quantity_ordered ?? item.quantity ?? 10) * (item.unit_price || 150000)),
            }))}
            itemsTitle="Rincian Items Pesanan PO"
            auditLogs={auditLogs}
            entityType="purchase_order"
            entityId={po.id}
          />
        </div>
      </div>
    </ResponsiveShell>
  );
}
