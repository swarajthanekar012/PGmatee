'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Rent } from '@/types';
import { CreditCard, CheckCircle2, Clock, Plus, Loader2, Sparkles } from 'lucide-react';

export default function OwnerRentPage() {
  const [rentData, setRentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [monthInput, setMonthInput] = useState('November 2026');

  useEffect(() => {
    fetchRentRecords();
  }, []);

  const fetchRentRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rent/owner');
      if (res.data.success) {
        setRentData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load rents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNextMonth = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post('/rent/generate', {
        month: monthInput,
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchRentRecords();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate rent');
    } finally {
      setIsGenerating(false);
    }
  };

  const rents: Rent[] = rentData?.rents || [];
  const stats = rentData?.stats || { totalCollected: 0, totalPending: 0, totalRecords: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Collections</span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            Rent Records & Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track student fee dues, verified online collections, and batch-generate monthly invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={monthInput}
            onChange={(e) => setMonthInput(e.target.value)}
            placeholder="e.g. November 2026"
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white w-36 font-semibold"
          />
          <button
            type="button"
            onClick={handleGenerateNextMonth}
            disabled={isGenerating}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate Invoices
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total Collected</span>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{stats.totalCollected.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Verified online payments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Pending Due</span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            ₹{stats.totalPending.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Awaiting student payment</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Total Invoices</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.totalRecords}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Across all residents</span>
        </div>
      </div>

      {/* Rents Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading rent records...</p>
        </div>
      ) : rents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">No Invoices Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click "Generate Invoices" to create fee records for all active PG residents.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="p-4">Resident Student</th>
                  <th className="p-4">Room & Bed</th>
                  <th className="p-4">Billing Month</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Payment Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rents.map((r) => {
                  const isPaid = r.status === 'PAID';
                  const payment = r.payments?.[0];

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-white">{r.student?.user?.name || 'Resident'}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">{r.student?.user?.mobile}</p>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                        Room {r.booking?.bed?.room?.roomNumber} (Bed {r.booking?.bed?.bedNumber})
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{r.month}</td>
                      <td className="p-4 font-black text-slate-900 dark:text-white">₹{r.amount.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {new Date(r.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono text-slate-500 dark:text-slate-400">
                        {payment ? payment.transactionId : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
