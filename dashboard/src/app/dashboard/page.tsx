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
        const convos = await api.getConversations();
        const active = convos.filter((c: any) => c.status === 'active').length;
        
        setStats({
          totalConversations: convos.length,
          totalContacts: new Set(convos.map((c: any) => c.contact_id)).size,
          activeConversations: active,
          messagesToday: Math.floor(Math.random() * 50) + 10 // Mock data for now since we'd need to fetch messages
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Conversations', value: stats.totalConversations, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Contacts', value: stats.totalContacts, icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { label: 'Active Conversations', value: stats.activeConversations, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Messages Today', value: stats.messagesToday, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Welcome back, {tenant?.business_name || 'Admin'}
        </h1>
        <p className="text-zinc-400">Here's what's happening with your AI Receptionist today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:bg-white/10 group">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </div>
            <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full ${stat.bg.replace('/10', '')} transition-all duration-1000 ease-out`} style={{ width: '70%' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-blue-500">
          <h3 className="text-lg font-semibold text-white mb-2">Update Knowledge Base</h3>
          <p className="text-zinc-400 text-sm mb-6">Train your AI with new FAQs or policies to handle more queries automatically.</p>
          <Link href="/dashboard/knowledge" className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
            <Plus className="w-4 h-4" /> Add New FAQ
          </Link>
        </div>

        <div className="glass-card rounded-2xl p-6 border-l-4 border-l-violet-500">
          <h3 className="text-lg font-semibold text-white mb-2">Monitor Conversations</h3>
          <p className="text-zinc-400 text-sm mb-6">Review recent interactions and take over conversations when human touch is needed.</p>
          <Link href="/dashboard/conversations" className="inline-flex items-center gap-2 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors">
            View Live Chats <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
