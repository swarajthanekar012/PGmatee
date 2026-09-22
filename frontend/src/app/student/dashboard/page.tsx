'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Rent, Booking, Announcement, Complaint } from '@/types';
import PaymentModal from '@/components/PaymentModal';
import ReceiptModal from '@/components/ReceiptModal';
import {
  Home,
  CreditCard,
  Calendar,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  Bed,
  Receipt,
  Loader2,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [rents, setRents] = useState<Rent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedRentToPay, setSelectedRentToPay] = useState<Rent | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [rentRes, annRes, compRes] = await Promise.all([
        api.get('/rent/student'),
        api.get('/announcements'),
        api.get('/complaints'),
      ]);

      if (rentRes.data.success) setRents(rentRes.data.data);
      if (annRes.data.success) setAnnouncements(rentRes.data.data ? annRes.data.data.slice(0, 3) : []);
      if (compRes.data.success) setComplaints(compRes.data.data.slice(0, 3));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading student portal...</p>
      </div>
    );
  }

  // Active stay info from rents or bookings
  const currentRent = rents[0];
  const activeBooking = currentRent?.booking;
  const currentPG = activeBooking?.bed?.room?.pg;
  const pendingRent = rents.find((r) => r.status === 'PENDING' || r.status === 'OVERDUE');

  return (
    <div className="space-y-8">
      {/* Header Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            Student Resident Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Welcome, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {user?.student?.college ? `${user.student.college} • ${user.student.course || ''}` : 'Active PG Resident'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/student/complaints"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
          >
            Raise Grievance
          </Link>
          <Link
            href="/pgs"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            Explore PGs
          </Link>
        </div>
      </div>

      {/* Main 3 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Current PG & Room */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current PG</span>
              <span className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
                <Home className="w-4 h-4" />
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              {currentPG?.name || 'Sunrise Boys PG'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {currentPG?.address || 'Station Road, Kopargaon'}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Room</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">
                {activeBooking?.bed?.room?.roomNumber || '203'} ({activeBooking?.bed?.room?.roomType || 'Triple Sharing'})
              </p>
            </div>
            <div className="text-right">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Bed</span>
              <p className="font-bold text-brand-600 dark:text-brand-400">{activeBooking?.bed?.bedNumber || 'B2'}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Rent & Status */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Monthly Rent ({pendingRent?.month || currentRent?.month || 'October 2026'})
              </span>
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </span>
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              ₹{(pendingRent?.amount || currentRent?.amount || 6000).toLocaleString('en-IN')}
            </p>

            <div className="mt-2 flex items-center gap-2">
              {pendingRent ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
                  <Clock className="w-3.5 h-3.5" /> PENDING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PAID ✓
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Due by: {new Date(pendingRent?.dueDate || currentRent?.dueDate || new Date()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {pendingRent ? (
              <button
                type="button"
                onClick={() => setSelectedRentToPay(pendingRent)}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-3.5 h-3.5" />
                Pay Rent via Razorpay
              </button>
            ) : (
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Rent is fully settled for this month
              </div>
            )}
          </div>
        </div>

        {/* Card 3: Notice & Support */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Owner Contact
              </span>
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-2">Ramesh Sharma</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sunrise Boys PG Warden & Manager</p>

            <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                +91 9876543210
              </p>
              <p className="flex items-center gap-2">
                <Megaphone className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                Gate Closes: 10:30 PM
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <Link
              href="/student/announcements"
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline flex items-center gap-1"
            >
              View Notice Board ({announcements.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2-Columns: Recent Invoices / Receipts & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Invoices & Receipts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Rent History & Invoices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">View payment records and download instant receipts.</p>
            </div>
            <Link
              href="/student/payments"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              All Invoices <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rents.map((rent) => {
              const isPaid = rent.status === 'PAID';
              const payment = rent.payments?.[0];

              return (
                <div key={rent.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{rent.month}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {isPaid ? 'PAID' : 'PENDING'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Due: {new Date(rent.dueDate).toLocaleDateString()} • Room {rent.booking?.bed?.room?.roomNumber || '203'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      ₹{rent.amount.toLocaleString('en-IN')}
                    </span>

                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPaymentForReceipt(
                            payment || {
                              id: 'demo',
                              rentId: rent.id,
                              amount: rent.amount,
                              transactionId: 'PAY' + rent.id.slice(-6),
                              paymentMethod: 'Razorpay - UPI',
                              status: 'SUCCESS',
                              paidAt: new Date().toISOString(),
                              rent,
                            }
                          )
                        }
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedRentToPay(rent)}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Announcements & Grievances */}
        <div className="lg:col-span-1 space-y-6">
          {/* Announcements */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Owner Notices
              </h3>
              <Link href="/student/announcements" className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-semibold">
                View all
              </Link>
            </div>

            <div className="space-y-2.5">
              {announcements.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No active announcements</p>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className="p-3 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/40 space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{a.title}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{a.message}</p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block pt-1">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Grievances */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> My Grievances
              </h3>
              <Link href="/student/complaints" className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-semibold">
                Submit New
              </Link>
            </div>

            <div className="space-y-2">
              {complaints.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No pending complaints lodged</p>
              ) : (
                complaints.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          c.status === 'RESOLVED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : c.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.description}</p>
                    {c.resolutionNote && (
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50 mt-1">
                        Note: {c.resolutionNote}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      {selectedRentToPay && (
        <PaymentModal
          rent={selectedRentToPay}
          isOpen={!!selectedRentToPay}
          onClose={() => {
            setSelectedRentToPay(null);
            fetchDashboardData();
          }}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />
      )}

      {/* Official Receipt Modal */}
      {selectedPaymentForReceipt && (
        <ReceiptModal
          payment={selectedPaymentForReceipt}
          isOpen={!!selectedPaymentForReceipt}
          onClose={() => setSelectedPaymentForReceipt(null)}
        />
      )}
    </div>
  );
}
