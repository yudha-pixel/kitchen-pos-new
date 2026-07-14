'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from '@/src/lib/api';

type User = {
  id: string;
  username: string;
  role: 'admin' | 'cashier';
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const init = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      api.clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const login = async (username: string, password: string) => {
    const { user: loggedInUser } = await api.login({ username, password });
    setUser(loggedInUser);
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
