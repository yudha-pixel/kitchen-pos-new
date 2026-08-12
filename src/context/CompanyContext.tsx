'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '@/src/config/runtime';
import { getToken } from '@/src/lib/api';
import { useConfigStore } from '@/src/store/useConfigStore';

export interface CompanyIdentity {
  name: string;
  logo_url: string | null;
}

interface CompanyContextValue {
  company: CompanyIdentity;
  isLoading: boolean;
  refreshCompany: () => Promise<void>;
}

const FALLBACK_COMPANY: CompanyIdentity = { name: 'Kitchen POS', logo_url: null };
const CompanyContext = createContext<CompanyContextValue | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [company, setCompany] = useState(FALLBACK_COMPANY);
  const [isLoading, setIsLoading] = useState(false);
  const setTaxRate = useConfigStore((state) => state.setTaxRate);
  const setServiceChargeRate = useConfigStore((state) => state.setServiceChargeRate);

  const refreshCompany = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setCompany(FALLBACK_COMPANY);
      return;
    }
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [identityResponse, configResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/company/identity`, { headers }),
        fetch(`${API_BASE_URL}/api/company/config`, { headers }),
      ]);
      if (!identityResponse.ok || !configResponse.ok) throw new Error('Failed to load company identity');
      const identity = await identityResponse.json() as CompanyIdentity;
      const config = await configResponse.json() as { tax_rate: number; service_charge: number };
      setCompany({
        name: identity.name?.trim() || FALLBACK_COMPANY.name,
        logo_url: identity.logo_url ? identity.logo_url : null,
      });
      setTaxRate(config.tax_rate);
      setServiceChargeRate(config.service_charge);
    } catch {
      setCompany(FALLBACK_COMPANY);
    } finally {
      setIsLoading(false);
    }
  }, [setServiceChargeRate, setTaxRate]);

  useEffect(() => {
    if (user) void Promise.resolve().then(refreshCompany);
  }, [refreshCompany, user]);

  const value = useMemo(() => ({ company, isLoading, refreshCompany }), [company, isLoading, refreshCompany]);
  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) throw new Error('useCompany must be used within CompanyProvider');
  return context;
}
