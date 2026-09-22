'use client';

import React from 'react';
import { Payment } from '@/types';
import { X, Printer, CheckCircle2, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({
  payment,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const rent = payment.rent;
  const booking = rent?.booking;
  const room = booking?.bed?.room;
  const pg = room?.pg;
  const student = rent?.student || booking?.student;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Actions bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-slate-600">Official Payment Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">PGMate Technologies</h3>
                <p className="text-xs text-slate-500">Verified Accommodation Rent Receipt</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAID
              </span>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Receipt #{payment.transactionId}
              </p>
            </div>
          </div>

          {/* Details 2-columns */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                Tenant Information
              </span>
              <p className="font-bold text-slate-800 text-sm">{student?.user?.name || 'Swaraj Patil'}</p>
              <p className="text-slate-600">{student?.user?.email || 'student@pgmate.com'}</p>
              <p className="text-slate-600">{student?.user?.mobile || '+91 9823456789'}</p>
              {student?.college && (
                <p className="text-slate-500 mt-1">{student.college}</p>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                Property & Room
              </span>
              <p className="font-bold text-slate-800 text-sm">{pg?.name || 'Sunrise Boys PG'}</p>
              <p className="text-slate-600">{pg?.address || 'Station Road, Kopargaon'}</p>
              <p className="text-slate-600 font-medium text-brand-600 mt-1">
                Room {room?.roomNumber || '203'} • Bed {booking?.bed?.bedNumber || 'B2'}
              </p>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3">Billing Period</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-medium text-slate-800">
                    PG Accommodation Monthly Rent
                    <span className="block text-[11px] text-slate-400">Includes Wi-Fi, 3-time Food & Maintenance</span>
                  </td>
                  <td className="p-3 text-slate-600">{rent?.month || 'October 2026'}</td>
                  <td className="p-3 text-right font-bold text-slate-800">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="p-3 text-slate-700">Total Paid (INR)</td>
                  <td className="p-3 text-right text-brand-700 text-sm">
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Metadata Footer */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-[11px] space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Payment Gateway:</span>
              <span className="font-semibold">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction Reference:</span>
              <span className="font-mono">{payment.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Timestamp:</span>
              <span>{new Date(payment.paidAt).toLocaleString()}</span>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 text-center">
            This is an electronically generated receipt verified by PGMate Smart PG Systems. No physical signature is required.
          </p>
        </div>
      </div>
    </div>
  );
}
