const DEFAULT_API_BASE_URL = 'http://localhost:3001';

export function resolveApiBaseUrl(configuredUrl?: string): string {
  const baseUrl = configuredUrl?.trim() || DEFAULT_API_BASE_URL;
  return baseUrl.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
