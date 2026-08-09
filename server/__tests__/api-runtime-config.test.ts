import { afterEach, describe, expect, it, vi } from 'vitest';

import { resolveApiBaseUrl } from '../../src/config/runtime';

describe('frontend API runtime configuration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('sends API requests to port 3001 when NEXT_PUBLIC_API_URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    let requestedUrl = '';

    vi.stubGlobal('fetch', async (input: string | URL | Request) => {
      requestedUrl = String(input);
      return new Response(
        JSON.stringify({ id: 'user-1', username: 'admin', role: 'admin' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    });

    const { getMe } = await import('../../src/lib/api');
    await getMe();

    expect(requestedUrl).toBe('http://localhost:3001/auth/me');
  });

  it('removes trailing slashes from a configured API URL', () => {
    expect(resolveApiBaseUrl('https://erp.example.test/api///')).toBe(
      'https://erp.example.test/api'
    );
  });
});
