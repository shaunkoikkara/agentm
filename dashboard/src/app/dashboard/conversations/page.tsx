"use client";

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Send, User, Bot, Loader2, Phone, AlertCircle } from 'lucide-react';

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
      const data = await api.getConversations();
      setConversations(Array.isArray(data) ? data : []);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const fetchMessages = async (id: string) => {
    try {
      const data = await api.getConversation(id);
      setConvDetails(data.conversation);
      setMessages(data.messages || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTakeoverToggle = async () => {
    if (!selectedId || !convDetails) return;
    try {
      if (convDetails.status === 'human') {
        await api.releaseConversation(selectedId);
      } else {
        await api.takeoverConversation(selectedId);
      }
      fetchMessages(selectedId);
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

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 animate-in fade-in duration-500">
      {/* Left Sidebar */}
      <div className="w-1/3 glass-card rounded-2xl flex flex-col overflow-hidden border-white/5">
        <div className="p-4 border-b border-white/5 bg-zinc-900/50">
          <h2 className="font-semibold text-lg text-white flex items-center gap-2">
            <Phone className="w-5 h-5 text-zinc-400" /> Inbox
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">No conversations found</div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${
                  selectedId === c.id ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : 'hover:bg-white/5 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-white truncate pr-2">{c.contact_name || c.contact_number}</span>
                  <span className="text-xs text-zinc-500 flex-shrink-0">
                    {c.updated_at ? formatTime(c.updated_at) : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`w-2 h-2 rounded-full ${c.status === 'human' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-xs text-zinc-500 capitalize">{c.status} Mode</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden border-white/5">
        {selectedId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">{convDetails?.contact_name || convDetails?.contact_number}</h3>
                <p className="text-xs text-zinc-400">{convDetails?.contact_number}</p>
              </div>
              <button
                onClick={handleTakeoverToggle}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  convDetails?.status === 'human' 
                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/20' 
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/20'
                }`}
              >
                {convDetails?.status === 'human' ? 'Return to AI' : 'Takeover Chat'}
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950/50">
              {messages.map((m, i) => {
                const isOutbound = m.direction === 'outbound';
                return (
                  <div key={i} className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-end gap-2 max-w-[80%]">
                      {!isOutbound && (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl ${
                        isOutbound 
                          ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-br-none' 
                          : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-white/5'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                      </div>
                      {isOutbound && (
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          {m.type === 'human' ? <User className="w-4 h-4 text-blue-400" /> : <Bot className="w-4 h-4 text-blue-400" />}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 mx-10">
                      {formatTime(m.created_at || new Date().toISOString())}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-zinc-900/50 border-t border-white/5">
              {convDetails?.status === 'human' ? (
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm py-2">
                  <AlertCircle className="w-4 h-4" />
                  AI is handling this conversation. Click 'Takeover Chat' to reply manually.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
