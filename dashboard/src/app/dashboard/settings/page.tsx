"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    try {
      const data = await api.getTenant();
      setTenant(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateTenant(tenant);
      showToast('Settings saved successfully');
    } catch (error: any) {
      showToast(error.message || 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top-2 z-50 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 text-sm mt-1">Configure your business details and AI behavior.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info */}
        <div className="glass-card rounded-2xl p-6 border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Business Name</label>
              <input
                type="text"
                value={tenant?.business_name || ''}
                onChange={(e) => setTenant({...tenant, business_name: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Category / Industry</label>
              <input
                type="text"
                value={tenant?.business_category || ''}
                onChange={(e) => setTenant({...tenant, business_category: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-zinc-400">Description</label>
              <textarea
                value={tenant?.business_description || ''}
                onChange={(e) => setTenant({...tenant, business_description: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
              />
            </div>
          </div>
        </div>

        {/* AI Config */}
        <div className="glass-card rounded-2xl p-6 border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">AI Configuration</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-400">Receptionist Name</label>
                <input
                  type="text"
                  value={tenant?.ai_name || ''}
                  onChange={(e) => setTenant({...tenant, ai_name: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Sarah"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-400">Personality Type</label>
                <select
                  value={tenant?.ai_personality || 'professional'}
                  onChange={(e) => setTenant({...tenant, ai_personality: e.target.value})}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="professional">Professional & Polite</option>
                  <option value="friendly">Friendly & Casual</option>
                  <option value="enthusiastic">Enthusiastic & Energetic</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-400">Custom System Prompt (Optional)</label>
              <textarea
                value={tenant?.custom_prompt || ''}
                onChange={(e) => setTenant({...tenant, custom_prompt: e.target.value})}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-32 font-mono text-sm"
                placeholder="Override the default behavior instructions here..."
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Connection */}
        <div className="glass-card rounded-2xl p-6 border-white/5">
          <h2 className="text-lg font-semibold text-white mb-4">WhatsApp Connection</h2>
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Status</p>
                {tenant?.wa_phone_number_id ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Not Connected
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <p className="text-sm text-zinc-400 mb-1">Phone Number ID</p>
                <p className="font-mono text-sm text-white bg-zinc-950 px-2 py-1 rounded">
                  {tenant?.wa_phone_number_id || 'Not configured'}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-4">
              WhatsApp configuration is managed via the backend. Contact support to update these credentials.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 sticky bottom-8">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-8 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
