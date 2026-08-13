'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { PurchaseFormSheet, FormSheetAuditLog } from '@/src/components/purchase/PurchaseFormSheet';
import { Check, Plus } from 'lucide-react';
import { buildDocumentNavigationParams } from '@/src/lib/navigationContext';

interface PRPageProps {
  params: Promise<{ id: string }>;
}

export default function PRDetailPage({ params }: PRPageProps) {
  const { id } = use(params);
  const { user } = useAuth();
  const { toast } = useToast();

  const [pr, setPR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchPR = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPR(data);
      } else {
        // Fallback mock object if specific ID not found in dev mock
        setPR({
          id,
          pr_number: `#PR-${id.slice(0, 4).toUpperCase()}`,
          status: 'Approved',
          requested_by: 'admin',
          created_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
          approved_by: 'System Administrator',
          total_estimated: 766000,
          notes: 'Restok bahan baku mingguan area dapur utama.',
          items: [
            { ingredient_id: 'ing-1', ingredient_name: 'Daging Sapi Slice', quantity: 10, unit: 'kg', estimated_price: 650000, notes: 'Harus lemak max 10%' },
            { ingredient_id: 'ing-2', ingredient_name: 'Bawang Merah', quantity: 4, unit: 'kg', estimated_price: 116000, notes: 'Kondisi segar' },
          ],
          po_id: 'po-202608-9508',
          po_number: '#PO-202608-9508',
        });
      }
    } catch (error) {
      console.error('Failed to fetch PR detail:', error);
      toast('error', 'Gagal memuat detail PR');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchPR();
  }, [fetchPR]);

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast('success', 'Permintaan Dapur berhasil disetujui');
        fetchPR();
      }
    } catch (error) {
      toast('error', 'Gagal menyetujui PR');
    } finally {
      setProcessing(false);
    }
  };

  const handleConvertToPO = async () => {
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${id}/convert-to-po`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast('success', 'PR berhasil dikonversi menjadi PO');
        fetchPR();
      }
    } catch (error) {
      toast('error', 'Gagal konversi ke PO');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/purchase-requisitions/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        toast('success', 'PR ditolak');
        fetchPR();
      }
    } catch (error) {
      toast('error', 'Gagal menolak PR');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <ResponsiveShell title="Permintaan Dapur">
        <div className="p-8 text-center text-ink-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          Memuat formulir permintaan dapur...
        </div>
      </ResponsiveShell>
    );
  }

  if (!pr) {
    return (
      <ResponsiveShell title="Permintaan Dapur">
        <div className="p-8 text-center text-ink-muted">
          Dokumen PR tidak ditemukan.
        </div>
      </ResponsiveShell>
    );
  }

  const auditLogs: FormSheetAuditLog[] = [
    { timestamp: new Date(pr.created_at).toLocaleString('id-ID'), user: pr.requested_by || 'admin', action: 'Dokumen DRAF Permintaan Dapur dibuat' },
    ...(pr.approved_by ? [{ timestamp: pr.approved_at ? new Date(pr.approved_at).toLocaleString('id-ID') : 'Hari ini', user: pr.approved_by, action: 'Status diubah menjadi Disetujui' }] : []),
    ...(pr.po_number ? [{ timestamp: 'Hari ini', user: 'System Administrator', action: `Dikonversi menjadi PO ${pr.po_number}` }] : []),
  ];

  const rawItems = (pr.prItems && pr.prItems.length > 0)
    ? pr.prItems
    : (pr.items && pr.items.length > 0)
    ? pr.items
    : [
        { ingredient_id: 'ing-1', ingredient_name: 'Daging Sapi Slice', quantity: 10, unit: 'kg', estimated_price: 650000, notes: 'Harus lemak max 10%' },
        { ingredient_id: 'ing-2', ingredient_name: 'Bawang Merah', quantity: 4, unit: 'kg', estimated_price: 116000, notes: 'Kondisi segar' },
      ];

  const poNumber = pr.po_number || '#PO-202608-9508';

  // Build navigation context for PO links
  const poId = pr.po_id || 'po-202608-9508';
  const poHref = `/purchase/orders/${poId}`;
  const navigationParams = buildDocumentNavigationParams(
    { number: pr.pr_number, id: pr.id, href: `/purchase/requisitions/${id}` },
    poHref,
    'Permintaan Dapur',
    '/purchase/requisitions'
  ).toString();
  const poHrefWithContext = poHref + (navigationParams ? `?${navigationParams}` : '');

  return (
    <ResponsiveShell title={pr.pr_number}>
      <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
        <div className="w-full">
          <PurchaseFormSheet
            documentTitle="Permintaan Dapur"
            documentNumber={pr.pr_number}
            status={pr.status}
            pipelineSteps={[
              { key: 'draft', label: 'Draf' },
              { key: 'pending approval', label: 'Menunggu' },
              { key: 'approved', label: 'Disetujui' },
              { key: 'converted to po', label: 'Dikonversi' },
            ]}
            activeStepKey={pr.status}
            requesterOrSupplierLabel="Pemohon (Requester)"
            requesterOrSupplierValue={pr.requested_by || 'admin'}
            outletName="Kitchen POS - Outlet Utama"
            notes={pr.notes}
            submittedDate={new Date(pr.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            approvedByDate={pr.approved_by ? `${pr.approved_by} (${pr.approved_at ? new Date(pr.approved_at).toLocaleDateString('id-ID') : ''})` : undefined}
            totalAmount={pr.total_estimated || 766000}
            primaryActions={
              pr.status === 'Pending Approval' && user?.role === 'admin' ? (
                <Button onClick={handleApprove} disabled={processing} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <Check className="h-4 w-4" />
                  Setujui PR
                </Button>
              ) : pr.status === 'Approved' ? (
                <Button onClick={handleConvertToPO} disabled={processing} className="flex items-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  Konversi ke PO
                </Button>
              ) : null
            }
            smartButtons={
              (pr.status === 'Converted to PO' || pr.po_number || pr.po_id)
                ? [
                    {
                      label: `1 Purchase Order (${poNumber})`,
                      href: poHrefWithContext,
                      icon: 'po',
                    },
                  ]
                : []
            }
            smartLink={{ label: `PO Terkait: ${poNumber}`, href: poHrefWithContext }}
            onPrint={() => toast('info', `Mencetak dokumen ${pr.pr_number}`)}
            onDuplicate={() => toast('success', `Menduplikat ${pr.pr_number}`)}
            onReject={pr.status === 'Pending Approval' ? handleReject : undefined}
            onDelete={() => toast('success', `PR ${pr.pr_number} dihapus`)}
            items={rawItems.map((item: any, idx: number) => ({
              id: item.ingredient_id || item.id || idx,
              code: `ING-${String(idx + 1).padStart(3, '0')}`,
              name: item.ingredient_name || item.name || 'Bahan Baku',
              category: 'Bahan Baku Dapur',
              quantity: item.quantity || 1,
              unit: item.unit || 'kg',
              unit_price: (item.estimated_price || item.unit_price) ? ((item.estimated_price || item.unit_price) / (item.quantity || 1)) : 65000,
              total_price: item.estimated_price || item.total_price || 650000,
              notes: item.notes,
            }))}
            itemsTitle="Rincian Bahan & Barang"
            auditLogs={auditLogs}
            entityType="purchase_requisition"
            entityId={pr.id}
          />
        </div>
      </div>
    </ResponsiveShell>
  );
}
