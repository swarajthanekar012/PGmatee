'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Booking } from '@/types';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function OwnerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings(true);
    // Real-time polling every 8s
    const timer = setInterval(() => {
      fetchBookings(false);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await api.get('/bookings/owner');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      if (isInitial) setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await api.put(`/bookings/${id}/approve`);
      if (res.data.success) {
        fetchBookings(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve booking');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this booking?')) return;
    setActionId(id);
    try {
      const res = await api.put(`/bookings/${id}/reject`);
      if (res.data.success) {
        fetchBookings(false);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject booking');
    } finally {
      setActionId(null);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Queue</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Student Booking Requests ({pendingCount} Pending)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review applicant profiles, allocate vacant beds, and generate initial rent records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchBookings(false)}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="Refresh bookings list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Queue'}</span>
          </button>
        </div>
      </div>

      {user && (
        <div className="p-3 bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/70 dark:border-brand-900/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-brand-900 dark:text-brand-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Viewing bookings for: <strong>{user.name}</strong> ({user.email})
            </span>
          </div>
          <span className="text-[11px] text-brand-700 dark:text-brand-300">
            Auto-refreshes every 8 seconds for incoming applications.
          </span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading booking queue...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Booking Requests</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student applications will be listed here when beds are requested for your properties.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {bookings.map((b) => {
            const isPending = b.status === 'PENDING';
            const isApproved = b.status === 'APPROVED';

            return (
              <div
                key={b.id}
                className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {b.student?.user?.name || 'Applicant'}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : isPending
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {b.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                      {b.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Requested Accommodation:{' '}
                    <span className="font-bold text-brand-600 dark:text-brand-400">
                      {b.bed?.room?.pg?.name || 'PG Accommodation'}
                    </span>{' '}
                    • Room {b.bed?.room?.roomNumber || '—'} (Bed {b.bed?.bedNumber || '—'})
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {b.student?.user?.mobile && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                        {b.student.user.mobile}
                      </span>
                    )}
                    {b.student?.user?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                        {b.student.user.email}
                      </span>
                    )}
                    <span>Date: {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-slate-900 dark:text-white mr-2">
                    ₹{(b.bed?.room?.rent ?? 0).toLocaleString('en-IN')}/mo
                  </span>

                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(b.id)}
                        disabled={actionId === b.id}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 rounded-xl text-xs font-bold transition"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(b.id)}
                        disabled={actionId === b.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                      >
                        {actionId === b.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve & Allocate
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
