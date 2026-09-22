'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Rent } from '@/types';
import PaymentModal from '@/components/PaymentModal';
import ReceiptModal from '@/components/ReceiptModal';
import { CreditCard, Calendar, Clock, CheckCircle2, Receipt, AlertTriangle, Loader2 } from 'lucide-react';

export default function StudentRentPage() {
  const [rents, setRents] = useState<Rent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRent, setSelectedRent] = useState<Rent | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  useEffect(() => {
    fetchRents();
  }, []);

  const fetchRents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/rent/student');
      if (res.data.success) {
        setRents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch rents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Financials</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Rent Schedule & Online Payments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track paid and pending monthly rents. Pay directly using UPI, Netbanking, or Debit/Credit Cards.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-2">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading invoices...</p>
        </div>
      ) : rents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Invoices Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Rent records will appear here once your booking is approved by the PG owner.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {rents.map((rent) => {
              const isPaid = rent.status === 'PAID';
              const payment = rent.payments?.[0];

              return (
                <div
                  key={rent.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-slate-900">{rent.month}</h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {rent.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {rent.booking?.bed?.room?.pg?.name || 'PG'} • Room {rent.booking?.bed?.room?.roomNumber || 'N/A'} (Bed {rent.booking?.bed?.bedNumber || 'N/A'})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Payment Due Date: {new Date(rent.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Amount</span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{rent.amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPayment(
                            payment || {
                              id: 'demo',
                              rentId: rent.id,
                              amount: rent.amount,
                              transactionId: 'PAY' + rent.id.slice(-6),
                              paymentMethod: 'Razorpay - Verified',
                              status: 'SUCCESS',
                              paidAt: new Date().toISOString(),
                              rent,
                            }
                          )
                        }
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Receipt className="w-4 h-4" />
                        View Receipt
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedRent(rent)}
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pay Online
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedRent && (
        <PaymentModal
          rent={selectedRent}
          isOpen={!!selectedRent}
          onClose={() => {
            setSelectedRent(null);
            fetchRents();
          }}
          onSuccess={() => {
            fetchRents();
          }}
        />
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
