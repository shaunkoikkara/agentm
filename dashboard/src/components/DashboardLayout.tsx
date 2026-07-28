"use client";

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/lib/auth';
import { Loader2, Menu, X, Bot } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, token } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!token) return null; // Let the AuthProvider handle the redirect

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between px-5 py-4 bg-white border-b border-slate-200/80 shadow-xs z-20">
        <div className="flex items-center gap-2.5">
          <img src="/brand-logo.png" alt="BusDesk Logo" className="w-7 h-7 object-contain" />
          <span className="font-bold text-lg tracking-tight">
            <span className="text-blue-700 font-extrabold">Bus</span>
            <span className="text-emerald-600 font-bold">Desk</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-50 h-full w-64 max-w-[80vw]">
            <Sidebar onClose={() => setIsMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
