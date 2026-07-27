"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { LayoutDashboard, BookOpen, MessageSquare, Settings, LogOut, Bot } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/dashboard/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-slate-200/80 h-screen transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
        <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-md shadow-indigo-500/20">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900">AgentM</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-50/80 text-indigo-600 font-semibold border border-indigo-100/80 shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-200 font-medium"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
