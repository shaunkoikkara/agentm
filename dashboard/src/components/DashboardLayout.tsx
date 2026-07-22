"use client";

import { Sidebar } from './Sidebar';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!token) return null; // Let the AuthProvider handle the redirect

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-950/50">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
