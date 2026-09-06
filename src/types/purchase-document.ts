/**
 * Line items on procurement documents (PR, quotation, PO, GRN, invoice).
 * The endpoints differ in which quantity/price fields they populate, so every
 * field beyond the identity is optional and callers keep their fallbacks.
 */
export interface PurchaseDocumentItem {
  id?: string;
  ingredient_id?: string;
  ingredient_name?: string;
  name?: string;
  quantity?: number;
  quantity_ordered?: number;
  quantity_received?: number;
  unit?: string;
  unit_price?: number;
  estimated_price?: number;
  total_price?: number;
  notes?: string | null;
  quality_notes?: string | null;
}

interface SupplierRef {
  id?: string;
  name?: string;
}

/**
 * The union of fields the five procurement detail pages read. They share one
 * document shape with type-specific numbering and date fields, so everything
 * is optional rather than split into five near-identical interfaces.
 */
export interface PurchaseDocument {
  id?: string;
  status?: string;
  notes?: string | null;
  created_at?: string;
  items?: PurchaseDocumentItem[];
  prItems?: PurchaseDocumentItem[];
  supplier?: SupplierRef | null;
  supplier_name?: string | null;
  total?: number;
  total_amount?: number;
  total_estimated?: number;
  subtotal?: number;
  tax?: number;

  // Purchase requisition
  pr_number?: string;
  requested_by?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  po_id?: string | null;

  // Quotation
  quotation_number?: string;
  valid_until?: string | null;

  // Purchase order
  po_number?: string;
  order_date?: string | null;
  expected_date?: string | null;
  sent_at?: string | null;
  acknowledged_at?: string | null;
  pr_id?: string | null;
  pr?: { id?: string; pr_number?: string } | null;

  // Goods received note
  grn_number?: string;
  received_date?: string | null;
  purchase_order?: { id?: string; po_number?: string; supplier?: SupplierRef | null } | null;

  // Vendor invoice
  invoice_number?: string;
  invoice_date?: string | null;
  due_date?: string | null;
  grn?: {
    id?: string;
    grn_number?: string;
    purchase_order?: { supplier?: SupplierRef | null } | null;
  } | null;
}
