import { describe, expect, it } from 'vitest';

import { getRootDestination } from '../../src/features/auth/root-entry';

describe('getRootDestination', () => {
  it('sends unauthenticated visitors to login', () => {
    expect(getRootDestination(false)).toBe('/login');
  });

  it('sends authenticated staff to the existing POS entry', () => {
    expect(getRootDestination(true)).toBe('/pos');
  });
});
