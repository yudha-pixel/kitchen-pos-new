export interface StateDefinition {
  key: string;
  label: string;
  badgeVariant: 'draft' | 'pending' | 'approved' | 'converted' | 'rejected' | 'completed' | 'paid';
  nextActions: string[];
}

export const PR_STATE_CONFIG: Record<string, StateDefinition> = {
  DRAFT: {
    key: 'draft',
    label: 'Draf',
    badgeVariant: 'draft',
    nextActions: ['SUBMIT'],
  },
  PENDING: {
    key: 'pending',
    label: 'Menunggu Approval',
    badgeVariant: 'pending',
    nextActions: ['APPROVE', 'REJECT'],
  },
  APPROVED: {
    key: 'approved',
    label: 'Disetujui',
    badgeVariant: 'approved',
    nextActions: ['CONVERT_TO_PO'],
  },
  CONVERTED: {
    key: 'converted',
    label: 'Dikonversi',
    badgeVariant: 'converted',
    nextActions: [],
  },
  REJECTED: {
    key: 'rejected',
    label: 'Ditolak',
    badgeVariant: 'rejected',
    nextActions: ['DUPLICATE'],
  },
};

export const PO_STATE_CONFIG: Record<string, StateDefinition> = {
  DRAFT: {
    key: 'draft',
    label: 'Draf',
    badgeVariant: 'draft',
    nextActions: ['SEND'],
  },
  SENT: {
    key: 'sent',
    label: 'Terkirim',
    badgeVariant: 'pending',
    nextActions: ['ACKNOWLEDGE'],
  },
  ACKNOWLEDGED: {
    key: 'acknowledged',
    label: 'Konfirmasi Supplier',
    badgeVariant: 'approved',
    nextActions: ['COMPLETE'],
  },
  COMPLETED: {
    key: 'completed',
    label: 'Selesai',
    badgeVariant: 'completed',
    nextActions: [],
  },
};

export const getStateConfig = (docType: 'pr' | 'po' | 'qt' | 'grn' | 'inv', statusStr: string): StateDefinition => {
  const norm = (statusStr || '').toLowerCase();
  const config = docType === 'pr' ? PR_STATE_CONFIG : PO_STATE_CONFIG;
  
  for (const item of Object.values(config)) {
    if (norm.includes(item.key)) return item;
  }
  
  return {
    key: norm,
    label: statusStr,
    badgeVariant: 'pending',
    nextActions: [],
  };
};
