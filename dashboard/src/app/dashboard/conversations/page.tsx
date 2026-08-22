"use client";

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Send, User, Bot, Loader2, Phone, AlertCircle, MessageSquare } from 'lucide-react';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [convDetails, setConvDetails] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
      const interval = setInterval(() => fetchMessages(selectedId), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const responseData = await api.getConversations();
      // The API returns { data: [...], total: X, limit: Y, offset: Z }
      const items = responseData.data || responseData;
      setConversations(Array.isArray(items) ? items : []);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const data = await api.getConversation(id);
      // The API spreads the conversation fields at the root of the response
      setConvDetails(data.conversation || data);
      setMessages(data.messages || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTakeoverToggle = async () => {
    if (!selectedId || !convDetails) return;
    try {
      if (convDetails.is_human_takeover) {
        await api.releaseConversation(selectedId);
      } else {
        await api.takeoverConversation(selectedId);
      }
      fetchMessages(selectedId);
      fetchConversations(); // Update sidebar too
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedId) return;
    
    setIsSending(true);
    try {
      await api.sendMessage(selectedId, replyText);
      setReplyText('');
      fetchMessages(selectedId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarDetails = (name?: string, number?: string) => {
    const text = name && name !== 'Unknown' ? name : number || '?';
    const cleanStr = text.replace(/[^a-zA-Z0-9]/g, '');
    let initials = 'C';
    if (name && name !== 'Unknown') {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        initials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts[0]) {
        initials = parts[0].substring(0, 2).toUpperCase();
      }
    } else if (cleanStr.length >= 2) {
      initials = cleanStr.substring(cleanStr.length - 2).toUpperCase();
    }

    const gradients = [
      'from-blue-600 to-indigo-600',
      'from-emerald-500 to-teal-700',
      'from-violet-600 to-purple-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-cyan-600 to-blue-700'
    ];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bgGradient = gradients[Math.abs(hash) % gradients.length];
    return { initials, bgGradient };
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)] flex gap-4 animate-in fade-in duration-500">
      {/* Left Sidebar (Inbox List) */}
      <div className={`w-full md:w-1/3 glass-card rounded-2xl flex flex-col overflow-hidden border-slate-200/80 shadow-sm bg-white ${
        selectedId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-indigo-600" /> Inbox
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">No conversations found</div>
          ) : (
            conversations.map((c) => {
              const avatar = getAvatarDetails(c.contact_name, c.whatsapp_number);
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`p-4 cursor-pointer transition-all flex items-center gap-3.5 ${
                    selectedId === c.id 
                      ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600' 
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${avatar.bgGradient} text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0`}>
                    {avatar.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-900 truncate pr-2 text-sm">{c.contact_name || c.whatsapp_number}</span>
                      <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">
                        {c.updated_at ? formatTime(c.updated_at) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`w-2 h-2 rounded-full ${c.is_human_takeover ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="text-xs text-slate-500 font-medium capitalize">{c.is_human_takeover ? 'Human Mode' : 'AI Mode'}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white ml-auto ${
                        c.channel === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-emerald-600'
                      }`}>
                        {c.channel === 'instagram' ? '📸 Instagram' : '💬 WhatsApp'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className={`flex-1 glass-card rounded-2xl flex flex-col overflow-hidden border-slate-200/80 shadow-sm bg-white ${
        !selectedId ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                  aria-label="Back to Inbox"
                >
                  ←
                </button>
                {(() => {
                  const avatar = getAvatarDetails(convDetails?.contact_name, convDetails?.whatsapp_number);
                  return (
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${avatar.bgGradient} text-white flex items-center justify-center font-bold text-sm shadow-xs`}>
                        {avatar.initials}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{convDetails?.contact_name || convDetails?.whatsapp_number}</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{convDetails?.whatsapp_number}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <button
                onClick={handleTakeoverToggle}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
                  convDetails?.is_human_takeover 
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {convDetails?.is_human_takeover ? 'Return to AI' : 'Takeover Chat'}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
              {messages.map((m, i) => {
                const isOutbound = m.direction === 'outbound';
                const avatar = getAvatarDetails(convDetails?.contact_name, convDetails?.whatsapp_number);
                return (
                  <div key={i} className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {!isOutbound && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${avatar.bgGradient} text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-2xs`}>
                          {avatar.initials}
                        </div>
                      )}
                      <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isOutbound 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs shadow-sm font-medium' 
                          : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80 shadow-2xs font-normal'
                      }`}>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                      {isOutbound && (
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {m.type === 'human' ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium mt-1 mx-10">
                      {formatTime(m.created_at || new Date().toISOString())}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              {convDetails?.is_human_takeover ? (
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-sm shadow-indigo-500/20"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium py-1.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  AI is handling this conversation. Click 'Takeover Chat' to reply manually.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageSquare className="w-12 h-12 mb-3 text-slate-300" />
            <p className="font-medium text-sm">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
