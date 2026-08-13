import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CompanyBrand } from '../../src/components/layout/CompanyBrand';
import { TopNavigation } from '../../src/components/layout/TopNavigation';

describe('shared top navigation', () => {
  it('renders company identity with an initials fallback and stable brand width', () => {
    const markup = renderToStaticMarkup(createElement(CompanyBrand, {
      name: 'PT Dapur Nusantara',
      logoUrl: null,
    }));

    expect(markup).toContain('PT Dapur Nusantara');
    expect(markup).toContain('PD');
    expect(markup).toContain('aria-label="Perusahaan PT Dapur Nusantara"');
  });

  it('uses balanced columns and moves a mobile search row below the primary row', () => {
    const markup = renderToStaticMarkup(createElement(TopNavigation, {
      brand: createElement(CompanyBrand, { name: 'Kitchen POS', logoUrl: null }),
      left: createElement('span', null, 'Left'),
      right: createElement('span', null, 'Right'),
      mobileRow: createElement('label', null, 'Cari modul'),
    }));

    expect(markup).toContain('grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]');
    expect(markup).toContain('Cari modul');
    expect(markup).toContain('lg:hidden');
  });
});
