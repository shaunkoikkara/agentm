"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { MessageSquare, Users, Activity, Clock, Plus, ArrowRight } from 'lucide-react';

export default function DashboardHome() {
  const { tenant } = useAuth();
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalContacts: 0,
    activeConversations: 0,
    messagesToday: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getConversationStats();
        setStats({
          totalConversations: data.totalConversations || 0,
          totalContacts: data.totalContacts || 0,
          activeConversations: data.activeConversations || 0,
          messagesToday: data.messagesToday || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Conversations', value: stats.totalConversations, icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50 border border-indigo-100', barBg: 'bg-indigo-600' },
    { label: 'Total Contacts', value: stats.totalContacts, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50 border border-violet-100', barBg: 'bg-violet-600' },
    { label: 'Active Conversations', value: stats.activeConversations, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-100', barBg: 'bg-emerald-600' },
    { label: 'Messages Today', value: stats.messagesToday, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border border-amber-100', barBg: 'bg-amber-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
          Welcome back, {tenant?.business_name || 'Admin'}
        </h1>
        <p className="text-slate-500 font-medium">Here's what's happening with your AI Receptionist today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.barBg} transition-all duration-1000 ease-out`} style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-indigo-600 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Update Knowledge Base</h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">Train your AI with new FAQs, business hours, or policies to handle customer queries automatically.</p>
          <Link href="/dashboard/knowledge" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> Add New FAQ
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-violet-600 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Monitor Conversations</h3>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">Review live customer interactions, view phone numbers, and take over chats when a human touch is needed.</p>
          <Link href="/dashboard/conversations" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors">
            View Live Chats <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
