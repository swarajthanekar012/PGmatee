'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Booking } from '@/types';
import { BedDouble, CheckCircle2, Clock, XCircle, MapPin, Loader2, ArrowRight } from 'lucide-react';

export default function StudentBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/student');
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Accommodations</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            My Bed Booking Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track allocation status for requested rooms and beds.
          </p>
        </div>
        <Link
          href="/pgs"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm inline-flex items-center gap-1.5"
        >
          Book Another PG <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Booking Requests</h3>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified PGs and choose your preferred room and bed.
          </p>
          <Link
            href="/pgs"
            className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
          >
            Explore PGs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((b) => {
            const pg = b.bed.room?.pg;
            const isApproved = b.status === 'APPROVED';
            const isPending = b.status === 'PENDING';

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isApproved && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {isPending && <Clock className="w-3.5 h-3.5" />}
                      {b.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                      {b.status}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Requested: {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{pg?.name || 'Sunrise PG'}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {pg?.address || 'Kopargaon'}
                  </p>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Room & Bed</span>
                      <p className="font-bold text-slate-800">
                        Room {b.bed.room?.roomNumber} • Bed {b.bed.bedNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Rent</span>
                      <p className="font-bold text-brand-600">
                        ₹{b.bed.room?.rent.toLocaleString('en-IN')}/mo
                      </p>
                    </div>
                  </div>
                </div>

                {isApproved && (
                  <Link
                    href="/student/dashboard"
                    className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold text-center transition"
                  >
                    View Resident Details & Rent
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
