"use client";

import { Sidebar } from './Sidebar';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!token) return null; // Let the AuthProvider handle the redirect

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
