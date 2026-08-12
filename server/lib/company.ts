export interface CompanyRecord {
  id: string;
  name: string;
  logo_path: string | null;
  logo_mime_type: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  tax_id: string | null;
  company_registry: string | null;
  timezone: string;
  currency: string;
  tax_rate: number;
  service_charge: number;
  created_at: Date;
  updated_at: Date;
}

const OPTIONAL_TEXT_FIELDS = ['phone', 'address', 'tax_id', 'company_registry'] as const;

export function serializeCompany(company: CompanyRecord) {
  return {
    id: company.id,
    name: company.name,
    logo_url: company.logo_path ? '/api/company/logo' : null,
    phone: company.phone,
    email: company.email,
    website: company.website,
    address: company.address,
    tax_id: company.tax_id,
    company_registry: company.company_registry,
    timezone: company.timezone,
    currency: company.currency,
    tax_rate: company.tax_rate,
    service_charge: company.service_charge,
    created_at: company.created_at.toISOString(),
    updated_at: company.updated_at.toISOString(),
  };
}

export function serializeCompanyIdentity(company: CompanyRecord) {
  return {
    name: company.name,
    logo_url: company.logo_path ? '/api/company/logo' : null,
  };
}

function optionalText(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

export function validateCompanyPatch(input: Record<string, unknown>):
  | { data: Record<string, string | number | null> }
  | { error: string } {
  const data: Record<string, string | number | null> = {};

  if (input.name !== undefined) {
    if (typeof input.name !== 'string' || !input.name.trim()) return { error: 'Nama perusahaan wajib diisi.' };
    if (input.name.trim().length > 120) return { error: 'Nama perusahaan maksimal 120 karakter.' };
    data.name = input.name.trim();
  }

  for (const field of OPTIONAL_TEXT_FIELDS) {
    const value = optionalText(input[field]);
    if (input[field] !== undefined && value === null && typeof input[field] !== 'string') {
      return { error: `${field} harus berupa teks.` };
    }
    if (value !== undefined) data[field] = value;
  }

  if (input.email !== undefined) {
    const value = optionalText(input.email);
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return { error: 'Email perusahaan tidak valid.' };
    data.email = value ?? null;
  }

  if (input.website !== undefined) {
    const value = optionalText(input.website);
    if (value) {
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol');
      } catch {
        return { error: 'Website perusahaan harus berupa URL HTTP atau HTTPS yang valid.' };
      }
    }
    data.website = value ?? null;
  }

  if (input.timezone !== undefined) {
    if (typeof input.timezone !== 'string') return { error: 'Zona waktu tidak valid.' };
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: input.timezone }).format();
    } catch {
      return { error: 'Zona waktu tidak valid.' };
    }
    data.timezone = input.timezone;
  }

  if (input.currency !== undefined) {
    if (typeof input.currency !== 'string' || !/^[A-Za-z]{3}$/.test(input.currency)) {
      return { error: 'Mata uang harus berupa kode ISO tiga huruf.' };
    }
    data.currency = input.currency.toUpperCase();
  }

  for (const [field, label] of [['tax_rate', 'Pajak'], ['service_charge', 'Biaya layanan']] as const) {
    if (input[field] !== undefined) {
      if (typeof input[field] !== 'number' || !Number.isFinite(input[field]) || input[field] < 0 || input[field] > 100) {
        return { error: `${label} harus antara 0 dan 100.` };
      }
      data[field] = input[field];
    }
  }

  return { data };
}

export function detectCompanyLogoMimeType(buffer: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
}
