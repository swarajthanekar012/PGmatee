'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Complaint } from '@/types';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  Loader2,
  Phone,
  MessageSquare,
} from 'lucide-react';

export default function OwnerComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusInput, setStatusInput] = useState<string>('IN_PROGRESS');
  const [noteInput, setNoteInput] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

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
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string) => {
    setIsUpdating(true);
    try {
      const res = await api.put(`/complaints/${id}/status`, {
        status: statusInput,
        resolutionNote: noteInput,
      });

      if (res.data.success) {
        setEditingId(null);
        setNoteInput('');
        fetchComplaints();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update grievance');
    } finally {
      setIsUpdating(false);
    }
  };

  const openEdit = (c: Complaint) => {
    setEditingId(c.id);
    setStatusInput(c.status);
    setNoteInput(c.resolutionNote || '');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Maintenance</span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
          Student Grievance Triage & Resolution
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review, assign, and resolve maintenance requests reported by your tenants.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Complaints Pending</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All student grievances have been addressed and resolved.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const isResolved = c.status === 'RESOLVED';
            const isInProgress = c.status === 'IN_PROGRESS';
            const isEditing = editingId === c.id;

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {c.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{c.title}</h3>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
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

                <div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{c.description}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                    Reported by: <span className="font-semibold text-slate-700 dark:text-slate-200">{c.student?.user?.name}</span> ({c.student?.user?.mobile}) • Room {c.room?.roomNumber || '203'}
                  </p>
                </div>

                {c.resolutionNote && !isEditing && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-[11px]">Resolution Note:</span>
                    <p className="text-emerald-700 dark:text-emerald-400 mt-0.5">{c.resolutionNote}</p>
                  </div>
                )}

                {/* Edit Status Form */}
                {isEditing ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Update Grievance Status</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Status
                        </label>
                        <select
                          value={statusInput}
                          onChange={(e) => setStatusInput(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Resolution Note for Student
                        </label>
                        <input
                          type="text"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="e.g. Electrician visited and repaired regulator"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(c.id)}
                        disabled={isUpdating}
                        className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Update'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
                  >
                    Update Status & Note
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
