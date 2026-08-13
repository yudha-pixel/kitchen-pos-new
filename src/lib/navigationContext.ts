/**
 * Navigation Context Utility
 * 
 * Provides utilities for building and parsing navigation context between documents.
 * This enables dynamic breadcrumbs that show document lineage (e.g., #PR-001 > #PO-PO-2)
 * instead of module-based navigation.
 */

export interface DocumentContext {
  number: string;
  id: string;
  href: string;
}

export interface NavigationContextParams {
  fromLabel?: string;
  fromHref?: string;
  fromParentLabel?: string;
  fromParentHref?: string;
}

/**
 * Build URL search params for document navigation context.
 * 
 * @param currentDoc - The current document being viewed
 * @param targetDocHref - The href of the target document being navigated to
 * @param parentModuleLabel - The label of the parent module (e.g., "Permintaan Dapur")
 * @param parentModuleHref - The href of the parent module list page (e.g., "/purchase/requisitions")
 * @returns URLSearchParams with navigation context
 */
export function buildDocumentNavigationParams(
  currentDoc: DocumentContext,
  targetDocHref: string,
  parentModuleLabel?: string,
  parentModuleHref?: string
): URLSearchParams {
  const params = new URLSearchParams();
  
  // Current document becomes the "from" context for the target
  params.set('fromLabel', currentDoc.number);
  params.set('fromHref', currentDoc.href);
  
  // Parent module context (optional, for sidebar persistence)
  if (parentModuleLabel && parentModuleHref) {
    params.set('fromParentLabel', parentModuleLabel);
    params.set('fromParentHref', parentModuleHref);
  }
  
  return params;
}

/**
 * Parse navigation context from URL search params.
 * 
 * @param searchParams - URLSearchParams from the current page
 * @returns Parsed navigation context object
 */
export function parseNavigationContext(searchParams: URLSearchParams): NavigationContextParams {
  return {
    fromLabel: searchParams.get('fromLabel') || undefined,
    fromHref: searchParams.get('fromHref') || undefined,
    fromParentLabel: searchParams.get('fromParentLabel') || undefined,
    fromParentHref: searchParams.get('fromParentHref') || undefined,
  };
}

/**
 * Append navigation context to an href.
 * 
 * @param href - The base href
 * @param context - Navigation context params
 * @returns Full href with search params appended
 */
export function appendNavigationContext(
  href: string,
  context: NavigationContextParams
): string {
  const url = new URL(href, window.location.origin);
  
  if (context.fromLabel) url.searchParams.set('fromLabel', context.fromLabel);
  if (context.fromHref) url.searchParams.set('fromHref', context.fromHref);
  if (context.fromParentLabel) url.searchParams.set('fromParentLabel', context.fromParentLabel);
  if (context.fromParentHref) url.searchParams.set('fromParentHref', context.fromParentHref);
  
  return url.pathname + url.search;
}

/**
 * Get module info for a given pathname.
 * This is a helper to determine parent module context.
 * 
 * @param pathname - Current pathname
 * @returns Object with module label and href, or null if not found
 */
export function getModuleInfoForPath(pathname: string): { label: string; href: string } | null {
  // This should be synchronized with the navigation config
  // For now, return common module mappings
  const moduleMap: Record<string, { label: string; href: string }> = {
    '/purchase/requisitions': { label: 'Permintaan Dapur', href: '/purchase/requisitions' },
    '/purchase/orders': { label: 'Pesanan Pembelian', href: '/purchase/orders' },
    '/purchase/quotations': { label: 'Penawaran Harga', href: '/purchase/quotations' },
    '/purchase/goods-receipt': { label: 'Penerimaan Barang', href: '/purchase/goods-receipt' },
    '/purchase/vendor-invoices': { label: 'Faktur Supplier', href: '/purchase/vendor-invoices' },
    '/inventory/purchase-requisitions': { label: 'Permintaan Dapur', href: '/inventory/purchase-requisitions' },
  };
  
  // Find the most specific match
  for (const [path, info] of Object.entries(moduleMap)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      return info;
    }
  }
  
  return null;
}