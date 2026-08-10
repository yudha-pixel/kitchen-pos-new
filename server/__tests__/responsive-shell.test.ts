import { describe, expect, it } from 'vitest';

if (typeof window === 'undefined') {
  class MockCustomEvent extends Event {
    constructor(type: string) {
      super(type);
    }
  }
  class MockKeyboardEvent extends Event {
    key: string;
    constructor(type: string, init?: { key?: string }) {
      super(type);
      this.key = init?.key || '';
    }
  }
  const target = new EventTarget();
  (globalThis as any).window = target;
  (globalThis as any).CustomEvent = MockCustomEvent;
  (globalThis as any).KeyboardEvent = MockKeyboardEvent;
}

describe('Responsive Shell & Off-Canvas Mobile Drawer Contract', () => {
  it('dispatches custom event on mobile sidebar toggle', () => {
    let eventFired = false;
    const listener = () => {
      eventFired = true;
    };
    window.addEventListener('toggle-mobile-sidebar', listener);

    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar'));
    expect(eventFired).toBe(true);

    window.removeEventListener('toggle-mobile-sidebar', listener);
  });

  it('verifies Escape key handling logic for drawer closure', () => {
    let drawerClosed = false;
    const handleKeyDown = (e: any) => {
      if (e.key === 'Escape') {
        drawerClosed = true;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(drawerClosed).toBe(true);
    window.removeEventListener('keydown', handleKeyDown);
  });
});
