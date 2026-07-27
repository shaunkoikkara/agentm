"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit2, Trash2, BookOpen, X, Loader2, Save } from 'lucide-react';

export default function KnowledgePage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ type: 'faq', title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const data = await api.getKnowledge();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await api.updateKnowledge(editingId, formData);
      } else {
        await api.createKnowledge(formData);
      }
      setIsModalOpen(false);
      fetchKnowledge();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await api.deleteKnowledge(id);
        fetchKnowledge();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setFormData({ type: item.type, title: item.title, content: item.content });
      setEditingId(item.id);
    } else {
      setFormData({ type: 'faq', title: '', content: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Knowledge Base</h1>
          <p className="text-slate-500 text-sm mt-1">Train your AI with FAQs, policies, and service details.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm font-semibold shadow-md shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card bg-white rounded-2xl p-12 flex flex-col items-center text-center border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No knowledge entries yet</h3>
          <p className="text-slate-500 max-w-sm mb-6 text-sm">Add FAQs and business information to help your AI receptionist answer customer questions accurately.</p>
          <button
            onClick={() => openModal()}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-sm"
          >
            Create your first entry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => (
            <div key={item.id} className="glass-card bg-white rounded-2xl p-6 border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                    {item.type}
                  </span>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(item)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm line-clamp-3 leading-relaxed font-normal">{item.content}</p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit Entry' : 'Add New Entry'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                >
                  <option value="faq">FAQ</option>
                  <option value="service">Service</option>
                  <option value="policy">Policy</option>
                  <option value="general">General Info</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Title / Question</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  placeholder="e.g. What are your opening hours?"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Content / Answer</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[120px] resize-y"
                  placeholder="We are open Monday to Friday from 9am to 5pm."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all text-sm font-semibold shadow-sm shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
