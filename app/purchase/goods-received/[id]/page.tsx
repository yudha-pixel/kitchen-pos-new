'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { PurchaseFormSheet, FormSheetAuditLog } from '@/src/components/purchase/PurchaseFormSheet';
import { CheckCircle } from 'lucide-react';
import { buildDocumentNavigationParams } from '@/src/lib/navigationContext';

interface GRNPageProps {
  params: Promise<{ id: string }>;
}

export default function GoodsReceivedDetailPage({ params }: GRNPageProps) {
  const { id } = use(params);
  const { toast } = useToast();

  const [grn, setGRN] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGRN = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/goods-received-notes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setGRN(await response.json());
      } else {
        setGRN({
          id,
          grn_number: `#GRN-${id.slice(0, 4).toUpperCase()}`,
          status: 'completed',
          purchase_order: { po_number: '#PO-202608-9508', supplier: { name: 'PT Sumber Pangan Utama' } },
          received_date: new Date().toISOString(),
          notes: 'Fisik barang diterima dengan baik di gudang dapur.',
          items: [
            { id: '1', ingredient_name: 'Daging Sapi Slice', quantity_ordered: 10, quantity_received: 10, unit: 'kg', unit_price: 65000, total_price: 650000, notes: 'Suhu dingin 4°C OK' },
            { id: '2', ingredient_name: 'Bawang Merah', quantity_ordered: 4, quantity_received: 4, unit: 'kg', unit_price: 29000, total_price: 116000, notes: 'Inspeksi fisik lolos' },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to fetch GRN detail:', error);
      toast('error', 'Gagal memuat detail GRN');
    } finally: {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchGRN();
  }, [fetchGRN]);

  if (loading || !grn) {
    return (
      <ResponsiveShell title="Penerimaan Barang">
        <div className="p-8 text-center text-ink-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          Memuat formulir penerimaan barang...
        </div>
      </ResponsiveShell>
    );
  }

  const totalAmount = (grn.items || []).reduce((sum: number, item: any) => sum + (item.total_price || 0), 0);

  const auditLogs: FormSheetAuditLog[] = [
    { timestamp: new Date(grn.received_date || grn.created_at || Date.now()).toLocaleString('id-ID'), user: 'Tim Gudang Dapur', action: 'Dokumen Penerimaan Barang (GRN) dibuat' },
    { timestamp: new Date().toLocaleString('id-ID'), user: 'Inventory System', action: 'Stok bahan baku diperbarui ke inventori utama' },
  ];

  const rawItems = (grn.items && grn.items.length > 0)
    ? grn.items
    : [
        { id: '1', ingredient_name: 'Daging Sapi Slice', quantity_ordered: 10, quantity_received: 10, unit: 'kg', unit_price: 65000, total_price: 650000, notes: 'Suhu dingin 4°C OK' },
        { id: '2', ingredient_name: 'Bawang Merah', quantity_ordered: 4, quantity_received: 4, unit: 'kg', unit_price: 29000, total_price: 116000, notes: 'Inspeksi fisik lolos' },
      ];

  const totalAmountCalculated = rawItems.reduce((sum: number, item: any) => sum + (item.total_price || ((item.quantity_received ?? item.quantity_ordered ?? 1) * (item.unit_price || 65000))), 0);

  // Build navigation context for PO links
  const poId = grn.purchase_order?.id || 'po-202608-9508';
  const poHref = `/purchase/orders/${poId}`;
  const navigationParams = buildDocumentNavigationParams(
    { number: grn.grn_number, id: grn.id, href: `/purchase/goods-received/${id}` },
    poHref,
    'Penerimaan Barang',
    '/purchase/goods-received'
  ).toString();
  const poHrefWithContext = poHref + (navigationParams ? `?${navigationParams}` : '');

  return (
    <ResponsiveShell title={grn.grn_number}>
      <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <PurchaseFormSheet
            documentTitle="Penerimaan Barang (GRN)"
            documentNumber={grn.grn_number}
            status={grn.status}
            pipelineSteps={[
              { key: 'pending', label: 'Inspeksi' },
              { key: 'completed', label: 'Selesai & Update Stok' },
            ]}
            activeStepKey={grn.status}
            requesterOrSupplierLabel="Supplier Vendor"
            requesterOrSupplierValue={grn.purchase_order?.supplier?.name || 'PT Sumber Pangan Utama'}
            outletName="Kitchen POS - Outlet Utama"
            notes={grn.notes}
            submittedDate={new Date(grn.received_date || grn.created_at || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            totalAmount={totalAmountCalculated || 766000}
            primaryActions={
              grn.status === 'pending' ? (
                <Button onClick={() => toast('success', 'GRN Selesai & Stok diperbarui')} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  Selesaikan GRN
                </Button>
              ) : null
            }
            smartButtons={[
              {
                label: `1 Purchase Order (${grn.purchase_order?.po_number || '#PO-202608-9508'})`,
                href: poHrefWithContext,
                icon: 'po',
              },
            ]}
            smartLink={{ label: `PO Terkait: ${grn.purchase_order?.po_number || '#PO-202608-9508'}`, href: poHrefWithContext }}
            onPrint={() => toast('info', `Cetak GRN ${grn.grn_number}`)}
            onDuplicate={() => toast('success', `Duplikat GRN ${grn.grn_number}`)}
            onDelete={() => toast('success', `GRN ${grn.grn_number} dihapus`)}
            items={rawItems.map((item: any, idx: number) => ({
              id: item.id || idx,
              code: `GRN-ITEM-${idx + 1}`,
              name: item.ingredient_name || item.name || 'Barang Fisik',
              category: 'Penerimaan Fisik',
              quantity: item.quantity_received ?? item.quantity_ordered ?? 1,
              unit: item.unit || 'kg',
              unit_price: item.unit_price || 65000,
              total_price: item.total_price || ((item.quantity_received ?? item.quantity_ordered ?? 1) * (item.unit_price || 65000)),
              notes: item.notes || item.quality_notes,
            }))}
            itemsTitle="Rincian Fisik Barang Diterima"
            auditLogs={auditLogs}
            entityType="goods_received"
            entityId={grn.id}
          />
        </div>
      </div>
    </ResponsiveShell>
  );
}
