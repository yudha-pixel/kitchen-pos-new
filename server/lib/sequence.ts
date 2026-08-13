import { prisma } from './prisma';

export interface DocumentSequenceRule {
  prefix: string;
  suffix: string;
  padding: number;
  next_number: number;
  reset_frequency: 'never' | 'yearly' | 'monthly';
  last_reset_year?: number;
  last_reset_month?: number;
}

export type DocumentType = 'pr' | 'po' | 'quotation' | 'grn' | 'invoice' | 'pos_receipt';

export interface DocumentSequenceMap {
  pr: DocumentSequenceRule;
  po: DocumentSequenceRule;
  quotation: DocumentSequenceRule;
  grn: DocumentSequenceRule;
  invoice: DocumentSequenceRule;
  pos_receipt: DocumentSequenceRule;
}

export const DEFAULT_DOCUMENT_SEQUENCES: DocumentSequenceMap = {
  pr: {
    prefix: '#PR-',
    suffix: '',
    padding: 3,
    next_number: 1,
    reset_frequency: 'never',
  },
  po: {
    prefix: '#PO-',
    suffix: '',
    padding: 3,
    next_number: 1,
    reset_frequency: 'never',
  },
  quotation: {
    prefix: '#QT-',
    suffix: '',
    padding: 3,
    next_number: 1,
    reset_frequency: 'never',
  },
  grn: {
    prefix: '#GRN-',
    suffix: '',
    padding: 3,
    next_number: 1,
    reset_frequency: 'never',
  },
  invoice: {
    prefix: '#INV-',
    suffix: '',
    padding: 3,
    next_number: 1,
    reset_frequency: 'never',
  },
  pos_receipt: {
    prefix: '#POS-',
    suffix: '',
    padding: 4,
    next_number: 1,
    reset_frequency: 'never',
  },
};

/**
 * Evaluates date tokens in a prefix or suffix string (e.g. {YYYY}, {YY}, {MM}, {DD})
 */
export function formatSequenceTokens(pattern: string, date: Date = new Date()): string {
  if (!pattern) return '';
  const yyyy = String(date.getFullYear());
  const yy = yyyy.slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');

  return pattern
    .replace(/\{YYYY\}/g, yyyy)
    .replace(/\{YY\}/g, yy)
    .replace(/\{MM\}/g, mm)
    .replace(/\{DD\}/g, dd);
}

/**
 * Formats a sample sequence string for previewing or document creation
 */
export function formatSequenceString(rule: DocumentSequenceRule, date: Date = new Date()): string {
  const prefixStr = formatSequenceTokens(rule.prefix || '', date);
  const suffixStr = formatSequenceTokens(rule.suffix || '', date);
  const paddedNum = String(rule.next_number || 1).padStart(rule.padding || 3, '0');

  return `${prefixStr}${paddedNum}${suffixStr}`;
}

/**
 * Load active sequence settings from AppSettings in database or fallback defaults
 */
export async function getSequenceSettings(): Promise<DocumentSequenceMap> {
  try {
    const settings = await prisma.appSettings.findFirst();
    if (settings && (settings as any).document_sequences) {
      const raw = typeof (settings as any).document_sequences === 'string'
        ? JSON.parse((settings as any).document_sequences)
        : (settings as any).document_sequences;
      return {
        ...DEFAULT_DOCUMENT_SEQUENCES,
        ...raw,
      };
    }
  } catch (error) {
    console.error('Error fetching sequence settings:', error);
  }
  return DEFAULT_DOCUMENT_SEQUENCES;
}

/**
 * Save updated sequence settings to database AppSettings
 */
export async function updateSequenceSettings(newSequences: Partial<DocumentSequenceMap>): Promise<DocumentSequenceMap> {
  const current = await getSequenceSettings();
  const merged: DocumentSequenceMap = {
    pr: { ...current.pr, ...(newSequences.pr || {}) },
    po: { ...current.po, ...(newSequences.po || {}) },
    quotation: { ...current.quotation, ...(newSequences.quotation || {}) },
    grn: { ...current.grn, ...(newSequences.grn || {}) },
    invoice: { ...current.invoice, ...(newSequences.invoice || {}) },
    pos_receipt: { ...current.pos_receipt, ...(newSequences.pos_receipt || {}) },
  };

  const appSettings = await prisma.appSettings.findFirst();
  if (appSettings) {
    await prisma.appSettings.update({
      where: { id: appSettings.id },
      data: {
        document_sequences: merged as any,
      },
    });
  } else {
    await prisma.appSettings.create({
      data: {
        document_sequences: merged as any,
      },
    });
  }

  return merged;
}

/**
 * Generates next sequence number string for a given document type and increments counter
 */
export async function generateNextSequenceNumber(docType: DocumentType): Promise<string> {
  const allSequences = await getSequenceSettings();
  const rule = allSequences[docType] || DEFAULT_DOCUMENT_SEQUENCES[docType];

  const now = new Date();
  let currentNum = rule.next_number || 1;

  // Check reset frequency rules
  if (rule.reset_frequency === 'yearly' && rule.last_reset_year && rule.last_reset_year !== now.getFullYear()) {
    currentNum = 1;
    rule.last_reset_year = now.getFullYear();
  } else if (rule.reset_frequency === 'monthly') {
    const isDifferentMonth = rule.last_reset_month !== (now.getMonth() + 1) || rule.last_reset_year !== now.getFullYear();
    if (isDifferentMonth) {
      currentNum = 1;
      rule.last_reset_month = now.getMonth() + 1;
      rule.last_reset_year = now.getFullYear();
    }
  }

  const generatedString = formatSequenceString({ ...rule, next_number: currentNum }, now);

  // Increment counter for next time
  const updatedRule: DocumentSequenceRule = {
    ...rule,
    next_number: currentNum + 1,
    last_reset_year: now.getFullYear(),
    last_reset_month: now.getMonth() + 1,
  };

  await updateSequenceSettings({
    [docType]: updatedRule,
  } as any);

  return generatedString;
}
