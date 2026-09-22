'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Payment } from '@/types';
import ReceiptModal from '@/components/ReceiptModal';
import { Receipt, CheckCircle2, Download, Printer, Loader2 } from 'lucide-react';

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments/history');
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Ledger</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Payment History & Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction records for all verified rent settlements.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading payment history...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Payments Recorded Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            When you pay your monthly rent, instant digital receipts will be archived here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Billing Month</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 font-mono font-bold text-slate-800">{p.transactionId}</td>
                    <td className="p-4 font-semibold text-slate-700">{p.rent?.month || 'October 2026'}</td>
                    <td className="p-4 font-black text-slate-900">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-slate-600">{p.paymentMethod}</td>
                    <td className="p-4 text-slate-500">
                      {new Date(p.paidAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-bold text-xs transition inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPayment && (
        <ReceiptModal
          payment={selectedPayment}
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
