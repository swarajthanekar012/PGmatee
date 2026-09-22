'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Complaint } from '@/types';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  MessageSquare,
  Wrench,
  Loader2,
} from 'lucide-react';

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('Electrical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/complaints', {
        category,
        title,
        description,
      });

      if (res.data.success) {
        setSuccessMsg('Grievance lodged successfully! The PG owner has been notified.');
        setTitle('');
        setDescription('');
        setShowForm(false);
        fetchComplaints();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit grievance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Support</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Grievances & Maintenance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Report electrical, plumbing, food, or Wi-Fi issues directly to your PG owner.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Lodge Grievance'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Submission Form Modal / Box */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Submit New Maintenance Complaint</h3>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white font-medium"
                >
                  <option value="Electrical">Electrical (Fan, Lights, Switch)</option>
                  <option value="Plumbing">Plumbing (Tap, Geyser, Washroom)</option>
                  <option value="Wi-Fi">Wi-Fi & Internet Speed</option>
                  <option value="Cleaning">Housekeeping & Cleanliness</option>
                  <option value="Food">Food Quality & Mess</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fan not working in Room 203"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue and when it started occurring..."
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Complaint'}
            </button>
          </form>
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Complaints Lodged</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Everything is running smoothly! Click "Lodge Grievance" if you need maintenance.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const isResolved = c.status === 'RESOLVED';
            const isInProgress = c.status === 'IN_PROGRESS';

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {c.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h3>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isResolved
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : isInProgress
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {isResolved && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isInProgress && <Wrench className="w-3.5 h-3.5" />}
                    {c.status === 'OPEN' && <Clock className="w-3.5 h-3.5" />}
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{c.description}</p>

                {c.resolutionNote && (
                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50 text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-[11px] mb-0.5">
                      Owner Response:
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-400">{c.resolutionNote}</p>
                  </div>
                )}

                <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Reported on: {new Date(c.createdAt).toLocaleDateString()}</span>
                  <span>Room: {c.room?.roomNumber || 'Assigned Room'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
