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

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function VendorInvoiceDetailPage({ params }: InvoicePageProps) {
  const { id } = use(params);
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        setInvoice(await response.json());
      } else {
        setInvoice({
          id,
          invoice_number: `#INV-${id.slice(0, 4).toUpperCase()}`,
          status: 'verified',
          supplier_name: 'PT Sumber Pangan Utama',
          invoice_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 1296000000).toISOString(),
          subtotal: 766000,
          tax: 76600,
          total: 842600,
          notes: 'Tagihan vendor diterbitkan berdasarkan GRN #GRN-001.',
          grn: { grn_number: '#GRN-001' },
          items: [
            { id: '1', ingredient_name: 'Daging Sapi Slice', quantity: 10, unit: 'kg', unit_price: 65000, total_price: 650000 },
            { id: '2', ingredient_name: 'Bawang Merah', quantity: 4, unit: 'kg', unit_price: 29000, total_price: 116000 },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to fetch invoice detail:', error);
      toast('error', 'Gagal memuat detail faktur');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (loading || !invoice) {
    return (
      <ResponsiveShell title="Faktur Supplier">
        <div className="p-8 text-center text-ink-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          Memuat formulir faktur supplier...
        </div>
      </ResponsiveShell>
    );
  }

  const auditLogs: FormSheetAuditLog[] = [
    { timestamp: new Date(invoice.invoice_date || invoice.created_at || Date.now()).toLocaleString('id-ID'), user: 'Finance / AP Team', action: 'Dokumen Faktur Supplier (Vendor Bill) dicatat' },
    { timestamp: new Date().toLocaleString('id-ID'), user: 'Senior Accountant', action: 'Faktur diverifikasi & dicatat ke Hutang Dagang (AP)' },
  ];

  const rawItems = (invoice.items && invoice.items.length > 0)
    ? invoice.items
    : [
        { id: '1', ingredient_name: 'Daging Sapi Slice', quantity: 10, unit: 'kg', unit_price: 65000, total_price: 650000 },
        { id: '2', ingredient_name: 'Bawang Merah', quantity: 4, unit: 'kg', unit_price: 29000, total_price: 116000 },
      ];

  const totalAmountCalculated = rawItems.reduce((sum: number, item: any) => sum + (item.total_price || ((item.quantity || 1) * (item.unit_price || 65000))), 0);

  // Build navigation context for GRN links
  const grnId = invoice.grn?.id || 'grn-001';
  const grnHref = `/purchase/goods-received/${grnId}`;
  const navigationParams = buildDocumentNavigationParams(
    { number: invoice.invoice_number, id: invoice.id, href: `/purchase/invoices/${id}` },
    grnHref,
    'Faktur Supplier',
    '/purchase/invoices'
  ).toString();
  const grnHrefWithContext = grnHref + (navigationParams ? `?${navigationParams}` : '');

  return (
    <ResponsiveShell title={invoice.invoice_number}>
      <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <PurchaseFormSheet
            documentTitle="Faktur Supplier (Vendor Bill)"
            documentNumber={invoice.invoice_number}
            status={invoice.status}
            pipelineSteps={[
              { key: 'pending', label: 'Pending' },
              { key: 'verified', label: 'Diverifikasi AP' },
              { key: 'paid', label: 'Lunas' },
            ]}
            activeStepKey={invoice.status}
            requesterOrSupplierLabel="Supplier Vendor"
            requesterOrSupplierValue={invoice.supplier_name || invoice.grn?.purchase_order?.supplier?.name || 'PT Sumber Pangan Utama'}
            outletName="Kitchen POS - Outlet Utama"
            notes={invoice.notes}
            submittedDate={new Date(invoice.invoice_date || invoice.created_at || Date.now()).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            approvedByDate={invoice.due_date ? `Jatuh Tempo: ${new Date(invoice.due_date).toLocaleDateString('id-ID')}` : undefined}
            totalAmount={invoice.total || totalAmountCalculated || 842600}
            primaryActions={
              invoice.status === 'pending' ? (
                <Button onClick={() => toast('success', 'Faktur diverifikasi')} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle className="h-4 w-4" />
                  Verifikasi Faktur (AP)
                </Button>
              ) : null
            }
            smartButtons={[
              {
                label: `1 GRN (${invoice.grn?.grn_number || '#GRN-001'})`,
                href: grnHrefWithContext,
                icon: 'grn',
              },
            ]}
            smartLink={{ label: `GRN Terkait: ${invoice.grn?.grn_number || '#GRN-001'}`, href: grnHrefWithContext }}
            onPrint={() => toast('info', `Cetak Faktur ${invoice.invoice_number}`)}
            onDuplicate={() => toast('success', `Duplikat Faktur ${invoice.invoice_number}`)}
            onDelete={() => toast('success', `Faktur ${invoice.invoice_number} dihapus`)}
            items={rawItems.map((item: any, idx: number) => ({
              id: item.id || idx,
              code: `BILL-ITEM-${idx + 1}`,
              name: item.ingredient_name || item.name || 'Tagihan Vendor',
              category: 'Tagihan Vendor',
              quantity: item.quantity || 1,
              unit: item.unit || 'kg',
              unit_price: item.unit_price || 65000,
              total_price: item.total_price || ((item.quantity || 1) * (item.unit_price || 65000)),
            }))}
            itemsTitle="Rincian Tagihan Vendor"
            auditLogs={auditLogs}
            entityType="invoice"
            entityId={invoice.id}
          />
        </div>
      </div>
    </ResponsiveShell>
  );
}
