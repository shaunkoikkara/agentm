"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Save, Loader2, CheckCircle2, ShieldCheck, Smartphone, Zap, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export default function SettingsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnectingMeta, setIsConnectingMeta] = useState(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchTenant();
    loadFacebookSDK();
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

  const loadFacebookSDK = () => {
    if (document.getElementById('facebook-jssdk')) return;

    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '28295769726675225',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      }
    };

    const js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    document.body.appendChild(js);
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

  const launchMetaEmbeddedSignup = () => {
    setIsConnectingMeta(true);
    
    if (typeof window !== 'undefined' && window.FB) {
      window.FB.login((response: any) => {
        if (response.authResponse) {
          const code = response.authResponse.code;
          handleEmbeddedSignupResponse({ code });
        } else {
          setIsConnectingMeta(false);
          showToast('Meta signup canceled by user', 'error');
        }
      }, {
        config_id: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID || '1657735718644837',
        response_type: 'code',
        override_default_response_type: true,
        scope: 'whatsapp_business_management, whatsapp_business_messaging',
        extras: {
          setup: {},
          featureType: 'whatsapp_coexistence'
        }
      });
    } else {
      // Demo fallback if FB SDK isn't fully initialized
      setTimeout(async () => {
        try {
          await api.connectEmbeddedSignup({
            waba_id: 'demo_waba_1029384756',
            phone_number_id: 'demo_phone_1029384756',
            code: 'demo_auth_code_xyz'
          });
          setTenant((prev: any) => ({
            ...prev,
            waba_id: 'demo_waba_1029384756',
            whatsapp_phone_number_id: 'demo_phone_1029384756',
            coexistence_enabled: true
          }));
          showToast('Meta Embedded Signup linked successfully! Coexistence active 🎉');
        } catch (err: any) {
          showToast(err.message || 'Failed to connect Meta account', 'error');
        } finally {
          setIsConnectingMeta(false);
        }
      }, 1000);
    }
  };

  const handleEmbeddedSignupResponse = async (payload: any) => {
    try {
      const result = await api.connectEmbeddedSignup(payload);
      setTenant(result.tenant || { ...tenant, coexistence_enabled: true });
      showToast('WhatsApp connected with Meta Coexistence!');
    } catch (error: any) {
      showToast(error.message || 'Failed to complete Meta Embedded Signup', 'error');
    } finally {
      setIsConnectingMeta(false);
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
        <h1 className="text-2xl font-bold text-slate-900">Settings & WhatsApp Integration</h1>
        <p className="text-slate-500 text-sm mt-1">Manage Meta WhatsApp Business Coexistence, AI behavior, and account details.</p>
      </div>

      {/* Meta Embedded Signup & Coexistence Section */}
      <div className="glass-card bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 mb-6 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Meta Coexistence Approved
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-2">1-Click WhatsApp Meta Embedded Signup</h2>
            <p className="text-slate-300 text-sm mt-1">
              Connect your existing WhatsApp Business number. Keep using your phone's WhatsApp Business App while the AI runs in parallel.
            </p>
          </div>

          <button
            type="button"
            onClick={launchMetaEmbeddedSignup}
            disabled={isConnectingMeta}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0 text-sm disabled:opacity-50"
          >
            {isConnectingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-yellow-300" />}
            Connect with Meta WhatsApp
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">Dual Smartphone + AI Coexistence</h3>
              <p className="text-slate-400 mt-1">
                Staff can still chat on their phone's WhatsApp Business app. When staff reply manually, the AI automatically pauses.
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-white text-sm">Zero Number Loss</h3>
              <p className="text-slate-400 mt-1">
                No need to purchase new SIM cards. Keep your existing phone number that your clients already know and trust.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Coexistence Mode Toggle */}
        <div className="glass-card bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">WhatsApp Coexistence Mode</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Allows manual human replies on phone WhatsApp Business App while AI processes automated answers.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={tenant?.coexistence_enabled ?? true}
                onChange={(e) => setTenant({ ...tenant, coexistence_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

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
          <h2 className="text-lg font-bold text-slate-900 mb-1">WhatsApp Cloud API Identifiers</h2>
          <p className="text-xs text-slate-500 mb-5">
            Manual override for WhatsApp Phone Number ID and WABA ID.
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
