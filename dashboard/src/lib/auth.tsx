"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from './api';

interface AuthContextType {
  token: string | null;
  tenant: any;
  login: (token: string, tenant: any) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const tenantData = await api.getTenant();
          setTenant(tenantData);
        } catch (error) {
          console.error('Failed to restore session', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = pathname === '/login' || pathname === '/signup';
      if (!token && !isAuthRoute) {
        router.push('/login');
      } else if (token && isAuthRoute) {
        router.push('/dashboard');
      }
    }
  }, [token, isLoading, pathname, router]);

  const login = (newToken: string, newTenant: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setTenant(newTenant);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setTenant(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, tenant, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
