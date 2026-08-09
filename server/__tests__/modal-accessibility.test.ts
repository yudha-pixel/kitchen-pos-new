import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { Modal } from '../../src/components/ui/Modal';

describe('Modal accessibility contract', () => {
  it('exposes alert-dialog semantics and its description for destructive confirmation', () => {
    const markup = renderToStaticMarkup(
      createElement(
        Modal,
        {
          isOpen: true,
          onClose: vi.fn(),
          title: 'Hapus voucer?',
          role: 'alertdialog',
          descriptionId: 'delete-voucher-description',
        },
        createElement(
          'p',
          { id: 'delete-voucher-description' },
          'Tindakan ini tidak dapat dibatalkan.'
        )
      )
    );

    expect(markup).toContain('role="alertdialog"');
    expect(markup).toContain('aria-describedby="delete-voucher-description"');
  });
});
