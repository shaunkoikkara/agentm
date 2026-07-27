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

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-4xl animate-in fade-in duration-500 relative pb-12">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 p-4 rounded-xl shadow-xl border flex items-center gap-3 animate-in slide-in-from-top-2 z-50 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your business details, AI behavior, and WhatsApp connection.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info */}
        <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Client / Internal Name</label>
              <input
                type="text"
                value={tenant?.client_name || ''}
                onChange={(e) => setTenant({...tenant, client_name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                placeholder="e.g. Acme Corp"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Public Business Name</label>
              <input
                type="text"
                value={tenant?.business_name || ''}
                onChange={(e) => setTenant({...tenant, business_name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Category / Industry</label>
              <input
                type="text"
                value={tenant?.business_category || ''}
                onChange={(e) => setTenant({...tenant, business_category: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Description</label>
              <textarea
                value={tenant?.business_description || ''}
                onChange={(e) => setTenant({...tenant, business_description: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all h-24 resize-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* AI Config */}
        <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">AI Configuration</h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Receptionist Name</label>
                <input
                  type="text"
                  value={tenant?.receptionist_name || ''}
                  onChange={(e) => setTenant({...tenant, receptionist_name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                  placeholder="e.g. Sarah"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Personality Type</label>
                <select
                  value={tenant?.receptionist_personality || 'professional'}
                  onChange={(e) => setTenant({...tenant, receptionist_personality: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                >
                  <option value="Professional, friendly, and helpful">Professional & Polite</option>
                  <option value="Friendly and casual">Friendly & Casual</option>
                  <option value="Enthusiastic and energetic">Enthusiastic & Energetic</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Custom System Prompt (Optional)</label>
              <textarea
                value={tenant?.system_prompt || ''}
                onChange={(e) => setTenant({...tenant, system_prompt: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all h-32 font-mono text-sm placeholder:text-slate-400"
                placeholder="Override the default behavior instructions here..."
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Manual Connection */}
        <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-1">WhatsApp Cloud API</h2>
          <p className="text-xs text-slate-500 mb-5">
            Configure the specific WhatsApp Phone Number ID and WABA ID for this client account.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Phone Number ID</label>
              <input
                type="text"
                value={tenant?.whatsapp_phone_number_id || ''}
                onChange={(e) => setTenant({...tenant, whatsapp_phone_number_id: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                placeholder="e.g. 101234567890123"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">WhatsApp Business Account ID</label>
              <input
                type="text"
                value={tenant?.waba_id || ''}
                onChange={(e) => setTenant({...tenant, waba_id: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-mono text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                placeholder="e.g. 109876543210987"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 sticky bottom-8">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50 text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
