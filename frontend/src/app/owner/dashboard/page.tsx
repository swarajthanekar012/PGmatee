'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Building2,
  Bed,
  CreditCard,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Megaphone,
  Loader2,
  Wrench,
  ShieldCheck,
  QrCode,
  Check,
  MessageSquare,
  Activity,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { Booking, PG, Complaint } from '@/types';

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [pgs, setPgs] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rentData, setRentData] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOwnerDashboard(true);
    // Real-time auto-polling every 8 seconds for incoming student bookings and complaints
    const timer = setInterval(() => {
      fetchOwnerDashboard(false);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const fetchOwnerDashboard = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setIsRefreshing(true);
    try {
      const [pgRes, bookRes, rentRes, compRes] = await Promise.all([
        api.get('/pgs/owner/my-pgs'),
        api.get('/bookings/owner'),
        api.get('/rent/owner'),
        api.get('/complaints'),
      ]);

      if (pgRes.data.success) setPgs(pgRes.data.data);
      if (bookRes.data.success) setBookings(bookRes.data.data);
      if (rentRes.data.success) setRentData(rentRes.data.data);
      if (compRes.data.success) setComplaints(compRes.data.data);
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      if (isInitial) setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleApproveBooking = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/approve`);
      if (res.data.success) {
        fetchOwnerDashboard();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to reject this booking request?')) return;
    setActionLoading(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/reject`);
      if (res.data.success) {
        fetchOwnerDashboard();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuickResolveComplaint = async (complaintId: string) => {
    setActionLoading(complaintId);
    try {
      const res = await api.put(`/complaints/${complaintId}/status`, {
        status: 'RESOLVED',
        resolutionNote: 'Resolved directly by PG owner from dashboard triage.',
      });
      if (res.data.success) {
        fetchOwnerDashboard();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-2">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading owner dashboard & activity feed...</p>
      </div>
    );
  }

  // Aggregate metrics
  let totalBeds = 0;
  let occupiedBeds = 0;
  let availableBeds = 0;
  let monthlyCollection = 0;

  pgs.forEach((pg) => {
    totalBeds += pg.totalBeds || 0;
    occupiedBeds += pg.occupiedBeds || 0;
    availableBeds += pg.availableBeds || 0;
    monthlyCollection += pg.monthlyCollection || 0;
  });

  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const pendingRent = rentData?.stats?.totalPending || 0;
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const openComplaints = complaints.filter((c) => c.status === 'OPEN');
  const inProgressComplaints = complaints.filter((c) => c.status === 'IN_PROGRESS');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Property Administration
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            PG Owner Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry of your properties: bookings, tenant grievances, bed allocations, and rent collection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchOwnerDashboard(false)}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            title="Fetch latest student bookings and complaints"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <Link
            href="/list-pg"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            List Another PG
          </Link>
          <Link
            href="/owner/announcements"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Megaphone className="w-4 h-4 text-brand-600" />
            Broadcast
          </Link>
          <Link
            href="/owner/rooms-beds"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-1.5"
          >
            <Bed className="w-4 h-4" />
            Rooms & Beds
          </Link>
        </div>
      </div>

      {/* Account Info Pill */}
      {user && (
        <div className="p-3 bg-brand-50/60 border border-brand-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-brand-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Logged in as: <strong>{user.name}</strong> ({user.email}) • Managed Properties: <strong>{pgs.length}</strong>
            </span>
          </div>
          <span className="text-[11px] text-brand-700">
            💡 Student requests appear under the owner account that owns that specific PG.
          </span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Total Beds */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Beds</span>
            <span className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Bed className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalBeds}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Across {pgs.length} Properties</span>
        </div>

        {/* Occupied Beds */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Occupied Beds</span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{occupiedBeds}</p>
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 block">
            {occupancyRate}% Occupancy
          </span>
        </div>

        {/* Available Beds */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Available Beds</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{availableBeds}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Ready to allocate</span>
        </div>

        {/* Active Grievances */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Grievances</span>
            <span className={`p-2 rounded-xl ${openComplaints.length > 0 ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'}`}>
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <p className={`text-2xl sm:text-3xl font-black ${openComplaints.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {openComplaints.length}
          </p>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">
            {openComplaints.length > 0 ? `${openComplaints.length} Need Attention` : 'All Resolved ✓'}
          </span>
        </div>

        {/* Pending Rent */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Pending Rent</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            ₹{pendingRent.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Uncollected cycle</span>
        </div>
      </div>

      {/* Monthly Collection Telemetry Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold">
            Projected Monthly Rent Revenue
          </span>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            ₹{monthlyCollection.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-indigo-200">
            Calculated from {occupiedBeds} occupied resident beds across your {pgs.length} managed properties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/owner/rent"
            className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/30"
          >
            View Rent Ledger
          </Link>
        </div>
      </div>

      {/* TWO-COLUMN COMMAND CENTER: Incoming Grievances & Booking Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COMPLAINTS / GRIEVANCES TRIAGE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <Wrench className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tenant Grievances & Maintenance ({complaints.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {openComplaints.length} open issues reported by residents.
                  </p>
                </div>
              </div>
              <Link
                href="/owner/complaints"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                Grievance Desk <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {complaints.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs">No grievances logged by residents</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {complaints.slice(0, 6).map((c) => {
                  const isOpen = c.status === 'OPEN';
                  const isInProgress = c.status === 'IN_PROGRESS';
                  const isResolved = c.status === 'RESOLVED';

                  return (
                    <div key={c.id} className="py-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isOpen
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                : isInProgress
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            }`}
                          >
                            {c.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isOpen
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                              : isInProgress
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{c.description}</p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                        <span>
                          {c.student?.user?.name || 'Resident'} • Room {c.room?.roomNumber || '—'}
                          {c.student?.user?.mobile && ` (${c.student.user.mobile})`}
                        </span>

                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => handleQuickResolveComplaint(c.id)}
                            disabled={actionLoading === c.id}
                            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 px-2.5 py-1 rounded-lg transition"
                          >
                            {actionLoading === c.id ? 'Resolving...' : 'Mark Resolved ✓'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/owner/complaints"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center gap-1"
            >
              Open Full Grievance Triage Portal →
            </Link>
          </div>
        </div>

        {/* BOOKING REQUESTS TRIAGE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Users className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    New Booking Requests ({pendingBookings.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Approve requests to allocate vacant beds.
                  </p>
                </div>
              </div>
              <Link
                href="/owner/bookings"
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                All Bookings <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                <p className="text-xs">No pending student booking requests</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
                {pendingBookings.map((b) => (
                  <div key={b.id} className="py-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{b.student?.user?.name || 'Applicant'}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">
                          {b.student?.user?.mobile || b.student?.user?.email || ''}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        ₹{(b.bed?.room?.rent ?? 0).toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Requested: <span className="font-semibold text-brand-600 dark:text-brand-400">Room {b.bed?.room?.roomNumber || '—'} • Bed {b.bed?.bedNumber || '—'}</span> ({b.bed?.room?.pg?.name || 'PG Accommodation'})
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Move-in: {new Date(b.startDate).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRejectBooking(b.id)}
                          disabled={actionLoading === b.id}
                          className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700 dark:hover:text-rose-300 rounded-lg text-xs font-semibold transition"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveBooking(b.id)}
                          disabled={actionLoading === b.id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                        >
                          {actionLoading === b.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-3 h-3" /> Approve
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/owner/bookings"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center gap-1"
            >
              View Full Booking Log & History →
            </Link>
          </div>
        </div>
      </div>

      {/* Properties Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Managed Properties ({pgs.length})</h3>
          <Link
            href="/owner/pgs"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            Manage Properties <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pgs.map((pg) => (
            <div
              key={pg.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{pg.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pg.address}, {pg.city}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                    {pg.status}
                  </span>
                  {pg.licenseNumber && (
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {pg.licenseNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* QR and UPI status */}
              {pg.upiId && (
                <div className="bg-indigo-50/50 dark:bg-indigo-950/30 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-mono font-bold text-indigo-900 dark:text-indigo-200 text-[11px]">{pg.upiId}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    QR Active
                  </span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-center text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Total Beds</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{pg.totalBeds}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Occupied</span>
                  <p className="font-bold text-indigo-600 dark:text-indigo-400">{pg.occupiedBeds}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Available</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{pg.availableBeds}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Rooms: {pg.rooms?.length || 0} Configured</span>
                <Link
                  href={`/owner/rooms-beds?pgId=${pg.id}`}
                  className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Configure Beds & Rooms →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

