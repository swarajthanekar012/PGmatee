'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Announcement, PG } from '@/types';
import { Megaphone, Plus, Trash2, X, Loader2 } from 'lucide-react';

export default function OwnerAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [pgId, setPgId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [annRes, pgRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/pgs/owner/my-pgs'),
      ]);

      if (annRes.data.success) setAnnouncements(annRes.data.data);
      if (pgRes.data.success) {
        setPgs(pgRes.data.data);
        if (pgRes.data.data.length > 0) setPgId(pgRes.data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgId) return;
    setIsSubmitting(true);

    try {
      const res = await api.post('/announcements', {
        pgId,
        title,
        message,
        targetType,
      });

      if (res.data.success) {
        setShowModal(false);
        setTitle('');
        setMessage('');
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await api.delete(`/announcements/${id}`);
      if (res.data.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Broadcasting</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Announcements & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish notices directly to all resident students with instant notifications.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Publish Notice
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading notices...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Announcements Published</h3>
          <p className="text-xs text-slate-500 mt-1">
            Send updates regarding maintenance, gate timings, or mess menus.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                    <Megaphone className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{a.message}</p>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span>{a.pg?.name || 'Property'}</span>
                <span className="font-semibold text-brand-600">Target: {a.targetType}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Publish Notice</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Property</label>
                <select
                  value={pgId}
                  onChange={(e) => setPgId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                >
                  {pgs.map((pg) => (
                    <option key={pg.id} value={pg.id}>
                      {pg.name} ({pg.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                >
                  <option value="ALL">All Residents</option>
                  <option value="PG">Specific PG Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water Pipeline Maintenance"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide timing, instructions, and contact info..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
