import { describe, expect, it } from 'vitest';
import {
  detectCompanyLogoMimeType,
  serializeCompany,
  validateCompanyPatch,
} from '../lib/company';

const companyRecord = {
  id: 'eec7cf48-7705-4bd1-82cd-a74402e30ab0',
  name: 'PT Dapur Nusantara',
  logo_path: 'uploads/company/logo.webp',
  logo_mime_type: 'image/webp',
  phone: '+62 21 555 0199',
  email: 'halo@dapur.test',
  website: 'https://dapur.test',
  address: 'Jakarta Selatan',
  tax_id: '01.234.567.8-901.000',
  company_registry: 'AHU-12345',
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  tax_rate: 11,
  service_charge: 5,
  created_at: new Date('2026-08-12T00:00:00.000Z'),
  updated_at: new Date('2026-08-12T01:00:00.000Z'),
};

describe('company contract', () => {
  it('serializes the full settings shape without exposing the managed path', () => {
    expect(serializeCompany(companyRecord)).toEqual({
      id: companyRecord.id,
      name: 'PT Dapur Nusantara',
      logo_url: '/api/company/logo',
      phone: '+62 21 555 0199',
      email: 'halo@dapur.test',
      website: 'https://dapur.test',
      address: 'Jakarta Selatan',
      tax_id: '01.234.567.8-901.000',
      company_registry: 'AHU-12345',
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      tax_rate: 11,
      service_charge: 5,
      created_at: '2026-08-12T00:00:00.000Z',
      updated_at: '2026-08-12T01:00:00.000Z',
    });
  });

  it('normalizes valid edits and rejects invalid company context values', () => {
    expect(validateCompanyPatch({
      name: '  PT Dapur Nusantara  ',
      email: '',
      website: 'https://dapur.test',
      timezone: 'Asia/Jakarta',
      currency: 'idr',
      tax_rate: 11,
      service_charge: 5,
    })).toEqual({
      data: {
        name: 'PT Dapur Nusantara',
        email: null,
        website: 'https://dapur.test',
        timezone: 'Asia/Jakarta',
        currency: 'IDR',
        tax_rate: 11,
        service_charge: 5,
      },
    });

    expect(validateCompanyPatch({ name: '  ' })).toEqual({ error: 'Nama perusahaan wajib diisi.' });
    expect(validateCompanyPatch({ tax_rate: 101 })).toEqual({ error: 'Pajak harus antara 0 dan 100.' });
    expect(validateCompanyPatch({ timezone: 'Not/A_Timezone' })).toEqual({ error: 'Zona waktu tidak valid.' });
  });

  it('detects supported logo signatures independently of the declared mime type', () => {
    expect(detectCompanyLogoMimeType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png');
    expect(detectCompanyLogoMimeType(Buffer.from([0xff, 0xd8, 0xff, 0xdb]))).toBe('image/jpeg');
    expect(detectCompanyLogoMimeType(Buffer.from('RIFF1234WEBP'))).toBe('image/webp');
    expect(detectCompanyLogoMimeType(Buffer.from('<svg></svg>'))).toBeNull();
  });
});
